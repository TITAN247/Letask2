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

        // Generate new 6-digit OTP
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Save to user
        user.verificationCode = verificationCode;
        user.verificationCodeExpiry = verificationCodeExpiry;
        await user.save();

        // Send email with new code using professional template
        try {
            const { sendEmail } = await import("@/lib/mailer");
            const { emailTemplates } = await import("@/lib/emailTemplates");
            
            const template = emailTemplates.otpVerification(user.name, verificationCode);

            const emailResult = await sendEmail({
                to: email,
                subject: template.subject,
                html: template.html,
            });

            if (emailResult.devMode) {
                console.log("[Resend Code] Verification code for", email, ":", verificationCode);
            }
        } catch (emailError) {
            console.error("[Resend Code] Email send error:", emailError);
            // Continue even if email fails
        }

        return NextResponse.json(
            { 
                message: "Verification code resent successfully",
                email: user.email
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Resend code error:", error);
        return NextResponse.json(
            { message: "An error occurred while resending the code", error: error.message },
            { status: 500 }
        );
    }
}
