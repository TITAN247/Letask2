import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ProMentorApplication from "@/models/ProMentorApplication";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// GET - Get all Pro-Mentor applications
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

    const applications = await ProMentorApplication.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await ProMentorApplication.countDocuments(query);

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
    console.error("Get Pro-Mentor applications error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get applications", error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Approve/Reject/Score Pro-Mentor application
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
    const { applicationId, status, adminNotes, adminScores } = body;

    if (!applicationId || !status) {
      return NextResponse.json(
        { success: false, message: "Application ID and status are required" },
        { status: 400 }
      );
    }

    const updateData: any = {
      status,
      adminReviewNotes: adminNotes,
      reviewedAt: new Date(),
    };

    if (adminScores) {
      updateData.adminScores = adminScores;
    }

    const application = await ProMentorApplication.findByIdAndUpdate(
      applicationId,
      updateData,
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
        role: "promentor",
        isActive: true,
        hourlyRateINR: application.hourlyRateINR,
        hourlyRateUSD: application.hourlyRateUSD,
      });
    }

    // Send email notification
    try {
      const { sendEmail } = await import("@/lib/mailer");

      if (status === "approved") {
        await sendEmail({
          to: application.email,
          subject: "Pro-Mentor Application Approved - LetAsk",
          html: `<h2>Congratulations!</h2>
                 <p>Your Pro-Mentor application has been approved.</p>
                 <p>You can now start earning as a Pro-Mentor on LetAsk.</p>
                 <a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/promentor">Go to Dashboard</a>`,
        });
      } else if (status === "rejected") {
        await sendEmail({
          to: application.email,
          subject: "Pro-Mentor Application Update - LetAsk",
          html: `<h2>Application Status</h2>
                 <p>Unfortunately, your Pro-Mentor application was not approved at this time.</p>
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
