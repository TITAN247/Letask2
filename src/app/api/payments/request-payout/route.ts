import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Payout from "@/models/Payout";
import User from "@/models/User";
import Payment from "@/models/Payment";
import MentorProfile from "@/models/MentorProfile";
import { getUserFromSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Use custom JWT auth instead of NextAuth
    const userSession = await getUserFromSession();
    if (!userSession) {
      return NextResponse.json(
        { success: false, message: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    // Get mentor profile to find correct mentorId
    const userId = (userSession as any).id;
    const mentorProfile = await MentorProfile.findOne({ userId }).lean();
    const mentorId = mentorProfile ? (mentorProfile as any)._id.toString() : userId;

    const body = await request.json();
    const { amount, currency = "INR", bankDetails } = body;

    if (!amount || !bankDetails) {
      return NextResponse.json(
        { success: false, message: "Amount and bank details are required" },
        { status: 400 }
      );
    }

    // Minimum payout thresholds
    const minAmount = currency === "INR" ? 500 : 10; // ₹500 or $10
    if (amount < minAmount) {
      return NextResponse.json(
        { success: false, message: `Minimum payout is ${currency === "INR" ? "₹500" : "$10"}` },
        { status: 400 }
      );
    }

    // Calculate available balance using correct mentorId
    const mongoose = await import("mongoose");
    const mentorIdObj = new mongoose.Types.ObjectId(mentorId);
    
    console.log(`[Payout API] Calculating balance for mentorId: ${mentorId}`);
    
    const totalEarnedAgg = await Payment.aggregate([
      { $match: { mentorId: mentorIdObj, status: "completed" } },
      { $group: { _id: null, total: { $sum: "$mentorEarning" } } },
    ]);
    const totalEarned = totalEarnedAgg.length > 0 ? totalEarnedAgg[0].total : 0;
    console.log(`[Payout API] Total earned: ${totalEarned}`);

    const pendingPayoutAgg = await Payout.aggregate([
      { $match: { mentorId: mentorIdObj, status: "pending" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const pendingPayout = pendingPayoutAgg.length > 0 ? pendingPayoutAgg[0].total : 0;
    console.log(`[Payout API] Pending payouts: ${pendingPayout}`);

    const availableBalance = totalEarned - pendingPayout;
    console.log(`[Payout API] Available balance: ${availableBalance}`);

    if (amount > availableBalance) {
      return NextResponse.json(
        { success: false, message: `Insufficient balance. Available: ₹${availableBalance/100}` },
        { status: 400 }
      );
    }

    // Create payout request with userId (not mentorId)
    const payout = await Payout.create({
      mentorId: userId,
      amount,
      currency,
      status: "pending",
      bankDetails,
    });

    // Send notification to admin (simplified - in production, use a notification system)
    try {
      const { sendEmail } = await import("@/lib/mailer");
      
      const mentor = await User.findById(userId).lean();
      
      await sendEmail({
        to: process.env.ADMIN_EMAIL || "admin@letask.in",
        subject: "New Payout Request - LetAsk",
        html: `<h2>New Payout Request</h2>
               <p>Mentor: ${mentor?.name} (${mentor?.email})</p>
               <p>Amount: ${currency === "INR" ? "₹" : "$"}${amount}</p>
               <p>Bank: ${bankDetails.bankName}</p>
               <p>Account: ${bankDetails.accountNumber}</p>`,
      });
    } catch (emailError) {
      console.error("Payout notification email failed:", emailError);
    }

    return NextResponse.json({
      success: true,
      data: {
        payoutId: payout._id,
        amount,
        currency,
        status: "pending",
      },
      message: "Payout request submitted successfully",
    });
  } catch (error: any) {
    console.error("Request payout error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to request payout", error: error.message },
      { status: 500 }
    );
  }
}
