import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Session from "@/models/Session";
import Feedback from "@/models/Feedback";
import Testimonial from "@/models/Testimonial";
import Rating from "@/models/Rating";
import Document from "@/models/Document";
import MentorProfile from "@/models/MentorProfile";
import MenteeProfile from "@/models/MenteeProfile";
import Payment from "@/models/Payment";
import Payout from "@/models/Payout";
import Message from "@/models/Message";
import PreMentorApplication from "@/models/PreMentorApplication";
import ProMentorApplication from "@/models/ProMentorApplication";
import bcrypt from "bcryptjs";

// POST - Initialize database with indexes and default data
export async function POST(req: Request) {
    try {
        const { setupKey, createSampleData = false } = await req.json();

        // Verify setup key
        const validKey = process.env.ADMIN_SETUP_KEY || "letask-setup-2024";
        if (setupKey !== validKey) {
            return NextResponse.json(
                { message: "Invalid setup key" },
                { status: 401 }
            );
        }

        await dbConnect();

        const results = {
            indexes: [] as string[],
            collections: [] as string[],
            adminCreated: false,
            sampleData: false,
            errors: [] as string[]
        };

        // 1. Create all collections by touching each model
        const models = [
            User, Session, Feedback, Testimonial, Rating, Document,
            MentorProfile, MenteeProfile, Payment, Payout, Message,
            PreMentorApplication, ProMentorApplication
        ];

        for (const model of models) {
            try {
                // This ensures collection exists
                await model.createCollection();
                results.collections.push(model.collection.name);
            } catch (e: any) {
                // Collection may already exist
                if (!e.message?.includes('already exists')) {
                    results.errors.push(`Collection ${model.collection?.name}: ${e.message}`);
                }
            }
        }

        // 2. Create indexes for each collection
        try {
            await User.collection.createIndex({ email: 1 }, { unique: true });
            await User.collection.createIndex({ role: 1 });
            await User.collection.createIndex({ averageRating: -1 });
            results.indexes.push("users: email (unique), role, averageRating");
        } catch (e: any) {
            results.errors.push("User indexes: " + e.message);
        }

        try {
            await Session.collection.createIndex({ menteeId: 1, status: 1 });
            await Session.collection.createIndex({ mentorId: 1, status: 1 });
            await Session.collection.createIndex({ date: -1 });
            results.indexes.push("sessions: menteeId+status, mentorId+status, date");
        } catch (e: any) {
            results.errors.push("Session indexes: " + e.message);
        }

        try {
            await Feedback.collection.createIndex({ sessionId: 1 }, { unique: true });
            await Feedback.collection.createIndex({ mentorId: 1, createdAt: -1 });
            await Feedback.collection.createIndex({ menteeId: 1 });
            results.indexes.push("feedback: sessionId (unique), mentorId, menteeId");
        } catch (e: any) {
            results.errors.push("Feedback indexes: " + e.message);
        }

        try {
            await Testimonial.collection.createIndex({ revieweeId: 1, isPublic: 1 });
            await Testimonial.collection.createIndex({ isFeatured: 1, createdAt: -1 });
            results.indexes.push("testimonials: revieweeId+isPublic, isFeatured");
        } catch (e: any) {
            results.errors.push("Testimonial indexes: " + e.message);
        }

        try {
            await Rating.collection.createIndex({ revieweeId: 1, createdAt: -1 });
            await Rating.collection.createIndex({ sessionId: 1 }, { unique: true });
            results.indexes.push("ratings: revieweeId, sessionId (unique)");
        } catch (e: any) {
            results.errors.push("Rating indexes: " + e.message);
        }

        try {
            await Document.collection.createIndex({ userId: 1, docType: 1 });
            await Document.collection.createIndex({ status: 1, uploadedAt: -1 });
            results.indexes.push("documents: userId+docType, status");
        } catch (e: any) {
            results.errors.push("Document indexes: " + e.message);
        }

        try {
            await Payment.collection.createIndex({ userId: 1, status: 1 });
            await Payment.collection.createIndex({ sessionId: 1 });
            results.indexes.push("payments: userId+status, sessionId");
        } catch (e: any) {
            results.errors.push("Payment indexes: " + e.message);
        }

        try {
            await Message.collection.createIndex({ sessionId: 1, createdAt: 1 });
            results.indexes.push("messages: sessionId+createdAt");
        } catch (e: any) {
            results.errors.push("Message indexes: " + e.message);
        }

        // 3. Create default admin if none exists
        const adminExists = await User.findOne({ role: "admin" });
        if (!adminExists) {
            try {
                const hashedPassword = await bcrypt.hash("admin123", 10);
                await User.create({
                    name: "Admin",
                    email: "admin@letask.com",
                    password: hashedPassword,
                    role: "admin",
                    isEmailVerified: true
                });
                results.adminCreated = true;
            } catch (e: any) {
                results.errors.push("Admin creation: " + e.message);
            }
        }

        // 4. Create sample data if requested
        if (createSampleData) {
            try {
                // Create sample mentee
                const menteePassword = await bcrypt.hash("mentee123", 10);
                const mentee = await User.findOneAndUpdate(
                    { email: "mentee@example.com" },
                    {
                        name: "John Mentee",
                        email: "mentee@example.com",
                        password: menteePassword,
                        role: "mentee",
                        isEmailVerified: true
                    },
                    { upsert: true, new: true }
                );

                // Create sample pre-mentor
                const preMentorPassword = await bcrypt.hash("prementor123", 10);
                const preMentor = await User.findOneAndUpdate(
                    { email: "prementor@example.com" },
                    {
                        name: "Jane PreMentor",
                        email: "prementor@example.com",
                        password: preMentorPassword,
                        role: "prementor",
                        isEmailVerified: true,
                        xp: 500,
                        level: 3
                    },
                    { upsert: true, new: true }
                );

                results.sampleData = true;
            } catch (e: any) {
                results.errors.push("Sample data: " + e.message);
            }
        }

        return NextResponse.json({
            message: "Database setup completed",
            success: results.errors.length === 0,
            results: {
                collectionsCreated: results.collections.length,
                indexesCreated: results.indexes.length,
                indexes: results.indexes,
                adminCreated: results.adminCreated,
                sampleDataCreated: results.sampleData,
                errors: results.errors
            }
        }, { status: 200 });

    } catch (error: any) {
        console.error("DB Setup Error:", error);
        return NextResponse.json(
            { message: "Database setup failed", error: error.message },
            { status: 500 }
        );
    }
}

// GET - Check database status
export async function GET() {
    try {
        await dbConnect();

        const adminCount = await User.countDocuments({ role: "admin" });
        const userCount = await User.countDocuments();
        const sessionCount = await Session.countDocuments();
        const feedbackCount = await Feedback.countDocuments();
        const testimonialCount = await Testimonial.countDocuments();

        return NextResponse.json({
            status: "connected",
            collections: {
                users: userCount,
                admins: adminCount,
                sessions: sessionCount,
                feedback: feedbackCount,
                testimonials: testimonialCount
            },
            needsSetup: adminCount === 0
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json(
            { status: "error", message: error.message },
            { status: 500 }
        );
    }
}
