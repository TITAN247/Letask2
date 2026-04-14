import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import UpgradeApplication from "@/models/UpgradeApplication";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        await dbConnect();
        
        const hashedPassword = await bcrypt.hash("mockpassword123", 10);

        // Wipe old plaintext deployments natively
        await User.deleteMany({ email: { $regex: "@seed.com" } });
        await UpgradeApplication.deleteMany();

        const mentees = [
            { name: "Charlie (Test Mentee)", email: "charlie@seed.com", role: "mentee" },
            { name: "Dave (Test Mentee)", email: "dave@seed.com", role: "mentee" }
        ];

        const prementors = [
            { name: "Bob (Test Pre-Mentor)", email: "bob@seed.com", role: "prementor", domain: "Product Design", skills: ["Figma", "UI/UX"] },
            { name: "Luke (Test Pre-Mentor)", email: "luke@seed.com", role: "prementor", domain: "Frontend Dev", skills: ["React", "CSS"] },
            { name: "Mia (Test Pre-Mentor)", email: "mia@seed.com", role: "prementor", domain: "Data Science", skills: ["Python", "SQL"] },
            { name: "Tom (Test Pre-Mentor)", email: "tom@seed.com", role: "prementor", domain: "Backend Dev", skills: ["Node.js", "Express"] }
        ];

        const promentors = [
            { name: "Alice (Test Pro-Mentor)", email: "alice@seed.com", role: "promentor", domain: "Software Engineering", skills: ["System Design", "Go"] },
            { name: "Emma (Test Pro-Mentor)", email: "emma@seed.com", role: "promentor", domain: "Principal Architect", skills: ["AWS", "Kubernetes"] },
            { name: "John (Test Pro-Mentor)", email: "john@seed.com", role: "promentor", domain: "AI Engineering", skills: ["PyTorch", "LLMs"] },
            { name: "Sarah (Test Pro-Mentor)", email: "sarah@seed.com", role: "promentor", domain: "Blockchain Dev", skills: ["Solidity", "Web3"] }
        ];

        // 1. Create Mentees
        for (const m of mentees) {
            await User.create({ name: m.name, email: m.email, password: hashedPassword, role: m.role, isEmailVerified: true });
        }

        // 2. Create Pre-mentors
        for (const m of prementors) {
            const user = await User.create({ name: m.name, email: m.email, password: hashedPassword, role: m.role, isEmailVerified: true });
            await UpgradeApplication.create({
                userId: user._id, targetRole: m.role, domain: m.domain, skills: m.skills,
                experienceYears: 2, currentStatus: "Junior Developer", status: "approved", mockTestScore: 85,
                qGuideBeginners: "I focus on wireframing robust user journeys.", qProblemSolved: "Redesigned a checkout flow increasing conversion by 15%."
            });
        }

        // 3. Create Pro-mentors
        for (const m of promentors) {
            const user = await User.create({ name: m.name, email: m.email, password: hashedPassword, role: m.role, isEmailVerified: true });
            await UpgradeApplication.create({
                userId: user._id, targetRole: m.role, domain: m.domain, skills: m.skills,
                experienceYears: 10, currentStatus: "Staff Engineer", status: "approved", mockTestScore: 98,
                qGuideBeginners: "I build strong fundamentals first, then we tackle advanced microservices.", qProblemSolved: "Scaled an internal orchestration platform handling 1M+ RPS."
            });
        }

        return NextResponse.json({
            message: "Successfully seeded 10 authentic data accounts into MongoDB!",
            accounts: {
                mentees: mentees.map(m => m.email),
                prementors: prementors.map(m => m.email),
                promentors: promentors.map(m => m.email),
                password_for_everyone: "mockpassword123"
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}
