import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Review from "@/models/Review";
import Session from "@/models/Session";
import User from "@/models/User";
import MentorProfile from "@/models/MentorProfile";
import XPTransaction from "@/models/XPTransaction";
import { getUserFromSession } from "@/lib/auth";

// POST - Submit a review
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const userSession = await getUserFromSession();
    if (!userSession) {
      console.error("[Review API] No user session found");
      return NextResponse.json(
        { success: false, message: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      sessionId,
      overallRating,
      categories,
      writtenFeedback,
      tags,
    } = body;

    console.log(`[Review API] Received review request for session: ${sessionId}`);
    console.log(`[Review API] User: ${userSession.id}, Role: ${userSession.role}`);

    if (!sessionId || !overallRating || !categories) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get session details
    const sessionDetails = await Session.findById(sessionId).lean();
    if (!sessionDetails) {
      console.error(`[Review API] Session not found: ${sessionId}`);
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 }
      );
    }

    console.log(`[Review API] Session found. Status: ${sessionDetails.status}, Mentee: ${sessionDetails.menteeId}, Mentor: ${sessionDetails.mentorId}`);

    // Check if session is completed
    if (sessionDetails.status !== "completed") {
      return NextResponse.json(
        { success: false, message: "Can only review completed sessions" },
        { status: 400 }
      );
    }

    const reviewerId = (userSession as any).id;
    const reviewerRole = (userSession as any).role;

    // Determine reviewer and reviewee
    let revieweeId;
    let revieweeRole;

    // Check if reviewer is the mentee (includes mentees and prementors booking promentors)
    const sessionMenteeId = sessionDetails.menteeId?.toString();
    const sessionMentorId = sessionDetails.mentorId?.toString();
    
    console.log(`[Review API] Comparing - Reviewer: ${reviewerId}, Session Mentee: ${sessionMenteeId}, Session Mentor: ${sessionMentorId}`);
    
    if (reviewerId === sessionMenteeId) {
      // Mentee reviewing mentor (works for both regular mentees and prementors as mentees)
      revieweeId = sessionDetails.mentorId;
      revieweeRole = sessionDetails.mentorType === "promentor" ? "pro-mentor" : "pre-mentor";
      console.log(`[Review API] Mentee reviewing mentor. Reviewee: ${revieweeId}, Role: ${revieweeRole}`);
    } else if (reviewerId === sessionMentorId) {
      // Mentor trying to review - not allowed
      return NextResponse.json(
        { success: false, message: "Mentors cannot review their own sessions" },
        { status: 403 }
      );
    } else {
      return NextResponse.json(
        { success: false, message: "Unauthorized to review this session" },
        { status: 403 }
      );
    }

    // Check if already reviewed
    const existingReview = await Review.findOne({ sessionId, reviewerId }).lean();
    if (existingReview) {
      console.log(`[Review API] Review already exists for session ${sessionId} by user ${reviewerId}`);
      return NextResponse.json(
        { success: false, message: "You have already reviewed this session" },
        { status: 400 }
      );
    }

    // Create review
    // Determine reviewer role: mentee, pre-mentor, or pro-mentor
    let finalReviewerRole = "mentee";
    if (reviewerRole === "prementor") {
      finalReviewerRole = "pre-mentor";
    } else if (reviewerRole === "promentor") {
      finalReviewerRole = "pro-mentor";
    }
    
    console.log(`[Review API] Creating review:`, {
      reviewerId,
      reviewerRole: finalReviewerRole,
      revieweeId,
      revieweeRole,
      sessionId,
      overallRating,
      categories,
      writtenFeedback: writtenFeedback || "",
    });
    
    const review = await Review.create({
      reviewerId,
      reviewerRole: finalReviewerRole,
      revieweeId,
      revieweeRole,
      sessionId,
      overallRating,
      categories,
      writtenFeedback: writtenFeedback || "",
      tags: tags || [],
    });
    
    console.log(`[Review API] Review created successfully: ${review._id}`);

    // Update session rated status
    await Session.findByIdAndUpdate(sessionId, {
      menteeRated: true,
    });

    // Calculate and update mentor's average rating
    const allReviews = await Review.find({ revieweeId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.overallRating, 0);
    const averageRating = totalRating / allReviews.length;

    // Calculate category averages
    const categoryTotals = {
      communication: allReviews.reduce((sum, r) => sum + r.categories.communication, 0),
      expertise: allReviews.reduce((sum, r) => sum + r.categories.expertise, 0),
      punctuality: allReviews.reduce((sum, r) => sum + r.categories.punctuality, 0),
      helpfulness: allReviews.reduce((sum, r) => sum + r.categories.helpfulness, 0),
    };

    // For pre-mentors, we need to find the actual User ID from the PreMentorApplication
    let userIdToUpdate = revieweeId;
    if (revieweeRole === "pre-mentor") {
      const PreMentorApplication = (await import("@/models/PreMentorApplication")).default;
      const preMentorDoc = await PreMentorApplication.findById(revieweeId);
      if (preMentorDoc && preMentorDoc.userId) {
        userIdToUpdate = preMentorDoc.userId;
      }
    }

    await User.findByIdAndUpdate(userIdToUpdate, {
      averageRating,
      totalReviews: allReviews.length,
      categoryAverages: {
        communication: categoryTotals.communication / allReviews.length,
        expertise: categoryTotals.expertise / allReviews.length,
        punctuality: categoryTotals.punctuality / allReviews.length,
        helpfulness: categoryTotals.helpfulness / allReviews.length,
      },
    });

    // Award XP to pre-mentors for reviews
    if (revieweeRole === "pre-mentor") {
      const xpAmount = overallRating >= 5 ? 25 : overallRating >= 4 ? 15 : 0;
      
      if (xpAmount > 0) {
        await XPTransaction.create({
          userId: userIdToUpdate,
          amount: xpAmount,
          reason: `Received ${overallRating}-star review`,
          source: overallRating >= 5 ? "review_5star" : "review_4star",
          sessionId,
        });

        // Update user's XP
        const reviewee = await User.findById(userIdToUpdate);
        if (reviewee) {
          reviewee.xp += xpAmount;
          reviewee.sessionsCompleted += 1;
          
          // Check for level up
          const newLevel = calculateLevel(reviewee.xp);
          if (newLevel > reviewee.level) {
            reviewee.level = newLevel;
            
            // Check if reached Level 7
            if (newLevel >= 7 && !reviewee.canApplyForProMentor) {
              reviewee.canApplyForProMentor = true;
              
              // Send notification
              try {
                const { sendEmail } = await import("@/lib/mailer");
                await sendEmail({
                  to: reviewee.email,
                  subject: "Congratulations! You can now apply for Pro-Mentor",
                  html: `<h2>You've reached Level ${newLevel}!</h2>
                         <p>You can now apply to become a Pro-Mentor on LetAsk.</p>`,
                });
              } catch (e) {
                console.error("Level up email failed:", e);
              }
            }
          }
          
          await reviewee.save();
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: review,
      message: "Review submitted successfully",
    });
  } catch (error: any) {
    console.error("[Review API] Submit review error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit review", error: error.message },
      { status: 500 }
    );
  }
}

