import dbConnect from "@/lib/db";
import Session from "@/models/Session";
import PreMentorApplication from "@/models/PreMentorApplication";
import { getUserFromSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Video } from "lucide-react";

export default async function PreMentorChatList() {
    const sessionUser = await getUserFromSession();
    if (!sessionUser) redirect("/login/prementor");

    await dbConnect();
    
    const userId = (sessionUser as any).id;
    
    // Find the pre-mentor's PreMentorApplication document
    const preMentorDoc = await PreMentorApplication.findOne({ userId }).select("_id").lean();
    const mentorDocId = preMentorDoc ? preMentorDoc._id : null;
    
    // Build query to find sessions where user is mentor (using either User ID or PreMentorApplication ID)
    const query: any = { status: 'accepted' };
    if (mentorDocId) {
        query.$or = [
            { mentorId: userId },
            { mentorId: mentorDocId }
        ];
    } else {
        query.mentorId = userId;
    }
    
    const sessions = await Session.find(query)
        .populate("menteeId", "name email avatar profilePicture")
        .sort({ createdAt: -1 })
        .lean();

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-3">
                    <MessageSquare className="w-3.5 h-3.5" /> Communications
                </div>
                <h1 className="text-3xl font-black text-slate-800">Messages & Chat</h1>
                <p className="text-slate-500 mt-2">Connect in real-time with your matched mentees.</p>
            </div>

            {sessions.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-3xl py-16 flex flex-col items-center justify-center bg-slate-50">
                    <MessageSquare className="w-12 h-12 text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium text-lg">No active conversations.</p>
                    <p className="text-slate-400 text-sm mt-1">Accept session requests to start chatting.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {sessions.map(session => (
                        <div key={session._id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
                            <div className="flex items-center gap-4 mb-6">
                                {(session.menteeId as any)?.avatar || (session.menteeId as any)?.profilePicture ? (
                                    <img 
                                        src={(session.menteeId as any)?.avatar || (session.menteeId as any)?.profilePicture} 
                                        alt={(session.menteeId as any)?.name || 'Mentee'}
                                        className="w-16 h-16 rounded-full object-cover border-4 border-indigo-50 shrink-0"
                                    />
                                ) : (
                                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-50 text-indigo-700 rounded-full flex items-center justify-center font-black text-2xl border-4 border-indigo-50 shrink-0">
                                        {(session.menteeId as any)?.name?.[0] || 'M'}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-bold text-slate-800 truncate">{(session.menteeId as any)?.name || 'Mentee'}</h3>
                                    <div className="text-sm font-medium text-slate-500 flex items-center gap-2 mt-1">
                                        <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md text-xs font-bold">{session.type || 'Mentorship'}</span>
                                        <span className="truncate" suppressHydrationWarning>{session.date || new Date((session as any).createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex gap-3 mt-auto pt-2 border-t border-slate-100">
                                <Link href={`/dashboard/chat/${session._id}`} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl text-sm font-bold transition-colors">
                                    <MessageSquare className="w-4 h-4" /> Open Chat
                                </Link>
                                <Link href={`/dashboard/video/${session._id}`} className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-800 text-slate-600 hover:text-white rounded-xl text-sm font-bold transition-colors">
                                    <Video className="w-4 h-4" /> Start Video
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
