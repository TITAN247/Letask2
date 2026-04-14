"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function AuthRedirectInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    useEffect(() => {
        const checkSessionAndRedirect = async () => {
            try {
                // Get the session
                const response = await fetch("/api/auth/session");
                const session = await response.json();
                
                if (!session || !session.user) {
                    setError("No active session found. Please try logging in again.");
                    setTimeout(() => router.replace("/login/mentee"), 3000);
                    return;
                }
                
                const userRole = session.user.role;
                const requestedRole = searchParams?.get("role");
                
                // Store user role in localStorage for client-side use
                if (userRole) {
                    localStorage.setItem("userRole", userRole);
                }
                
                // If user tries to access a role that doesn't match their actual role
                if (requestedRole && userRole !== requestedRole) {
                    setError(`This account is registered as a ${userRole}. Redirecting to the correct page...`);
                    
                    // Redirect to correct page based on actual role
                    if (userRole === "prementor") {
                        setTimeout(() => router.replace("/onboarding/prementor"), 2000);
                    } else if (userRole === 'promentor') {
                        setTimeout(() => router.replace("/dashboard/promentor"), 2000);
                    } else if (userRole === "mentee") {
                        setTimeout(() => router.replace("/dashboard/mentee"), 2000);
                    } else if (userRole === "admin") {
                        setTimeout(() => router.replace("/dashboard/admin"), 2000);
                    }
                    return;
                }
                
                // Redirect based on actual role
                if (userRole === "prementor") {
                    // Check if pre-mentor has completed onboarding
                    const userId = session.user._id || session.user.id;
                    console.log("Pre-mentor login, checking onboarding for:", userId);
                    
                    if (!userId) {
                        console.error("No user ID found in session:", session.user);
                        setError("Login error: Missing user ID");
                        return;
                    }
                    
                    const onboardingRes = await fetch(`/api/auth/onboarding/check?userId=${userId}`);
                    const onboardingData = await onboardingRes.json();
                    console.log("Onboarding check result:", onboardingData);
                    
                    if (onboardingData.hasOnboarding) {
                        console.log("Redirecting pre-mentor to dashboard");
                        router.replace("/dashboard/prementor");
                    } else {
                        console.log("Redirecting pre-mentor to onboarding");
                        router.replace("/onboarding/prementor");
                    }
                } else if (userRole === "promentor") {
                    router.replace("/dashboard/promentor");
                } else if (userRole === "mentee") {
                    router.replace("/dashboard/mentee");
                } else if (userRole === "admin") {
                    router.replace("/dashboard/admin");
                } else {
                    // Default to mentee dashboard
                    router.replace("/dashboard/mentee");
                }
            } catch (err) {
                console.error("Auth redirect error:", err);
                setError("An error occurred. Redirecting to login...");
                setTimeout(() => router.replace("/login/mentee"), 2000);
            } finally {
                setLoading(false);
            }
        };
        
        checkSessionAndRedirect();
    }, [searchParams, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0EA5E9] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Authenticating...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-500 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    return null;
}

export default function AuthRedirect() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0EA5E9] mx-auto"></div>
                    <p className="mt-4 text-gray-600">Authenticating...</p>
                </div>
            </div>
        }>
            <AuthRedirectInner />
        </Suspense>
    );
}
