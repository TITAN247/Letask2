import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Session from "@/models/Session";
import User from "@/models/User";

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
        const isMentor = session.mentorId.userId ? 
            session.mentorId.userId.toString() === userId : 
            session.mentorId.toString() === userId;
        
        if (!isMentor) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }
        
        // Update session status to active chat
        await Session.findByIdAndUpdate(sessionId, {
            status: 'chat_active',
            chatStartedAt: new Date()
        });
        
        // Generate unique room ID for video call
        const roomId = `session_${sessionId}_${Date.now()}`;
        
        return NextResponse.json({ 
            message: "Chat session started",
            roomId,
            sessionInfo: {
                sessionId,
                menteeName: session.menteeId.name,
                mentorName: session.mentorId.userId ? 
                    (await User.findById(session.mentorId.userId).select('name').lean())?.name :
                    (await User.findById(session.mentorId).select('name').lean())?.name
            }
        }, { status: 200 });
        
    } catch (error) {
        console.error("Chat start error:", error);
        return NextResponse.json({ message: "Failed to start chat" }, { status: 500 });
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