// GET - Get reviews for a mentor
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const mentorId = searchParams.get("mentorId");
    const userId = searchParams.get("userId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (!mentorId && !userId) {
      return NextResponse.json(
        { success: false, message: "mentorId or userId is required" },
        { status: 400 }
      );
    }

    let query = {};
    if (mentorId) {
      // For pre-mentors, we need to check both their User ID and PreMentorApplication ID
      // Reviews are stored with revieweeId as the PreMentorApplication ID
      const PreMentorApplication = (await import("@/models/PreMentorApplication")).default;
      const preMentorDoc = await PreMentorApplication.findOne({ userId: mentorId }).select("_id").lean();
      
      if (preMentorDoc) {
        // Pre-mentor found - search by both User ID and PreMentorApplication ID
        query = { 
          $or: [
            { revieweeId: mentorId },
            { revieweeId: preMentorDoc._id }
          ]
        };
      } else {
        // Not a pre-mentor, search by mentorId directly
        query = { revieweeId: mentorId };
      }
    } else {
      query = { reviewerId: userId };
    }

    const skip = (page - 1) * limit;

    const reviews = await Review.find(query)
      .populate("reviewerId", "name")
      .populate("sessionId", "date subject")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Review.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Get reviews error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get reviews", error: error.message },
      { status: 500 }
    );
  }
}

function calculateLevel(xp: number): number {
  const levels = [
    { level: 1, xp: 0 },
    { level: 2, xp: 100 },
    { level: 3, xp: 250 },
    { level: 4, xp: 500 },
    { level: 5, xp: 900 },
    { level: 6, xp: 1400 },
    { level: 7, xp: 2000 },
    { level: 8, xp: 2800 },
    { level: 9, xp: 3800 },
    { level: 10, xp: 5000 },
  ];

  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i].xp) {
      return levels[i].level;
    }
  }
  return 1;
}
