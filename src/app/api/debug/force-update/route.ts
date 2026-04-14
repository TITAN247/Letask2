import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Session from "@/models/Session";

export async function POST() {
    try {
        await dbConnect();
        
        // Force update the session
        const result = await Session.updateOne(
            { _id: "69d3dd9cd667d1113e51b9ab" },
            { mentorType: 'prementor' }
        );
        
        console.log("Update result:", result);
        
        // Verify
        const session = await Session.findById("69d3dd9cd667d1113e51b9ab").lean();
        console.log("Session after update:", session);
        
        return NextResponse.json({
            result,
            session
        });
        
    } catch (error) {
        console.error("Force update error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
