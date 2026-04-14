import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const token = url.searchParams.get("token");

        if (!token) {
            return NextResponse.redirect(new URL('/login/mentee?error=missing_token', req.url));
        }

        await dbConnect();

        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return NextResponse.redirect(new URL('/login/mentee?error=invalid_token', req.url));
        }

        user.isEmailVerified = true;
        user.verificationToken = undefined;
        await user.save();

        // Redirect to appropriate login page based on user role
        const role = user.role || 'mentee';
        return NextResponse.redirect(new URL(`/login/${role}?verified=true`, req.url));
    } catch (error) {
        console.error("Verification Error:", error);
        return NextResponse.redirect(new URL('/login/mentee?error=server', req.url));
    }
}
