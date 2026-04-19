"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    ArrowLeft,
    Wallet,
    Building2,
    User,
    Hash,
    Mail,
    CheckCircle,
    AlertCircle,
    Loader2
} from "lucide-react";

interface BankDetails {
    bankName: string;
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    email: string;
}

export default function WithdrawPage() {
    const router = useRouter();
    const [availableBalance, setAvailableBalance] = useState(0);
    const [amount, setAmount] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [bankDetails, setBankDetails] = useState<BankDetails>({
        bankName: "",
        accountHolderName: "",
        accountNumber: "",
        ifscCode: "",
        email: ""
    });

    // Fetch available balance on mount
    useEffect(() => {
        fetchBalance();
    }, []);

    const fetchBalance = async () => {
        try {
            const res = await fetch('/api/payments/earnings');
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    // Convert from paise to rupees
                    setAvailableBalance(Math.floor(data.data.availableBalance / 100));
                }
            }
        } catch (e) {
            console.error("Failed to fetch balance:", e);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const withdrawAmount = parseFloat(amount);

        // Validation
        if (!withdrawAmount || withdrawAmount < 500) {
            setError("Minimum withdrawal amount is ₹500");
            setLoading(false);
            return;
        }

        if (withdrawAmount > availableBalance) {
            setError("Insufficient balance");
            setLoading(false);
            return;
        }

        if (!bankDetails.bankName || !bankDetails.accountHolderName || !bankDetails.accountNumber || !bankDetails.ifscCode) {
            setError("Please fill in all bank details");
            setLoading(false);
            return;
        }

        try {
            const res = await fetch('/api/payments/request-payout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: withdrawAmount,
                    currency: "INR",
                    bankDetails: {
                        bankName: bankDetails.bankName,
                        accountHolderName: bankDetails.accountHolderName,
                        accountNumber: bankDetails.accountNumber,
                        ifscCode: bankDetails.ifscCode,
                        email: bankDetails.email
                    }
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setSuccess(true);
                // Reset form
                setAmount("");
                setBankDetails({
                    bankName: "",
                    accountHolderName: "",
                    accountNumber: "",
                    ifscCode: "",
                    email: ""
                });
            } else {
                setError(data.message || "Failed to process withdrawal request");
            }
        } catch (e) {
            console.error("Withdrawal error:", e);
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200 p-8 text-center">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Withdrawal Requested!</h2>
                    <p className="text-slate-500 mb-6">
                        Your withdrawal request has been submitted successfully. You will receive an email confirmation shortly.
                    </p>
                    <button
                        onClick={() => router.push("/dashboard/promentor")}
                        className="w-full py-3 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => router.push("/dashboard/promentor")}
                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    <h1 className="text-3xl font-black text-slate-900">Withdraw Earnings</h1>
                </div>

                {/* Balance Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white mb-8 shadow-xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Wallet className="w-6 h-6 text-indigo-300" />
                        <span className="text-indigo-200 font-medium">Available Balance</span>
                    </div>
                    <div className="text-5xl font-black mb-2">₹{availableBalance.toLocaleString('en-IN')}</div>
                    <p className="text-indigo-200 text-sm">Minimum withdrawal: ₹500</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                        <p className="text-red-600 text-sm font-medium">{error}</p>
                    </div>
                )}

                {/* Withdrawal Form */}
                <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 space-y-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Withdrawal Details</h2>

                    {/* Amount */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Amount to Withdraw
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">₹</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                                min="500"
                                max={availableBalance}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-900 text-lg"
                                required
                            />
                        </div>
                        <p className="mt-2 text-xs text-slate-500 bg-slate-50 w-fit px-3 py-1 rounded-full">
                            Available: <span className="font-bold text-slate-700">₹{availableBalance.toLocaleString('en-IN')}</span>
                        </p>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-slate-400" />
                            Bank Details
                        </h3>

                        {/* Bank Name */}
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Bank Name
                            </label>
                            <input
                                type="text"
                                value={bankDetails.bankName}
                                onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                                placeholder="e.g., State Bank of India"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-900"
                                required
                            />
                        </div>

                        {/* Account Holder Name */}
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-400" />
                                Account Holder Name
                            </label>
                            <input
                                type="text"
                                value={bankDetails.accountHolderName}
                                onChange={(e) => setBankDetails({...bankDetails, accountHolderName: e.target.value})}
                                placeholder="Full name as per bank records"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-900"
                                required
                            />
                        </div>

                        {/* Account Number */}
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <Hash className="w-4 h-4 text-slate-400" />
                                Account Number
                            </label>
                            <input
                                type="text"
                                value={bankDetails.accountNumber}
                                onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                                placeholder="Enter account number"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-900"
                                required
                            />
                        </div>

                        {/* IFSC Code */}
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                IFSC Code
                            </label>
                            <input
                                type="text"
                                value={bankDetails.ifscCode}
                                onChange={(e) => setBankDetails({...bankDetails, ifscCode: e.target.value.toUpperCase()})}
                                placeholder="e.g., SBIN0001234"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-900 uppercase"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-slate-400" />
                                Email for Confirmation
                            </label>
                            <input
                                type="email"
                                value={bankDetails.email}
                                onChange={(e) => setBankDetails({...bankDetails, email: e.target.value})}
                                placeholder="Enter email for confirmation"
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-medium text-slate-900"
                                required
                            />
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                            <div className="text-sm text-indigo-700">
                                <p className="font-bold mb-1">Important Information:</p>
                                <ul className="space-y-1 text-xs">
                                    <li>• Processing time: 3-5 business days</li>
                                    <li>• 2.5% processing fee will be deducted</li>
                                    <li>• Minimum withdrawal: ₹500</li>
                                    <li>• You will receive an email confirmation</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || !amount || parseFloat(amount) < 500}
                        className="w-full py-4 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:bg-slate-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                <Wallet className="w-5 h-5" />
                                Request Withdrawal
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
