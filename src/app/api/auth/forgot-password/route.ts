import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        
        const { email } = await request.json();
        
        if (!email) {
            return NextResponse.json(
                { message: "Email is required" },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await User.findOne({ email });
        
        // Don't reveal if user exists or not for security
        if (!user) {
            return NextResponse.json(
                { message: "If an account exists with this email, a reset code has been sent." },
                { status: 200 }
            );
        }

        // Generate 6-digit reset code
        const resetPasswordCode = Math.floor(100000 + Math.random() * 900000).toString();
        const resetPasswordCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save to user
        user.resetPasswordCode = resetPasswordCode;
        user.resetPasswordCodeExpiry = resetPasswordCodeExpiry;
        await user.save();

        // Send password reset email using professional template
        try {
            const { sendEmail } = await import("@/lib/mailer");
            const { emailTemplates } = await import("@/lib/emailTemplates");
            
            const template = emailTemplates.passwordReset(user.name || 'User', resetPasswordCode);
            
            const emailResult = await sendEmail({
                to: email,
                subject: template.subject,
                html: template.html,
            });
            
            if (emailResult.devMode) {
                console.log("[Forgot Password] Reset code for", email, ":", resetPasswordCode);
            }
        } catch (emailError) {
            console.error("[Forgot Password] Email send error:", emailError);
        }

        return NextResponse.json(
            { 
                message: "If an account exists with this email, a reset code has been sent.",
                email: user.email
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { message: "An error occurred", error: error.message },
            { status: 500 }
        );
    }
}
