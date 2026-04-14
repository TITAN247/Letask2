import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// POST - Create admin user
export async function POST() {
    try {
        await dbConnect();

        const adminEmail = "admin@letask.com";
        const adminPassword = "admin123";

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            return NextResponse.json({
                message: "Admin user already exists",
                credentials: {
                    email: adminEmail,
                    password: adminPassword
                },
                note: "Use these credentials to login at /login/mentee"
            });
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
        const adminUser = await User.create({
            name: "Admin",
            email: adminEmail,
            password: hashedPassword,
            role: "admin",
            isEmailVerified: true, // Auto-verify admin
            verificationToken: null
        });

        return NextResponse.json({
            message: "Admin user created successfully",
            credentials: {
                email: adminEmail,
                password: adminPassword
            },
            instructions: [
                "1. Go to /login/mentee",
                "2. Login with the credentials above",
                "3. You'll be redirected to /dashboard/admin",
                "4. Go to 'Applications' to review Pro-Mentor applications"
            ]
        }, { status: 201 });

    } catch (error: any) {
        console.error("Admin Seed Error:", error);
        return NextResponse.json(
            { message: "Error creating admin user", error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// GET - Check if admin exists, create if not
export async function GET() {
    try {
        await dbConnect();

        const adminEmail = "admin@letask.com";
        const adminPassword = "admin123";

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        
        if (existingAdmin) {
            return NextResponse.json({
                adminExists: true,
                message: "Admin user already exists",
                credentials: {
                    email: adminEmail,
                    password: adminPassword
                },
                instructions: [
                    "1. Go to /login/admin",
                    "2. Login with the credentials above",
                    "3. You'll be redirected to /dashboard/admin/applications"
                ]
            });
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
        const adminUser = await User.create({
            name: "Admin",
            email: adminEmail,
            password: hashedPassword,
            role: "admin",
            isEmailVerified: true,
            verificationToken: null
        });

        return NextResponse.json({
            adminExists: true,
            message: "Admin user created successfully!",
            credentials: {
                email: adminEmail,
                password: adminPassword
            },
            instructions: [
                "1. Go to /login/admin",
                "2. Login with the credentials above",
                "3. You'll be redirected to /dashboard/admin/applications"
            ]
        }, { status: 201 });

    } catch (error: any) {
        return NextResponse.json(
            { message: "Error creating admin", error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
