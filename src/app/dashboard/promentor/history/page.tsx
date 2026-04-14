import dbConnect from "@/lib/db";
import Session from "@/models/Session";
import { getUserFromSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DollarSign, History, Star, Download } from "lucide-react";
import MentorProfile from "@/models/MentorProfile";

export default async function ProMentorHistory() {
    const sessionUser = await getUserFromSession();
    if (!sessionUser) redirect("/login/promentor");

    await dbConnect();
    
    // Get MentorProfile to find the correct mentorId (MentorProfile._id)
    const profile = await MentorProfile.findOne({ userId: (sessionUser as any).id }).lean() || { _id: null, pricing: 0 };
    const mentorProfileId = profile?._id;
    
    // For promentors, mentorId in Session is the MentorProfile._id, not User ID
    const pastSessions = mentorProfileId 
        ? await Session.find({ mentorId: mentorProfileId, status: 'completed' })
            .populate("menteeId", "name email avatar profilePicture")
            .sort({ createdAt: -1 })
            .lean()
        : [];

    const flatRate = profile?.pricing || 125;

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-white text-xs font-bold uppercase tracking-widest mb-3">
                        <History className="w-3.5 h-3.5 text-slate-300" /> Ledger
                    </div>
                    <h1 className="text-3xl font-black text-slate-800">Financial History</h1>
                    <p className="text-slate-500 mt-2">A complete ledger of your completed sessions and earnings.</p>
                </div>
                
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors w-full md:w-auto">
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
                {pastSessions.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center px-4">
                        <DollarSign className="w-16 h-16 text-slate-200 mb-6" />
                        <h3 className="text-xl font-bold text-slate-800">No completed transactions</h3>
                        <p className="text-slate-500 text-sm mt-2 max-w-sm">When you successfully complete a paid session, the verified transaction will appear here.</p>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200 font-bold">
                            <tr>
                                <th scope="col" className="px-8 py-5">Client</th>
                                <th scope="col" className="px-8 py-5">Date</th>
                                <th scope="col" className="px-8 py-5">Topic</th>
                                <th scope="col" className="px-8 py-5 text-right">Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pastSessions.map((session, idx) => (
                                <tr key={session._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                    <th scope="row" className="px-8 py-5 font-bold text-slate-800 flex items-center gap-3">
                                        {(session.menteeId as any)?.avatar || (session.menteeId as any)?.profilePicture ? (
                                            <img 
                                                src={(session.menteeId as any)?.avatar || (session.menteeId as any)?.profilePicture} 
                                                alt={(session.menteeId as any)?.name || 'Client'}
                                                className="w-10 h-10 rounded-full object-cover shadow-md shrink-0"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm shadow-md shrink-0">
                                                {(session.menteeId as any)?.name?.[0] || 'C'}
                                            </div>
                                        )}
                                        {(session.menteeId as any)?.name || 'Unknown Client'}
                                    </th>
                                    <td className="px-8 py-5 font-medium" suppressHydrationWarning>
                                        {session.date || new Date((session as any).createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </td>
                                    <td className="px-8 py-5 text-slate-500">{session.subject || 'Mentorship Session'}</td>
                                    <td className="px-8 py-5 text-right flex justify-end">
                                        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1 rounded-md font-bold text-sm">
                                            +${flatRate}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
