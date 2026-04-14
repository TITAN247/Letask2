import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Payout from "@/models/Payout";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// GET - Get all payout requests
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    let query: any = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const payouts = await Payout.find(query)
      .populate("mentorId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Payout.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: payouts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Get payouts error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get payouts", error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Approve/Reject payout
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { payoutId, status, adminNotes } = body;

    if (!payoutId || !status) {
      return NextResponse.json(
        { success: false, message: "Payout ID and status are required" },
        { status: 400 }
      );
    }

    const updateData: any = { status, adminNotes };
    if (status === "paid" || status === "approved") {
      updateData.processedAt = new Date();
    }

    const payout = await Payout.findByIdAndUpdate(
      payoutId,
      updateData,
      { new: true }
    ).populate("mentorId", "name email");

    if (!payout) {
      return NextResponse.json(
        { success: false, message: "Payout not found" },
        { status: 404 }
      );
    }

    // Send email notification
    try {
      const { sendEmail } = await import("@/lib/mailer");
      const mentor = payout.mentorId as any;

      if (status === "paid") {
        await sendEmail({
          to: mentor.email,
          subject: "Payout Processed - LetAsk",
          html: `<h2>Payout Processed!</h2>
                 <p>Your payout request has been processed.</p>
                 <p>Amount: ${payout.currency === "INR" ? "₹" : "$"}${payout.amount}</p>
                 <p>Processed on: ${new Date().toLocaleDateString()}</p>
                 <p>The funds should appear in your account within 3-5 business days.</p>`,
        });
      } else if (status === "rejected") {
        await sendEmail({
          to: mentor.email,
          subject: "Payout Request Rejected - LetAsk",
          html: `<h2>Payout Request Rejected</h2>
                 <p>Your payout request has been rejected.</p>
                 <p>Reason: ${adminNotes || "Please contact support for more information."}</p>`,
        });
      }
    } catch (emailError) {
      console.error("Payout notification email failed:", emailError);
    }

    return NextResponse.json({
      success: true,
      data: payout,
      message: `Payout ${status} successfully`,
    });
  } catch (error: any) {
    console.error("Update payout error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update payout", error: error.message },
      { status: 500 }
    );
  }
}
