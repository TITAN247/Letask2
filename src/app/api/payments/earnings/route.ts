import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Payment from "@/models/Payment";
import Payout from "@/models/Payout";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;

    // Get total earned
    const totalEarnedAgg = await Payment.aggregate([
      { $match: { mentorId: new (await import("mongoose")).Types.ObjectId(userId), status: "completed" } },
      { $group: { _id: null, total: { $sum: "$mentorEarning" } } },
    ]);
    const totalEarned = totalEarnedAgg.length > 0 ? totalEarnedAgg[0].total : 0;

    // Get pending payout
    const pendingPayoutAgg = await Payout.aggregate([
      { $match: { mentorId: new (await import("mongoose")).Types.ObjectId(userId), status: "pending" } },
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
          mentorId: new (await import("mongoose")).Types.ObjectId(userId),
          status: "completed",
          createdAt: { $gte: startOfMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$mentorEarning" } } },
    ]);
    const thisMonthEarnings = thisMonthAgg.length > 0 ? thisMonthAgg[0].total : 0;

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
    console.error("Get earnings error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get earnings", error: error.message },
      { status: 500 }
    );
  }
}
