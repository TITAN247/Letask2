import { NextResponse } from "next/server";
import { getUserFromSession } from "@/lib/auth";

// POST - Enhance bio with AI
export async function POST(req: Request) {
    try {
        const userSession = await getUserFromSession();
        if (!userSession) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { bio, title, company, fieldOfWork, experienceLevel } = await req.json();

        // Generate enhanced bio using local logic
        const intros = [
            "Passionate about creating impactful solutions,",
            "Driven by curiosity and a love for innovation,",
            "With a strong focus on delivering excellence,",
            "Combining creativity with technical expertise,",
            "Committed to continuous growth and learning,"
        ];
        const intro = intros[Math.floor(Math.random() * intros.length)];
        
        let enhanced = bio ? bio + "\n\n" : "";
        
        if (title && company) {
            enhanced += `${intro} I work as a ${title.toLowerCase()} at ${company}. `;
        } else if (title) {
            enhanced += `${intro} I am a ${title.toLowerCase()}. `;
        }
        
        if (fieldOfWork) {
            const fields: Record<string, string> = {
                "AI & Data": "leveraging data and AI to solve complex problems",
                "Product Design": "crafting user-centered designs that make a difference",
                "Software Engineering": "building robust and scalable software solutions",
                "Product Management": "leading product strategy and execution",
                "Marketing": "creating compelling stories that connect with audiences",
                "Business Strategy": "developing strategies that drive business growth"
            };
            enhanced += `My expertise lies in ${fieldOfWork.toLowerCase()}, ${fields[fieldOfWork] || "delivering impactful results"}. `;
        }
        
        if (experienceLevel) {
            const expTexts: Record<string, string> = {
                "Entry Level": "I'm eager to learn and grow in my field, bringing fresh perspectives and enthusiasm.",
                "Mid Level": "With solid experience under my belt, I'm ready to tackle challenging projects and mentor others.",
                "Senior Level": "My years of experience have equipped me with deep insights and leadership capabilities.",
                "Executive": "I bring strategic vision and extensive experience to drive organizational success."
            };
            enhanced += expTexts[experienceLevel] || "";
        }
        
        enhanced += " I'm always excited to connect with like-minded professionals and explore new opportunities for collaboration and growth.";
        
        // Limit to 1300 characters
        const finalBio = enhanced.slice(0, 1300);

        return NextResponse.json({
            message: "Bio enhanced successfully",
            enhancedBio: finalBio
        });

    } catch (error) {
        console.error("Bio Enhancement Error:", error);
        return NextResponse.json(
            { message: "An error occurred while enhancing bio." },
            { status: 500 }
        );
    }
}
