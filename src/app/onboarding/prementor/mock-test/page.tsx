"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    Clock, 
    AlertCircle, 
    CheckCircle2, 
    ChevronRight,
    ChevronLeft,
    Loader2,
    Trophy,
    XCircle
} from "lucide-react";

interface Question {
    _id: string;
    question: string;
    options: string[];
    correctOption: number;
    type: 'mcq' | 'descriptive';
    marks: number;
}

export default function PreMentorMockTest() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number | string>>({});
    const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [domain, setDomain] = useState("");
    const [applicationId, setApplicationId] = useState("");
    const [showResults, setShowResults] = useState(false);
    const [results, setResults] = useState<any>(null);

    useEffect(() => {
        // Get stored application info
        const storedAppId = localStorage.getItem("prementor_application_id");
        const storedDomain = localStorage.getItem("prementor_domain");

        if (!storedAppId || !storedDomain) {
            router.push("/onboarding/prementor");
            return;
        }

        setApplicationId(storedAppId);
        setDomain(storedDomain);

        // Fetch questions
        fetchQuestions(storedDomain);
    }, [router]);

    useEffect(() => {
        // Timer countdown
        if (timeLeft > 0 && !showResults) {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleSubmit();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft, showResults]);

    const fetchQuestions = async (domainName: string) => {
        try {
            const res = await fetch(`/api/prementor/mock-test?domain=${encodeURIComponent(domainName)}`);
            if (res.ok) {
                const data = await res.json();
                const allQuestions = [...data.mcqs, ...data.descriptives];
                if (allQuestions.length === 0) {
                    setError(`No questions found for domain: ${domainName}. Please contact support.`);
                }
                setQuestions(allQuestions);
            } else {
                const errorData = await res.json().catch(() => ({ message: "Failed to load questions" }));
                setError(errorData.message || "Failed to load questions");
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setError("Error loading questions. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (questionId: string, answer: number | string) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            // Separate MCQ and descriptive answers
            const mcqAnswers = [];
            const descriptiveAnswers = [];

            for (const q of questions) {
                if (q.type === 'mcq' && answers[q._id] !== undefined) {
                    mcqAnswers.push({
                        questionId: q._id,
                        selectedOption: answers[q._id] as number
                    });
                } else if (q.type === 'descriptive' && answers[q._id]) {
                    descriptiveAnswers.push({
                        questionId: q._id,
                        question: q.question,
                        answer: answers[q._id] as string
                    });
                }
            }

            const res = await fetch("/api/prementor/mock-test", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    applicationId,
                    mcqAnswers,
                    descriptiveAnswers
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setResults(data);
                setShowResults(true);
                // Clear stored data
                localStorage.removeItem("prementor_application_id");
                localStorage.removeItem("prementor_domain");
            } else {
                setError(data.message || "Failed to submit test");
            }
        } catch (error) {
            setError("Error submitting test");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#E2F5FF] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-[#0EA5E9] animate-spin" />
                    <p className="text-slate-600 font-medium">Loading your mock test...</p>
                </div>
            </div>
        );
    }

    if (showResults && results) {
        return (
            <div className="min-h-screen bg-[#E2F5FF] flex flex-col items-center justify-center p-6">
                <div className="max-w-2xl w-full bg-white rounded-3xl p-8 md:p-12 shadow-2xl text-center animate-in zoom-in-95">
                    {results.passed ? (
                        <>
                            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trophy className="w-12 h-12 text-green-600" />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 mb-4">Congratulations! 🎉</h1>
                            <p className="text-slate-600 mb-8">You passed the mock test!</p>
                            <div className="bg-slate-50 rounded-2xl p-6 mb-8">
                                <div className="flex justify-around">
                                    <div className="text-center">
                                        <p className="text-3xl font-black text-[#0EA5E9]">{results.score}</p>
                                        <p className="text-slate-500 text-sm">MCQ Score</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-3xl font-black text-[#0EA5E9]">{results.percentage}%</p>
                                        <p className="text-slate-500 text-sm">Percentage</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-slate-600 mb-8">
                                Your application has been submitted for admin review. You will receive an email notification within 3-5 business days.
                            </p>
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="px-8 py-4 bg-[#0EA5E9] text-white font-bold rounded-full hover:bg-[#0284c7] transition-colors"
                            >
                                Go to Dashboard
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <XCircle className="w-12 h-12 text-red-600" />
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 mb-4">Keep Learning! 📚</h1>
                            <p className="text-slate-600 mb-8">You need 60% or higher to pass</p>
                            <div className="bg-slate-50 rounded-2xl p-6 mb-8">
                                <div className="flex justify-around">
                                    <div className="text-center">
                                        <p className="text-3xl font-black text-red-500">{results.score}</p>
                                        <p className="text-slate-500 text-sm">MCQ Score</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-3xl font-black text-red-500">{results.percentage}%</p>
                                        <p className="text-slate-500 text-sm">Percentage</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-slate-600 mb-8">
                                Don't worry! You can reapply after improving your skills. Review the feedback and try again.
                            </p>
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="px-8 py-4 bg-slate-200 text-slate-700 font-bold rounded-full hover:bg-slate-300 transition-colors"
                            >
                                Back to Dashboard
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    if (!loading && questions.length === 0) {
        return (
            <div className="min-h-screen bg-[#E2F5FF] flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl text-center">
                    <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">No Questions Available</h2>
                    <p className="text-slate-600 mb-6">{error || "Mock test questions have not been set up for this domain yet."}</p>
                    <button
                        onClick={() => router.push("/onboarding/prementor")}
                        className="px-6 py-3 bg-[#0EA5E9] text-white font-bold rounded-full hover:bg-[#0284c7] transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const currentQ = questions[currentQuestion];
    if (!currentQ) return null;

    return (
        <div className="min-h-screen bg-[#E2F5FF] flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-50">
                <div>
                    <h1 className="text-xl font-black text-slate-900">Pre-Mentor Mock Test</h1>
                    <p className="text-sm text-slate-500">Domain: {domain}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-full">
                        <Clock className="w-5 h-5 text-slate-600" />
                        <span className={`font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-slate-700'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                    <span className="text-sm font-medium text-slate-500">
                        {currentQuestion + 1} / {questions.length}
                    </span>
                </div>
            </header>

            {error && (
                <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {/* Main Content */}
            <main className="flex-1 p-6 md:p-12">
                <div className="max-w-4xl mx-auto">
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-white rounded-full mb-8 overflow-hidden">
                        <div 
                            className="h-full bg-[#0EA5E9] transition-all duration-300"
                            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                        />
                    </div>

                    {/* Question Card */}
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl animate-in fade-in slide-in-from-right-4">
                        <div className="flex items-center gap-3 mb-6">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                currentQ.type === 'mcq' 
                                    ? 'bg-blue-100 text-blue-700' 
                                    : 'bg-purple-100 text-purple-700'
                            }`}>
                                {currentQ.type === 'mcq' ? 'MULTIPLE CHOICE' : 'DESCRIPTIVE'}
                            </span>
                            <span className="text-slate-400 text-sm">
                                {currentQ.type === 'mcq' ? `${currentQ.marks} mark` : `${currentQ.marks} marks`}
                            </span>
                        </div>

                        <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-8">
                            {currentQ.question}
                        </h2>

                        {/* MCQ Options */}
                        {currentQ.type === 'mcq' && (
                            <div className="space-y-3">
                                {currentQ.options.map((option, idx) => {
                                    const isSelected = answers[currentQ._id] === idx;
                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(currentQ._id, idx)}
                                            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                                                isSelected 
                                                    ? 'border-[#0EA5E9] bg-[#E2F5FF]/30' 
                                                    : 'border-slate-200 hover:border-[#0EA5E9]/50 bg-slate-50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold text-sm ${
                                                    isSelected 
                                                        ? 'border-[#0EA5E9] bg-[#0EA5E9] text-white' 
                                                        : 'border-slate-300 text-slate-500'
                                                }`}>
                                                    {String.fromCharCode(65 + idx)}
                                                </div>
                                                <span className={`font-medium ${isSelected ? 'text-[#0EA5E9]' : 'text-slate-700'}`}>
                                                    {option}
                                                </span>
                                                {isSelected && <CheckCircle2 className="w-5 h-5 text-[#0EA5E9] ml-auto" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}

                        {/* Descriptive Answer */}
                        {currentQ.type === 'descriptive' && (
                            <div className="space-y-4">
                                <textarea
                                    value={(answers[currentQ._id] as string) || ''}
                                    onChange={(e) => handleAnswer(currentQ._id, e.target.value)}
                                    placeholder="Type your answer here..."
                                    rows={8}
                                    className="w-full p-4 bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-[#0EA5E9] focus:outline-none transition-colors font-medium resize-none"
                                />
                                <p className="text-sm text-slate-400">
                                    Minimum 50 words recommended. Be thorough in your explanation.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer Navigation */}
            <footer className="bg-white border-t border-slate-100 px-6 py-4">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <button
                        onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestion === 0}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
                    >
                        <ChevronLeft className="w-5 h-5" /> Previous
                    </button>

                    <div className="flex gap-2">
                        {questions.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentQuestion(idx)}
                                className={`w-3 h-3 rounded-full transition-all ${
                                    idx === currentQuestion 
                                        ? 'bg-[#0EA5E9] w-6' 
                                        : answers[questions[idx]._id] !== undefined 
                                            ? 'bg-green-400' 
                                            : 'bg-slate-200'
                                }`}
                            />
                        ))}
                    </div>

                    {currentQuestion === questions.length - 1 ? (
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-8 py-3 bg-[#0EA5E9] text-white rounded-xl font-semibold hover:bg-[#0284c7] transition-colors disabled:opacity-70"
                        >
                            {isSubmitting ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
                            ) : (
                                <>Submit Test <CheckCircle2 className="w-5 h-5" /></>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                            className="flex items-center gap-2 px-6 py-3 bg-[#0EA5E9] text-white rounded-xl font-semibold hover:bg-[#0284c7] transition-colors"
                        >
                            Next <ChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </footer>
        </div>
    );
}
