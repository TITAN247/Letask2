import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MentorProfile from "@/models/MentorProfile";
import User from "@/models/User";
import { getUserFromSession } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getUserFromSession();
        if (!session || ((session as any).role !== 'prementor' && (session as any).role !== 'promentor')) {
            return NextResponse.json({ message: "Unauthorized. Must be a mentor." }, { status: 403 });
        }

        const body = await req.json();
        await dbConnect();

        const userId = (session as any).id;

        // Update MentorProfile
        const profile = await MentorProfile.findOneAndUpdate(
            { userId: userId },
            { 
               userId: userId,
               ...body,
            },
            { new: true, upsert: true }
        );

        // Also update User model with profile picture for global visibility
        if (body.profilePicture) {
            await User.findByIdAndUpdate(
                userId,
                { 
                    avatar: body.profilePicture,
                    profilePicture: body.profilePicture,
                    image: body.profilePicture
                },
                { new: true }
            );
            console.log('[Profile API] Updated User profile picture:', body.profilePicture.substring(0, 50) + '...');
        }

        return NextResponse.json({ message: "Mentor profile updated successfully.", profile }, { status: 200 });
    } catch (error) {
        console.error("Mentor Profile Error:", error);
        return NextResponse.json({ message: "An error occurred updating profile." }, { status: 500 });
    }
}
