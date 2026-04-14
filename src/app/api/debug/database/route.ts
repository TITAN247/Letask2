import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MentorProfile from "@/models/MentorProfile";
import PreMentorApplication from "@/models/PreMentorApplication";
import User from "@/models/User";

export async function GET() {
    try {
        await dbConnect();
        
        console.log("=== DEBUG: Checking Database ===");
        
        // Check User collection
        const users = await User.find({}).lean();
        console.log(`Users found: ${users.length}`);
        users.forEach(u => console.log(`  - ${u.name} (${u.email}) - Role: ${u.role}`));
        
        // Check MentorProfile collection
        const proMentors = await MentorProfile.find({}).lean();
        console.log(`\nPro-Mentor profiles found: ${proMentors.length}`);
        proMentors.forEach(m => console.log(`  - ${m._id} - User: ${m.userId} - Skills: ${m.skills?.join(', ')}`));
        
        // Check PreMentorApplication collection
        const preMentors = await PreMentorApplication.find({}).lean();
        console.log(`\nPre-Mentor applications found: ${preMentors.length}`);
        preMentors.forEach(m => console.log(`  - ${m._id} - User: ${m.userId} - Status: ${m.status} - Skills: ${m.skills?.join(', ')}`));
        
        // Check approved pre-mentors specifically
        const approvedPreMentors = await PreMentorApplication.find({ status: 'approved' }).lean();
        console.log(`\nApproved Pre-Mentors: ${approvedPreMentors.length}`);
        
        // Test populate for pre-mentors
        const populatedPreMentors = await PreMentorApplication.find({ status: 'approved' })
            .populate('userId', 'name email role')
            .lean();
        console.log(`\nPopulated Pre-Mentors: ${populatedPreMentors.length}`);
        populatedPreMentors.forEach(m => {
            console.log(`  - ${m._id}`);
            console.log(`    User: ${m.userId?.name || 'NULL'} (${m.userId?.email || 'NULL'})`);
            console.log(`    Skills: ${m.skills?.join(', ') || 'NONE'}`);
            console.log(`    Domain: ${m.domain || 'NONE'}`);
        });

        return NextResponse.json({
            users: users.length,
            proMentors: proMentors.length,
            preMentors: preMentors.length,
            approvedPreMentors: approvedPreMentors.length,
            populatedPreMentors: populatedPreMentors.length,
            details: {
                users: users.map(u => ({ name: u.name, email: u.email, role: u.role })),
                proMentors: proMentors.map(m => ({ id: m._id, userId: m.userId, skills: m.skills })),
                preMentors: preMentors.map(m => ({ id: m._id, userId: m.userId, status: m.status, skills: m.skills })),
                approvedPreMentors: approvedPreMentors.map(m => ({ id: m._id, userId: m.userId, skills: m.skills }))
            }
        });
    } catch (error) {
        console.error("Database debug error:", error);
        return NextResponse.json(
            { message: "Database debug error", error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
