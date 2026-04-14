"use client";

import { useState } from "react";
import { Shield, Loader2, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("admin@letask.com");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            console.log("[Admin Login] Attempting login with:", email);
            
            // Use direct API login instead of signIn for better control
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();
            console.log("[Admin Login] Response:", data);

            if (!res.ok) {
                setError(data.message || "Invalid credentials");
                setLoading(false);
                return;
            }

            // Check if user is admin
            if (data.user?.role === "admin") {
                console.log("[Admin Login] Success, redirecting...");
                // Store user in localStorage for session
                localStorage.setItem("user", JSON.stringify(data.user));
                // Hard redirect to applications
                window.location.href = "/dashboard/admin/applications";
            } else {
                setError("You are not authorized as admin");
                setLoading(false);
            }
        } catch (error) {
            console.error("[Admin Login] Error:", error);
            setError("An error occurred during login");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
                        <Shield className="w-10 h-10 text-indigo-400" />
                    </div>
                    <h1 className="text-3xl font-black text-white mb-2">Admin Portal</h1>
                    <p className="text-slate-400">LetAsk Administration Panel</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/10 shadow-2xl">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors"
                                placeholder="admin@letask.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-colors"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> Logging in...
                                </>
                            ) : (
                                <>
                                    Login <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Default credentials hint */}
                    <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
                        <p className="text-xs text-slate-400 text-center">
                            Default credentials: <span className="text-slate-300">admin@letask.com</span> / <span className="text-slate-300">admin123</span>
                        </p>
                    </div>
                </div>

                {/* Back link */}
                <div className="text-center mt-6">
                    <a
                        href="/"
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                        ← Back to LetAsk
                    </a>
                </div>
            </div>
        </div>
    );
}
