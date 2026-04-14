import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Session from "@/models/Session";
import PreMentorApplication from "@/models/PreMentorApplication";
import MentorProfile from "@/models/MentorProfile";

export async function POST() {
    try {
        await dbConnect();
        
        console.log("=== MIGRATING SESSIONS ===");
        
        // Find all sessions without mentorType
        const sessions = await Session.find({ mentorType: { $exists: false } }).lean();
        console.log(`Found ${sessions.length} sessions to migrate`);
        
        let updated = 0;
        
        for (const session of sessions) {
            // Check if mentorId is a PreMentorApplication
            const preMentor = await PreMentorApplication.findById(session.mentorId);
            if (preMentor) {
                await Session.findByIdAndUpdate(session._id, { mentorType: 'prementor' });
                console.log(`Updated session ${session._id} to prementor`);
                updated++;
            } else {
                // Check if mentorId is a MentorProfile
                const mentorProfile = await MentorProfile.findById(session.mentorId);
                if (mentorProfile) {
                    await Session.findByIdAndUpdate(session._id, { mentorType: 'promentor' });
                    console.log(`Updated session ${session._id} to promentor`);
                    updated++;
                } else {
                    console.log(`Could not determine type for session ${session._id}`);
                }
            }
        }
        
        return NextResponse.json({
            message: `Migration complete. Updated ${updated} sessions.`,
            total: sessions.length,
            updated
        });
        
    } catch (error) {
        console.error("Migration error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
