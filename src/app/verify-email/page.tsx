"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/Logo";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your email...");
  const [email, setEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const token = searchParams.get("token");

  const handleResend = async () => {
    if (!email) return;
    
    setResendLoading(true);
    setResendSuccess(false);
    
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        setResendSuccess(true);
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to resend verification email');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token provided.");
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Your email has been verified successfully!");
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/login/mentee");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.message || "Failed to verify email. The token may be expired or invalid.");
        }
      } catch (error) {
        setStatus("error");
        setMessage("An error occurred while verifying your email. Please try again.");
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F4FD] via-[#F0F8FF] to-[#E0F2FE] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <Logo size={40} showText={true} />
        {status === "loading" && (
          <>
            <Loader2 className="w-16 h-16 text-[#6DB2F2] mx-auto mb-4 animate-spin" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Verifying Email</h1>
            <p className="text-slate-600">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Email Verified!</h1>
            <p className="text-slate-600 mb-6">{message}</p>
            <p className="text-sm text-slate-500">Redirecting to login page...</p>
            <Link 
              href="/login/mentee"
              className="inline-block mt-4 px-6 py-2 bg-[#6DB2F2] text-white rounded-lg font-medium hover:bg-[#4A90D9] transition-colors"
            >
              Go to Login
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Verification Failed</h1>
            <p className="text-slate-600 mb-4">{message}</p>
            
            {/* Resend Verification Section */}
            <div className="mt-4 mb-6 p-4 bg-slate-50 rounded-xl">
              <p className="text-sm text-slate-600 mb-3">Enter your email to resend verification link:</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-[#6DB2F2]/20 focus:border-[#6DB2F2] outline-none text-sm"
                />
                <button
                  onClick={handleResend}
                  disabled={resendLoading || !email}
                  className="px-4 py-2 bg-[#6DB2F2] text-white rounded-lg font-medium hover:bg-[#4A90D9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                >
                  {resendLoading ? "Sending..." : "Resend Link"}
                </button>
              </div>
              {resendSuccess && (
                <p className="text-green-600 text-sm mt-2">Verification email sent! Check your inbox.</p>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              <Link 
                href="/login/mentee"
                className="px-6 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-colors"
              >
                Go to Login
              </Link>
              <Link 
                href="/"
                className="px-6 py-2 bg-[#6DB2F2] text-white rounded-lg font-medium hover:bg-[#4A90D9] transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#E8F4FD] via-[#F0F8FF] to-[#E0F2FE] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <Logo size={40} showText={true} />
          <Loader2 className="w-16 h-16 text-[#6DB2F2] mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Loading...</h1>
          <p className="text-slate-600">Please wait while we verify your email.</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
