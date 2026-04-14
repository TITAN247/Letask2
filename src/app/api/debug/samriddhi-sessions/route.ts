import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Session from "@/models/Session";
import PreMentorApplication from "@/models/PreMentorApplication";
import User from "@/models/User";

export async function POST() {
    try {
        await dbConnect();
        
        console.log("=== DEBUGGING SESSIONS FOR SAMRIDDHI ===");
        
        // Find Samriddhi's user document
        const samriddhiUser = await User.findOne({ name: /samriddhi/i }).lean();
        console.log("Samriddhi user:", samriddhiUser);
        
        if (!samriddhiUser) {
            return NextResponse.json({ message: "Samriddhi user not found" }, { status: 404 });
        }
        
        // Find Samriddhi's PreMentorApplication
        const preMentorDoc = await PreMentorApplication.findOne({ userId: samriddhiUser._id }).lean();
        console.log("PreMentor doc:", preMentorDoc);
        
        // Check sessions with user ID as mentorId
        const sessionsByUserId = await Session.find({ mentorId: samriddhiUser._id })
            .populate('menteeId', 'name email')
            .lean();
        console.log("Sessions by user ID:", sessionsByUserId.length);
        
        // Check sessions with PreMentorApplication ID as mentorId
        const sessionsByDocId = await Session.find({ mentorId: preMentorDoc?._id })
            .populate('menteeId', 'name email')
            .lean();
        console.log("Sessions by doc ID:", sessionsByDocId.length);
        
        // Get all sessions to debug
        const allSessions = await Session.find({})
            .populate('menteeId', 'name email')
            .populate('mentorId')
            .lean();
        console.log("All sessions:", allSessions.length);
        
        return NextResponse.json({
            samriddhiUser,
            preMentorDoc,
            sessionsByUserId: sessionsByUserId.length,
            sessionsByDocId: sessionsByDocId.length,
            allSessions: allSessions.length,
            sessionDetails: allSessions.map(s => ({
                id: s._id,
                mentorId: s.mentorId,
                mentorIdType: typeof s.mentorId,
                mentorType: s.mentorType,
                status: s.status,
                menteeName: (s.menteeId as any)?.name
            }))
        });
        
    } catch (error) {
        console.error("Debug error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
