import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Payment from "@/models/Payment";
import Session from "@/models/Session";
import { getUserFromSession } from "@/lib/auth";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

// Request a refund for a session
export async function POST(request: NextRequest) {
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
    const { sessionId, reason } = body;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, message: "Session ID is required" },
        { status: 400 }
      );
    }

    // Find the payment
    const payment = await Payment.findOne({ sessionId });
    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment not found" },
        { status: 404 }
      );
    }

    // Verify the user owns this payment
    if (payment.userId.toString() !== userSession.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to request refund" },
        { status: 403 }
      );
    }

    // Check if payment was completed
    if (payment.status !== "completed") {
      return NextResponse.json(
        { success: false, message: "Payment is not eligible for refund" },
        { status: 400 }
      );
    }

    // Check if already refunded
    if (payment.status === "refunded") {
      return NextResponse.json(
        { success: false, message: "Payment already refunded" },
        { status: 400 }
      );
    }

    // Get session to check refund eligibility
    const session = await Session.findById(sessionId);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 }
      );
    }

    // Check if session is completed (no refund for completed sessions)
    if (session.status === "completed") {
      return NextResponse.json(
        { success: false, message: "Cannot refund completed sessions" },
        { status: 400 }
      );
    }

    // Initiate refund via Razorpay
    try {
      const refund = await razorpay.payments.refund(payment.paymentId, {
        amount: payment.amount,
        notes: {
          sessionId: sessionId,
          reason: reason || "User requested refund",
        },
      });

      // Update payment status
      payment.status = "refunded";
      payment.refundId = refund.id;
      payment.refundReason = reason;
      await payment.save();

      // Update session
      await Session.findByIdAndUpdate(sessionId, {
        paymentStatus: "refunded",
        status: "cancelled",
      });

      // Reverse mentor earnings (if session was accepted)
      if (session.status === "accepted" || session.status === "chat_active") {
        await User.findByIdAndUpdate(payment.mentorId, {
          $inc: { 
            earningsBalance: -payment.mentorEarning 
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Refund processed successfully",
        data: {
          refundId: refund.id,
          amount: refund.amount / 100,
          status: refund.status,
        },
      });
    } catch (razorpayError: any) {
      console.error("[Refund] Razorpay error:", razorpayError);
      return NextResponse.json(
        { success: false, message: "Failed to process refund", error: razorpayError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("[Refund] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to process refund", error: error.message },
      { status: 500 }
    );
  }
}
