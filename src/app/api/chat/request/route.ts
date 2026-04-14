import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Session from "@/models/Session";
import User from "@/models/User";
// EMAIL DISABLED: import { sendEmail } from "@/lib/mailer";

export async function POST(req: Request) {
    try {
        const userSession = await getUserFromSession();
        if (!userSession) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { sessionId } = await req.json();
        
        await dbConnect();
        
        // Find the session
        const session = await Session.findById(sessionId)
            .populate('menteeId', 'name email')
            .populate('mentorId')
            .lean();
            
        if (!session) {
            return NextResponse.json({ message: "Session not found" }, { status: 404 });
        }
        
        // Check if user is part of this session
        const userId = (userSession as any).id;
        const isMentee = session.menteeId._id.toString() === userId;
        
        if (!isMentee) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }
        
        // Update session status to indicate chat requested
        await Session.findByIdAndUpdate(sessionId, {
            status: 'chat_requested',
            chatRequestedAt: new Date()
        });
        
        // Get mentor's user info
        let mentorUser;
        if (session.mentorId.userId) {
            // Pre-Mentor case
            mentorUser = await User.findById(session.mentorId.userId).select('name email').lean();
        } else {
            // Pro-Mentor case
            mentorUser = await User.findById(session.mentorId).select('name email').lean();
        }
        
        // EMAIL DISABLED: Skipping chat request email to mentor
        
        return NextResponse.json({ 
            message: "Chat request sent successfully",
            chatUrl: `/chat/${sessionId}`
        }, { status: 200 });
        
    } catch (error) {
        console.error("Chat request error:", error);
        return NextResponse.json({ message: "Failed to send chat request" }, { status: 500 });
    }
}

// Import getUserFromSession
async function getUserFromSession() {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    if (token) {
        const { verifyToken } = await import("@/lib/auth");
        return verifyToken(token);
    }

    // Fallback to NextAuth Google OAuth session
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("@/lib/authOptions");
    const session = await getServerSession(authOptions);
    
    if (session?.user) {
        return { id: (session.user as any).id, role: (session.user as any).role, email: session.user.email };
    }

    return null;
}
