import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// POST - Create initial admin user (requires setup key for security)
export async function POST(req: Request) {
    try {
        const { setupKey, name, email, password } = await req.json();

        // Check setup key (should be set in env for security)
        const validSetupKey = process.env.ADMIN_SETUP_KEY || "letask-setup-2024";
        if (setupKey !== validSetupKey) {
            return NextResponse.json(
                { message: "Invalid setup key" },
                { status: 401 }
            );
        }

        // Validate required fields
        if (!name || !email || !password) {
            return NextResponse.json(
                { message: "Please provide name, email, and password" },
                { status: 400 }
            );
        }

        // Password validation
        if (password.length < 8) {
            return NextResponse.json(
                { message: "Password must be at least 8 characters long" },
                { status: 400 }
            );
        }

        await dbConnect();

        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: "admin" });
        if (existingAdmin) {
            return NextResponse.json(
                { message: "Admin user already exists. Use /api/admin/reset to reset admin." },
                { status: 409 }
            );
        }

        // Check if email is already used
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { message: "Email already in use" },
                { status: 409 }
            );
        }

        // Create admin user
        const hashedPassword = await bcrypt.hash(password, 10);

        const adminUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: "admin",
            isEmailVerified: true,
            verificationCode: null,
            verificationCodeExpiry: null
        });

        return NextResponse.json({
            message: "Admin user created successfully",
            admin: {
                id: adminUser._id.toString(),
                name: adminUser.name,
                email: adminUser.email,
                role: adminUser.role
            },
            instructions: [
                "1. Go to /login/admin",
                "2. Login with your credentials",
                "3. You'll be redirected to /dashboard/admin"
            ]
        }, { status: 201 });

    } catch (error: any) {
        console.error("Admin Setup Error:", error);
        return NextResponse.json(
            { message: "Error creating admin user", error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}

// GET - Check if admin exists
export async function GET() {
    try {
        await dbConnect();

        const adminCount = await User.countDocuments({ role: "admin" });

        return NextResponse.json({
            adminExists: adminCount > 0,
            message: adminCount > 0 ? "Admin user exists" : "No admin user found. Use POST to create one."
        }, { status: 200 });

    } catch (error: any) {
        console.error("Admin Check Error:", error);
        return NextResponse.json(
            { message: "Error checking admin status", error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
