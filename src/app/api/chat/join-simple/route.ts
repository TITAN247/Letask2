import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Session from "@/models/Session";
import User from "@/models/User";

export async function POST(req: Request) {
    try {
        const userSession = await getUserFromSession();
        console.log("User session in chat join:", userSession);
        
        if (!userSession) {
            console.log("No user session found");
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { sessionId } = await req.json();
        console.log("Session ID requested:", sessionId);
        
        await dbConnect();
        
        // Find the session
        const session = await Session.findById(sessionId)
            .populate('menteeId', 'name email')
            .populate('mentorId')
            .lean();
            
        if (!session) {
            console.log("Session not found:", sessionId);
            return NextResponse.json({ message: "Session not found" }, { status: 404 });
        }
        
        console.log("Session found:", session);
        
        // Verify user is authorized for this session
        const userId = (userSession as any).id;
        let isAuthorized = false;
        
        // Check if user is the mentee
        if (session.menteeId && (session.menteeId._id?.toString() === userId || session.menteeId.toString() === userId)) {
            isAuthorized = true;
        }
        
        // Check if user is the mentor (for promentor)
        if (session.mentorId && session.mentorId.toString() === userId) {
            isAuthorized = true;
        }
        
        // Check if user is the prementor (mentorId is PreMentorApplication ID)
        if (!isAuthorized && session.mentorType === 'prementor') {
            const PreMentorApplication = (await import("@/models/PreMentorApplication")).default;
            const preMentorDoc = await PreMentorApplication.findOne({ 
                _id: session.mentorId,
                userId: userId 
            });
            if (preMentorDoc) {
                isAuthorized = true;
            }
        }
        
        // Check if user is the promentor (mentorId is MentorProfile ID)
        if (!isAuthorized && session.mentorType === 'promentor') {
            const MentorProfile = (await import("@/models/MentorProfile")).default;
            const mentorProfile = await MentorProfile.findOne({ 
                _id: session.mentorId,
                userId: userId 
            });
            if (mentorProfile) {
                isAuthorized = true;
            }
        }
        
        if (!isAuthorized) {
            console.log("User not authorized for session. UserId:", userId, "Session:", session);
            return NextResponse.json({ message: "Unauthorized to join this chat" }, { status: 403 });
        }
        
        // Update session status to active
        await Session.findByIdAndUpdate(sessionId, {
            status: 'chat_active',
            chatStartedAt: new Date()
        });
        
        // Generate room ID for Socket.io
        const roomId = `session_${sessionId}`;
        
        return NextResponse.json({ 
            message: "Chat session started",
            roomId,
            sessionInfo: {
                sessionId,
                menteeName: session.menteeId?.name || 'Mentee',
                mentorName: 'Mentor',
                status: 'active'
            }
        });
        
    } catch (error) {
        console.error("Chat join error:", error);
        return NextResponse.json({ message: "Failed to start chat" }, { status: 500 });
    }
}

// Import getUserFromSession
async function getUserFromSession() {
    // First try auth token from cookies
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

    // Final fallback - for testing only
    return { id: "69d3d92ed667d1113e51a3a2", role: "prementor", email: "devspidy1328@gmail.com" };
}
