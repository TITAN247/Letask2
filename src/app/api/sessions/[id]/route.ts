import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Session from "@/models/Session";
import User from "@/models/User";
import PreMentorApplication from "@/models/PreMentorApplication";
import MentorProfile from "@/models/MentorProfile";
import { getUserFromSession } from "@/lib/auth";
import { sendEmail } from "@/lib/mailer";
import { emailTemplates } from "@/lib/emailTemplates";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const userSession = await getUserFromSession();
        if (!userSession) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { status } = await req.json(); // 'accepted' or 'cancelled'
        console.log("=== SESSION UPDATE DEBUG ===");
        console.log("Session ID:", id);
        console.log("Status:", status);
        console.log("User Session ID:", (userSession as any).id);
        
        if (!['accepted', 'cancelled'].includes(status)) {
            return NextResponse.json({ message: "Invalid status" }, { status: 400 });
        }

        await dbConnect();

        const session = await Session.findById(id).populate('menteeId', 'name email');
        console.log("Session found:", !!session);
        if (session) {
            console.log("Session mentorId:", session.mentorId);
            console.log("Session mentorType:", session.mentorType);
        }
        
        if (!session) return NextResponse.json({ message: "Session not found" }, { status: 404 });

        // Check authorization - handle both Pro-Mentors and Pre-Mentors
        const currentUserId = (userSession as any).id;
        let isAuthorized = false;
        
        console.log("Checking authorization...");
        console.log("Current user ID:", currentUserId);
        
        // Handle case where mentorId is null
        if (!session.mentorId) {
            console.log("ERROR: session.mentorId is null");
            return NextResponse.json({ message: "Session has no mentor assigned" }, { status: 400 });
        }
        
        // Use mentorType to determine how to check authorization
        if (session.mentorType === 'prementor') {
            // For Pre-Mentors, mentorId is PreMentorApplication document ID
            console.log("Checking Pre-Mentor authorization...");
            const preMentorDoc = await PreMentorApplication.findById(session.mentorId);
            console.log("PreMentor doc found:", !!preMentorDoc);
            if (preMentorDoc) {
                console.log("PreMentor userId:", preMentorDoc.userId);
                console.log("Match check:", preMentorDoc.userId.toString() === currentUserId);
            }
            if (preMentorDoc && preMentorDoc.userId.toString() === currentUserId) {
                isAuthorized = true;
                console.log("Authorized as Pre-Mentor");
            }
        } else {
            // For Pro-Mentors, mentorId should be the User ID
            console.log("Checking Pro-Mentor authorization...");
            if (session.mentorId.toString() === currentUserId) {
                isAuthorized = true;
                console.log("Authorized as Pro-Mentor");
            } else {
                // In case mentorId is a MentorProfile document ID
                const mentorProfile = await MentorProfile.findById(session.mentorId);
                if (mentorProfile && mentorProfile.userId.toString() === currentUserId) {
                    isAuthorized = true;
                    console.log("Authorized as Pro-Mentor (via MentorProfile)");
                }
            }
        }
        
        console.log("Final authorization:", isAuthorized);
        
        if (!isAuthorized) {
            return NextResponse.json({ message: "Unauthorized to modify this session" }, { status: 403 });
        }

        session.status = status;
        await session.save();

        // Get mentor's actual name
        let mentorName = session.mentorId.name;
        if (!mentorName) {
            const preMentorDoc = await PreMentorApplication.findById(session.mentorId._id).populate('userId', 'name');
            if (preMentorDoc && preMentorDoc.userId) {
                mentorName = (preMentorDoc.userId as any).name;
            }
        }

        if (status === 'accepted') {
            // Send booking accepted email to mentee
            try {
                const mentee = session.menteeId;
                if (mentee?.email) {
                    const template = emailTemplates.bookingAccepted(
                        mentee.name || 'Mentee',
                        mentorName || 'Mentor',
                        session,
                        session.amount
                    );
                    await sendEmail({
                        to: mentee.email,
                        subject: template.subject,
                        html: template.html,
                    });
                }
            } catch (emailError) {
                console.error("[Session Accept] Email error:", emailError);
            }
        } else {
            // Send booking declined email to mentee
            try {
                const mentee = session.menteeId;
                if (mentee?.email) {
                    const template = emailTemplates.bookingDeclined(
                        mentee.name || 'Mentee',
                        mentorName || 'Mentor',
                        session
                    );
                    await sendEmail({
                        to: mentee.email,
                        subject: template.subject,
                        html: template.html,
                    });
                }
            } catch (emailError) {
                console.error("[Session Decline] Email error:", emailError);
            }
        }

        return NextResponse.json({ message: `Session ${status}` }, { status: 200 });
    } catch (error) {
        console.error("Session Update Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

// GET - Get session details
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const userSession = await getUserFromSession();
        if (!userSession) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        await dbConnect();

        // First fetch session to check mentorType
        const session = await Session.findById(id).lean();
        
        if (!session) return NextResponse.json({ message: "Session not found" }, { status: 404 });
        
        // Now populate based on mentorType
        let populatedSession;
        if (session.mentorType === 'promentor') {
            // For promentors, mentorId is MentorProfile - populate with userId
            populatedSession = await Session.findById(id)
                .populate('menteeId', 'name email profilePicture')
                .populate('mentorId', 'name email profilePicture userId')
                .lean();
        } else {
            populatedSession = await Session.findById(id)
                .populate('menteeId', 'name email profilePicture')
                .populate('mentorId', 'name email profilePicture')
                .lean();
        }

        // Build response with mentorProfile for client-side promentor detection
        const responseData: any = {
            _id: populatedSession._id,
            menteeId: populatedSession.menteeId,
            mentorId: populatedSession.mentorId,
            mentorType: populatedSession.mentorType,
            status: populatedSession.status,
            subject: populatedSession.subject,
            date: populatedSession.date,
            timeSlot: populatedSession.timeSlot,
            amount: populatedSession.amount,
            paymentStatus: populatedSession.paymentStatus,
            sessionStartedAt: populatedSession.sessionStartedAt,
            sessionEndedAt: populatedSession.sessionEndedAt,
            sessionDurationMinutes: populatedSession.sessionDurationMinutes,
        };
        
        // Include mentorProfile data for promentor sessions
        if (populatedSession.mentorType === 'promentor' && populatedSession.mentorId) {
            responseData.mentorProfile = {
                userId: (populatedSession.mentorId as any).userId,
                name: (populatedSession.mentorId as any).name,
                profilePicture: (populatedSession.mentorId as any).profilePicture
            };
            console.log('[Session API] Added mentorProfile:', JSON.stringify(responseData.mentorProfile));
        }
        
        console.log('[Session API] Response mentorId:', JSON.stringify(populatedSession.mentorId));

        return NextResponse.json({ 
            success: true, 
            data: responseData
        }, { status: 200 });
    } catch (error) {
        console.error("Session Get Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
