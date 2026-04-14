import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        
        const { email, code } = await request.json();
        
        console.log(`[Verify OTP] Received request - Email: ${email}, Code: "${code}" (type: ${typeof code})`);
        
        if (!email || !code) {
            return NextResponse.json(
                { message: "Email and verification code are required" },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        // Check if already verified
        if (user.isEmailVerified) {
            return NextResponse.json(
                { message: "Email is already verified" },
                { status: 400 }
            );
        }

        // Check if verification code exists
        console.log(`[Verify OTP] User found - verificationCode: "${user.verificationCode}" (type: ${typeof user.verificationCode}), Expiry: ${user.verificationCodeExpiry}`);
        
        if (!user.verificationCode) {
            return NextResponse.json(
                { message: "No verification code found. Please request a new code." },
                { status: 400 }
            );
        }

        // Check if code matches (convert both to strings and trim for safety)
        const storedCode = String(user.verificationCode).trim();
        const inputCode = String(code).trim();
        
        console.log(`[Verify OTP] Comparing codes - Stored: "${storedCode}", Input: "${inputCode}"`);
        
        if (storedCode !== inputCode) {
            return NextResponse.json(
                { message: "Invalid verification code" },
                { status: 400 }
            );
        }

        // Check if code has expired
        if (user.verificationCodeExpiry && new Date() > user.verificationCodeExpiry) {
            return NextResponse.json(
                { message: "Verification code has expired. Please request a new code." },
                { status: 400 }
            );
        }

        // Mark email as verified
        user.isEmailVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpiry = undefined;
        await user.save();

        // Send welcome email
        try {
            const { sendEmail } = await import("@/lib/mailer");
            const { emailTemplates } = await import("@/lib/emailTemplates");
            
            const welcomeTemplate = emailTemplates.welcome(user.name || 'New User', user.role);
            await sendEmail({
                to: user.email,
                subject: welcomeTemplate.subject,
                html: welcomeTemplate.html,
            });
            console.log(`[Verify OTP] Welcome email sent to ${user.email}`);
        } catch (emailError) {
            console.error("[Verify OTP] Failed to send welcome email:", emailError);
        }

        return NextResponse.json(
            { 
                message: "Email verified successfully! You can now log in.",
                email: user.email,
                role: user.role,
                redirectUrl: user.role === 'prementor' ? '/onboarding/prementor' : 
                            user.role === 'promentor' ? '/onboarding/promentor' : 
                            '/login'
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Verify OTP error:", error);
        return NextResponse.json(
            { message: "An error occurred while verifying the code", error: error.message },
            { status: 500 }
        );
    }
}
