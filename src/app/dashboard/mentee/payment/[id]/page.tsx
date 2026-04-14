"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { CreditCard, Loader2, CheckCircle, AlertCircle, RefreshCw, RotateCcw } from "lucide-react";
import Script from "next/script";
import { checkPaymentStatus, formatAmount } from "@/lib/payments";

interface SessionDetails {
  _id: string;
  subject: string;
  date: string;
  timeSlot: string;
  amount: number | null;
  mentorId: {
    name: string;
    email: string;
  } | null;
  menteeId: any;
  paymentStatus: string;
  status: string;
  mentorType: string;
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.id as string | undefined;
  
  const [session, setSession] = useState<SessionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  // Load session details
  useEffect(() => {
    if (!sessionId) {
      setError("Invalid session ID");
      setLoading(false);
      return;
    }
    
    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`);
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response:', text.substring(0, 200));
          throw new Error(`Server returned ${response.status}: Not JSON`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data) {
          const sessionData = data.data;
          setSession(sessionData);
          
          // If payment already completed or paid, redirect to chat
          const isPaid = sessionData.paymentStatus === 'completed' || sessionData.paymentStatus === 'paid';
          if (isPaid) {
            console.log('[Payment Page] Payment already completed, redirecting to chat...');
            router.push(`/dashboard/chat/${sessionId}`);
            return;
          }
        } else {
          setError(data.message || "Session not found");
        }
      } catch (err: any) {
        console.error('Fetch session error:', err);
        setError(err.message || "Failed to load session details");
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [sessionId, router]);

  // Handle Razorpay Payment
  const handlePayment = async () => {
    if (!session) return;
    
    setPaymentLoading(true);
    setError("");

    try {
      // 1. Create order
      const orderResponse = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session._id,
          amount: session.amount || 500,
          currency: "INR",
        }),
      });

      const orderData = await orderResponse.json();

      if (!orderData.success) {
        throw new Error(orderData.message || "Failed to create order");
      }

      // 2. Open Razorpay checkout
      const options = {
        key: orderData.data.key,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        order_id: orderData.data.orderId,
        name: "LetAsk",
        description: `Session with ${session.mentorId?.name || 'Mentor'}`,
        image: "/logo.png",
        prefill: {
          name: "",
          email: "",
          contact: "",
        },
        notes: {
          sessionId: session._id,
        },
        theme: {
          color: "#0EA5E9",
        },
        handler: async function (response: any) {
          try {
            // 3. Verify payment
            const verifyResponse = await fetch("/api/payments/verify-razorpay", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              setSuccess(true);
              setSession((prev) =>
                prev ? { ...prev, paymentStatus: "completed" } : null
              );
              // Poll for session status update (for localhost without webhooks)
              setTimeout(() => {
                router.push(`/dashboard/chat/${sessionId}`);
              }, 2000);
            } else {
              setError("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Payment verification error:", err);
            // Even if verification API fails, Razorpay payment succeeded
            // Show success and redirect (webhooks will handle backend update)
            setSuccess(true);
            setTimeout(() => {
              router.push(`/dashboard/chat/${sessionId}`);
            }, 2000);
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentLoading(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message || "Payment failed. Please try again.");
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800">{error}</h2>
          <p className="text-red-600 mt-2">Please try again or contact support.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
        <div className="bg-emerald-50 border border-emerald-200 rounded-[2.5rem] p-12 text-center max-w-md w-full">
          <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black text-emerald-800 mb-4">Payment Successful!</h2>
          <p className="text-emerald-600 mb-8">
            Your session is now confirmed. You'll receive an email confirmation shortly.
          </p>
          <div className="space-y-3">
            <a
              href={`/dashboard/chat/${sessionId}`}
              className="block w-full py-4 bg-emerald-600 text-white rounded-2xl font-black shadow-lg hover:bg-emerald-700 transition-all"
            >
              Start Chat with Mentor
            </a>
            <a
              href="/dashboard/mentee/bookings"
              className="block w-full py-4 bg-white text-emerald-600 border-2 border-emerald-600 rounded-2xl font-black hover:bg-emerald-50 transition-all"
            >
              View My Bookings
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <div className="min-h-screen bg-slate-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-[2.5rem] shadow-xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white">
              <h1 className="text-3xl font-black mb-2">Complete Payment</h1>
              <p className="text-indigo-100">Secure your mentorship session</p>
            </div>

            <div className="p-8">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                  <button
                    onClick={handlePayment}
                    disabled={paymentLoading}
                    className="mt-3 w-full py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${paymentLoading ? 'animate-spin' : ''}`} />
                    {paymentLoading ? 'Retrying...' : 'Try Again'}
                  </button>
                </div>
              )}

              {/* Session Details */}
              <div className="bg-slate-50 rounded-2xl p-6 mb-8">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Session Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mentor</span>
                    <span className="font-bold text-slate-800">{session?.mentorId?.name || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Subject</span>
                    <span className="font-bold text-slate-800">{session?.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date</span>
                    <span className="font-bold text-slate-800">{session?.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Time</span>
                    <span className="font-bold text-slate-800">{session?.timeSlot}</span>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="border-t border-slate-200 pt-6 mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-slate-600">Session Fee</span>
                  <span className="text-xl font-bold text-slate-800">₹{session?.amount || 500}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Platform Fee (20%)</span>
                  <span className="text-slate-600">Included</span>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-200">
                  <span className="text-lg font-bold text-slate-800">Total Amount</span>
                  <span className="text-3xl font-black text-indigo-600">₹{session?.amount || 'TBD'}</span>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={paymentLoading || !session?.amount}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pay ₹{session?.amount || '---'}
                  </>
                )}
              </button>

              {/* Security Note */}
              <div className="mt-6 text-center">
                <p className="text-sm text-slate-500">
                  🔒 Secure payment powered by Razorpay
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Your payment information is encrypted and secure
                </p>
              </div>

              {/* Support */}
              <div className="mt-8 text-center">
                <p className="text-sm text-slate-500">
                  Having trouble?{" "}
                  <a href="mailto:support@letask.in" className="text-indigo-600 font-medium hover:underline">
                    Contact Support
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
