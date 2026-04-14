"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

export default function MentorDashboardClient({ pendingRequests, upcomingSessions }: { pendingRequests: any[], upcomingSessions: any[] }) {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const router = useRouter();

    const updateSessionStatus = async (id: string, status: 'accepted' | 'cancelled') => {
        setLoadingId(id);
        try {
            const res = await fetch(`/api/sessions/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                router.refresh(); // Automatically mutate UI via Server Component re-fetch
            } else {
                alert("Action failed to process.");
            }
        } catch (e) {
            alert("Network error.");
        } finally {
            setLoadingId(null);
        }
    };

    const startChat = async (sessionId: string) => {
        try {
            console.log("Starting chat for session:", sessionId);
            const res = await fetch('/api/chat/join-simple', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId })
            });
            
            const data = await res.json();
            console.log("Chat join response:", data);
            
            if (res.ok) {
                window.location.href = `/dashboard/chat/${sessionId}`;
            } else {
                alert(`Failed to start chat: ${data.message}`);
            }
        } catch (error) {
            console.error('Error starting chat:', error);
            alert("Failed to start chat session");
        }
    };

    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const formatDate = (req: any) => {
        if (!isMounted) return ''; // Avoid rendering dates on server
        return new Date(req.createdAt || Date.now()).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    };

    const formatTime = (req: any) => {
        if (!isMounted) return '';
        return new Date(req.createdAt || Date.now()).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    };

    return (
        <div className="space-y-6">
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Pending Requests</h3>
                    <div className="space-y-4">
                        {pendingRequests.map(req => (
                            <div key={req._id} className="p-5 border border-slate-100 bg-slate-50 rounded-xl relative overflow-hidden group hover:border-indigo-100 hover:bg-white transition-all">
                                
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">{(req.menteeId as any)?.name || 'Unknown Mentee'}</h3>
                                        <p suppressHydrationWarning className="text-sm font-medium text-slate-500">
                                            {req.date || formatDate(req)} {isMounted && req.timeSlot ? `at ${req.timeSlot}` : (!req.date && isMounted ? `at ${formatTime(req)}` : '')}
                                        </p>
                                    </div>
                                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                                        Pending Review
                                    </span>
                                </div>
                                
                                <div className="mt-4 p-3 bg-white border border-slate-100 rounded-lg text-sm text-slate-600">
                                    <span className="font-semibold text-slate-800 block mb-1">Mentee's Topic:</span>
                                    "{req.subject || 'No topic specified'}"
                                </div>

                                <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-slate-100">
                                    <button 
                                        disabled={loadingId !== null}
                                        onClick={() => updateSessionStatus(req._id, 'cancelled')}
                                        className="px-4 py-2 font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <XCircle className="w-4 h-4" /> Decline
                                    </button>
                                    <button 
                                        disabled={loadingId !== null}
                                        onClick={() => updateSessionStatus(req._id, 'accepted')}
                                        className="px-6 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-md transition-all active:scale-[0.98] flex items-center gap-2"
                                    >
                                        {loadingId === req._id ? 'Processing...' : <><CheckCircle className="w-4 h-4" /> Accept Request</>}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upcoming Sessions */}
            {upcomingSessions.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Upcoming Sessions</h3>
                    <div className="space-y-4">
                        {upcomingSessions.map(req => (
                            <div key={req._id} className="p-5 border border-green-100 bg-green-50 rounded-xl">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">{(req.menteeId as any)?.name || 'Unknown Mentee'}</h3>
                                        <p suppressHydrationWarning className="text-sm font-medium text-slate-500">
                                            {req.date || formatDate(req)} {isMounted && req.timeSlot ? `at ${req.timeSlot}` : ''}
                                        </p>
                                    </div>
                                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                                        Accepted
                                    </span>
                                </div>
                                
                                <div className="mt-4 p-3 bg-white border border-slate-100 rounded-lg text-sm text-slate-600">
                                    <span className="font-semibold text-slate-800 block mb-1">Topic:</span>
                                    "{req.subject || 'No topic specified'}"
                                </div>

                                <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-slate-100">
                                    <button 
                                        onClick={() => startChat(req._id)}
                                        className="px-6 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-md transition-all active:scale-[0.98] flex items-center gap-2"
                                    >
                                        <MessageSquare className="w-4 h-4" /> Start Chat
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* No Sessions */}
            {pendingRequests.length === 0 && upcomingSessions.length === 0 && (
                <div className="text-center py-8 text-slate-400">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>You are all caught up! No pending or upcoming sessions.</p>
                </div>
            )}
        </div>
    );
}
