import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";

export async function GET() {
    try {
        await dbConnect();
        return NextResponse.json({ 
            message: "Database connection successful",
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error("Database test error:", error);
        return NextResponse.json({ 
            message: "Database connection failed", 
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
