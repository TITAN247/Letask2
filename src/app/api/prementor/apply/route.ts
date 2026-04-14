import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PreMentorApplication from "@/models/PreMentorApplication";
import { getUserFromSession } from "@/lib/auth";
// EMAIL DISABLED: import { sendEmail } from "@/lib/mailer";

// POST - Create new Pre-Mentor application
export async function POST(req: Request) {
    try {
        const userSession = await getUserFromSession();
        if (!userSession) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        await dbConnect();

        // Check for existing pending application
        const existing = await PreMentorApplication.findOne({
            userId: (userSession as any).id,
            status: 'pending'
        });

        if (existing) {
            return NextResponse.json(
                { message: "You already have a pending Pre-Mentor application." },
                { status: 400 }
            );
        }

        // Generate unique temp ID
        const tempId = `PRE-${Math.floor(10000 + Math.random() * 90000)}`;

        // Create application
        const application = await PreMentorApplication.create({
            userId: (userSession as any).id,
            tempId,
            ...body,
            status: 'pending',
            submittedAt: new Date()
        });

        // EMAIL DISABLED: Skipping confirmation email

        return NextResponse.json({
            message: "Pre-Mentor application submitted successfully.",
            application,
            tempId
        }, { status: 201 });

    } catch (error) {
        console.error("PreMentor Application Error:", error);
        return NextResponse.json(
            { message: "An error occurred submitting application." },
            { status: 500 }
        );
    }
}

// GET - Check user's Pre-Mentor application status
export async function GET(req: Request) {
    try {
        const userSession = await getUserFromSession();
        if (!userSession) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const application = await PreMentorApplication.findOne({
            userId: (userSession as any).id
        }).sort({ createdAt: -1 });

        return NextResponse.json({
            hasApplication: !!application,
            application
        });

    } catch (error) {
        console.error("Get PreMentor Application Error:", error);
        return NextResponse.json(
            { message: "An error occurred fetching application status." },
            { status: 500 }
        );
    }
}
