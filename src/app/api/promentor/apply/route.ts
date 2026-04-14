import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ProMentorApplication from "@/models/ProMentorApplication";
import { getUserFromSession } from "@/lib/auth";

// POST - Create new Pro-Mentor application
export async function POST(req: Request) {
    try {
        const userSession = await getUserFromSession();
        if (!userSession) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        await dbConnect();

        // Check for existing pending application
        const existing = await ProMentorApplication.findOne({
            userId: (userSession as any).id,
            status: 'pending'
        });

        if (existing) {
            return NextResponse.json(
                { message: "You already have a pending Pro-Mentor application." },
                { status: 400 }
            );
        }

        // Generate unique temp ID
        const tempId = `PRO-${Math.floor(10000 + Math.random() * 90000)}`;

        // Create application
        const application = await ProMentorApplication.create({
            userId: (userSession as any).id,
            tempId,
            ...body,
            preferredMenteeLevel: body.preferredMenteeLevel || 'all', // Default to 'all' if not provided
            status: 'pending',
            submittedAt: new Date()
        });

        // Note: Email will only be sent when admin approves the application

        return NextResponse.json({
            message: "Pro-Mentor application submitted successfully.",
            application,
            tempId
        }, { status: 201 });

    } catch (error: any) {
        console.error("ProMentor Application Error:", error);
        console.error("Error details:", error.errors || error instanceof Error ? error.message : 'Unknown error');
        return NextResponse.json(
            { message: "An error occurred submitting application.", error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// GET - Check user's Pro-Mentor application status
export async function GET(req: Request) {
    try {
        const userSession = await getUserFromSession();
        if (!userSession) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const application = await ProMentorApplication.findOne({
            userId: (userSession as any).id
        }).sort({ createdAt: -1 });

        return NextResponse.json({
            hasApplication: !!application,
            application
        });

    } catch (error) {
        console.error("Get ProMentor Application Error:", error);
        return NextResponse.json(
            { message: "An error occurred fetching application status." },
            { status: 500 }
        );
    }
}
