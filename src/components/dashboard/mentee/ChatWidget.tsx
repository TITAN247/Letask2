"use client";

import { MessageCircle, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const res = await fetch("/api/sessions");
        const data = await res.json();
        setSessions(data.sessions || []);
      } catch (e) {
        console.error("Failed to fetch sessions");
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, []);

  const hasActiveSession = sessions.length > 0;

  return (
    <div className="fixed bottom-6 right-8 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 w-80 h-[450px] mb-4 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          <div className="bg-slate-900 p-5 text-white font-bold flex justify-between items-center">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
               <span className="text-sm">Active Conversations</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              ✕
            </button>
          </div>
          
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center bg-slate-50/50">
            {loading ? (
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            ) : !hasActiveSession ? (
              <>
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                   <MessageCircle className="w-8 h-8 text-slate-300" />
                </div>
                <h4 className="text-slate-800 font-black text-sm mb-2">No Active Sessions</h4>
                <p className="text-[11px] text-slate-500 font-bold leading-relaxed px-4">
                  You need to book a session with a mentor to start chatting. 
                </p>
                <button 
                  onClick={() => window.location.href = '/dashboard/mentee/explore'}
                  className="mt-6 px-4 py-2 bg-indigo-600 text-white text-[10px] font-black rounded-lg shadow-md hover:bg-indigo-700 transition-colors uppercase tracking-wider"
                >
                  Find a Mentor
                </button>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                <p className="text-sm text-slate-800 font-black">Connection Ready</p>
                <p className="text-[11px] text-slate-500 font-bold mt-1">Open Messages to start chatting</p>
                <button 
                  onClick={() => window.location.href = '/dashboard/mentee/messages'}
                  className="mt-6 px-4 py-2 bg-slate-900 text-white text-[10px] font-black rounded-lg uppercase"
                >
                  Go to Messages
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-xl hover:shadow-indigo-600/20 hover:-translate-y-1 transition-all flex items-center justify-center relative group ${isOpen ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-white'}`}
      >
        <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
        {hasActiveSession && !isOpen && (
          <span className="absolute top-3 right-3 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-900 ring-2 ring-emerald-500/20"></span>
        )}
      </button>
    </div>
  );
}
