import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";

export async function POST() {
    try {
        await dbConnect();
        
        const collections = [
            'sessions',
            'users', 
            'mentorprofiles',
            'prementorapplications',
            'menteeprofiles',
            'upgradeapplications',
            'messages',
            'chatrooms'
        ];
        
        const results = [];
        
        for (const collectionName of collections) {
            try {
                const collection = mongoose.connection.collection(collectionName);
                const result = await collection.deleteMany({});
                results.push({
                    collection: collectionName,
                    deleted: result.deletedCount,
                    status: 'cleared'
                });
            } catch (err: any) {
                results.push({
                    collection: collectionName,
                    status: 'error',
                    error: err.message
                });
            }
        }
        
        return NextResponse.json({
            message: "Database cleared successfully",
            results
        }, { status: 200 });
        
    } catch (error: any) {
        return NextResponse.json({
            message: "Failed to clear database",
            error: error.message
        }, { status: 500 });
    }
}
