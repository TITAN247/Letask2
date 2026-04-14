import dbConnect from "@/lib/db";
import Session from "@/models/Session";
import MentorProfile from "@/models/MentorProfile";
import { getUserFromSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageSquare, Video } from "lucide-react";

export default async function ProMentorChatList() {
    const sessionUser = await getUserFromSession();
    if (!sessionUser) redirect("/login/promentor");

    await dbConnect();
    
    // Get MentorProfile to find the correct mentorId (MentorProfile._id)
    const profile = await MentorProfile.findOne({ userId: (sessionUser as any).id }).lean();
    const mentorProfileId = profile?._id;
    
    // For promentors, mentorId in Session is the MentorProfile._id, not User ID
    const sessions = mentorProfileId 
        ? await Session.find({ mentorId: mentorProfileId, status: 'accepted' })
            .populate("menteeId", "name email avatar profilePicture")
            .sort({ createdAt: -1 })
            .lean()
        : [];

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest mb-3">
                    <MessageSquare className="w-3.5 h-3.5" /> Client Comms
                </div>
                <h1 className="text-3xl font-black text-slate-800">Direct Messages</h1>
                <p className="text-slate-500 mt-2">Access secure communication channels with your paying clientele.</p>
            </div>

            {sessions.length === 0 ? (
                <div className="border-2 border-dashed border-slate-200 rounded-3xl py-16 flex flex-col items-center justify-center bg-slate-50">
                    <MessageSquare className="w-12 h-12 text-slate-300 mb-4" />
                    <p className="text-slate-500 font-medium text-lg">No active conversations.</p>
                    <p className="text-slate-400 text-sm mt-1">Accept session requests to start chatting.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessions.map(session => (
                        <div key={session._id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col justify-between">
                            <div className="flex items-center gap-4 mb-6">
                                {(session.menteeId as any)?.avatar || (session.menteeId as any)?.profilePicture ? (
                                    <img 
                                        src={(session.menteeId as any)?.avatar || (session.menteeId as any)?.profilePicture} 
                                        alt={(session.menteeId as any)?.name || 'Client'}
                                        className="w-14 h-14 rounded-full object-cover shadow-lg border-2 border-slate-100 shrink-0"
                                    />
                                ) : (
                                    <div className="w-14 h-14 bg-gradient-to-br from-slate-900 to-indigo-900 text-white rounded-full flex items-center justify-center font-black text-xl shadow-lg border-2 border-slate-100 shrink-0">
                                        {(session.menteeId as any)?.name?.[0] || 'C'}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-bold text-slate-800 truncate">{(session.menteeId as any)?.name || 'Client'}</h3>
                                    <div className="text-xs font-medium text-slate-500 flex items-center gap-2 mt-1">
                                        <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-md font-bold uppercase tracking-wide">Paid</span>
                                        <span className="truncate" suppressHydrationWarning>{session.date || new Date((session as any).createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col gap-2 mt-auto">
                                <Link href={`/dashboard/chat/${session._id}`} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-sm font-bold transition-colors">
                                    <MessageSquare className="w-4 h-4 text-slate-400" /> Open Secure Chat
                                </Link>
                                <Link href={`/dashboard/video/${session._id}`} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#09090b] hover:bg-indigo-600 text-white rounded-xl text-sm font-bold transition-all shadow-md mt-1">
                                    <Video className="w-4 h-4 text-indigo-300" /> Launch Video Room
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
