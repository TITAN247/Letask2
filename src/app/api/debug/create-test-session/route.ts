import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Session from "@/models/Session";
import PreMentorApplication from "@/models/PreMentorApplication";
import User from "@/models/User";

export async function POST() {
    try {
        await dbConnect();
        
        // Get Samriddhi's pre-mentor doc
        const preMentorDoc = await PreMentorApplication.findOne({ 
            userId: "69d3d92ed667d1113e51a3a2" 
        }).lean();
        
        if (!preMentorDoc) {
            return NextResponse.json({ message: "Pre-mentor not found" });
        }
        
        // Create a test session
        const session = await Session.create({
            menteeId: "69d3d6a3d667d1113e519d48", // Test mentee
            mentorId: preMentorDoc._id,
            mentorType: 'prementor',
            subject: "Test Session for Chat",
            date: new Date().toISOString().split('T')[0],
            timeSlot: "10:00",
            status: 'accepted'
        });
        
        return NextResponse.json({
            message: "Test session created",
            sessionId: session._id,
            mentorId: preMentorDoc._id,
            mentorType: 'prementor'
        });
        
    } catch (error) {
        console.error("Error creating test session:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' });
    }
}
