import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Payout from "@/models/Payout";
import User from "@/models/User";
import Payment from "@/models/Payment";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function POST(request: NextRequest) {
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

    // Calculate available balance
    const totalEarnedAgg = await Payment.aggregate([
      { $match: { mentorId: new (await import("mongoose")).Types.ObjectId(userId), status: "completed" } },
      { $group: { _id: null, total: { $sum: "$mentorEarning" } } },
    ]);
    const totalEarned = totalEarnedAgg.length > 0 ? totalEarnedAgg[0].total : 0;

    const pendingPayoutAgg = await Payout.aggregate([
      { $match: { mentorId: new (await import("mongoose")).Types.ObjectId(userId), status: "pending" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const pendingPayout = pendingPayoutAgg.length > 0 ? pendingPayoutAgg[0].total : 0;

    const availableBalance = totalEarned - pendingPayout;

    if (amount > availableBalance) {
      return NextResponse.json(
        { success: false, message: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Create payout request
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
