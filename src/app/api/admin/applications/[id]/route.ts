import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PreMentorApplication from "@/models/PreMentorApplication";
import ProMentorApplication from "@/models/ProMentorApplication";
import User from "@/models/User";
import { sendEmail } from "@/lib/mailer";
import { emailTemplates } from "@/lib/emailTemplates";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { status, adminNotes } = await req.json();
        await dbConnect();

        // Find application in both collections
        let application = await PreMentorApplication.findById(id).populate('userId');
        let applicationType = 'prementor';
        
        if (!application) {
            application = await ProMentorApplication.findById(id).populate('userId');
            applicationType = 'promentor';
        }
        
        if (!application) return NextResponse.json({ message: "Application not found" }, { status: 404 });

        application.status = status;
        if (adminNotes) application.adminNotes = adminNotes;
        
        await application.save();

        const user = await User.findById(application.userId._id);
        if (!user) return NextResponse.json({ message: "Associated user not found" }, { status: 404 });

        // Approval Logic
        if (status === 'approved') {
            user.role = applicationType;
            await user.save();

            // Notify User with rich email template
            const approvalTemplate = emailTemplates.applicationApproved(
                user.name,
                applicationType,
                application.tempId
            );
            await sendEmail({
                to: user.email,
                subject: approvalTemplate.subject,
                html: approvalTemplate.html
            });
        } 
        // Rejection Logic
        else if (status === 'rejected') {
            const rejectionTemplate = emailTemplates.applicationRejected(
                user.name,
                applicationType,
                adminNotes
            );
            await sendEmail({
                to: user.email,
                subject: rejectionTemplate.subject,
                html: rejectionTemplate.html
            });
        }

        return NextResponse.json({ message: `Application marked as ${status}` }, { status: 200 });
    } catch (error) {
        console.error("Admin Application Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
