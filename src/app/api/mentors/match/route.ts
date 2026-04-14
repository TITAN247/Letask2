import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MentorProfile from "@/models/MentorProfile";
import User from "@/models/User";
import PreMentorApplication from "@/models/PreMentorApplication";
import { findBestMatches } from "@/lib/tfidf";

// GET - Fetch all mentors (Pro and Pre)
export async function GET() {
    try {
        await dbConnect();

        // Ensure User model is loaded
        await User.findOne().exec().catch(() => {});

        // Get Pro-Mentors
        const proMentors = await MentorProfile.find({ verified: true })
            .populate('userId', 'name email role')
            .lean();
        
        // Get approved Pre-Mentors
        const preMentors = await PreMentorApplication.find({ status: 'approved' })
            .populate('userId', 'name email role')
            .lean();

        // Format Pro-Mentors
        const formattedProMentors = proMentors.map(m => ({
            _id: m._id.toString(),
            userId: m.userId,
            name: (m.userId as any)?.name || m.name || 'Unknown',
            bio: m.description || '',
            expertise: m.skills || [],
            experience: m.experienceTitle || '',
            hourlyRateINR: m.pricing || m.hourlyRateINR || 500,
            averageRating: m.averageRating || m.rating || 0,
            totalReviews: m.totalReviews || 0,
            profilePic: m.profilePic || (m.userId as any)?.image,
            type: 'promentor' as const,
            verified: true,
        }));

        // Format Pre-Mentors
        const formattedPreMentors = preMentors.map(m => ({
            _id: m._id.toString(),
            userId: m.userId,
            name: (m.userId as any)?.name || m.name || 'Unknown',
            bio: m.qWhyMentor || m.description || '',
            expertise: m.skills || [],
            experience: m.domain || '',
            hourlyRateINR: 0, // Free for pre-mentors
            averageRating: m.averageRating || 0,
            totalReviews: m.totalReviews || 0,
            profilePic: (m.userId as any)?.image,
            type: 'prementor' as const,
            verified: false,
        }));

        // Combine all mentors
        const allMentors = [...formattedProMentors, ...formattedPreMentors];

        return NextResponse.json({
            success: true,
            data: allMentors,
            count: allMentors.length
        }, { status: 200 });
    } catch (error) {
        console.error("Fetch Mentors Error:", error);
        return NextResponse.json({
            success: false,
            message: "Failed to fetch mentors",
            error: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}

// POST - AI matching with search query
export async function POST(req: Request) {
    try {
        const { query } = await req.json();
        await dbConnect();

        // Ensure User model is loaded since we populate ref
        await User.findOne().exec().catch(() => {});

        // Get both Pro-Mentors and Pre-Mentors
        const proMentors = await MentorProfile.find().populate('userId', 'name email role').lean();
        const preMentors = await PreMentorApplication.find({ status: 'approved' }).populate('userId', 'name email role').lean();
        
        // Combine and format mentors
        const allMentors = [
            ...proMentors.map(m => ({ ...m, mentorType: 'promentor', verified: m.verified || false })),
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
        
        if (!allMentors || allMentors.length === 0) {
            return NextResponse.json({ matches: [] }, { status: 200 });
        }

        if (!query || query.trim() === '') {
            // Return top rated if no query
            const sorted = allMentors.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 5);
            const reshaped = sorted.map(m => ({ ...m, matchPercent: 100 }));
            return NextResponse.json({ matches: reshaped }, { status: 200 });
        }

        const documents = allMentors.map(mentor => ({
            id: mentor._id.toString(),
            text: `${mentor.description || ''} ${(mentor.skills || []).join(' ')} ${mentor.experienceTitle || ''} ${mentor.mentorType || 'mentor'}`
        }));

        const matchResults = findBestMatches(query, documents);
        
        // Take top 5 with highest score (limit arbitrarily or show all positive scores)
        const topResults = matchResults.filter(r => r.score > 0).slice(0, 5);

        const finalMatches = topResults.map(res => {
            const mentorMeta = allMentors.find(m => m._id.toString() === res.id);
            return {
                ...mentorMeta,
                matchPercent: Math.round(res.score * 100) // pseudo percentage based on cosine similarity [0,1]
            };
        });

        // Even if some scored 0, pad with top rated just in case
        if (finalMatches.length < 5) {
            const missing = 5 - finalMatches.length;
            const existingIds = finalMatches.map(m => m._id.toString());
            const padded = allMentors
               .filter(m => !existingIds.includes(m._id.toString()))
               .slice(0, missing)
               .map(m => ({ ...m, matchPercent: 0 }));
            
            finalMatches.push(...padded);
        }

        return NextResponse.json({ matches: finalMatches }, { status: 200 });
    } catch (error) {
        console.error("AI Match Error:", error);
        return NextResponse.json({ message: "An error occurred during matching." }, { status: 500 });
    }
}
