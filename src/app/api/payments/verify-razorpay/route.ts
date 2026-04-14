import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Payment from "@/models/Payment";
import Session from "@/models/Session";
import User from "@/models/User";
import { emailTemplates } from "@/lib/emailTemplates";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Missing required payment details" },
        { status: 400 }
      );
    }

    // Verify signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, message: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Find payment record
    const payment = await Payment.findOne({ orderId: razorpay_order_id });
    if (!payment) {
      return NextResponse.json(
        { success: false, message: "Payment record not found" },
        { status: 404 }
      );
    }

    if (payment.status === "completed") {
      return NextResponse.json(
        { success: true, message: "Payment already verified" },
        { status: 200 }
      );
    }

    // Update payment status
    payment.status = "completed";
    payment.paymentId = razorpay_payment_id;
    await payment.save();

    // Update session payment status
    await Session.findByIdAndUpdate(payment.sessionId, {
      paymentStatus: "paid",
    });

    // Update mentor earnings
    await User.findByIdAndUpdate(payment.mentorId, {
      $inc: { earningsBalance: payment.mentorEarning, totalEarned: payment.mentorEarning },
    });

    // Send confirmation emails
    try {
      const { sendEmail } = await import("@/lib/mailer");
      
      // Get session details for email
      const session = await Session.findById(payment.sessionId)
        .populate("menteeId", "name email")
        .populate("mentorId", "name email")
        .lean();

      if (session) {
        const amountInRupees = payment.amount / 100;
        const earningInRupees = payment.mentorEarning / 100;

        // Send to mentee
        const menteeTemplate = emailTemplates.paymentReceived(
          (session.menteeId as any).name,
          (session.mentorId as any).name,
          session,
          amountInRupees
        );
        await sendEmail({
          to: (session.menteeId as any).email,
          subject: menteeTemplate.subject,
          html: menteeTemplate.html,
        });

        // Send to mentor
        const mentorTemplate = emailTemplates.paymentReceivedMentor(
          (session.mentorId as any).name,
          (session.menteeId as any).name,
          session,
          amountInRupees,
          earningInRupees
        );
        await sendEmail({
          to: (session.mentorId as any).email,
          subject: mentorTemplate.subject,
          html: mentorTemplate.html,
        });
      }
    } catch (emailError) {
      console.error("Payment confirmation email failed:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      data: {
        paymentId: razorpay_payment_id,
        status: "completed",
      },
    });
  } catch (error: any) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to verify payment", error: error.message },
      { status: 500 }
    );
  }
}
