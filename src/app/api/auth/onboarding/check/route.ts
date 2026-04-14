import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import PreMentorApplication from "@/models/PreMentorApplication";
import MentorProfile from "@/models/MentorProfile";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');
        
        if (!userId) {
            return NextResponse.json({ message: "User ID is required" }, { status: 400 });
        }
        
        await dbConnect();
        
        // Check if user has completed onboarding
        const user = await User.findById(userId).select('onboarding role').lean();
        
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }
        
        let hasOnboarding = false;
        
        if (user.role === 'prementor') {
            // Check if PreMentorApplication exists (means onboarding completed)
            const preMentorApp = await PreMentorApplication.findOne({ userId }).lean();
            hasOnboarding = !!preMentorApp;
        } else if (user.role === 'promentor') {
            // Check if MentorProfile exists
            const mentorProfile = await MentorProfile.findOne({ userId }).lean();
            hasOnboarding = !!mentorProfile;
        } else {
            // For mentees, check onboarding field
            hasOnboarding = !!(user as any).onboarding;
        }
        
        return NextResponse.json({ 
            hasOnboarding,
            role: user.role 
        });
        
    } catch (error) {
        console.error("Error checking onboarding:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
