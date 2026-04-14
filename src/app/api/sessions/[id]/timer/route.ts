import { NextResponse, NextRequest } from "next/server";
import { getUserFromSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Session from "@/models/Session";
import User from "@/models/User";
import MentorProfile from "@/models/MentorProfile";
import { sendSessionStartedEmail, sendFeedbackRequestEmail } from "@/lib/email";

// GET - Get session timer status
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const userSession = await getUserFromSession();
    if (!userSession) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const sessionData = await Session.findById(id);
    if (!sessionData) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 }
      );
    }

    const userId = (userSession as any).id;
    const userRole = (userSession as any).role;
    const isMentee = sessionData.menteeId.toString() === userId;
    let isMentor = sessionData.mentorId.toString() === userId;
    
    // For prementor sessions, mentorId is the PreMentorApplication document ID
    // We need to check if the current user is the owner of that PreMentorApplication
    if (!isMentor && sessionData.mentorType === 'prementor') {
      const PreMentorApplication = (await import("@/models/PreMentorApplication")).default;
      const preMentorDoc = await PreMentorApplication.findOne({ 
        _id: sessionData.mentorId,
        userId: userId 
      });
      if (preMentorDoc) {
        isMentor = true;
      }
    }
    
    // For promentor sessions, mentorId is the MentorProfile document ID
    // We need to check if the current user is the owner of that MentorProfile
    if (!isMentor && sessionData.mentorType === 'promentor') {
      const mentorProfile = await MentorProfile.findOne({ 
        _id: sessionData.mentorId,
        userId: userId 
      });
      if (mentorProfile) {
        isMentor = true;
      }
    }

    if (!isMentee && !isMentor) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to view this session" },
        { status: 403 }
      );
    }

    // Calculate time remaining
    let timeRemaining = 0;
    let isRunning = false;
    let isEnded = false;

    if (sessionData.sessionStartedAt && !sessionData.sessionEndedAt) {
      const startTime = new Date(sessionData.sessionStartedAt).getTime();
      const durationMs = sessionData.sessionDurationMinutes * 60 * 1000;
      const endTime = startTime + durationMs;
      const now = Date.now();
      
      timeRemaining = Math.max(0, endTime - now);
      isRunning = timeRemaining > 0;
      
      // Auto-end if time is up
      if (timeRemaining === 0 && sessionData.status !== "completed") {
        sessionData.status = "completed";
        sessionData.sessionEndedAt = new Date();
        sessionData.endedBy = "system_timeout";
        sessionData.endedReason = "Session time limit reached";
        await sessionData.save();
        isEnded = true;
      }
    }

    // Check if both users have joined
    const bothJoined = sessionData.mentorJoined && sessionData.menteeJoined;
    
    // Only show timer if both joined and session started
    const showTimer = bothJoined && sessionData.sessionStartedAt && !sessionData.sessionEndedAt;

    return NextResponse.json({
      success: true,
      data: {
        sessionId: sessionData._id,
        status: sessionData.status,
        sessionStartedAt: sessionData.sessionStartedAt,
        sessionEndedAt: sessionData.sessionEndedAt,
        sessionDurationMinutes: sessionData.sessionDurationMinutes,
        timeRemainingSeconds: Math.ceil(timeRemaining / 1000),
        isRunning: showTimer && isRunning,
        isEnded: isEnded || sessionData.status === "completed",
        endedBy: sessionData.endedBy,
        endedReason: sessionData.endedReason,
        canStart: !sessionData.sessionStartedAt && sessionData.status === "accepted",
        userRole: isMentee ? 'mentee' : isMentor ? (userRole || 'mentor') : 'unknown',
        isSessionMentor: isMentor,
        isSessionMentee: isMentee,
        mentorJoined: sessionData.mentorJoined,
        menteeJoined: sessionData.menteeJoined,
        bothJoined,
        waitingForOther: sessionData.sessionStartedAt && !bothJoined,
      },
    });
  } catch (error: any) {
    console.error("Get timer error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get timer", error: error.message },
      { status: 500 }
    );
  }
}

