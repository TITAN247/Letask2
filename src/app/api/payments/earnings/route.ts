import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Payment from "@/models/Payment";
import Payout from "@/models/Payout";
import MentorProfile from "@/models/MentorProfile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { getUserFromSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    // Try both auth methods
    let userId: string | null = null;
    
    // First try getServerSession (NextAuth)
    const session = await getServerSession(authOptions);
    if (session?.user) {
      userId = (session.user as any).id;
    } else {
      // Fallback to JWT token auth
      const userSession = await getUserFromSession();
      if (userSession) {
        userId = userSession.id;
      }
    }
    
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    console.log(`[Earnings API] Fetching earnings for user: ${userId}`);

    // For ProMentors, we need to check both User ID and MentorProfile._id
    const mongoose = await import("mongoose");
    const userIdObj = new mongoose.Types.ObjectId(userId);
    
    // Find mentor profile to get the mentorProfileId
    const mentorProfile = await MentorProfile.findOne({ userId }).lean();
    const mentorProfileId = mentorProfile?._id;
    
    console.log(`[Earnings API] Mentor profile found: ${mentorProfileId ? 'YES' : 'NO'}`);

    // Build mentor ID query - match either User ID or MentorProfile ID
    const mentorIdQuery = mentorProfileId 
      ? { $in: [userIdObj, new mongoose.Types.ObjectId(mentorProfileId)] }
      : userIdObj;
    
    // Get total earned
    const totalEarnedAgg = await Payment.aggregate([
      { $match: { mentorId: mentorIdQuery, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$mentorEarning" } } },
    ]);
    const totalEarned = totalEarnedAgg.length > 0 ? totalEarnedAgg[0].total : 0;

    // Get pending payout
    const pendingPayoutAgg = await Payout.aggregate([
      { $match: { mentorId: userIdObj, status: "pending" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const pendingPayout = pendingPayoutAgg.length > 0 ? pendingPayoutAgg[0].total : 0;

    // Get completed payouts
    const completedPayouts = await Payout.find({
      mentorId: userId,
      status: { $in: ["paid", "approved"] },
    })
      .sort({ createdAt: -1 })
      .lean();

    // Get this month's earnings
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthAgg = await Payment.aggregate([
      {
        $match: {
          mentorId: mentorIdQuery,
          status: "completed",
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$mentorEarning" } } },
    ]);
    const thisMonthEarnings = thisMonthAgg.length > 0 ? thisMonthAgg[0].total : 0;
    
    console.log(`[Earnings API] Total earned: ${totalEarned}, Available: ${totalEarned - pendingPayout}`);

    return NextResponse.json({
      success: true,
      data: {
        totalEarned,
        pendingPayout,
        completedPayouts: completedPayouts.map(p => ({
          id: p._id,
          amount: p.amount,
          currency: p.currency,
          status: p.status,
          processedAt: p.processedAt,
          createdAt: p.createdAt,
        })),
        thisMonthEarnings,
        availableBalance: totalEarned - pendingPayout,
      },
    });
  } catch (error: any) {
    console.error("[Earnings API] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get earnings", error: error.message },
      { status: 500 }
    );
  }
}
