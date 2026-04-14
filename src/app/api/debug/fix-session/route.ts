import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Session from "@/models/Session";

export async function POST() {
    try {
        await dbConnect();
        
        // Check current session state
        const session = await Session.findById("69d3dd9cd667d1113e51b9ab").lean();
        console.log("Current session:", session);
        
        // Update with mentorType
        const result = await Session.updateOne(
            { _id: "69d3dd9cd667d1113e51b9ab" },
            { 
                mentorType: 'prementor',
                $set: { mentorType: 'prementor' }
            },
            { upsert: false }
        );
        
        console.log("Update result:", result);
        
        // Verify
        const updated = await Session.findById("69d3dd9cd667d1113e51b9ab").lean();
        console.log("Updated session:", updated);
        
        return NextResponse.json({
            before: session,
            result,
            after: updated
        });
        
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
