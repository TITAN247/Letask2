"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Award, Clock, CheckCircle2, ArrowRight, Mail, Sparkles } from "lucide-react";

export default function ProMentorSuccess() {
    const router = useRouter();
    const [applicationId, setApplicationId] = useState<string>("");

    useEffect(() => {
        // Get application ID from localStorage if stored
        const storedAppId = localStorage.getItem("promentor_application_id");
        if (storedAppId) {
            setApplicationId(storedAppId);
        }
    }, []);

    return (
        <div className="min-h-screen bg-[#E2F5FF] flex flex-col items-center justify-center p-6">
            <div className="max-w-2xl w-full bg-white rounded-3xl p-10 md:p-16 shadow-2xl text-center animate-in zoom-in-95">
                <div className="w-24 h-24 bg-[#0EA5E9]/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <Award className="w-12 h-12 text-[#0EA5E9]" />
                </div>
                
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
                    Application Submitted!
                </h1>
                
                <p className="text-slate-600 mb-8 text-lg">
                    Your Pro-Mentor application has been received and is now under review.
                </p>

                {/* Application ID Display */}
                {applicationId && (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-6">
                        <p className="text-indigo-800 text-sm">
                            <span className="font-bold">Application ID:</span>{" "}
                            <span className="font-mono font-bold text-indigo-600">{applicationId}</span>
                        </p>
                        <p className="text-indigo-600 text-xs mt-1">
                            Save this ID for your reference
                        </p>
                    </div>
                )}

                <div className="bg-[#E2F5FF]/50 rounded-2xl p-6 mb-8 text-left">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-[#0EA5E9]" />
                        What happens next?
                    </h3>
                    <ul className="space-y-3 text-slate-600">
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-[#0EA5E9] flex-shrink-0 mt-0.5" />
                            <span>Our team will review your application and teaching video</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-[#0EA5E9] flex-shrink-0 mt-0.5" />
                            <span>You will receive an email notification within 5-7 business days</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-[#0EA5E9] flex-shrink-0 mt-0.5" />
                            <span>Once approved, login to access your Pro-Mentor Dashboard</span>
                        </li>
                    </ul>
                    
                    {/* Email Notification Box */}
                    <div className="mt-6 bg-white rounded-xl p-4 border border-slate-200">
                        <div className="flex items-center gap-3 mb-2">
                            <Mail className="w-5 h-5 text-purple-600" />
                            <span className="font-bold text-slate-800">Email Notification</span>
                        </div>
                        <p className="text-slate-600 text-sm">
                            We'll send you an email once your application is approved. Please check your inbox (and spam folder) regularly.
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => router.push("/login/promentor")}
                    className="px-8 py-4 bg-[#0EA5E9] text-white font-bold rounded-full hover:bg-[#0284c7] transition-colors flex items-center gap-2 mx-auto"
                >
                    Go to Pro-Mentor Login <ArrowRight className="w-5 h-5" />
                </button>
                <p className="text-slate-500 text-sm mt-4">
                    Login to check your application status
                </p>
            </div>
        </div>
    );
}
