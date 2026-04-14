import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Session from "@/models/Session";
import PreMentorApplication from "@/models/PreMentorApplication";

export async function POST() {
    try {
        await dbConnect();
        
        console.log("=== DEBUGGING SESSION ===");
        
        // Get the specific session
        const session = await Session.findById("69d3dd9cd667d1113e51b9ab").lean();
        console.log("Session:", session);
        
        // Check if mentorId is a PreMentorApplication
        const preMentor = await PreMentorApplication.findById(session?.mentorId);
        console.log("PreMentor found:", !!preMentor);
        
        if (preMentor) {
            console.log("Updating session to prementor...");
            await Session.findByIdAndUpdate("69d3dd9cd667d1113e51b9ab", { mentorType: 'prementor' });
            console.log("Updated successfully");
        }
        
        // Verify update
        const updatedSession = await Session.findById("69d3dd9cd667d1113e51b9ab").lean();
        console.log("Updated session:", updatedSession);
        
        return NextResponse.json({
            session,
            preMentorExists: !!preMentor,
            updatedSession
        });
        
    } catch (error) {
        console.error("Debug error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
