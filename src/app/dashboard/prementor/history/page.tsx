import dbConnect from "@/lib/db";
import Session from "@/models/Session";
import PreMentorApplication from "@/models/PreMentorApplication";
import MentorProfile from "@/models/MentorProfile";
import User from "@/models/User";
import Review from "@/models/Review";
import { getUserFromSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Calendar, History, Search, Star } from "lucide-react";

export default async function PreMentorHistory() {
    const sessionUser = await getUserFromSession();
    if (!sessionUser) redirect("/login/prementor");

    await dbConnect();
    
    const userId = (sessionUser as any).id;
    
    // Find the pre-mentor's PreMentorApplication document
    const preMentorDoc = await PreMentorApplication.findOne({ userId }).select("_id").lean();
    const mentorDocId = preMentorDoc ? preMentorDoc._id : null;
    
    // Query 1: Sessions where prementor is the MENTOR (receiving requests from mentees)
    const mentorQuery: any = { status: 'completed' };
    if (mentorDocId) {
        mentorQuery.$or = [
            { mentorId: userId },
            { mentorId: mentorDocId }
        ];
    } else {
        mentorQuery.mentorId = userId;
    }
    
    // Query 2: Sessions where prementor is the MENTEE (booking promentors)
    const menteeQuery = { 
        status: 'completed',
        menteeId: userId 
    };
    
    // Fetch both types of sessions
    const [inboundSessions, outboundSessionsRaw] = await Promise.all([
        Session.find(mentorQuery)
            .populate("menteeId", "name email avatar profilePicture")
            .sort({ createdAt: -1 })
            .lean(),
        Session.find(menteeQuery)
            .sort({ createdAt: -1 })
            .lean()
    ]);
    
    // Enrich outbound sessions with mentor data
    const outboundSessions = await Promise.all(
        outboundSessionsRaw.map(async (session: any) => {
            let mentorName = 'Pro-Mentor';
            let mentorImage = '';
            
            if (session.mentorType === 'promentor') {
                // For promentors, mentorId is MentorProfile._id
                const mentorProfile = await MentorProfile.findById(session.mentorId)
                    .select('userId profilePicture name')
                    .lean();
                
                if (mentorProfile) {
                    mentorImage = mentorProfile.profilePicture || '';
                    if (mentorProfile.userId) {
                        const mentorUser = await User.findById(mentorProfile.userId)
                            .select('name avatar profilePicture image')
                            .lean();
                        if (mentorUser?.name) {
                            mentorName = mentorUser.name;
                            if (!mentorImage) {
                                mentorImage = mentorUser.image || mentorUser.avatar || mentorUser.profilePicture || '';
                            }
                        }
                    }
                }
            } else if (session.mentorType === 'prementor') {
                const preMentorDoc = await PreMentorApplication.findById(session.mentorId)
                    .populate('userId', 'name avatar profilePicture')
                    .lean();
                
                if (preMentorDoc && (preMentorDoc.userId as any)?.name) {
                    mentorName = (preMentorDoc.userId as any).name;
                    mentorImage = (preMentorDoc.userId as any)?.avatar || (preMentorDoc.userId as any)?.profilePicture || '';
                }
            }
            
            return {
                ...session,
                mentorName,
                mentorImage,
                sessionType: 'outbound' // Mark as outbound session
            };
        })
    );
    
    // Combine and sort all sessions by date
    const allSessions = [
        ...inboundSessions.map(s => ({ ...s, sessionType: 'inbound' })),
        ...outboundSessions
    ].sort((a, b) => {
        const dateA = new Date((a as any).createdAt || a.date);
        const dateB = new Date((b as any).createdAt || b.date);
        return dateB.getTime() - dateA.getTime();
    });
    
    // Fetch reviews for all sessions
    const sessionIds = allSessions.map(s => s._id.toString());
    const reviews = await Review.find({ sessionId: { $in: sessionIds } }).lean();
    
    // Create a map of sessionId to review
    const reviewMap = new Map();
    reviews.forEach(review => {
        reviewMap.set(review.sessionId.toString(), review);
    });

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest mb-3">
                        <History className="w-3.5 h-3.5" /> Archive
                    </div>
                    <h1 className="text-3xl font-black text-slate-800">Session Log</h1>
                    <p className="text-slate-500 mt-2">A complete record of all your completed mentorship sessions.</p>
                </div>
                
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="w-4 h-4 text-slate-400" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="Search records..." 
                        className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {allSessions.length === 0 ? (
                    <div className="py-16 flex flex-col items-center justify-center text-center px-4">
                        <Calendar className="w-12 h-12 text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-700">No completed sessions</h3>
                        <p className="text-slate-500 text-sm mt-1 max-w-sm">When you successfully complete a mentorship session, the ledger will update here.</p>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="text-xs uppercase bg-slate-50 text-slate-500 border-b border-slate-200 font-bold">
                            <tr>
                                <th scope="col" className="px-6 py-4">Session</th>
                                <th scope="col" className="px-6 py-4">Date</th>
                                <th scope="col" className="px-6 py-4">Topic</th>
                                <th scope="col" className="px-6 py-4">Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allSessions.map((session, idx) => {
                                const isOutbound = (session as any).sessionType === 'outbound';
                                const displayName = isOutbound 
                                    ? ((session as any).mentorName || 'Pro-Mentor')
                                    : ((session.menteeId as any)?.name || 'Unknown');
                                const displayImage = isOutbound
                                    ? ((session as any).mentorImage || '')
                                    : ((session.menteeId as any)?.avatar || (session.menteeId as any)?.profilePicture || '');
                                const role = isOutbound ? 'Mentor' : 'Mentee';
                                
                                return (
                                    <tr key={session._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <th scope="row" className="px-6 py-4 font-bold text-slate-800 flex items-center gap-3">
                                            {displayImage ? (
                                                <img 
                                                    src={displayImage} 
                                                    alt={displayName}
                                                    className="w-8 h-8 rounded-full object-cover shrink-0"
                                                />
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs shrink-0">
                                                    {displayName[0] || '?'}
                                                </div>
                                            )}
                                            <div className="flex flex-col">
                                                <span>{displayName}</span>
                                                <span className="text-xs text-slate-400 font-normal">{role}</span>
                                            </div>
                                        </th>
                                        <td className="px-6 py-4 font-medium" suppressHydrationWarning>
                                            {session.date || new Date((session as any).createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">{session.subject || 'Mentorship Session'}</td>
                                        <td className="px-6 py-4">
                                            {(() => {
                                                const review = reviewMap.get(session._id.toString());
                                                if (review) {
                                                    return (
                                                        <div className="flex items-center gap-1">
                                                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                                            <span className="font-bold text-slate-700">{review.overallRating}/5</span>
                                                        </div>
                                                    );
                                                }
                                                return <span className="text-xs text-slate-400 font-medium">Not rated yet</span>;
                                            })()}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
