import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Payment from "@/models/Payment";
import Session from "@/models/Session";
import User from "@/models/User";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const payload = await request.text();
    const signature = request.headers.get("stripe-signature") || "";

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err: any) {
      console.error("Webhook signature verification failed:", err.message);
      return NextResponse.json(
        { success: false, message: "Webhook signature verification failed" },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        const { sessionId, menteeId, mentorId } = session.metadata || {};
        
        if (!sessionId || !menteeId || !mentorId) {
          console.error("Missing metadata in Stripe session");
          break;
        }

        const amount = session.amount_total || 0;
        const currency = session.currency || "usd";

        // Calculate commission (20% platform fee)
        const commissionAmount = amount * 0.2;
        const mentorEarning = amount * 0.8;

        // Create payment record
        const payment = await Payment.create({
          userId: menteeId,
          mentorId: mentorId,
          sessionId: sessionId,
          gateway: "stripe",
          orderId: session.id,
          paymentId: session.payment_intent as string,
          amount: amount,
          currency: currency.toUpperCase(),
          status: "completed",
          commissionAmount: Math.round(commissionAmount),
          mentorEarning: Math.round(mentorEarning),
        });

        // Update session payment status
        await Session.findByIdAndUpdate(sessionId, {
          paymentStatus: "paid",
        });

        // Update mentor earnings
        await User.findByIdAndUpdate(mentorId, {
          $inc: { earningsBalance: mentorEarning, totalEarned: mentorEarning },
        });

        // Send confirmation emails
        try {
          const { sendEmail } = await import("@/lib/mailer");
          
          const sessionDetails = await Session.findById(sessionId)
            .populate("menteeId", "name email")
            .populate("mentorId", "name email")
            .lean();

          if (sessionDetails) {
            await sendEmail({
              to: (sessionDetails.menteeId as any).email,
              subject: "Payment Successful - LetAsk",
              html: `<h2>Payment Successful!</h2>
                     <p>Your payment has been processed successfully.</p>`,
            });
          }
        } catch (emailError) {
          console.error("Payment confirmation email failed:", emailError);
        }

        break;
      }

      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Update session payment status to failed
        if (session.metadata?.sessionId) {
          await Session.findByIdAndUpdate(session.metadata.sessionId, {
            paymentStatus: "failed",
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ success: true, message: "Webhook handled" });
  } catch (error: any) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { success: false, message: "Webhook processing failed", error: error.message },
      { status: 500 }
    );
  }
}

// Disable body parsing for webhooks - use export const dynamic for App Router
export const dynamic = 'force-dynamic';
export const bodyParser = false;
