import { NextResponse, NextRequest } from "next/server";
import dbConnect from "@/lib/db";
import Message from "@/models/Message";
import Session from "@/models/Session";
import MentorProfile from "@/models/MentorProfile";
import { getUserFromSession } from "@/lib/auth";

// Fetch chat history for a session
export async function GET(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
    try {
        const { sessionId } = await params;
        const userSession = await getUserFromSession();
        
        let uid = "anonymous_tester";
        if (userSession) uid = String((userSession as any).id);

        await dbConnect();
        
        let targetSession;
        let isAuthorized = uid === "anonymous_tester"; // Allow anonymous for testing
        
        try {
            targetSession = await Session.findById(sessionId);
            if (!targetSession) return NextResponse.json({ message: "Session not found." }, { status: 404 });
            
            // Check authorization
            if (!isAuthorized) {
                // Check if user is the mentee
                if (targetSession.menteeId.toString() === uid) {
                    isAuthorized = true;
                }
                // Check if user is the mentor (for promentor)
                else if (targetSession.mentorId.toString() === uid) {
                    isAuthorized = true;
                }
                // Check if user is the prementor (mentorId is PreMentorApplication ID)
                else if (targetSession.mentorType === 'prementor') {
                    const PreMentorApplication = (await import("@/models/PreMentorApplication")).default;
                    const preMentorDoc = await PreMentorApplication.findOne({ 
                        _id: targetSession.mentorId,
                        userId: uid 
                    });
                    if (preMentorDoc) {
                        isAuthorized = true;
                    }
                }
                // Check if user is the promentor (mentorId is MentorProfile ID)
                else if (targetSession.mentorType === 'promentor') {
                    const MentorProfile = (await import("@/models/MentorProfile")).default;
                    const mentorProfile = await MentorProfile.findOne({ 
                        _id: targetSession.mentorId,
                        userId: uid 
                    });
                    if (mentorProfile) {
                        isAuthorized = true;
                    }
                }
                
                if (!isAuthorized) {
                    return NextResponse.json({ message: "Unauthorized access to session chat." }, { status: 403 });
                }
            }
        } catch(e) {
            return NextResponse.json({ message: "Invalid Session format." }, { status: 400 });
        }

        const messages = await Message.find({ sessionId }).sort({ timestamp: 1 }).lean();
        
        const mappedData = messages.map(m => ({
            ...m,
            text: m.messageText
        }));

        return NextResponse.json(mappedData);
    } catch (error) {
        console.error("Fetch Messages Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

// Save a new message
export async function POST(req: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
    try {
        const { sessionId } = await params;
        const userSession = await getUserFromSession();
        
        let uid = "anonymous_tester";
        if (userSession) uid = String((userSession as any).id);

        const body = await req.json();
        const { text, messageId, status, fallbackSenderId } = body;

        if (!text || !sessionId) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        await dbConnect();

        let targetSession;
        let receiverId = "unknown";
        let isAuthorized = uid === "anonymous_tester"; // Allow anonymous for testing
        
        try {
            targetSession = await Session.findById(sessionId);
            if (!targetSession) {
                return NextResponse.json({ message: "Session not found." }, { status: 404 });
            }
            
            // Check authorization
            if (!isAuthorized) {
                // Check if user is the mentee
                if (targetSession.menteeId.toString() === uid) {
                    isAuthorized = true;
                    receiverId = targetSession.mentorId;
                }
                // Check if user is the mentor (for promentor)
                else if (targetSession.mentorId.toString() === uid) {
                    isAuthorized = true;
                    receiverId = targetSession.menteeId;
                }
                // Check if user is the prementor (mentorId is PreMentorApplication ID)
                else if (targetSession.mentorType === 'prementor') {
                    const PreMentorApplication = (await import("@/models/PreMentorApplication")).default;
                    const preMentorDoc = await PreMentorApplication.findOne({ 
                        _id: targetSession.mentorId,
                        userId: uid 
                    });
                    if (preMentorDoc) {
                        isAuthorized = true;
                        receiverId = targetSession.menteeId;
                    }
                }
                // Check if user is the promentor (mentorId is MentorProfile ID)
                else if (targetSession.mentorType === 'promentor') {
                    const MentorProfile = (await import("@/models/MentorProfile")).default;
                    const mentorProfile = await MentorProfile.findOne({ 
                        _id: targetSession.mentorId,
                        userId: uid 
                    });
                    if (mentorProfile) {
                        isAuthorized = true;
                        receiverId = targetSession.menteeId;
                    }
                }
                
                if (!isAuthorized) {
                    return NextResponse.json({ message: "Unauthorized to send messages in this chat." }, { status: 403 });
                }
            } else {
                // For anonymous, determine receiver the old way
                receiverId = targetSession.menteeId.toString() === uid ? targetSession.mentorId : targetSession.menteeId;
            }
        } catch(e) {
            console.warn("Invalid Session ID during message insert");
        }

        const finalSenderId = (uid === "anonymous_tester" && fallbackSenderId) ? fallbackSenderId : uid;

        const newMessage = await Message.create({
            messageId: messageId || `n_${Date.now()}_${Math.random().toString(36).substr(2,9)}`,
            senderId: finalSenderId,
            receiverId: receiverId,
            sessionId,
            messageText: text,
            status: status || 'sent',
            timestamp: new Date()
        });

        const mappedResponse = {
            ...newMessage.toObject(),
            text: newMessage.messageText
        };

        return NextResponse.json(mappedResponse, { status: 201 });
    } catch (error) {
        console.error("Save Message Error:", error);
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
