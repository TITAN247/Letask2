import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ProMentorApplication from "@/models/ProMentorApplication";
import PreMentorApplication from "@/models/PreMentorApplication";
import User from "@/models/User";
import { getUserFromSession } from "@/lib/auth";

export async function GET() {
    try {
        const userSession = await getUserFromSession();
        if (!userSession || (userSession as any).role !== 'admin') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        await dbConnect();

        // Find all applications
        const proApps = await ProMentorApplication.find().lean();
        const preApps = await PreMentorApplication.find().lean();

        const issues = [];

        // Check ProMentor applications
        for (const app of proApps) {
            const user = await User.findById(app.userId).lean();
            if (!user) {
                issues.push({
                    type: 'promentor',
                    tempId: app.tempId,
                    applicationId: app._id.toString(),
                    userId: app.userId?.toString(),
                    status: app.status,
                    problem: 'User not found'
                });
            }
        }

        // Check PreMentor applications
        for (const app of preApps) {
            const user = await User.findById(app.userId).lean();
            if (!user) {
                issues.push({
                    type: 'prementor',
                    tempId: app.tempId,
                    applicationId: app._id.toString(),
                    userId: app.userId?.toString(),
                    status: app.status,
                    problem: 'User not found'
                });
            }
        }

        return NextResponse.json({
            totalApplications: proApps.length + preApps.length,
            issuesFound: issues.length,
            issues
        });

    } catch (error: any) {
        console.error("Check Users Error:", error);
        return NextResponse.json(
            { message: "Error checking users", error: error.message },
            { status: 500 }
        );
    }
}
