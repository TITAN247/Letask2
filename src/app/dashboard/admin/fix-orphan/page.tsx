"use client";

import { useState } from "react";
import { ArrowLeft, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FixOrphanPage() {
    const router = useRouter();
    const [tempId, setTempId] = useState("PRO-23723");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("password123");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState("");

    const handleFix = async () => {
        setLoading(true);
        setError("");
        setResult(null);

        try {
            const res = await fetch("/api/admin/fix-orphan", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tempId, email, password })
            });

            const data = await res.json();

            if (res.ok) {
                setResult(data);
            } else {
                setError(data.message || "Failed to fix application");
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.push('/dashboard/admin/applications')}
                        className="p-2 bg-white rounded-lg shadow-sm hover:bg-slate-100"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h1 className="text-2xl font-black">Fix Orphan Application</h1>
                </div>

                <div className="bg-white rounded-2xl p-8 shadow-sm">
                    <p className="text-slate-600 mb-6">
                        This tool creates a user account for applications where the original user was deleted.
                    </p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Application ID (Temp ID)
                            </label>
                            <input
                                type="text"
                                value={tempId}
                                onChange={(e) => setTempId(e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl"
                                placeholder="e.g., PRO-23723"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                New Email for User
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl"
                                placeholder="user@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Password
                            </label>
                            <input
                                type="text"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 border border-slate-200 rounded-xl"
                            />
                        </div>

                        <button
                            onClick={handleFix}
                            disabled={loading || !email || !tempId}
                            className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold disabled:opacity-50"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <Loader2 className="w-5 h-5 animate-spin" /> Fixing...
                                </span>
                            ) : (
                                "Create User & Fix Application"
                            )}
                        </button>
                    </div>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                <span className="font-bold">{error}</span>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle className="w-5 h-5" />
                                <span className="font-bold">{result.message}</span>
                            </div>
                            <div className="space-y-2 text-sm">
                                <p><strong>User Email:</strong> {result.user?.email}</p>
                                <p><strong>Application:</strong> {result.application?.tempId}</p>
                                <p><strong>Type:</strong> {result.application?.type}</p>
                            </div>
                            <div className="mt-4 p-3 bg-white rounded-lg">
                                <p className="font-bold text-sm mb-2">Next Steps:</p>
                                <ol className="text-sm space-y-1">
                                    <li>1. Go to Applications page</li>
                                    <li>2. Review and Approve the application</li>
                                    <li>3. User can login with email: {email} / password: {password}</li>
                                </ol>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
