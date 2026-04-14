import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import PreMentorApplication from "@/models/PreMentorApplication";

export async function GET() {
    try {
        await dbConnect();
        
        console.log("=== Searching for Samriddhi ===");
        
        // Search for user named Samriddhi
        const samriddhiUser = await User.findOne({ 
            name: { $regex: /samriddhi/i } 
        }).lean();
        
        console.log("Samriddhi User:", samriddhiUser);
        
        if (!samriddhiUser) {
            // Try alternative spellings
            const altUsers = await User.find({
                name: { $regex: /samr|samar|samrid/i }
            }).lean();
            
            console.log("Alternative Users:", altUsers);
            
            return NextResponse.json({
                message: "No user named Samriddhi found",
                alternatives: altUsers.map(u => ({ name: u.name, email: u.email, role: u.role }))
            });
        }
        
        // Check if Samriddhi has a Pre-Mentor application
        const preMentorApp = await PreMentorApplication.findOne({ 
            userId: samriddhiUser._id 
        }).lean();
        
        console.log("Pre-Mentor Application:", preMentorApp);
        
        // Check all Pre-Mentor applications
        const allPreMentors = await PreMentorApplication.find({})
            .populate('userId', 'name email role')
            .lean();
        
        console.log("All Pre-Mentors:", allPreMentors.length);
        allPreMentors.forEach(m => {
            console.log(`- ${m.userId?.name || 'Unknown'} - Status: ${m.status} - Skills: ${m.skills?.join(', ')}`);
        });
        
        return NextResponse.json({
            samriddhiUser: {
                name: samriddhiUser.name,
                email: samriddhiUser.email,
                role: samriddhiUser.role,
                _id: samriddhiUser._id
            },
            preMentorApplication: preMentorApp,
            totalPreMentors: allPreMentors.length,
            allPreMentors: allPreMentors.map(m => ({
                name: m.userId?.name,
                status: m.status,
                skills: m.skills,
                domain: m.domain
            }))
        });
        
    } catch (error) {
        console.error("Search error:", error);
        return NextResponse.json({ error: error instanceof Error ? error instanceof Error ? error.message : 'Unknown error' : 'Unknown error' }, { status: 500 });
    }
}
