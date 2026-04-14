import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        
        const { email, code, newPassword } = await request.json();
        
        if (!email || !code || !newPassword) {
            return NextResponse.json(
                { message: "Email, code, and new password are required" },
                { status: 400 }
            );
        }

        // Validate password strength
        if (newPassword.length < 6) {
            return NextResponse.json(
                { message: "Password must be at least 6 characters long" },
                { status: 400 }
            );
        }

        // Find user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            return NextResponse.json(
                { message: "Invalid email or code" },
                { status: 400 }
            );
        }

        // Check if reset code exists
        if (!user.resetPasswordCode) {
            return NextResponse.json(
                { message: "No reset code found. Please request a new one." },
                { status: 400 }
            );
        }

        // Check if code matches
        if (user.resetPasswordCode !== code) {
            return NextResponse.json(
                { message: "Invalid reset code" },
                { status: 400 }
            );
        }

        // Check if code has expired
        if (user.resetPasswordCodeExpiry && new Date() > user.resetPasswordCodeExpiry) {
            return NextResponse.json(
                { message: "Reset code has expired. Please request a new one." },
                { status: 400 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password and clear reset code
        user.password = hashedPassword;
        user.resetPasswordCode = undefined;
        user.resetPasswordCodeExpiry = undefined;
        await user.save();

        return NextResponse.json(
            { 
                message: "Password reset successfully! You can now log in with your new password.",
                email: user.email
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            { message: "An error occurred while resetting password", error: error.message },
            { status: 500 }
        );
    }
}
