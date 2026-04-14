import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import ProMentorApplication from "@/models/ProMentorApplication";
import PreMentorApplication from "@/models/PreMentorApplication";
import User from "@/models/User";
import { getUserFromSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const userSession = await getUserFromSession();
        if (!userSession || (userSession as any).role !== 'admin') {
            return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
        }

        const { tempId, email, password } = await req.json();
        
        if (!tempId || !email || !password) {
            return NextResponse.json({ 
                message: "Missing required fields: tempId, email, password" 
            }, { status: 400 });
        }

        await dbConnect();

        // Find the application
        let application = await ProMentorApplication.findOne({ tempId }).lean();
        let type = 'promentor';
        
        if (!application) {
            application = await PreMentorApplication.findOne({ tempId }).lean();
            type = 'prementor';
        }

        if (!application) {
            return NextResponse.json({ message: "Application not found" }, { status: 404 });
        }

        // Check if user already exists
        const existingUser = await User.findById(application.userId);
        if (existingUser) {
            return NextResponse.json({ 
                message: "User already exists",
                user: {
                    id: existingUser._id,
                    email: existingUser.email,
                    name: existingUser.name
                }
            });
        }

        // Create new user with the same _id as the application's userId
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = await User.create({
            _id: application.userId,
            name: email.split('@')[0],
            email: email,
            password: hashedPassword,
            role: 'mentee', // Will be updated to promentor/prementor upon approval
            isEmailVerified: true
        });

        return NextResponse.json({
            message: "User created successfully",
            user: {
                id: newUser._id,
                email: newUser.email,
                name: newUser.name
            },
            application: {
                tempId: application.tempId,
                type: type,
                status: application.status
            },
            instructions: [
                `The user can now login with:`,
                `Email: ${email}`,
                `Password: ${password}`,
                `Then you can approve the application.`
            ]
        }, { status: 201 });

    } catch (error: any) {
        console.error("Fix Orphan Error:", error);
        return NextResponse.json(
            { message: "Error fixing orphan application", error: error.message },
            { status: 500 }
        );
    }
}
