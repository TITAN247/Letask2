"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar as CalendarIcon, Clock, MoveRight, Loader2, Sparkles } from "lucide-react";

export default function BookingPanel({ mentorId, mentorName, userRole }: { mentorId: string, mentorName: string, userRole?: string }) {
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [subject, setSubject] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const generateDates = () => {
        const dates = [];
        const today = new Date();
        for (let i = 1; i <= 5; i++) {
            const nextDay = new Date(today);
            nextDay.setDate(today.getDate() + i);
            dates.push(nextDay);
        }
        return dates;
    };

    const timeSlots = ["10:00 AM", "01:00 PM", "03:30 PM", "06:00 PM"];

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/sessions/book", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mentorId,
                    subject,
                    date,
                    timeSlot: time,
                    notes
                })
            });

            if (res.ok) {
                // Success
                alert(`Session with ${mentorName} booked successfully!`);
                router.push("/dashboard/mentee"); 
            } else {
                const err = await res.json();
                alert(err.message || "Failed to book session.");
            }
        } catch (error) {
            console.error(error);
            alert("Network error.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleBooking} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">What do you want to learn?</label>
                <input 
                    type="text" 
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. System Design Mock Interview"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all shadow-sm"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-slate-400" /> Select a Date</label>
                <div className="grid grid-cols-5 gap-2">
                    {generateDates().map((d, i) => {
                        const dateStr = d.toISOString().split('T')[0];
                        const isSelected = date === dateStr;
                        return (
                            <button
                                key={i}
                                type="button"
                                onClick={() => setDate(dateStr)}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                            >
                                <span className={`text-[10px] uppercase font-bold tracking-widest ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                                    {d.toLocaleDateString('en-US', { weekday: 'short' })}
                                </span>
                                <span className="text-lg font-black">{d.getDate()}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {date && (
                <div className="animate-in fade-in slide-in-from-top-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /> Select a Time</label>
                    <div className="grid grid-cols-2 gap-3">
                        {timeSlots.map(slot => (
                            <button
                                key={slot}
                                type="button"
                                onClick={() => setTime(slot)}
                                className={`py-3 text-sm font-bold rounded-xl border transition-all ${time === slot ? 'bg-indigo-50 border-indigo-600 text-indigo-700 ring-1 ring-indigo-600' : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'}`}
                            >
                                {slot}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Additional context for {mentorName}</label>
                <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide your background or specific questions so the mentor can prepare..."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all shadow-sm resize-none"
                />
            </div>

            <button 
                type="submit" 
                disabled={loading || !date || !time || !subject}
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:pointer-events-none disabled:transform-none mt-4"
            >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                    <>
                        <Sparkles className="w-4 h-4 text-indigo-400" /> Book Session
                    </>
                )}
            </button>
        </form>
    );
}
