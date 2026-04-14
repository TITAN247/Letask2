import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Session from "@/models/Session";
import { getUserFromSession } from "@/lib/auth";

export async function GET() {
    try {
        const userSession = await getUserFromSession();
        if (!userSession) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        await dbConnect();
        
        const userIdStr = (userSession as any).id;
        const userId = new (await import("mongoose")).default.Types.ObjectId(userIdStr);
        
        console.log(`[Sessions API] Fetching sessions for user: ${userId}`);
        
        // Also look for sessions where the user is a mentor via their PreMentorApplication ID
        const PreMentorApplication = (await import("@/models/PreMentorApplication")).default;
        const preMentorDoc = await PreMentorApplication.findOne({ userId }).select("_id").lean();
        const mentorAppId = preMentorDoc ? preMentorDoc._id : null;
        
        console.log(`[Sessions API] PreMentorApplication ID: ${mentorAppId}`);

        // Build query to find sessions where user is either mentee or mentor
        const query: any = {
            $or: [
                { menteeId: userId }, 
                { mentorId: userId }
            ]
        };
        
        // For prementors, also search by application ID
        if (mentorAppId) {
            query.$or.push({ mentorId: mentorAppId });
        }
        
        console.log(`[Sessions API] Query:`, JSON.stringify(query));

        const sessions = await Session.find(query)
            .populate('menteeId', 'name email')
            .populate('mentorId', 'name email')
            .sort({ date: 1, timeSlot: 1 });
        
        console.log(`[Sessions API] Found ${sessions.length} sessions`);
        sessions.forEach((s: any) => {
            console.log(`[Sessions API] - Session: ${s._id}, mentorId: ${s.mentorId}, mentorType: ${s.mentorType}, status: ${s.status}`);
        });

        return NextResponse.json({ sessions }, { status: 200 });
    } catch (error) {
        console.error("Fetch Sessions Error:", error);
        return NextResponse.json({ message: "An error occurred fetching sessions." }, { status: 500 });
    }
}
