import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import MenteeProfile from "@/models/MenteeProfile";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, email, country, title, company, fieldOfWork, experienceLevel, bio, avatar } = body;

        console.log("[Onboarding API] Received request:", { userId, email, hasAvatar: !!avatar, avatarLength: avatar?.length });

        if (!userId && !email) {
            return NextResponse.json({ message: "User ID or email is required." }, { status: 400 });
        }

        await dbConnect();

        // Build the onboarding update using the actual schema fields
        const updateData: any = {
            'onboarding.currentStatus': title || '',
            'onboarding.techSpecialization': fieldOfWork || '',
            'onboarding.experienceLevel': experienceLevel || '',
        };

        // Save avatar to user profile if provided
        if (avatar) {
            updateData.avatar = avatar;
            console.log("[Onboarding API] Saving avatar, length:", avatar.length);
        } else {
            console.log("[Onboarding API] No avatar provided in request");
        }

        console.log("[Onboarding API] updateData keys:", Object.keys(updateData));

        // Find by ID first, fall back to email (handles both JWT and google auth sessions)
        let updatedUser = null;

        if (userId) {
            updatedUser = await User.findByIdAndUpdate(
                userId,
                { $set: updateData },
                { new: true }
            );
        }

        // Fallback: look up by email if userId didn't resolve
        if (!updatedUser && email) {
            updatedUser = await User.findOneAndUpdate(
                { email },
                { $set: updateData },
                { new: true }
            );
        }

        console.log("[Onboarding API] Saved user avatar?", updatedUser?.avatar ? "YES" : "NO", "| Length:", updatedUser?.avatar?.length || 0);

        if (!updatedUser) {
            return NextResponse.json({ message: "User not found." }, { status: 404 });
        }

        // 3. Create specific profile based on role
        if (updatedUser.role === 'promentor' || updatedUser.role === 'prementor') {
            // Create a basic unverified Mentor Profile
            await (import("@/models/MentorProfile").then(m => m.default)).then(Mentor => 
                Mentor.findOneAndUpdate(
                    { userId: updatedUser._id },
                    {
                        userId: updatedUser._id,
                        skills: [fieldOfWork || ''],
                        experienceYears: Number(body.experienceYears) || 0,
                        experienceTitle: title || '',
                        description: bio || '',
                        verified: false
                    },
                    { upsert: true, new: true }
                )
            );

            // Also create an UpgradeApplication to satisfy the dashboard's vetting check
            const UpgradeApp = (await import("@/models/UpgradeApplication")).default;
            await UpgradeApp.findOneAndUpdate(
                { userId: updatedUser._id },
                {
                    userId: updatedUser._id,
                    targetRole: updatedUser.role,
                    currentStatus: title || '',
                    domain: fieldOfWork || '',
                    experienceLevel: experienceLevel || '',
                    status: 'pending' // Initial status
                },
                { upsert: true, new: true }
            );
        } else {
            // Map experience level to skill level for the MenteeProfile
            let skillLvl = 'beginner';
            if (experienceLevel === 'Mid Level') skillLvl = 'intermediate';
            if (experienceLevel === 'Senior Level' || experienceLevel === 'Director/VP') skillLvl = 'advanced';

            await MenteeProfile.findOneAndUpdate(
                { userId: updatedUser._id },
                {
                    userId: updatedUser._id,
                    bio: bio || '',
                    skillLevel: skillLvl,
                    $addToSet: { interests: fieldOfWork || '' }
                },
                { upsert: true, new: true }
            );
        }

        return NextResponse.json(
            { message: "Onboarding data saved successfully.", user: updatedUser },
            { status: 200 }
        );
    } catch (error) {
        console.error("Onboarding error:", error);
        return NextResponse.json(
            { message: "An error occurred while saving onboarding data.", detail: String(error) },
            { status: 500 }
        );
    }
}
