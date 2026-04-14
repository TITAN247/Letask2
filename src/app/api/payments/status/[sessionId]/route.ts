import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Payment from "@/models/Payment";
import Session from "@/models/Session";
import { getUserFromSession } from "@/lib/auth";

// Check payment status for a session
export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
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

    const { sessionId } = params;

    // Get session details
    const session = await Session.findById(sessionId);
    if (!session) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 }
      );
    }

    // Verify user is part of this session
    const isMentee = session.menteeId.toString() === userSession.id;
    const isMentor = session.mentorId.toString() === userSession.id;

    if (!isMentee && !isMentor) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to view this payment" },
        { status: 403 }
      );
    }

    // Get payment details
    const payment = await Payment.findOne({ sessionId });

    if (!payment) {
      return NextResponse.json({
        success: true,
        data: {
          status: "not_initiated",
          sessionStatus: session.status,
          paymentStatus: session.paymentStatus,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        status: payment.status,
        amount: payment.amount / 100,
        currency: payment.currency,
        orderId: payment.orderId,
        paymentId: payment.paymentId,
        createdAt: payment.createdAt,
        commissionAmount: payment.commissionAmount / 100,
        mentorEarning: payment.mentorEarning / 100,
        sessionStatus: session.status,
        paymentStatus: session.paymentStatus,
        refundReason: payment.refundReason,
        isRefundable: 
          payment.status === "completed" && 
          session.status !== "completed" &&
          session.status !== "cancelled",
      },
    });
  } catch (error: any) {
    console.error("[Payment Status] Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get payment status", error: error.message },
      { status: 500 }
    );
  }
}
