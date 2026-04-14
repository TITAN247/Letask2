import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import XPTransaction from "@/models/XPTransaction";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { calculateLevel, getXPForNextLevel, getLevelName } from "@/lib/xpUtils";

// GET - Get user's XP and level data
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get("userId") || userId;

    const user = await User.findById(targetUserId).select("xp level badges sessionsCompleted canApplyForProMentor").lean();
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Get XP transactions
    const transactions = await XPTransaction.find({ userId: targetUserId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    // Calculate progress to next level
    const currentLevelXP = getXPForNextLevel(user.level - 1);
    const nextLevelXP = getXPForNextLevel(user.level);
    const xpInCurrentLevel = user.xp - currentLevelXP;
    const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
    const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100));

    return NextResponse.json({
      success: true,
      data: {
        xp: user.xp,
        level: user.level,
        levelName: getLevelName(user.level),
        badges: user.badges,
        sessionsCompleted: user.sessionsCompleted,
        canApplyForProMentor: user.canApplyForProMentor,
        progressToNextLevel: {
          currentXP: xpInCurrentLevel,
          neededXP: xpNeededForNextLevel,
          totalXP: user.xp,
          nextLevelXP,
          percent: progressPercent,
        },
        recentTransactions: transactions,
      },
    });
  } catch (error: any) {
    console.error("Get XP error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get XP data", error: error.message },
      { status: 500 }
    );
  }
}

// POST - Award XP (admin or system use)
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
    const { userId, amount, reason, source } = body;

    if (!userId || !amount || !source) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Import awardXP function
    const { awardXP } = await import("@/lib/xpUtils");
    const result = await awardXP(userId, amount, reason || "", source);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "XP awarded successfully",
    });
  } catch (error: any) {
    console.error("Award XP error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to award XP", error: error.message },
      { status: 500 }
    );
  }
}
