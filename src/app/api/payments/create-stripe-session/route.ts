import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Session from "@/models/Session";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

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

    const body = await request.json();
    const { sessionId, amount, currency = "usd" } = body;

    if (!sessionId || !amount) {
      return NextResponse.json(
        { success: false, message: "Session ID and amount are required" },
        { status: 400 }
      );
    }

    // Get session details
    const sessionDetails = await Session.findById(sessionId)
      .populate("mentorId", "name")
      .lean();

    if (!sessionDetails) {
      return NextResponse.json(
        { success: false, message: "Session not found" },
        { status: 404 }
      );
    }

    // Check if user is the mentee
    if (sessionDetails.menteeId.toString() !== (session.user as any).id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized to make payment for this session" },
        { status: 403 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Create Stripe checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Mentorship Session with ${(sessionDetails.mentorId as any).name}`,
              description: `Session on ${sessionDetails.date} at ${sessionDetails.timeSlot}`,
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/payment/cancelled`,
      metadata: {
        sessionId,
        menteeId: (session.user as any).id,
        mentorId: sessionDetails.mentorId._id.toString(),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        url: stripeSession.url,
        sessionId: stripeSession.id,
      },
      message: "Checkout session created successfully",
    });
  } catch (error: any) {
    console.error("Create Stripe session error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create checkout session", error: error.message },
      { status: 500 }
    );
  }
}
