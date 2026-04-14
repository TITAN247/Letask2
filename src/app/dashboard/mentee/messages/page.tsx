import { MessageSquare, Search, Send, User } from "lucide-react";
import Link from "next/link";

export default function MessagesPage() {
  return (
    <div className="w-full max-w-6xl mx-auto h-[80vh] flex flex-col md:flex-row bg-white rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.05)] overflow-hidden animate-in fade-in zoom-in-95 duration-700">
      {/* Sidebar - Chat List */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-100 flex flex-col bg-slate-50/30">
          <div className="p-8 border-b border-slate-100 bg-white">
             <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-6">Messages</h2>
             <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search conversations..." 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 transition-all" 
                />
             </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
             <div className="py-20 flex flex-col items-center justify-center text-center px-8">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100">
                  <MessageSquare className="w-8 h-8 text-slate-200" />
                </div>
                <h4 className="text-sm font-black text-slate-800 mb-1">No Conversations Yet</h4>
                <p className="text-[10px] text-slate-400 font-bold leading-relaxed">
                   When you start a session with a mentor, your chat will appear here.
                </p>
                <Link 
                  href="/dashboard/mentee/explore"
                  className="mt-6 inline-block px-4 py-2 bg-indigo-600 text-white text-[10px] font-black rounded-lg shadow-md hover:bg-indigo-700 transition-colors uppercase tracking-widest"
                >
                  Explore Mentors
                </Link>
             </div>
          </div>
      </div>
      
      {/* Chat Area - Empty State */}
      <div className="flex-1 flex flex-col items-center justify-center bg-white p-12 text-center relative overflow-hidden group">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-50/30 blur-[120px] rounded-full pointer-events-none group-hover:bg-indigo-50/50 transition-colors duration-1000"></div>
         
         <div className="relative z-10 space-y-6">
            <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center mx-auto shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mb-8 animate-bounce">
               <MessageSquare className="w-10 h-10 text-indigo-600" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Your Direct Messages</h3>
            <p className="text-slate-500 font-bold text-sm max-w-sm mx-auto leading-relaxed">
               Select a conversation from the sidebar or book a new session to start communicating with your mentors.
            </p>
            <div className="pt-8 flex items-center justify-center gap-6">
                <div className="flex flex-col items-center gap-2">
                   <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 shadow-sm shadow-emerald-500/10">
                      <Send className="w-4 h-4" />
                   </div>
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Fast delivery</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                   <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center border border-indigo-100 shadow-sm shadow-indigo-600/10">
                      <User className="w-4 h-4" />
                   </div>
                   <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Expert advice</span>
                </div>
            </div>
         </div>
         
         {/* Mock Bottom Input */}
         <div className="absolute bottom-8 w-full max-w-2xl px-12 opacity-40">
            <div className="flex gap-4 p-2 bg-slate-50 border border-slate-100 rounded-2xl items-center pointer-events-none">
                <div className="flex-1 px-4 text-left text-sm font-bold text-slate-300">Type a message...</div>
                <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
            </div>
         </div>
      </div>
    </div>
  );
}
