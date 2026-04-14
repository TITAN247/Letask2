import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PreMentorApplication from "@/models/PreMentorApplication";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// GET - Get all Pre-Mentor applications
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

    const applications = await PreMentorApplication.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await PreMentorApplication.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Get Pre-Mentor applications error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get applications", error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Approve/Reject Pre-Mentor application
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
    const { applicationId, status, adminNotes } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        { success: false, message: "Application ID and status are required" },
        { status: 400 }
      );
    }

    const application = await PreMentorApplication.findByIdAndUpdate(
      applicationId,
      { status, adminReviewNotes: adminNotes, reviewedAt: new Date() },
      { new: true }
    );

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found" },
        { status: 404 }
      );
    }

    // If approved, update user role
    if (status === "approved" && application.userId) {
      await User.findByIdAndUpdate(application.userId, {
        role: "prementor",
        isActive: true,
      });
    }

    // Send email notification
    try {
      const { sendEmail } = await import("@/lib/mailer");

      if (status === "approved") {
        await sendEmail({
          to: application.email,
          subject: "Pre-Mentor Application Approved - LetAsk",
          html: `<h2>Congratulations!</h2>
                 <p>Your Pre-Mentor application has been approved.</p>
                 <p>You can now start mentoring on LetAsk.</p>
                 <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/prementor">Go to Dashboard</a>`,
        });
      } else if (status === "rejected") {
        await sendEmail({
          to: application.email,
          subject: "Pre-Mentor Application Update - LetAsk",
          html: `<h2>Application Status</h2>
                 <p>Unfortunately, your Pre-Mentor application was not approved at this time.</p>
                 <p>Reason: ${adminNotes || "Please review our requirements and apply again."}</p>`,
        });
      }
    } catch (emailError) {
      console.error("Application notification email failed:", emailError);
    }

    return NextResponse.json({
      success: true,
      data: application,
      message: `Application ${status} successfully`,
    });
  } catch (error: any) {
    console.error("Update application error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update application", error: error.message },
      { status: 500 }
    );
  }
}
