"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Loader2, GraduationCap, Award, ArrowRight } from "lucide-react";

export default function Dashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [checkingApplications, setCheckingApplications] = useState(true);
    const [applicationStatus, setApplicationStatus] = useState<{hasPending: boolean, type?: string} | null>(null);

    useEffect(() => {
        if (status === "loading") return;

        let currentUser = null;

        if (session?.user) {
            currentUser = {
                name: session.user.name,
                email: session.user.email,
                role: (session.user as any).role || "mentee",
                id: (session.user as any).id,
                onboarding: (session.user as any).onboarding,
            };
        } else {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                currentUser = JSON.parse(storedUser);
            }
        }

        if (!currentUser) {
            router.push("/login/mentee");
            return;
        }

        setUser(currentUser);

        // Check for pending mentor applications
        checkApplicationStatus(currentUser);
    }, [session, status, router]);

    // Immediate redirect for mentor roles once user is loaded
    useEffect(() => {
        if (user && !checkingApplications) {
            if (user.role === "prementor") {
                router.push('/dashboard/prementor');
            } else if (user.role === "promentor") {
                router.push('/dashboard/promentor');
            } else if (user.role === "mentee") {
                router.push('/dashboard/mentee');
            } else if (user.role === "admin") {
                router.push('/dashboard/admin');
            }
        }
    }, [user, checkingApplications, router]);

    const checkApplicationStatus = async (userData: any) => {
        try {
            // Check Pre-Mentor application
            const preRes = await fetch("/api/prementor/apply");
            if (preRes.ok) {
                const preData = await preRes.json();
                if (preData.hasApplication && preData.application?.status === 'pending') {
                    setApplicationStatus({ hasPending: true, type: 'prementor' });
                    setCheckingApplications(false);
                    return;
                }
            }

            // Check Pro-Mentor application
            const proRes = await fetch("/api/promentor/apply");
            if (proRes.ok) {
                const proData = await proRes.json();
                if (proData.hasApplication && proData.application?.status === 'pending') {
                    setApplicationStatus({ hasPending: true, type: 'promentor' });
                    setCheckingApplications(false);
                    return;
                }
            }

            setApplicationStatus({ hasPending: false });
            setCheckingApplications(false);
        } catch (error) {
            console.error("Error checking application status:", error);
            setCheckingApplications(false);
        }
    };

    const handleLogout = async () => {
        if (session) {
            await signOut({ redirect: false });
        }
        localStorage.removeItem("user");
        router.push("/");
    };

    if (checkingApplications || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E2F5FF] to-white">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 text-[#0EA5E9] animate-spin" />
                    <p className="text-slate-600 font-medium">Checking application status...</p>
                </div>
            </div>
        );
    }

    // Show pending application status for mentees with pending applications
    if (user.role === "mentee" && applicationStatus?.hasPending) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#E2F5FF] to-white p-6">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl text-center">
                        {applicationStatus.type === 'prementor' ? (
                            <>
                                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <GraduationCap className="w-10 h-10 text-blue-600" />
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 mb-4">Pre-Mentor Application Pending</h1>
                            </>
                        ) : (
                            <>
                                <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Award className="w-10 h-10 text-purple-600" />
                                </div>
                                <h1 className="text-3xl font-black text-slate-900 mb-4">Pro-Mentor Application Pending</h1>
                            </>
                        )}
                        
                        <p className="text-slate-600 mb-8 text-lg">
                            Your application is currently under review. Our team will evaluate your submission and notify you via email within 3-7 business days.
                        </p>

                        <div className="bg-slate-50 rounded-2xl p-6 mb-8">
                            <h3 className="font-bold text-slate-800 mb-3">What you can do:</h3>
                            <ul className="text-slate-600 space-y-2 text-left">
                                <li className="flex items-start gap-2">
                                    <span className="text-[#0EA5E9]">•</span>
                                    <span>Browse available mentors and book sessions as a mentee</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#0EA5E9]">•</span>
                                    <span>Complete your mentee profile to get better matches</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-[#0EA5E9]">•</span>
                                    <span>Wait for the approval email notification</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => router.push("/dashboard/mentee")}
                                className="px-8 py-4 bg-[#0EA5E9] text-white font-bold rounded-full hover:bg-[#0284c7] transition-colors flex items-center justify-center gap-2"
                            >
                                Go to Mentee Dashboard <ArrowRight className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-8 py-4 bg-white text-slate-700 font-bold rounded-full border-2 border-slate-200 hover:bg-slate-50 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-800">LetAsk Dashboard</h1>
                        </div>
                        <div className="flex items-center">
                            <span className="text-gray-600 mr-4">Welcome, {user.name}</span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Hello, {user.name}!</h2>
                    <p className="text-gray-600 mb-4">
                        You are logged in as a <span className="font-semibold capitalize text-[#0EA5E9]">{user.role}</span>.
                    </p>

                    {user.role === "mentee" && (
                        <div className="mt-6 border-t pt-4">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Want to become a mentor?</h3>
                            <button
                                onClick={() => router.push("/select-role")}
                                className="px-6 py-3 bg-[#0EA5E9] text-white font-bold rounded-xl hover:bg-[#0284c7] transition-colors"
                            >
                                Apply as Mentor
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
