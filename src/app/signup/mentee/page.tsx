"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function MenteeSignupPage() {
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
                    role: "mentee",
                }),
            });

            const data = await res.json();

            if (res.ok) {
                if (data.needsEmailVerification) {
                    router.push(`/verify-otp?email=${encodeURIComponent(data.email)}&role=mentee`);
                } else {
                    alert(data.message || "Account created! Please login.");
                    router.push("/login/mentee");
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
                                onClick={() => import("next-auth/react").then(mod => mod.signIn('google', { callbackUrl: '/dashboard' }))} 
                                className="w-full bg-[#333333] hover:bg-black text-white font-medium py-3 px-4 sm:px-6 rounded-xl flex items-center justify-center gap-2 sm:gap-3 transition-colors shadow-md text-sm sm:text-base"
                            >
                                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg"><g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)"><path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z" /><path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z" /><path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.734 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z" /><path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.424 44.599 -10.174 45.789 L -6.704 42.299 C -8.804 40.309 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z" /></g></svg>
                                <span className="whitespace-nowrap">Sign up with Google</span>
                            </button>
                        </div>

                        {/* Login Link */}
                        <div className="text-center pt-4">
                            <span className="text-gray-600 text-sm">Already have an account? </span>
                            <Link href="/login/mentee" className="text-[#0EA5E9] font-bold text-sm hover:underline">
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
                            Mentee!
                        </h1>
                    </div>

                    <div className="relative w-[200px] sm:w-[280px] md:w-[400px] lg:w-[500px] -mb-6 sm:-mb-10 lg:-mb-20 flex justify-center">
                        <Image
                            src="/assets/mentee-login-character.png"
                            alt="Mentee Character"
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
