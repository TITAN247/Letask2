"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/Logo";

function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const role = searchParams.get("role") || "mentee"; // Get role from URL, default to mentee
  
  // Determine login path based on role
  const getLoginPath = (userRole: string) => {
    switch(userRole) {
      case 'prementor':
        return '/login/prementor';
      case 'promentor':
        return '/login/promentor';
      case 'mentee':
      default:
        return '/login/mentee';
    }
  };
  
  const loginPath = getLoginPath(role);
  
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const inputRefs = Array(6).fill(null).map(() => useState<HTMLInputElement | null>(null));

  useEffect(() => {
    if (!email) {
      setStatus("error");
      setMessage("No email provided. Please sign up again.");
    }
  }, [email]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      setStatus("error");
      setMessage("Please enter all 6 digits");
      return;
    }

    setStatus("loading");
    
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message || "Email verified successfully!");
        // Redirect to correct login page based on role after 2 seconds
        setTimeout(() => {
          router.push(loginPath);
        }, 2000);
      } else {
        setStatus("error");
        setMessage(data.message || "Verification failed");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred. Please try again.");
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResendLoading(true);
    
    try {
      const response = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setResendSuccess(true);
        setTimeout(() => setResendSuccess(false), 3000);
      } else {
        const data = await response.json();
        setStatus("error");
        setMessage(data.message || "Failed to resend code");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Failed to resend code");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F4FD] via-[#F0F8FF] to-[#E0F2FE] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <Logo size={40} showText={true} />

        {status === "success" ? (
          <>
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Email Verified!</h1>
            <p className="text-slate-600 mb-6">{message}</p>
            <p className="text-sm text-slate-500">Redirecting to login...</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Verify Your Email</h1>
            <p className="text-slate-600 mb-2">
              Enter the 6-digit code sent to
            </p>
            <p className="text-[#0EA5E9] font-semibold mb-6">{email}</p>

            {/* OTP Input */}
            <div className="flex justify-center gap-2 mb-6">
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#0EA5E9] focus:outline-none transition-colors"
                  disabled={status === "loading"}
                />
              ))}
            </div>

            {status === "error" && (
              <div className="flex items-center justify-center gap-2 text-red-500 mb-4">
                <XCircle className="w-5 h-5" />
                <p className="text-sm">{message}</p>
              </div>
            )}

            {resendSuccess && (
              <p className="text-green-500 text-sm mb-4">New code sent!</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={status === "loading" || code.join("").length !== 6}
              className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </button>

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="text-[#0EA5E9] hover:text-[#0284C7] text-sm font-medium disabled:opacity-50"
              >
                {resendLoading ? "Sending..." : "Didn't receive the code? Resend"}
              </button>

              <Link
                href={loginPath}
                className="text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#E8F4FD] via-[#F0F8FF] to-[#E0F2FE] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <Loader2 className="w-16 h-16 text-[#0EA5E9] mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Loading...</h1>
        </div>
      </div>
    }>
      <VerifyOtpContent />
    </Suspense>
  );
}
