import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Session from "@/models/Session";
import Payment from "@/models/Payment";
import PreMentorApplication from "@/models/PreMentorApplication";
import ProMentorApplication from "@/models/ProMentorApplication";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

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

    // Date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twelveWeeksAgo = new Date(now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Total registered users
    const totalUsers = await User.countDocuments();
    const newUsersThisMonth = await User.countDocuments({
      createdAt: { $gte: startOfMonth },
    });
    const newUsersLastMonth = await User.countDocuments({
      createdAt: {
        $gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        $lt: startOfMonth,
      },
    });
    const userGrowth = newUsersLastMonth > 0
      ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100
      : 100;

    // 2. Active mentors
    const activePreMentors = await User.countDocuments({ role: "prementor", isActive: true });
    const activeProMentors = await User.countDocuments({ role: "promentor", isActive: true });

    // 3. Sessions this month
    const sessionsThisMonth = await Session.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // 4. Total platform revenue this month
    const revenueThisMonth = await Payment.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          commission: { $sum: "$commissionAmount" },
        },
      },
    ]);

    // 5. Pending applications
    const pendingPreMentorApps = await PreMentorApplication.countDocuments({ status: "pending" });
    const pendingProMentorApps = await ProMentorApplication.countDocuments({ status: "pending" });

    // 6. Daily new signups (last 30 days)
    const dailySignups = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 7. Sessions per week (last 12 weeks), split by Pre/Pro
    const sessionsByWeek = await Session.aggregate([
      {
        $match: {
          createdAt: { $gte: twelveWeeksAgo },
        },
      },
      {
        $group: {
          _id: {
            week: { $week: "$createdAt" },
            mentorType: "$mentorType",
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.week": 1 } },
    ]);

    // 8. Revenue split (commission vs payouts)
    const totalRevenue = await Payment.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalCommission: { $sum: "$commissionAmount" },
          totalMentorEarnings: { $sum: "$mentorEarning" },
        },
      },
    ]);

    // 9. Top 10 earning Pro-Mentors this month
    const topMentors = await Payment.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: "$mentorId",
          totalEarnings: { $sum: "$mentorEarning" },
          sessionsCount: { $sum: 1 },
        },
      },
      { $sort: { totalEarnings: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "mentor",
        },
      },
      {
        $project: {
          _id: 1,
          totalEarnings: 1,
          sessionsCount: 1,
          mentorName: { $arrayElemAt: ["$mentor.name", 0] },
        },
      },
    ]);

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          userGrowth: {
            thisMonth: newUsersThisMonth,
            percent: Math.round(userGrowth),
          },
          activeMentors: {
            pre: activePreMentors,
            pro: activeProMentors,
            total: activePreMentors + activeProMentors,
          },
          sessionsThisMonth,
          revenueThisMonth: revenueThisMonth.length > 0 ? revenueThisMonth[0] : { total: 0, commission: 0 },
          pendingApplications: {
            preMentor: pendingPreMentorApps,
            proMentor: pendingProMentorApps,
            total: pendingPreMentorApps + pendingProMentorApps,
          },
        },
        charts: {
          dailySignups,
          sessionsByWeek,
          revenueSplit: totalRevenue.length > 0 ? totalRevenue[0] : { totalAmount: 0, totalCommission: 0, totalMentorEarnings: 0 },
          topMentors,
        },
      },
    });
  } catch (error: any) {
    console.error("Admin analytics error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to get analytics", error: error.message },
      { status: 500 }
    );
  }
}
