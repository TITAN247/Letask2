import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Payment from "@/models/Payment";
import Session from "@/models/Session";
import User from "@/models/User";
import { getUserFromSession } from "@/lib/auth";
import { emailTemplates } from "@/lib/emailTemplates";
import Razorpay from "razorpay";

// Debug: Log env var availability
console.log('[Payment] RAZORPAY_KEY_ID available:', !!process.env.RAZORPAY_KEY_ID);
console.log('[Payment] RAZORPAY_KEY_SECRET available:', !!process.env.RAZORPAY_KEY_SECRET);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    const userSession = await getUserFromSession();
    console.log('[Payment Create Order] User session:', JSON.stringify(userSession, null, 2));
    
    if (!userSession) {
      console.log('[Payment Create Order] No user session found');
      return NextResponse.json(
        { success: false, message: "Unauthorized - Please login as mentee" },
        { status: 401 }
      );
    }
    
    const userId = userSession.id;
    console.log('[Payment Create Order] User ID:', userId);

    const body = await request.json();
    const { sessionId, amount, currency = "INR" } = body;

    if (!sessionId || !amount) {
      return NextResponse.json(
        { success: false, message: "Session ID and amount are required" },
        { status: 400 }
      );
    }

    // Get session details
    const sessionDetails = await Session.findById(sessionId)
      .populate("mentorId", "earningsBalance")
      .lean();

    if (!sessionDetails) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 }
      );
    }

    // Check if user is the mentee for this session
    if (sessionDetails.menteeId.toString() !== userId) {
      console.log('[Payment Create Order] User mismatch. Session mentee:', sessionDetails.menteeId.toString(), 'Current user:', userId);
      return NextResponse.json(
        { success: false, message: "Unauthorized to make payment for this session" },
        { status: 403 }
      );
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ sessionId });
    if (existingPayment && existingPayment.status === "completed") {
      return NextResponse.json(
        { success: false, message: "Payment already completed for this session" },
        { status: 400 }
      );
    }

    // Convert amount to paise (smallest unit for INR)
    const amountInPaise = Math.round(amount * 100);

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: currency,
      receipt: sessionId,
      notes: {
        sessionId,
        menteeId: userId,
        mentorId: sessionDetails.mentorId._id.toString(),
      },
    });

    // Calculate commission (20% platform fee)
    const commissionAmount = amount * 0.2;
    const mentorEarning = amount * 0.8;

    // Create payment record
    const payment = await Payment.create({
      userId: userId,
      mentorId: sessionDetails.mentorId._id,
      sessionId,
      gateway: "razorpay",
      orderId: order.id,
      amount: amountInPaise,
      currency: currency,
      status: "pending",
      commissionAmount: Math.round(commissionAmount * 100),
      mentorEarning: Math.round(mentorEarning * 100),
    });

    // Send pending payment email to mentee
    try {
      const { sendEmail } = await import("@/lib/mailer");
      const mentee = await User.findById(userId);
      const mentor = await User.findById(sessionDetails.mentorId._id);
      
      if (mentee && mentor) {
        const pendingTemplate = emailTemplates.paymentPending(
          mentee.name,
          mentor.name,
          sessionDetails,
          amount
        );
        
        await sendEmail({
          to: mentee.email,
          subject: pendingTemplate.subject,
          html: pendingTemplate.html,
        });
      }
    } catch (emailError) {
      console.error("[Payment Pending] Email error:", emailError);
    }

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.id,
        amount: amountInPaise,
        currency: currency,
        key: process.env.RAZORPAY_KEY_ID,
        paymentId: payment._id,
      },
      message: "Order created successfully",
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create order", error: error.message },
      { status: 500 }
    );
  }
}
