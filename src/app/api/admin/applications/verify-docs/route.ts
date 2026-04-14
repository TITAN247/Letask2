import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PreMentorApplication from "@/models/PreMentorApplication";
import ProMentorApplication from "@/models/ProMentorApplication";
import { getUserFromSession } from "@/lib/auth";

// PATCH - Verify documents for an application
export async function PATCH(req: Request) {
    try {
        const userSession = await getUserFromSession();
        if (!userSession || (userSession as any).role !== 'admin') {
            return NextResponse.json({ message: "Unauthorized - Admin only" }, { status: 403 });
        }

        const body = await req.json();
        const { applicationId, type, documentsVerified, adminVerificationNotes } = body;

        if (!applicationId || !type) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

        let application;
        const updateData = {
            documentsVerified,
            adminVerificationNotes: adminVerificationNotes || '',
            verifiedAt: documentsVerified ? new Date() : null,
            verifiedBy: documentsVerified ? (userSession as any).id : null
        };

        if (type === 'prementor') {
            application = await PreMentorApplication.findByIdAndUpdate(
                applicationId,
                updateData,
                { new: true }
            );
        } else if (type === 'promentor') {
            application = await ProMentorApplication.findByIdAndUpdate(
                applicationId,
                updateData,
                { new: true }
            );
        } else {
            return NextResponse.json({ message: "Invalid application type" }, { status: 400 });
        }

        if (!application) {
            return NextResponse.json({ message: "Application not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: `Documents ${documentsVerified ? 'verified' : 'unverified'} successfully`,
            application
        });

    } catch (error: any) {
        console.error("Document Verification Error:", error);
        return NextResponse.json(
            { message: "Error updating document verification", error: error.message },
            { status: 500 }
        );
    }
}
