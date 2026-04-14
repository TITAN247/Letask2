import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
    try {
        const MONGODB_URI = process.env.MONGODB_URI;
        
        if (!MONGODB_URI) {
            return NextResponse.json({ 
                success: false,
                message: "MONGODB_URI not found in environment variables" 
            }, { status: 500 });
        }

        // Test connection with shorter timeout
        const opts = {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 5000,
            connectTimeoutMS: 5000,
            bufferCommands: false,
        };

        await mongoose.connect(MONGODB_URI, opts);
        await mongoose.disconnect();
        
        return NextResponse.json({ 
            success: true,
            message: "MongoDB Atlas connection successful",
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json({ 
            success: false,
            message: "MongoDB Atlas connection failed",
            error: error instanceof Error ? error.message : 'Unknown error',
            help: [
                "Check MONGODB_URI in .env.local",
                "Whitelist your IP in Atlas Network Access",
                "Verify Atlas cluster is running",
                "Check username/password in connection string"
            ],
            timestamp: new Date().toISOString()
        }, { status: 500 });
    }
}
