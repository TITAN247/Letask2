"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Lock, Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/components/Logo";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams?.get("email") || "";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!email) {
      setStatus("error");
      setMessage("No email provided. Please go back and try again.");
    }
  }, [email]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`reset-otp-${index + 1}`) as HTMLInputElement;
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`reset-otp-${index - 1}`) as HTMLInputElement;
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    
    if (fullCode.length !== 6 || !newPassword) {
      setStatus("error");
      setMessage("Please enter all 6 digits and a new password");
      return;
    }

    if (newPassword.length < 6) {
      setStatus("error");
      setMessage("Password must be at least 6 characters");
      return;
    }

    setStatus("loading");

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message || "Password reset successfully!");
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login/mentee");
        }, 2000);
      } else {
        setStatus("error");
        setMessage(data.message || "Failed to reset password");
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
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Success!</h1>
            <p className="text-slate-600 mb-4">{message}</p>
            <p className="text-sm text-slate-500">Redirecting to login...</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">Reset Password</h1>
            <p className="text-slate-600 mb-2 text-center">
              Enter the 6-digit code sent to
            </p>
            <p className="text-[#0EA5E9] font-semibold mb-6 text-center">{email}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Code Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Reset Code
                </label>
                <div className="flex justify-center gap-2">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      id={`reset-otp-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#0EA5E9] focus:outline-none transition-colors"
                      disabled={status === "loading"}
                    />
                  ))}
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password (min 6 chars)"
                    required
                    minLength={6}
                    className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-[#0EA5E9] focus:outline-none transition-colors"
                    disabled={status === "loading"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {status === "error" && (
                <div className="flex items-center justify-center gap-2 text-red-500">
                  <XCircle className="w-5 h-5" />
                  <p className="text-sm">{message}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading" || code.join("").length !== 6 || !newPassword}
                className="w-full bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {status === "loading" ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </form>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/forgot-password"
                className="text-[#0EA5E9] hover:text-[#0284C7] text-sm font-medium text-center"
              >
                Didn't receive code? Resend
              </Link>

              <Link
                href="/login/mentee"
                className="text-gray-500 hover:text-gray-700 text-sm flex items-center justify-center gap-1 transition-colors"
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#E8F4FD] via-[#F0F8FF] to-[#E0F2FE] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <Loader2 className="w-16 h-16 text-[#0EA5E9] mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Loading...</h1>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
