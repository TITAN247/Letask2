import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const { name, email, password, role } = await req.json();

        if (!name || !email || !password || !role) {
            return NextResponse.json(
                { message: "Please provide all required fields." },
                { status: 400 }
            );
        }

        // Password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!passwordRegex.test(password)) {
            return NextResponse.json(
                {
                    message:
                        "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
                },
                { status: 400 }
            );
        }

        await dbConnect();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: "User already exists." },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Generate 6-digit OTP
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role,
            isEmailVerified: false,
            verificationCode,
            verificationCodeExpiry
        });

        // Send verification email using professional template
        try {
            const { sendEmail } = await import("@/lib/mailer");
            const { emailTemplates } = await import("@/lib/emailTemplates");
            
            const template = emailTemplates.otpVerification(name, verificationCode);
            
            const emailResult = await sendEmail({
                to: email,
                subject: template.subject,
                html: template.html,
            });
            
            if (emailResult.devMode) {
                console.log("[Signup] Verification code for", email, ":", verificationCode);
            }
            
            // Also send welcome email
            const welcomeTemplate = emailTemplates.welcome(name, role);
            await sendEmail({
                to: email,
                subject: welcomeTemplate.subject,
                html: welcomeTemplate.html,
            });
        } catch (emailError) {
            console.error("[Signup] Email send error:", emailError);
        }

        return NextResponse.json(
            { 
                message: "Signup successful. Please check your email for the verification code.",
                userId: newUser._id.toString(),
                email: newUser.email,
                needsEmailVerification: true
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { message: "An error occurred while registering the user.", error: error instanceof Error ? error.message : String(error) },
            { status: 500 }
        );
    }
}
