import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import PreMentorApplication from "@/models/PreMentorApplication";
import MentorProfile from "@/models/MentorProfile";
import ProMentorApplication from "@/models/ProMentorApplication";
import mongoose from "mongoose";

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
            console.log(`[Onboarding Check] Checking ProMentor: ${userId}`);
            let mentorProfile = await MentorProfile.findOne({ userId }).lean();
            console.log(`[Onboarding Check] MentorProfile found: ${mentorProfile ? 'YES' : 'NO'}`);
            
            if (!mentorProfile) {
                // Check if there's an approved ProMentorApplication
                // Try both string and ObjectId formats for userId
                console.log(`[Onboarding Check] Looking for approved ProMentorApplication with userId: ${userId}`);
                
                let proMentorApp = await ProMentorApplication.findOne({ 
                    userId, 
                    status: 'approved' 
                }).lean();
                
                // If not found, try with ObjectId format
                if (!proMentorApp) {
                    try {
                        const userIdObj = new mongoose.Types.ObjectId(userId);
                        proMentorApp = await ProMentorApplication.findOne({ 
                            userId: userIdObj, 
                            status: 'approved' 
                        }).lean();
                        console.log(`[Onboarding Check] Tried ObjectId format, found: ${proMentorApp ? 'YES' : 'NO'}`);
                    } catch (e) {
                        console.log(`[Onboarding Check] Invalid ObjectId format for userId: ${userId}`);
                    }
                }
                
                console.log(`[Onboarding Check] ProMentorApplication found: ${proMentorApp ? 'YES' : 'NO'}`);
                if (proMentorApp) {
                    console.log(`[Onboarding Check] Application status: ${proMentorApp.status}, tempId: ${proMentorApp.tempId}`);
                    // Auto-create MentorProfile from approved application
                    console.log(`[Onboarding Check] Creating MentorProfile for approved ProMentor: ${userId}`);
                    try {
                        mentorProfile = await MentorProfile.create({
                            userId: userId,
                            skills: proMentorApp.skills || [],
                            experienceTitle: proMentorApp.domain || '',
                            experienceYears: proMentorApp.professionalYears || 0,
                            description: proMentorApp.qWhyMentor || '',
                            pricing: proMentorApp.expectedPricing || 0,
                            verified: true,
                            profilePicture: proMentorApp.avatar || ''
                        });
                        console.log(`[Onboarding Check] MentorProfile created: ${mentorProfile._id}`);
                    } catch (createError) {
                        console.error(`[Onboarding Check] Error creating MentorProfile:`, createError);
                    }
                } else {
                    // Check if there's ANY ProMentorApplication for this user (regardless of status)
                    const anyApp = await ProMentorApplication.findOne({ userId }).lean();
                    console.log(`[Onboarding Check] Any ProMentorApplication found: ${anyApp ? 'YES - status: ' + anyApp.status : 'NO'}`);
                    
                    // Also check all approved apps to see if there's a mismatch
                    const allApproved = await ProMentorApplication.find({ status: 'approved' }).lean();
                    console.log(`[Onboarding Check] Total approved applications: ${allApproved.length}`);
                    allApproved.forEach((app: any) => {
                        console.log(`[Onboarding Check] - App ${app.tempId}: userId=${app.userId} (type: ${typeof app.userId})`);
                    });
                }
            }
            
            hasOnboarding = !!mentorProfile;
            console.log(`[Onboarding Check] Final hasOnboarding: ${hasOnboarding}`);
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
