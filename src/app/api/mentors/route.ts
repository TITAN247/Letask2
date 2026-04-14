import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MentorProfile from "@/models/MentorProfile";
import PreMentorApplication from "@/models/PreMentorApplication";
import User from "@/models/User";

export async function GET() {
    try {
        await dbConnect();
        
        // Ensure User model is loaded
        await User.findOne().exec().catch(() => {});

        // Get both Pro-Mentors and Pre-Mentors
        const proMentors = await MentorProfile.find()
            .populate('userId', 'name email role image')
            .lean();
            
        const preMentors = await PreMentorApplication.find({ status: 'approved' })
            .populate('userId', 'name email role image')
            .lean();

        // Combine and format mentors
        const allMentors = [
            ...proMentors.map(m => ({ 
                ...m, 
                mentorType: 'promentor',
                verified: m.verified || false 
            })),
            ...preMentors.map(m => ({ 
                ...m, 
                mentorType: 'prementor',
                verified: false,
                // Map PreMentor fields to MentorProfile format
                skills: m.skills || [],
                experienceTitle: m.domain || '',
                experienceYears: m.experienceYears + (m.experienceMonths / 12),
                description: m.qWhyMentor || '',
                pricing: 0 // Free for pre-mentors
            }))
        ];

        return NextResponse.json({ mentors: allMentors });
    } catch (error) {
        console.error("Mentors list error:", error);
        return NextResponse.json(
            { message: "An error occurred fetching mentors." },
            { status: 500 }
        );
    }
}
