import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Session from "@/models/Session";
import Payment from "@/models/Payment";
import Review from "@/models/Review";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

// GET - Get all users with pagination and filters
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const role = searchParams.get("role");
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    let query: any = {};
    if (role) query.role = role;
    if (status === "active") query.isActive = true;
    if (status === "banned") query.isActive = false;
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(query);

    // Get additional stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const sessionsCount = await Session.countDocuments({
          $or: [{ menteeId: user._id }, { mentorId: user._id }],
        });

        const lastSession = await Session.findOne({
          $or: [{ menteeId: user._id }, { mentorId: user._id }],
        })
          .sort({ updatedAt: -1 })
          .select("updatedAt")
          .lean();

        return {
          ...user,
          stats: {
            sessionsCount,
            lastActive: lastSession?.updatedAt || user.createdAt,
          },
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: usersWithStats,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Get users error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get users", error: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Ban/Unban user
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
    const { userId, isActive, reason } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Send email notification
    try {
      const { sendEmail } = await import("@/lib/mailer");
      
      if (!isActive) {
        await sendEmail({
          to: user.email,
          subject: "Account Suspended - LetAsk",
          html: `<h2>Account Suspended</h2>
                 <p>Your LetAsk account has been suspended.</p>
                 <p>Reason: ${reason || "Violation of platform policies"}</p>
                 <p>If you believe this is a mistake, please contact support.</p>`,
        });
      } else {
        await sendEmail({
          to: user.email,
          subject: "Account Restored - LetAsk",
          html: `<h2>Account Restored</h2>
                 <p>Your LetAsk account has been restored.</p>
                 <p>You can now access all features again.</p>`,
        });
      }
    } catch (emailError) {
      console.error("Ban notification email failed:", emailError);
    }

    return NextResponse.json({
      success: true,
      data: user,
      message: isActive ? "User unbanned successfully" : "User banned successfully",
    });
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update user", error: error.message },
      { status: 500 }
    );
  }
}
