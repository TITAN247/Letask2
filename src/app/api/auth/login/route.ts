import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const { email, password, role } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: "Please provide email and password." },
                { status: 400 }
            );
        }

        await dbConnect();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json(
                { message: "Invalid email or password." },
                { status: 400 }
            );
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json(
                { message: "Invalid email or password." },
                { status: 400 }
            );
        }

        // Check email verification
        if (!user.isEmailVerified) {
            return NextResponse.json(
                { message: "Please verify your email before logging in.", needsVerification: true },
                { status: 403 }
            );
        }

        // Validate role if provided (skip for admin or if no role specified)
        if (role && user.role !== role && user.role !== 'admin') {
            return NextResponse.json(
                { message: `Invalid login credentials. This account is registered as a ${user.role}.` },
                { status: 403 }
            );
        }

        // Return user info (excluding password)
        const { password: _, ...userInfo } = user.toObject();
        
        const token = signToken({ id: user._id, role: user.role });

        console.log(`[Login API] User ${user.email} logged in with role: ${user.role}`);
        
        const response = NextResponse.json(
            { message: "Login successful.", user: userInfo },
            { status: 200 }
        );
        response.cookies.set('auth_token', token, { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
        return response;
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json(
            { message: "An error occurred during login." },
            { status: 500 }
        );
    }
}
