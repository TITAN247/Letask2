import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { sendEmail } from "@/lib/mailer";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json(
        { message: "No account found with this email" },
        { status: 404 }
      );
    }

    if (user.isEmailVerified) {
      return NextResponse.json(
        { message: "Email is already verified" },
        { status: 400 }
      );
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    await user.save();

    // Send verification email using professional template
    try {
      const { emailTemplates } = await import("@/lib/emailTemplates");
      const template = emailTemplates.otpVerification(user.name, verificationToken.substring(0, 6));
      
      const emailResult = await sendEmail({
        to: user.email,
        subject: template.subject,
        html: template.html,
      });

      if (emailResult.success || emailResult.devMode) {
        return NextResponse.json(
          { message: "Verification email sent. Please check your inbox." },
          { status: 200 }
        );
      } else {
        return NextResponse.json(
          { message: "Failed to send verification email. Please try again later." },
          { status: 500 }
        );
      }
    } catch (emailError) {
      console.error("[Resend Verification] Email error:", emailError);
      return NextResponse.json(
        { message: "Failed to send verification email. Please try again later." },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[Resend Verification] Error:", error);
    return NextResponse.json(
      { message: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}
