import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PreMentorApplication from "@/models/PreMentorApplication";
import ProMentorApplication from "@/models/ProMentorApplication";

// GET - Delete all applications (development only)
export async function GET() {
    try {
        // Only allow in development
        if (process.env.NODE_ENV === 'production') {
            return NextResponse.json(
                { message: "This endpoint is only available in development mode." },
                { status: 403 }
            );
        }

        await dbConnect();

        // Delete all applications
        const preResult = await PreMentorApplication.deleteMany({});
        const proResult = await ProMentorApplication.deleteMany({});

        return NextResponse.json({
            message: "All applications deleted successfully",
            deleted: {
                preMentor: preResult.deletedCount,
                proMentor: proResult.deletedCount,
                total: preResult.deletedCount + proResult.deletedCount
            }
        });

    } catch (error: any) {
        console.error("Delete Applications Error:", error);
        return NextResponse.json(
            { message: "Error deleting applications", error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// POST - Alternative method to delete all
export async function POST() {
    return GET();
}
