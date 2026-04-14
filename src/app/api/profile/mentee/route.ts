import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MenteeProfile from "@/models/MenteeProfile";
import { getUserFromSession } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const session = await getUserFromSession();
        if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        await dbConnect();

        const profile = await MenteeProfile.findOneAndUpdate(
            { userId: (session as any).id },
            { 
               userId: (session as any).id,
               ...body,
            },
            { new: true, upsert: true }
        );

        return NextResponse.json({ message: "Profile updated successfully.", profile }, { status: 200 });
    } catch (error) {
        console.error("Mentee Profile Error:", error);
        return NextResponse.json({ message: "An error occurred updating profile." }, { status: 500 });
    }
}
