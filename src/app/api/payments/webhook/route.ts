import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Payment from "@/models/Payment";
import Session from "@/models/Session";
import User from "@/models/User";
import crypto from "crypto";

// This webhook handles Razorpay events for production reliability
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET || "")
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("[Webhook] Invalid signature");
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const event = JSON.parse(body);
    console.log("[Webhook] Event received:", event.event);

    switch (event.event) {
      case "payment.captured":
        await handlePaymentCaptured(event.payload.payment.entity);
        break;

      case "payment.failed":
        await handlePaymentFailed(event.payload.payment.entity);
        break;

      case "refund.processed":
        await handleRefundProcessed(event.payload.refund.entity);
        break;

      default:
        console.log("[Webhook] Unhandled event:", event.event);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[Webhook] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

async function handlePaymentCaptured(payment: any) {
  const orderId = payment.order_id;
  
  const existingPayment = await Payment.findOne({ orderId });
  if (!existingPayment) {
    console.error("[Webhook] Payment record not found for order:", orderId);
    return;
  }

  // Already processed
  if (existingPayment.status === "completed") {
    console.log("[Webhook] Payment already completed:", orderId);
    return;
  }

  // Update payment status
  existingPayment.status = "completed";
  existingPayment.paymentId = payment.id;
  await existingPayment.save();

  // Update session
  await Session.findByIdAndUpdate(existingPayment.sessionId, {
    paymentStatus: "paid",
  });

  // Update mentor earnings
  await User.findByIdAndUpdate(existingPayment.mentorId, {
    $inc: { 
      earningsBalance: existingPayment.mentorEarning, 
      totalEarned: existingPayment.mentorEarning 
    },
  });

  console.log("[Webhook] Payment captured and processed:", payment.id);
}

async function handlePaymentFailed(payment: any) {
  const orderId = payment.order_id;
  
  await Payment.findOneAndUpdate(
    { orderId },
    { 
      status: "failed",
      failureReason: payment.error_description || "Payment failed"
    }
  );

  console.log("[Webhook] Payment marked as failed:", orderId);
}

async function handleRefundProcessed(refund: any) {
  const paymentId = refund.payment_id;
  
  await Payment.findOneAndUpdate(
    { paymentId },
    { status: "refunded" }
  );

  console.log("[Webhook] Payment marked as refunded:", paymentId);
}
