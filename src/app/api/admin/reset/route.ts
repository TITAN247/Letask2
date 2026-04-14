import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// POST - Reset admin password or create new admin if none exists
export async function POST(req: Request) {
    try {
        const { setupKey, name, email, password } = await req.json();

        // Check setup key
        const validSetupKey = process.env.ADMIN_SETUP_KEY || "letask-setup-2024";
        if (setupKey !== validSetupKey) {
            return NextResponse.json(
                { message: "Invalid setup key" },
                { status: 401 }
            );
        }

        // Validate password
        if (!password || password.length < 8) {
            return NextResponse.json(
                { message: "Password must be at least 8 characters long" },
                { status: 400 }
            );
        }

        await dbConnect();

        // Find existing admin
        let admin = await User.findOne({ role: "admin" });

        const hashedPassword = await bcrypt.hash(password, 10);

        if (admin) {
            // Update existing admin
            admin.password = hashedPassword;
            if (name) admin.name = name;
            if (email && email !== admin.email) {
                // Check if new email is already used
                const existingUser = await User.findOne({ email, _id: { $ne: admin._id } });
                if (existingUser) {
                    return NextResponse.json(
                        { message: "Email already in use by another user" },
                        { status: 409 }
                    );
                }
                admin.email = email;
            }
            await admin.save();

            return NextResponse.json({
                message: "Admin password reset successfully",
                admin: {
                    id: admin._id.toString(),
                    name: admin.name,
                    email: admin.email,
                    role: admin.role
                },
                instructions: [
                    "1. Go to /login/admin",
                    "2. Login with your new credentials",
                    "3. You'll be redirected to /dashboard/admin"
                ]
            }, { status: 200 });
        } else {
            // Create new admin
            if (!name || !email) {
                return NextResponse.json(
                    { message: "Name and email required to create new admin" },
                    { status: 400 }
                );
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return NextResponse.json(
                    { message: "Email already in use" },
                    { status: 409 }
                );
            }

            admin = await User.create({
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
                    id: admin._id.toString(),
                    name: admin.name,
                    email: admin.email,
                    role: admin.role
                },
                instructions: [
                    "1. Go to /login/admin",
                    "2. Login with your credentials",
                    "3. You'll be redirected to /dashboard/admin"
                ]
            }, { status: 201 });
        }

    } catch (error: any) {
        console.error("Admin Reset Error:", error);
        return NextResponse.json(
            { message: "Error resetting admin", error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
