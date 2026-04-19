"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PreMentorSignupPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    role: "prementor",
                }),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.needsEmailVerification) {
                    router.push(`/verify-otp?email=${encodeURIComponent(data.email)}&role=prementor`);
                } else {
                    alert(data.message || "Account created! Please login.");
                    router.push("/login/prementor");
                }
            } else {
                alert(data.message || "Signup failed.");
            }
        } catch (error) {
            console.error("Signup error:", error);
            alert("An error occurred.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen w-full bg-gradient-to-br from-[#E0F7FF] via-[#EAF9FF] to-[#D6F1FF] flex items-center justify-center p-4 md:p-10 font-sans">
            <div className="w-full max-w-6xl mx-auto flex flex-col-reverse md:flex-row items-center gap-10 lg:gap-20">

                {/* LEFT: FORM CARD */}
                <div className="w-full max-w-md bg-white rounded-[20px] sm:rounded-[30px] p-6 sm:p-8 md:p-10 shadow-[0_20px_60px_rgba(14,165,233,0.1)]">
                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* Name Input */}
                        <div className="space-y-1">
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Full Name"
                                required
                                className="w-full bg-gray-100/80 border-none rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg text-gray-700 outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all font-medium placeholder:text-gray-400"
                            />
                        </div>

                        {/* Email Input */}
                        <div className="space-y-1">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email address"
                                required
                                className="w-full bg-gray-100/80 border-none rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg text-gray-700 outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all font-medium placeholder:text-gray-400"
                            />
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1 relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Create password"
                                required
                                className="w-full bg-gray-100/80 border-none rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-base sm:text-lg text-gray-700 outline-none focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all font-medium placeholder:text-gray-400 pr-12"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-800 hover:text-[#0EA5E9] transition-colors"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                )}
                            </button>
                        </div>

                        {/* Sign Up Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#1da9ea] hover:bg-[#0EA5E9] text-white font-bold text-base sm:text-lg py-3 sm:py-4 rounded-xl shadow-lg shadow-[#0EA5E9]/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? "Signing up..." : "Sign up"}
                        </button>

                        <div className="border-t border-gray-100 my-6"></div>

                        {/* Social Buttons */}
                        <div className="space-y-4">
                            <button 
                                type="button" 
                                onClick={() => import("next-auth/react").then(mod => mod.signIn('google', { callbackUrl: '/dashboard/mentee/apply-prementor' }))} 
                                className="w-full bg-[#333333] hover:bg-black text-white font-medium py-3 px-4 sm:px-6 rounded-xl flex items-center justify-center gap-2 sm:gap-3 transition-colors shadow-md text-sm sm:text-base"
                            >
                                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                <span className="whitespace-nowrap">Sign up with Google</span>
                            </button>
                        </div>

                        {/* Login Link */}
                        <div className="text-center pt-4">
                            <span className="text-gray-600 text-sm">Already have an account? </span>
                            <Link href="/login/prementor" className="text-[#0EA5E9] font-bold text-sm hover:underline">
                                Login
                            </Link>
                        </div>

                    </form>
                </div>

                {/* RIGHT: CHARACTER & TEXT */}
                <div className="flex flex-col items-center flex-1">
                    <div className="text-center mb-4 md:mb-6">
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-400 font-sans tracking-tight">
                            Register as
                        </h1>
                        <h1 className="text-4xl sm:text-5xl lg:text-[70px] font-extrabold text-[#0EA5E9] font-sans tracking-tight drop-shadow-sm mt-1">
                            PreMentor!
                        </h1>
                    </div>

                    <div className="relative w-[200px] sm:w-[280px] md:w-[400px] lg:w-[500px] -mb-6 sm:-mb-10 lg:-mb-20 flex justify-center">
                        <Image
                            src="/assets/login-prementor-new.png"
                            alt="PreMentor Character"
                            width={500}
                            height={500}
                            className="w-full h-auto drop-shadow-2xl z-10 relative"
                            priority
                            sizes="(max-width: 640px) 200px, (max-width: 768px) 280px, (max-width: 1024px) 400px, 500px"
                        />
                        {/* White-Blue Line/Glow Effect */}
                        <div className="absolute bottom-0 w-[120%] h-24 bg-gradient-to-t from-[#E0F7FF] via-[#E0F7FF]/80 to-transparent z-20 blur-xl"></div>
                        <div className="absolute bottom-10 w-full h-1 bg-gradient-to-r from-transparent via-sky-300 to-transparent opacity-50 blur-sm z-0"></div>
                    </div>
                </div>

            </div>
        </main>
    );
}
