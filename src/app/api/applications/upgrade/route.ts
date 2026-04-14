import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import UpgradeApplication from "@/models/UpgradeApplication";
import { getUserFromSession } from "@/lib/auth";
import { notifyAdmin } from "@/lib/email";

export async function POST(req: Request) {
    try {
        const userSession = await getUserFromSession();
        if (!userSession) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        await dbConnect();

        // 1. Ensure user hasn't already submitted a pending application
        const existing = await UpgradeApplication.findOne({ 
            userId: (userSession as any).id, 
            status: 'pending' 
        });

        if (existing) {
            return NextResponse.json({ message: "You already have a pending application." }, { status: 400 });
        }

        // 2. Generate a Unique Temp ID (LAK + 4 random digits)
        const tempId = `LAK-${Math.floor(1000 + Math.random() * 9000)}`;

        // 3. Create the enhanced application
        const application = await UpgradeApplication.create({
            userId: (userSession as any).id,
            tempId,
            ...body,
            status: 'pending'
        });

        // 4. Notify Admin (Async/Background)
        notifyAdmin(`New ${body.targetRole} Application: ${tempId}`, {
            userName: (userSession as any).name,
            userEmail: (userSession as any).email,
            role: body.targetRole,
            tempId,
            mockTestScore: body.mockTestScore || 'N/A'
        }).catch(e => console.error("Admin Notify Error:", e));

        return NextResponse.json({ 
            message: "Application submitted successfully.", 
            application,
            tempId 
        }, { status: 201 });

    } catch (error) {
        console.error("Upgrade App Error:", error);
        return NextResponse.json({ message: "An error occurred submitting application." }, { status: 500 });
    }
}
