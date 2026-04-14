import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import PreMentorApplication from "@/models/PreMentorApplication";

export async function GET() {
    try {
        await dbConnect();
        
        // Get all users with AI/Data related roles
        const users = await User.find({
            $or: [
                { name: { $regex: /samriddhi|samr|samar|samrid/i } },
                { role: { $in: ['prementor', 'promentor'] } }
            ]
        }).lean();
        
        // Get all pre-mentor applications
        const preMentors = await PreMentorApplication.find({})
            .populate('userId', 'name email role')
            .lean();
        
        return NextResponse.json({
            users,
            preMentors: preMentors.map(m => ({
                name: m.userId?.name,
                email: m.userId?.email,
                role: m.userId?.role,
                status: m.status,
                skills: m.skills,
                domain: m.domain
            }))
        });
        
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Something went wrong' }, { status: 500 });
    }
}
