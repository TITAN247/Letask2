"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
    GraduationCap, 
    Award, 
    ArrowRight, 
    CheckCircle2,
    Clock,
    Video,
    FileQuestion
} from "lucide-react";
import Logo from "@/components/Logo";

function RoleSelectionContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [hasPreMentorApp, setHasPreMentorApp] = useState(false);
    const [hasProMentorApp, setHasProMentorApp] = useState(false);
    
    // Check if in login mode (from landing page)
    const isLoginMode = searchParams?.get("mode") === "login";

    useEffect(() => {
        // If in login mode, skip authentication check
        if (isLoginMode) {
            setLoading(false);
            return;
        }
        
        if (status === "loading") return;

        const storedUser = localStorage.getItem("user");
        let currentUser = null;

        if (session?.user) {
            currentUser = {
                name: session.user.name,
                email: session.user.email,
                role: (session.user as any).role || "mentee",
                id: (session.user as any).id,
            };
        } else if (storedUser) {
            currentUser = JSON.parse(storedUser);
        }

        if (!currentUser) {
            router.push("/login/mentee");
            return;
        }

        setUser(currentUser);

        // Check if user already has pending applications
        checkApplicationStatus(currentUser);
    }, [session, status, router, isLoginMode]);

    const checkApplicationStatus = async (userData: any) => {
        try {
            // Check Pre-Mentor application status
            const preRes = await fetch("/api/prementor/apply");
            if (preRes.ok) {
                const preData = await preRes.json();
                setHasPreMentorApp(preData.hasApplication && preData.application?.status === 'pending');
            }

            // Check Pro-Mentor application status
            const proRes = await fetch("/api/promentor/apply");
            if (proRes.ok) {
                const proData = await proRes.json();
                setHasProMentorApp(proData.hasApplication && proData.application?.status === 'pending');
            }
        } catch (error) {
            console.error("Error checking application status:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleSelect = (role: 'prementor' | 'promentor') => {
        // If in login mode, redirect to respective login page
        if (isLoginMode) {
            if (role === 'prementor') {
                router.push("/login/prementor");
            } else {
                router.push("/login/promentor");
            }
            return;
        }
        
        // Normal onboarding flow
        if (role === 'prementor') {
            if (hasPreMentorApp) {
                alert("You already have a pending Pre-Mentor application. Please wait for admin review.");
                return;
            }
            router.push("/onboarding/prementor");
        } else {
            if (hasProMentorApp) {
                alert("You already have a pending Pro-Mentor application. Please wait for admin review.");
                return;
            }
            router.push("/onboarding/promentor");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#E2F5FF] via-white to-[#E2F5FF] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0EA5E9]"></div>
            </div>
        );
    }
    
    // Only require user for non-login mode
    if (!isLoginMode && !user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#E2F5FF] via-white to-[#E2F5FF] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0EA5E9]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#E2F5FF] via-white to-[#E2F5FF] flex flex-col font-sans">
            {/* Header */}
            <header className="px-8 py-6 flex items-center justify-between">
                <Logo size={40} showText={true} />
                {!isLoginMode && user && (
                    <div className="flex items-center gap-4">
                        <span className="text-slate-600">Welcome, {user.name}</span>
                        <button 
                            onClick={() => {
                                localStorage.removeItem("user");
                                router.push("/");
                            }}
                            className="text-[#0EA5E9] font-semibold hover:underline"
                        >
                            Logout
                        </button>
                    </div>
                )}
                {isLoginMode && (
                    <button 
                        onClick={() => router.push("/")}
                        className="text-slate-600 font-semibold hover:text-slate-800"
                    >
                        Back to Home
                    </button>
                )}
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6">
                <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-4">
                        {isLoginMode ? 'Login as' : 'Become a'} <span className="text-[#0EA5E9]">Mentor</span>
                    </h1>
                    <p className="text-xl text-slate-600 font-medium max-w-2xl mx-auto">
                        {isLoginMode 
                            ? "Select your mentor type to continue to login."
                            : "Share your knowledge and help others grow. Choose your mentor path below."}
                    </p>
                </div>

                {/* Role Selection Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full px-4">
                    {/* Pre-Mentor Card */}
                    <button
                        onClick={() => handleRoleSelect('prementor')}
                        disabled={!isLoginMode && hasPreMentorApp}
                        className={`group relative overflow-hidden bg-white rounded-[2rem] p-8 md:p-12 text-left transition-all duration-500 border-2 ${
                            !isLoginMode && hasPreMentorApp 
                                ? 'border-slate-200 opacity-60 cursor-not-allowed' 
                                : 'border-white hover:border-[#0EA5E9] shadow-[0_20px_60px_rgba(14,165,233,0.15)] hover:shadow-[0_30px_80px_rgba(14,165,233,0.25)] hover:-translate-y-2'
                        }`}
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-[#0EA5E9]/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-[#0EA5E9]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#0EA5E9]/20 transition-colors">
                                <GraduationCap className="w-8 h-8 text-[#0EA5E9]" />
                            </div>
                            
                            <h2 className="text-2xl font-black text-slate-900 mb-3">
                                Pre-Mentor
                            </h2>
                            <p className="text-slate-600 mb-6 font-medium">
                                For learners who want to share knowledge while continuing to grow. Perfect for college students and recent graduates.
                            </p>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                    <CheckCircle2 className="w-4 h-4 text-[#0EA5E9]" />
                                    <span>Free mentoring sessions</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                    <Clock className="w-4 h-4 text-[#0EA5E9]" />
                                    <span>15-20 min onboarding</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                    <FileQuestion className="w-4 h-4 text-[#0EA5E9]" />
                                    <span>Includes mock test</span>
                                </div>
                            </div>

                            {hasPreMentorApp ? (
                                <div className="mt-8 px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-semibold text-center">
                                    Application Pending
                                </div>
                            ) : (
                                <div className="mt-8 flex items-center gap-2 text-[#0EA5E9] font-bold group-hover:gap-4 transition-all">
                                    Get Started <ArrowRight className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                    </button>

                    {/* Pro-Mentor Card */}
                    <button
                        onClick={() => handleRoleSelect('promentor')}
                        disabled={!isLoginMode && hasProMentorApp}
                        className={`group relative overflow-hidden bg-white rounded-[2rem] p-8 md:p-12 text-left transition-all duration-500 border-2 ${
                            !isLoginMode && hasProMentorApp 
                                ? 'border-slate-200 opacity-60 cursor-not-allowed' 
                                : 'border-white hover:border-[#0EA5E9] shadow-[0_20px_60px_rgba(14,165,233,0.15)] hover:shadow-[0_30px_80px_rgba(14,165,233,0.25)] hover:-translate-y-2'
                        }`}
                    >
                        <div className="absolute top-0 right-0 w-40 h-40 bg-[#0EA5E9]/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                        
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-[#0EA5E9]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#0EA5E9]/20 transition-colors">
                                <Award className="w-8 h-8 text-[#0EA5E9]" />
                            </div>
                            
                            <h2 className="text-2xl font-black text-slate-900 mb-3">
                                Pro-Mentor
                            </h2>
                            <p className="text-slate-600 mb-6 font-medium">
                                For experienced professionals with 2+ years of industry experience. Set your own rates and build your brand.
                            </p>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                    <CheckCircle2 className="w-4 h-4 text-[#0EA5E9]" />
                                    <span>Paid mentoring sessions</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                    <Clock className="w-4 h-4 text-[#0EA5E9]" />
                                    <span>20-30 min onboarding</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                    <Video className="w-4 h-4 text-[#0EA5E9]" />
                                    <span>Requires video submission</span>
                                </div>
                            </div>

                            {hasProMentorApp ? (
                                <div className="mt-8 px-6 py-3 bg-slate-100 text-slate-500 rounded-xl font-semibold text-center">
                                    Application Pending
                                </div>
                            ) : (
                                <div className="mt-8 flex items-center gap-2 text-[#0EA5E9] font-bold group-hover:gap-4 transition-all">
                                    Apply Now <ArrowRight className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                    </button>
                </div>

                {/* Back to Dashboard */}
                {!isLoginMode && (
                    <button
                        onClick={() => router.push("/dashboard")}
                        className="mt-12 text-slate-500 hover:text-[#0EA5E9] font-medium transition-colors"
                    >
                        ← Back to Dashboard
                    </button>
                )}
            </main>
        </div>
    );
}

export default function RoleSelectionPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-[#E2F5FF] via-white to-[#E2F5FF] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0EA5E9]"></div>
            </div>
        }>
            <RoleSelectionContent />
        </Suspense>
    );
}
