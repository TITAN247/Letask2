import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import MockTestQuestion from "@/models/MockTestQuestion";
import PreMentorApplication from "@/models/PreMentorApplication";
import { getUserFromSession } from "@/lib/auth";

// GET - Fetch mock test questions by domain (no auth required - uses application ID)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const domain = searchParams.get('domain');

        if (!domain) {
            return NextResponse.json(
                { message: "Domain parameter is required" },
                { status: 400 }
            );
        }

        await dbConnect();

        console.log(`[Mock Test API] Searching for domain: "${domain}"`);

        // Check total questions for this domain (without isActive filter)
        const allQuestionsCount = await MockTestQuestion.countDocuments({ domain });
        console.log(`[Mock Test API] Total questions for domain: ${allQuestionsCount}`);

        // Check with isActive filter
        const activeQuestionsCount = await MockTestQuestion.countDocuments({ domain, isActive: true });
        console.log(`[Mock Test API] Active questions for domain: ${activeQuestionsCount}`);

        // Fetch 8 MCQs and 2 descriptive questions for the domain
        const mcqQuestions = await MockTestQuestion.find({
            domain,
            type: 'mcq',
            isActive: true
        }).limit(8);

        const descriptiveQuestions = await MockTestQuestion.find({
            domain,
            type: 'descriptive',
            isActive: true
        }).limit(2);

        console.log(`[Mock Test API] Found ${mcqQuestions.length} MCQs and ${descriptiveQuestions.length} descriptive questions`);

        // Shuffle MCQs
        const shuffledMcqs = mcqQuestions.sort(() => Math.random() - 0.5);

        return NextResponse.json({
            mcqs: shuffledMcqs,
            descriptives: descriptiveQuestions,
            totalMarks: shuffledMcqs.length * 1 + descriptiveQuestions.length * 5
        });

    } catch (error) {
        console.error("Mock Test Fetch Error:", error);
        return NextResponse.json(
            { message: "An error occurred fetching questions." },
            { status: 500 }
        );
    }
}

// POST - Submit mock test answers and calculate score (no auth required - uses application ID)
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { applicationId, mcqAnswers, descriptiveAnswers } = body;

        if (!applicationId) {
            return NextResponse.json(
                { message: "Application ID is required" },
                { status: 400 }
            );
        }

        await dbConnect();

        // Calculate MCQ score
        let mcqScore = 0;
        const processedMcqAnswers = [];

        for (const answer of mcqAnswers) {
            const question = await MockTestQuestion.findById(answer.questionId);
            if (question && question.type === 'mcq') {
                const isCorrect = answer.selectedOption === question.correctOption;
                if (isCorrect) {
                    mcqScore += question.marks;
                }
                processedMcqAnswers.push({
                    questionId: answer.questionId,
                    question: question.question,
                    selectedOption: answer.selectedOption,
                    correctOption: question.correctOption,
                    isCorrect
                });
            }
        }

        // Process descriptive answers
        const processedDescriptiveAnswers = descriptiveAnswers.map((answer: any) => ({
            questionId: answer.questionId,
            question: answer.question,
            answer: answer.answer
        }));

        // Calculate total score (descriptive questions are manually graded, so 0 for now)
        const totalMcqMarks = processedMcqAnswers.length * 1;
        const descriptiveMarks = processedDescriptiveAnswers.length * 5;
        const currentScore = mcqScore;
        const percentage = totalMcqMarks > 0 ? Math.round((mcqScore / totalMcqMarks) * 100) : 0;

        // Update application with test results
        const application = await PreMentorApplication.findByIdAndUpdate(
            applicationId,
            {
                mockTestScore: currentScore,
                mockTestTotal: totalMcqMarks + descriptiveMarks,
                mockTestPercentage: percentage,
                mcqAnswers: processedMcqAnswers,
                descriptiveAnswers: processedDescriptiveAnswers,
                status: 'pending' // Still pending admin review
            },
            { new: true }
        );

        if (!application) {
            return NextResponse.json(
                { message: "Application not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: "Mock test submitted successfully",
            score: currentScore,
            totalMarks: totalMcqMarks + descriptiveMarks,
            percentage,
            mcqScore,
            passed: percentage >= 60 // Minimum 60% to pass
        });

    } catch (error) {
        console.error("Mock Test Submit Error:", error);
        return NextResponse.json(
            { message: "An error occurred submitting test." },
            { status: 500 }
        );
    }
}
