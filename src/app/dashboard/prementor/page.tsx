import dbConnect from "@/lib/db";
import Session from "@/models/Session";
import User from "@/models/User";
import MentorProfile from "@/models/MentorProfile";
import PreMentorApplication from "@/models/PreMentorApplication";
import { getUserFromSession } from "@/lib/auth";
import { ArrowRight, Calendar, Clock, MessageSquare, Search, Video, Sparkles, Award, UserCircle, Headset, ArrowUpCircle, Star, Users, Filter, Grid3X3, List } from "lucide-react";
import MentorDashboardClient from "./MentorDashboardClient";
import MentorMatchCard from "@/components/dashboard/mentee/MentorMatchCard";
import UpgradeApplication from "@/models/UpgradeApplication";
import Link from "next/link";
import { redirect } from "next/navigation";

import mongoose from "mongoose";

export const dynamic = 'force-dynamic';

export default async function PreMentorDashboard() {
    const sessionUser = await getUserFromSession();
    if (!sessionUser) redirect("/login/prementor");

    await dbConnect();
    await User.findOne().exec().catch(() => {});

    const userIdStr = (sessionUser as any)._id || (sessionUser as any).id;
    const userId = new mongoose.Types.ObjectId(userIdStr);

    // Find the pre-mentor's document ID (not user ID)
    let mentorDocId = userId;
    const preMentorDoc = await PreMentorApplication.findOne({ userId }).select("_id").lean();
    
    console.log("=== Pre-Mentor Dashboard Debug ===");
    console.log("Logged In User ID:", userIdStr);
    
    if (preMentorDoc) {
        mentorDocId = preMentorDoc._id;
        console.log("Found Pre-Mentor App ID:", mentorDocId.toString());
    } else {
        console.log("⚠️ No Pre-Mentor Application found for user!");
    }

    // Fetch current user info with XP/Level/rating data
    const currentUser = await User.findById(userId).select("name email xp level badges sessionsCompleted averageRating totalReviews").lean();

    // For pre-mentors, rating is stored in User document (not MentorProfile)
    // The reviews API updates User.averageRating directly for pre-mentors
    const mentorProfile = null; // Pre-mentors don't have MentorProfile

    // As a Mentor (Receiving requests from mentees) 
    // We check for both Application ID and raw User ID to be ultra-robust
    const mentorDocIdStr = mentorDocId.toString();
    
    const sessionQuery = {
        $or: [
            { mentorId: mentorDocId },
            { mentorId: userId },
            { mentorId: mentorDocIdStr },  // Also check as string
            { mentorId: userIdStr }        // Also check as string
        ],
        mentorType: 'prementor'  // Only get pre-mentor sessions
    };
    
    console.log("=== Session Query Debug ===");
    console.log("Query:", JSON.stringify(sessionQuery));
    console.log("mentorDocId (PreMentorApplication ID):", mentorDocIdStr);
    console.log("userId (User ID):", userIdStr);

    const sessions = await Session.find(sessionQuery)
        .populate("menteeId", "name email avatar profilePicture")
        .sort({ createdAt: -1 })
        .lean();
    
    console.log(`Sessions found for pre-mentor: ${sessions.length}`);
    
    // Also check all sessions with mentorType prementor for debugging
    const allPreMentorSessions = await Session.find({ mentorType: 'prementor' }).lean();
    console.log(`All pre-mentor sessions in DB: ${allPreMentorSessions.length}`);
    allPreMentorSessions.forEach((s, i) => {
        console.log(`Session ${i}: mentorId=${s.mentorId?.toString()}, mentorType=${s.mentorType}, status=${s.status}`);
    });

    // As a Mentee (Booking Pro-Mentors)
    // Note: For promentor sessions, mentorId is MentorProfile._id
    const outboundSessionsRaw = await Session.find({ menteeId: userId })
        .sort({ createdAt: -1 })
        .lean();
    
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
                    // Get mentor name from User
                    if (mentorProfile.userId) {
                        const mentorUser = await User.findById(mentorProfile.userId)
                            .select('name avatar profilePicture image')
                            .lean();
                        if (mentorUser?.name) {
                            mentorName = mentorUser.name;
                            // Fallback to User profile picture if MentorProfile doesn't have one
                            if (!mentorImage) {
                                mentorImage = mentorUser.image || mentorUser.avatar || mentorUser.profilePicture || '';
                            }
                        }
                    }
                }
            } else if (session.mentorType === 'prementor') {
                // For prementor sessions, mentorId is PreMentorApplication._id
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
                mentorImage
            };
        })
    );

    // Hydrating Explore Mentors Widget
    const activeMentorsApps = await UpgradeApplication.find({ status: 'approved', targetRole: 'promentor' })
        .populate('userId', 'name image email')
        .sort({ createdAt: -1 })
        .limit(4)
        .lean();

    const pendingRequests = sessions.filter(s => s.status === 'pending');
    const upcomingSessions = sessions.filter(s => s.status === 'accepted' || s.status === 'chat_active');
    const pastSessions = sessions.filter(s => s.status === 'completed');
    const upcomingOutbound = outboundSessions.filter(s => s.status === 'accepted' || s.status === 'pending' || s.status === 'chat_active');

    const displayName = (currentUser as any)?.name || 'Mentor';
    const rating = (currentUser as any)?.averageRating || null;
    const totalReviews = (currentUser as any)?.totalReviews || 0;
    
    // XP and Level System Data
    const xp = (currentUser as any)?.xp || 0;
    const level = (currentUser as any)?.level || 1;
    const badges = (currentUser as any)?.badges || [];
    const sessionsCompleted = (currentUser as any)?.sessionsCompleted || pastSessions.length;
    
    // Calculate XP needed for next level (formula: level * 100)
    const xpForNextLevel = level * 100;
    const xpProgress = Math.min((xp / xpForNextLevel) * 100, 100);
    
    // Define badge icons and colors
    const badgeConfig: Record<string, { icon: string; color: string; desc: string }> = {
        'first_session': { icon: '🎯', color: 'bg-green-100 text-green-700', desc: 'Completed first mentoring session' },
        'five_sessions': { icon: '🔥', color: 'bg-orange-100 text-orange-700', desc: 'Completed 5 mentoring sessions' },
        'top_rated': { icon: '⭐', color: 'bg-yellow-100 text-yellow-700', desc: 'Achieved 4.5+ rating' },
        'helpful_mentor': { icon: '❤️', color: 'bg-pink-100 text-pink-700', desc: 'Received 10 positive feedbacks' },
        'rising_star': { icon: '🚀', color: 'bg-purple-100 text-purple-700', desc: 'Level 5 achieved' },
        'expert_mentor': { icon: '👑', color: 'bg-blue-100 text-blue-700', desc: 'Level 10 achieved' },
    };
    const totalCompleted = pastSessions.length;

    // Chat-only mode - no video option
    const activeSession = upcomingSessions.find(s => s.status === 'accepted' || s.status === 'chat_active');
    
    const quickActions = [
        activeSession 
            ? { label: "Continue Chat", href: `/dashboard/chat/${activeSession._id.toString()}`, icon: MessageSquare, bg: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100" }
            : { label: "Start New Session", href: "/dashboard/prementor/requests", icon: Search, bg: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100" },
        { label: "View History", href: "/dashboard/prementor/history", icon: Clock, bg: "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100" },
        { label: "Upgrade to Pro", href: "/dashboard/mentee/apply-promentor", icon: ArrowUpCircle, bg: "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100" },
        { label: "Support", href: "mailto:support@letask.com", icon: Headset, bg: "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" },
    ];

    return (
        <div className="pb-24 font-sans selection:bg-indigo-100">
            {/* Top Navigation Spacer */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-64 absolute top-0 w-full z-0 opacity-10 rounded-b-[4rem]"></div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-10">
                
                {/* Dashboard Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#84CC16]/10 border border-[#84CC16]/20 text-[#65A30D] text-xs font-bold uppercase tracking-widest mb-3">
                            <Sparkles className="w-3.5 h-3.5" /> Pre-Mentor Workspace
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#84CC16] to-[#65A30D]">{displayName.split(' ')[0]}</span>
                        </h1>
                        <p className="text-slate-500 mt-2 text-lg font-medium max-w-xl">
                            {pendingRequests.length > 0
                                ? `You have ${pendingRequests.length} pending mentorship request${pendingRequests.length > 1 ? 's' : ''} waiting.`
                                : 'Your mentorship queue is clear. Check back soon!'}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-4 sm:gap-6 bg-white py-3 px-4 sm:px-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 sm:border-r sm:border-slate-100 sm:pr-6">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 fill-amber-500" />
                            </div>
                            <div>
                                <div className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Rating</div>
                                <div className="text-lg sm:text-xl font-extrabold text-slate-800 leading-none">
                                    {rating ? <>{rating.toFixed(1)}<span className="text-xs sm:text-sm text-slate-400">/5</span></> : <span className="text-xs sm:text-sm text-slate-400">No ratings</span>}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-500" />
                            </div>
                            <div>
                                <div className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Sessions</div>
                                <div className="text-lg sm:text-xl font-extrabold text-slate-800 leading-none">{totalCompleted}<span className="text-xs sm:text-sm text-slate-400"> done</span></div>
                            </div>
                        </div>
                        
                        {/* XP/Level Badge */}
                        <div className="flex items-center gap-3 sm:pl-6 sm:border-l sm:border-slate-100 w-full sm:w-auto">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-[#84CC16] to-[#65A30D] flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                                {level}
                            </div>
                            <div className="flex-1 sm:w-32">
                                <div className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-wider mb-0.5">Level {level}</div>
                                <div className="w-full bg-slate-200 rounded-full h-2 mb-1">
                                    <div 
                                        className="bg-gradient-to-r from-[#84CC16] to-[#65A30D] h-2 rounded-full transition-all"
                                        style={{ width: `${xpProgress}%` }}
                                    />
                                </div>
                                <div className="text-[10px] sm:text-xs text-slate-500">{xp}/{xpForNextLevel} XP</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3 mb-8">
                    {quickActions.map((action) => (
                        <Link 
                            key={action.label} 
                            href={action.href}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold border transition-all shadow-sm active:scale-95 ${action.bg}`}
                        >
                            <action.icon className="w-4 h-4" />
                            {action.label}
                        </Link>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT COLUMN: Main Actions */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Inbox Block */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 relative overflow-hidden group transition-all duration-300 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full pointer-events-none opacity-50 transition-all group-hover:scale-110"></div>
                            <div className="relative z-10 flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                        <Clock className="w-5 h-5 text-indigo-600" />
                                    </div>
                                    Mentorship Inbox
                                </h2>
                                {pendingRequests.length > 0 && (
                                    <span className="bg-red-50 text-red-600 border border-red-100 text-sm font-bold px-4 py-1.5 rounded-full shadow-sm animate-pulse">
                                        {pendingRequests.length} New Request{pendingRequests.length > 1 ? 's' : ''}
                                    </span>
                                )}
                            </div>
                            
                            <MentorDashboardClient 
    pendingRequests={JSON.parse(JSON.stringify(pendingRequests))} 
    upcomingSessions={JSON.parse(JSON.stringify(upcomingSessions))} 
/>
                        </div>

                        {/* Schedule Block */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 relative overflow-hidden">
                            <h2 className="text-2xl font-extrabold text-slate-800 mb-8 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-emerald-600" />
                                </div>
                                Active Schedule
                            </h2>
                            
                            {upcomingSessions.length === 0 ? (
                                <div className="border-2 border-dashed border-slate-100 rounded-2xl py-12 flex flex-col items-center justify-center bg-slate-50/50">
                                    <Calendar className="w-12 h-12 text-slate-300 mb-4" />
                                    <p className="text-slate-500 font-medium text-lg">Your calendar is clear.</p>
                                    <p className="text-slate-400 text-sm mt-1">Accept requests above to fill your schedule.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {upcomingSessions.map(session => (
                                        <div key={session._id} className="group flex flex-col sm:flex-row items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-lg transition-all duration-300">
                                            <div className="flex items-center gap-5">
                                                {(session.menteeId as any)?.avatar || (session.menteeId as any)?.profilePicture ? (
                                                    <img 
                                                        src={(session.menteeId as any)?.avatar || (session.menteeId as any)?.profilePicture} 
                                                        alt={(session.menteeId as any)?.name || 'Mentee'}
                                                        className="w-14 h-14 rounded-2xl object-cover shadow-inner border border-white"
                                                    />
                                                ) : (
                                                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-blue-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-2xl shadow-inner border border-white">
                                                        {(session.menteeId as any)?.name?.[0]?.toUpperCase() || 'M'}
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{(session.menteeId as any)?.name || 'Mentee'}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-md">{session.subject || '1:1 Session'}</span>
                                                        <span className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
                                                            <Clock className="w-3.5 h-3.5" /> {session.date} {session.timeSlot && `@ ${session.timeSlot}`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-5 sm:mt-0 flex gap-3 text-sm font-bold w-full sm:w-auto">
                                                {/* Chat only - no video */}
                                                <Link href={`/dashboard/chat/${session._id}`} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl shadow-md hover:shadow-indigo-500/25 transition-all">
                                                    <MessageSquare className="w-4 h-4" /> Start Chat
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Outbound Pro-Mentor Bookings */}
                        {upcomingOutbound.length > 0 && (
                            <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 p-8 rounded-[2rem] shadow-xl text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500 rounded-full mix-blend-multiply filter blur-[80px] opacity-30 animate-pulse pointer-events-none"></div>
                                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500 rounded-full mix-blend-multiply filter blur-[80px] opacity-20 pointer-events-none"></div>
                                
                                <div className="relative z-10 flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-extrabold flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                                            <Star className="w-5 h-5 text-amber-300" />
                                        </div>
                                        My Mentors (Pro)
                                    </h2>
                                </div>
                                
                                <div className="space-y-4 relative z-10">
                                    {upcomingOutbound.map(session => (
                                        <div key={session._id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-4">
                                                {(session as any).mentorImage ? (
                                                    <img 
                                                        src={(session as any).mentorImage} 
                                                        alt={(session as any).mentorName || 'Pro-Mentor'}
                                                        className="w-12 h-12 rounded-full border-2 border-white/20 object-cover shadow-lg shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full border-2 border-white/20 flex items-center justify-center shadow-lg shrink-0">
                                                        <UserCircle className="w-8 h-8 text-white" />
                                                    </div>
                                                )}
                                                <div>
                                                    <h3 className="font-bold text-lg text-white">{(session as any).mentorName || 'Pro-Mentor'}</h3>
                                                    <div className="text-sm font-medium text-slate-300 mt-1 flex items-center gap-2">
                                                        <span className="uppercase text-amber-400 font-extrabold text-[10px] tracking-wider px-2 py-0.5 bg-amber-400/10 rounded-full">{session.status}</span>
                                                        {session.date && <span>• {session.date} {session.timeSlot && `@ ${session.timeSlot}`}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <Link href={`/dashboard/chat/${session._id}`} className="mt-4 sm:mt-0 px-6 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-bold shadow-lg hover:bg-slate-100 transition-all flex items-center gap-2 w-full sm:w-auto justify-center">
                                                <MessageSquare className="w-4 h-4" /> Join Chat
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                    </div>

                    {/* RIGHT COLUMN: Explore & Recents */}
                    <div className="lg:col-span-4 space-y-8">
                        <div>
                            <MentorMatchCard mentors={JSON.parse(JSON.stringify(activeMentorsApps))} />
                        </div>

                        <div className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 sticky top-10">
                            <h2 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-wider">Session History</h2>
                            <div className="space-y-6">
                                {pastSessions.slice(0, 4).map((session, idx) => (
                                    <div key={session._id} className="group flex items-center gap-4 relative">
                                        {idx !== pastSessions.length - 1 && idx !== 3 && (
                                            <div className="absolute left-[19px] top-10 bottom-[-24px] w-0.5 bg-slate-100 group-hover:bg-indigo-100 transition-colors"></div>
                                        )}
                                        {(session.menteeId as any)?.avatar || (session.menteeId as any)?.profilePicture ? (
                                            <img 
                                                src={(session.menteeId as any)?.avatar || (session.menteeId as any)?.profilePicture} 
                                                alt={(session.menteeId as any)?.name || 'Mentee'}
                                                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm shrink-0 z-10"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-slate-50 border-2 border-white shadow-sm flex items-center justify-center text-slate-400 font-bold text-sm shrink-0 z-10 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                {(session.menteeId as any)?.name?.[0]?.toUpperCase() || 'M'}
                                            </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{(session.menteeId as any)?.name || 'Mentee'}</h4>
                                            <p className="text-xs text-slate-400 font-medium">{session.date || 'Date pending'}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                    </div>
                                ))}
                                {pastSessions.length === 0 && (
                                    <div className="text-center py-6 text-sm text-slate-400 font-medium">No past sessions to display.</div>
                                )}
                            </div>
                            
                            {pastSessions.length > 4 && (
                                <Link href="/dashboard/prementor/history" className="w-full mt-6 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-bold text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-colors block text-center">
                                    View full log
                                </Link>
                            )}
                        </div>
                        
                        {/* Badges Section */}
                        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Award className="w-5 h-5 text-indigo-500" />
                                <h3 className="font-bold text-slate-800">Badges & Achievements</h3>
                            </div>
                            {badges.length === 0 ? (
                                <div className="text-center py-4">
                                    <p className="text-sm text-slate-400">Complete sessions to earn badges!</p>
                                    <p className="text-xs text-slate-300 mt-1">First badge at 1 session</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {badges.map((badge: string) => {
                                        const config = badgeConfig[badge];
                                        return (
                                            <div key={badge} className={`p-3 rounded-xl ${config?.color || 'bg-slate-100 text-slate-600'}`}>
                                                <div className="text-2xl mb-1">{config?.icon || '🏆'}</div>
                                                <div className="text-xs font-bold capitalize">{badge.replace('_', ' ')}</div>
                                                <div className="text-[10px] opacity-75 mt-0.5">{config?.desc}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        
                        {/* Mentee Tracking Section */}
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border border-emerald-100 p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-4">
                                <Users className="w-5 h-5 text-emerald-600" />
                                <h3 className="font-bold text-emerald-900">Mentee Tracking</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-emerald-700">Total Mentees</span>
                                    <span className="text-lg font-bold text-emerald-900">{new Set(pastSessions.map(s => (s.menteeId as any)?._id?.toString())).size}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-emerald-700">Active Now</span>
                                    <span className="text-lg font-bold text-emerald-900">{upcomingSessions.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-emerald-700">Avg. Rating</span>
                                    <span className="text-lg font-bold text-emerald-900">{rating ? rating.toFixed(1) : 'N/A'} ⭐</span>
                                </div>
                                <Link href="/dashboard/prementor/mentees" className="block w-full mt-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold text-center hover:bg-emerald-700 transition-all">
                                    View All Mentees
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
