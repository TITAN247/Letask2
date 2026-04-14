import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { getUserFromSession } from "@/lib/auth";

// GET - Get current user's profile
export async function GET(req: Request) {
    try {
        const user = await getUserFromSession();
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();

        const userData = await User.findById(user.id).select(
            "-password -verificationToken -verificationCode -resetPasswordCode"
        );

        if (!userData) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        console.log("[Profile API] User avatar:", userData.avatar ? "exists" : "missing", "| profilePicture:", userData.profilePicture ? "exists" : "missing");

        return NextResponse.json({
            message: "Profile retrieved successfully",
            user: userData
        });

    } catch (error) {
        console.error("Get Profile Error:", error);
        return NextResponse.json(
            { message: "An error occurred while retrieving profile." },
            { status: 500 }
        );
    }
}

// PUT - Update user profile
export async function PUT(req: Request) {
    try {
        const user = await getUserFromSession();
        if (!user) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const updates = await req.json();
        
        // Fields that are allowed to be updated
        const allowedFields = [
            "name",
            "bio",
            "country",
            "timezone",
            "languages",
            "profilePicture",
            "linkedInUrl",
            "githubUrl",
            "portfolioUrl"
        ];

        // Filter only allowed fields
        const filteredUpdates: Record<string, any> = {};
        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                filteredUpdates[field] = updates[field];
            }
        });

        await dbConnect();

        const updatedUser = await User.findByIdAndUpdate(
            user.id,
            { $set: filteredUpdates },
            { new: true, select: "-password -verificationToken -verificationCode -resetPasswordCode" }
        );

        if (!updatedUser) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Profile updated successfully",
            user: updatedUser
        });

    } catch (error) {
        console.error("Update Profile Error:", error);
        return NextResponse.json(
            { message: "An error occurred while updating profile." },
            { status: 500 }
        );
    }
}
