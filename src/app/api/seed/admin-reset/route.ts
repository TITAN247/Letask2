import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// GET - Reset/create admin with fresh password
export async function GET() {
    try {
        await dbConnect();

        const adminEmail = "admin@letask.com";
        const adminPassword = "admin123";

        // Delete existing admin if any
        await User.deleteOne({ email: adminEmail });

        // Create fresh admin user
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
            message: "Admin user reset successfully",
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
        console.error("Admin Reset Error:", error);
        return NextResponse.json(
            { message: "Error resetting admin", error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
