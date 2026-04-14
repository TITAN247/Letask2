import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PreMentorApplication from "@/models/PreMentorApplication";
import User from "@/models/User";

export async function POST() {
    try {
        await dbConnect();
        
        // Find Samriddhi's application and approve it if needed
        const user = await User.findOne({ 
            name: { $regex: /samriddhi/i } 
        });
        
        if (!user) {
            return NextResponse.json({ error: "Samriddhi not found" });
        }
        
        let application = await PreMentorApplication.findOne({ 
            userId: user._id 
        });
        
        if (!application) {
            // Create application if it doesn't exist
            application = await PreMentorApplication.create({
                userId: user._id,
                status: 'approved',
                domain: 'AI & Data Science',
                skills: ['AI', 'Machine Learning', 'Data Science', 'Python'],
                experienceYears: 2,
                experienceMonths: 0,
                qWhyMentor: 'Passionate about helping others learn AI and data science.',
                tempId: 'PRE-' + Date.now()
            });
        } else if (application.status !== 'approved') {
            // Approve existing application
            application.status = 'approved';
            await application.save();
        }
        
        return NextResponse.json({ 
            message: "Samriddhi's application is now approved",
            user: user.name,
            application: {
                status: application.status,
                domain: application.domain,
                skills: application.skills
            }
        });
        
    } catch (error) {
        return NextResponse.json({ error: error instanceof Error ? error instanceof Error ? error.message : 'Unknown error' : 'Unknown error' }, { status: 500 });
    }
}
