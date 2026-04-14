import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Session from "@/models/Session";
import MentorProfile from "@/models/MentorProfile";
import PreMentorApplication from "@/models/PreMentorApplication";
import User from "@/models/User";
import { getUserFromSession } from "@/lib/auth";
import { sendEmail } from "@/lib/mailer";
import { emailTemplates } from "@/lib/emailTemplates";

export async function POST(req: Request) {
    try {
        const userSession = await getUserFromSession();
        if (!userSession) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { mentorId, subject, date, timeSlot, notes } = await req.json();
        
        if (!mentorId || !subject || !date || !timeSlot) {
            return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
        }

        await dbConnect();

        // Find mentor in both collections
        let mentor = await MentorProfile.findById(mentorId).populate('userId', 'name email');
        let mentorType = 'promentor';
        let actualMentorId = mentorId; // Will use this for the session
        
        if (!mentor) {
            mentor = await PreMentorApplication.findById(mentorId).populate('userId', 'name email');
            mentorType = 'prementor';
        }

        // If still not found, try finding by userId (mentorId might be a User ID)
        if (!mentor) {
            mentor = await MentorProfile.findOne({ userId: mentorId }).populate('userId', 'name email');
            if (mentor) {
                mentorType = 'promentor';
                actualMentorId = mentor._id.toString(); // Use the document ID
            }
        }
        
        if (!mentor) {
            mentor = await PreMentorApplication.findOne({ userId: mentorId }).populate('userId', 'name email');
            if (mentor) {
                mentorType = 'prementor';
                actualMentorId = mentor._id.toString(); // Use the PreMentorApplication document ID!
            }
        }
        
        if (!mentor) {
            return NextResponse.json(
                { message: "Mentor not found. Please select a valid mentor." },
                { status: 404 }
            );
        }
        
        // Get mentee details
        const mentee = await User.findById((userSession as any).id);
        
        // Get mentor rate (default to 500 INR if not set)
        const amount = mentor.hourlyRateINR || 500;

        console.log(`[Book Session] Creating session with:`, {
            menteeId: (userSession as any).id,
            mentorId: actualMentorId,
            mentorType,
            subject,
            date,
            timeSlot
        });

        const newSession = await Session.create({
            menteeId: (userSession as any).id,
            mentorId: actualMentorId,
            mentorType,
            subject,
            date,
            timeSlot,
            notes,
            amount,
            currency: 'INR',
            status: 'pending',
            paymentStatus: 'pending'
        });

        console.log(`[Book Session] Session created:`, newSession._id.toString(), `mentorType:`, mentorType);
        
        // Send booking request email to mentor
        try {
            if (mentor?.userId?.email) {
                const template = emailTemplates.bookingRequest(
                    mentor.userId.name || 'Mentor',
                    mentee?.name || 'A mentee',
                    { subject, date, timeSlot }
                );
                
                await sendEmail({
                    to: mentor.userId.email,
                    subject: template.subject,
                    html: template.html,
                });
            }
        } catch (emailError) {
            console.error("[Book Session] Email error:", emailError);
        }

        return NextResponse.json({ 
            success: true,
            message: "Session booked successfully. Waiting for mentor acceptance.", 
            data: {
                session: newSession,
                amount,
                currency: 'INR'
            }
        }, { status: 201 });
    } catch (error) {
        console.error("Booking Error:", error);
        return NextResponse.json({ message: "An error occurred during booking." }, { status: 500 });
    }
}
