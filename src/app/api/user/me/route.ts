import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { getUserFromSession } from "@/lib/auth";
import MenteeProfile from "@/models/MenteeProfile";
import MentorProfile from "@/models/MentorProfile";

export async function GET() {
    try {
        const session = await getUserFromSession();
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        
        const user = await User.findById((session as any).id).select('-password');
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // Fetch profile
        let profile = null;
        if (user.role === 'mentee') {
            profile = await MenteeProfile.findOne({ userId: user._id });
        } else if (user.role === 'prementor' || user.role === 'promentor') {
            profile = await MentorProfile.findOne({ userId: user._id });
        }

        return NextResponse.json({ user, profile }, { status: 200 });
    } catch (error) {
        console.error("User ME error:", error);
        return NextResponse.json({ message: "An error occurred." }, { status: 500 });
    }
}