// POST - Start or end session
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    
    const userSession = await getUserFromSession();
    if (!userSession) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, reason } = body; // action: 'start' | 'end' | 'join'

    const { id } = await params;
    const sessionData = await Session.findById(id);
    if (!sessionData) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 }
      );
    }

    const userId = (userSession as any).id;
    const userRole = (userSession as any).role;
    const isMentee = sessionData.menteeId.toString() === userId;
    let isMentor = sessionData.mentorId.toString() === userId;
    
    // For prementor sessions, mentorId is the PreMentorApplication document ID
    // We need to check if the current user is the owner of that PreMentorApplication
    if (!isMentor && sessionData.mentorType === 'prementor') {
      const PreMentorApplication = (await import("@/models/PreMentorApplication")).default;
      const preMentorDoc = await PreMentorApplication.findOne({ 
        _id: sessionData.mentorId,
        userId: userId 
      });
      if (preMentorDoc) {
        isMentor = true;
      }
    }
    
    // For promentor sessions, mentorId is the MentorProfile document ID
    // We need to check if the current user is the owner of that MentorProfile
    if (!isMentor && sessionData.mentorType === 'promentor') {
      const mentorProfile = await MentorProfile.findOne({ 
        _id: sessionData.mentorId,
        userId: userId 
      });
      if (mentorProfile) {
        isMentor = true;
      }
    }

    if (!isMentee && !isMentor) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to modify this session" },
        { status: 403 }
      );
    }

    if (action === "join") {
      // Track when mentor or mentee joins
      if (isMentor) {
        sessionData.mentorJoined = true;
        sessionData.mentorJoinedAt = new Date();
      } else if (isMentee) {
        sessionData.menteeJoined = true;
        sessionData.menteeJoinedAt = new Date();
      }
      await sessionData.save();

      const bothJoined = sessionData.mentorJoined && sessionData.menteeJoined;

      return NextResponse.json({
        success: true,
        data: {
          mentorJoined: sessionData.mentorJoined,
          menteeJoined: sessionData.menteeJoined,
          bothJoined,
          isSessionMentor: isMentor,
          isSessionMentee: isMentee,
        },
        message: `${isMentor ? 'Mentor' : 'Mentee'} joined successfully`,
      });
    }

    if (action === "start") {
      // Only mentor can start the session
      if (!isMentor) {
        return NextResponse.json(
          { success: false, message: "Only mentor can start the session" },
          { status: 403 }
        );
      }

      if (sessionData.sessionStartedAt) {
        return NextResponse.json(
          { success: false, message: "Session already started" },
          { status: 400 }
        );
      }

      sessionData.sessionStartedAt = new Date();
      sessionData.status = "chat_active";
      // Set default 15-minute duration if not set
      if (!sessionData.sessionDurationMinutes) {
        sessionData.sessionDurationMinutes = 15;
      }
      await sessionData.save();

      // Send email to mentee
      try {
        const mentee = await User.findById(sessionData.menteeId);
        const mentor = await User.findById(sessionData.mentorId);
        if (mentee && mentor) {
          await sendSessionStartedEmail({
            to: mentee.email,
            menteeName: mentee.name || 'Student',
            mentorName: mentor.name || 'Mentor',
            sessionId: id,
          });
        }
      } catch (emailError) {
        console.error("Failed to send session started email:", emailError);
      }

      return NextResponse.json({
        success: true,
        data: {
          sessionStartedAt: sessionData.sessionStartedAt,
          sessionDurationMinutes: sessionData.sessionDurationMinutes,
        },
        message: "Session started successfully",
      });
    }

    if (action === "end") {
      if (sessionData.sessionEndedAt) {
        return NextResponse.json(
          { success: false, message: "Session already ended" },
          { status: 400 }
        );
      }

      if (!sessionData.sessionStartedAt) {
        return NextResponse.json(
          { success: false, message: "Session hasn't started yet" },
          { status: 400 }
        );
      }

      sessionData.sessionEndedAt = new Date();
      sessionData.status = "completed";
      sessionData.endedBy = isMentee ? "mentee" : "mentor";
      sessionData.endedReason = reason || "Session ended by user";
      await sessionData.save();

      // Update mentor earnings if this is a paid session
      let earningsUpdated = false;
      try {
        if (sessionData.paymentStatus === 'completed' || sessionData.paymentStatus === 'paid') {
          const mentorProfile = await MentorProfile.findById(sessionData.mentorId);
          if (mentorProfile) {
            const sessionAmount = sessionData.amount || mentorProfile.hourlyRateINR || 500;
            // Update total earnings
            mentorProfile.totalEarnings = (mentorProfile.totalEarnings || 0) + sessionAmount;
            // Add to earnings history
            if (!mentorProfile.earningsHistory) {
              mentorProfile.earningsHistory = [];
            }
            mentorProfile.earningsHistory.push({
              sessionId: id,
              amount: sessionAmount,
              date: new Date(),
              status: 'completed'
            });
            await mentorProfile.save();
            earningsUpdated = true;
            console.log(`[Timer API] Updated mentor earnings: +${sessionAmount} INR for session ${id}`);
          }
        }
      } catch (earningsError) {
        console.error("[Timer API] Failed to update mentor earnings:", earningsError);
      }

      // Send feedback email to mentee
      let emailSent = false;
      try {
        const mentee = await User.findById(sessionData.menteeId);
        const mentor = await User.findById(sessionData.mentorId);
        if (mentee && mentor) {
          await sendFeedbackRequestEmail({
            to: mentee.email,
            menteeName: mentee.name || 'Student',
            mentorName: mentor.name || 'Mentor',
            sessionId: id,
          });
          emailSent = true;
        }
      } catch (emailError) {
        console.error("Failed to send feedback request email:", emailError);
      }

      return NextResponse.json({
        success: true,
        data: {
          sessionEndedAt: sessionData.sessionEndedAt,
          endedBy: sessionData.endedBy,
          showFeedback: true, // Show feedback for mentee
          emailSent,
          earningsUpdated,
        },
        message: "Session ended successfully",
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Session timer action error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to perform action", error: error.message },
      { status: 500 }
    );
  }
}
