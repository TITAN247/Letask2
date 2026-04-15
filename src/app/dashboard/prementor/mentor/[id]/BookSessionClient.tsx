"use client";

import { useState } from "react";
import { Calendar, Clock, ArrowRight, Sparkles, CheckCircle, Zap, Award, CreditCard } from "lucide-react";
import { useRouter } from "next/navigation";

interface BookSessionClientProps {
  mentorId: string;
  mentorType: string;
  mentorName: string;
  pricing: number;
}

export default function BookSessionClient({ mentorId, mentorType, mentorName, pricing }: BookSessionClientProps) {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [subject, setSubject] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isPro = mentorType === 'promentor';
  const isFree = !isPro || pricing === 0;

  const handleBook = async () => {
    if (!date || !time || !subject) return alert("Please fill all fields");
    setLoading(true);
    try {
      const res = await fetch("/api/sessions/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mentorId, 
          date, 
          timeSlot: time, 
          subject, 
          notes: context 
        })
      });
      if (res.ok) {
        router.push("/dashboard/prementor");
      } else {
         const data = await res.json();
         alert(data.message || "Failed to book");
      }
    } catch (e) {
      alert("Error booking session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-br from-amber-400 to-orange-500`}>
          <Award className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900">Book Session</h2>
          <p className="text-sm text-slate-500 font-medium">with {mentorName}</p>
        </div>
      </div>

      {/* Pricing Badge */}
      <div className={`p-4 rounded-2xl border ${
        isFree 
          ? 'bg-emerald-50 border-emerald-100' 
          : 'bg-amber-50 border-amber-100'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isFree ? (
              <><Sparkles className="w-5 h-5 text-emerald-500" /><span className="font-bold text-emerald-700">Free Session</span></>
            ) : (
              <><CreditCard className="w-5 h-5 text-amber-500" /><span className="font-bold text-amber-700">₹{pricing} per session</span></>
            )}
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">15 minutes</span>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-4">
        {/* Subject */}
        <div>
          <label className="block text-sm font-black text-slate-700 mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" /> What do you want to learn?
          </label>
          <input 
            type="text" 
            value={subject} 
            onChange={e => setSubject(e.target.value)} 
            placeholder="e.g. System Design Mock Interview, Career Guidance..." 
            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Date & Time Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-black text-slate-700 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" /> Date
            </label>
            <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-black text-slate-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" /> Time
            </label>
            <input 
              type="time" 
              value={time} 
              onChange={e => setTime(e.target.value)} 
              className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        {/* Additional Context */}
        <div>
          <label className="block text-sm font-black text-slate-700 mb-2">
            Additional context for {mentorName}
          </label>
          <textarea 
            value={context} 
            onChange={e => setContext(e.target.value)} 
            placeholder="Provide your background or specific questions so the mentor can prepare..."
            rows={3}
            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
          />
        </div>

        {/* Submit Button */}
        <button 
          onClick={handleBook} 
          disabled={loading || !date || !time || !subject} 
          className={`w-full py-4 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/25`}
        >
          {loading ? (
            <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Booking...</>
          ) : (
            <>{isFree ? <><Sparkles className="w-5 h-5" /> Book Free Session</> : <><CreditCard className="w-5 h-5" /> Book Session ₹{pricing}</>}</>
          )}
        </button>

        {/* Trust Badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-500" />
          <span>100% money back guarantee</span>
        </div>
      </div>
    </div>
  );
}
