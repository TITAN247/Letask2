import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Session from "@/models/Session";
import PreMentorApplication from "@/models/PreMentorApplication";
import User from "@/models/User";

export async function GET() {
    try {
        await dbConnect();
        
        // Find Samriddhi's user document
        const samriddhiUser = await User.findOne({ name: /samriddhi/i }).lean();
        
        if (!samriddhiUser) {
            return NextResponse.json({ message: "Samriddhi user not found" });
        }
        
        // Find Samriddhi's PreMentorApplication
        const preMentorDoc = await PreMentorApplication.findOne({ userId: samriddhiUser._id }).lean();
        
        // Check sessions
        const sessionsByUserId = await Session.find({ mentorId: samriddhiUser._id })
            .populate('menteeId', 'name email')
            .lean();
        
        const sessionsByDocId = await Session.find({ mentorId: preMentorDoc?._id })
            .populate('menteeId', 'name email')
            .lean();
        
        return NextResponse.json({
            userId: samriddhiUser._id,
            preMentorDocId: preMentorDoc?._id,
            sessionsByUserId: sessionsByUserId.length,
            sessionsByDocId: sessionsByDocId.length,
            sessions: [...sessionsByUserId, ...sessionsByDocId].map(s => ({
                id: s._id,
                mentorId: s.mentorId,
                mentorType: s.mentorType,
                status: s.status,
                subject: s.subject,
                menteeName: (s.menteeId as any)?.name
            }))
        });
        
    } catch (error) {
        console.error("Debug error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
}
