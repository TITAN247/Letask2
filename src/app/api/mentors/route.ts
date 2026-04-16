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

        // Get both Pro-Mentors and Pre-Mentors (only valid ones, no dummy/test data)
        const proMentorsRaw = await MentorProfile.find({ userId: { $exists: true, $ne: null } })
            .populate('userId', 'name email role image')
            .lean();
            
        const preMentorsRaw = await PreMentorApplication.find({ 
            status: 'approved',
            userId: { $exists: true, $ne: null }
        })
            .populate('userId', 'name email role image')
            .lean();
        
        // Filter out dummy/test mentors
        const isValidMentor = (mentor: any) => {
            const name = mentor.userId?.name || '';
            const email = mentor.userId?.email || '';
            if (!name || name.length < 2) return false;
            const lowerName = name.toLowerCase();
            const lowerEmail = email.toLowerCase();
            const testKeywords = ['test', 'dummy', 'sample', 'example', 'fake', 'demo', 'admin'];
            return !testKeywords.some(kw => lowerName.includes(kw) || lowerEmail.includes(kw));
        };
        
        const proMentors = proMentorsRaw.filter(isValidMentor);
        const preMentors = preMentorsRaw.filter(isValidMentor);

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
