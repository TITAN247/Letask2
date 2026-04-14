import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MentorProfile from "@/models/MentorProfile";
import { getUserFromSession } from "@/lib/auth";

// GET - Fetch mentor profile by userId (for sidebar/profile display)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { success: false, message: "User ID required" },
                { status: 400 }
            );
        }

        await dbConnect();

        const profile = await MentorProfile.findOne({ userId })
            .select("profilePicture name userId")
            .lean();

        if (!profile) {
            return NextResponse.json(
                { success: false, message: "Profile not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            profile: {
                profilePicture: profile.profilePicture,
                name: profile.name,
                userId: profile.userId
            }
        });
    } catch (error: any) {
        console.error("[MentorProfile API] Error:", error);
        return NextResponse.json(
            { success: false, message: "Server error", error: error.message },
            { status: 500 }
        );
    }
}
