"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Mail, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/Logo";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    
    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message || "Reset code sent!");
        // Redirect to reset password page after 1.5 seconds
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 1500);
      } else {
        setStatus("error");
        setMessage(data.message || "Failed to send reset code");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F4FD] via-[#F0F8FF] to-[#E0F2FE] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <Logo size={40} showText={true} />

        {status === "success" ? (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Check Your Email!</h1>
            <p className="text-slate-600 mb-4">{message}</p>
            <p className="text-sm text-slate-500">Redirecting to reset password...</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">Forgot Password?</h1>
            <p className="text-slate-600 mb-6 text-center">
              Enter your email address and we'll send you a code to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#0EA5E9] focus:outline-none transition-colors"
                  disabled={status === "loading"}
                />
              </div>

              {status === "error" && (
                <p className="text-red-500 text-sm text-center">{message}</p>
              )}

              <button
                type="submit"
                disabled={status === "loading" || !email}
                className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Code"
                )}
              </button>
            </form>

            <Link
              href="/login/mentee"
              className="mt-6 text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
