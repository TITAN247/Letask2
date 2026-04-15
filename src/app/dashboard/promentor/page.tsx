import dbConnect from "@/lib/db";
import Session from "@/models/Session";
import User from "@/models/User";
import MentorProfile from "@/models/MentorProfile";
import Review from "@/models/Review";
import { getUserFromSession } from "@/lib/auth";
import { DollarSign, Rocket, Calendar, TrendingUp, CheckCircle, MessageSquare, Star, Copy, Clock, Settings, Headset, User as UserIcon } from "lucide-react";
import MentorDashboardClient from "../prementor/MentorDashboardClient";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function ProMentorDashboard() {
    const sessionUser = await getUserFromSession();
    if (!sessionUser) {
        return redirect("/login/promentor");
    }

    await dbConnect();
    await User.findOne().exec().catch(() => {});

    const userId = (sessionUser as any).id;

    // Fetch current user and mentor profile for real data
    const currentUser = await User.findById(userId).select("name email").lean();
    const mentorProfile = await MentorProfile.findOne({ userId }).lean();

    console.log(`[ProMentor Dashboard] userId: ${userId}`);
    console.log(`[ProMentor Dashboard] mentorProfile: ${mentorProfile ? 'Found' : 'Not found'}`);

    // For approved promentors, we don't need to check applications - they should have a profile
    // If no profile exists, it means approval didn't create it properly
    if (!mentorProfile) {
        console.log(`[ProMentor Dashboard] ERROR: No MentorProfile found for approved promentor ${userId}`);
        // Create the mentor profile if it doesn't exist
        const ProMentorApplication = (await import("@/models/ProMentorApplication")).default;
        
        // First, try to find by userId
        let application = await ProMentorApplication.findOne({ userId, status: 'approved' }).lean();
        console.log(`[ProMentor Dashboard] Searching by userId ${userId}: ${application ? 'Found' : 'Not found'}`);
        
        // If not found, search all approved applications to see what's available
        let userIdMismatch = false;
        if (!application) {
            const allApproved = await ProMentorApplication.find({ status: 'approved' }).lean();
            console.log(`[ProMentor Dashboard] All approved applications: ${allApproved.length}`);
            allApproved.forEach((app: any) => {
                console.log(`[ProMentor Dashboard] - App ${app.tempId}: userId=${app.userId}, type=${typeof app.userId}`);
            });
            
            // Check if there's a mismatch - application exists but with different userId
            if (allApproved.length === 1) {
                application = allApproved[0];
                userIdMismatch = true;
                console.log(`[ProMentor Dashboard] Detected userId mismatch! Updating application ${application.tempId} to user ${userId}`);
                
                // Update the application to use the current user's ID
                await ProMentorApplication.findByIdAndUpdate(application._id, { userId: userId });
            }
        }
        
        if (application) {
            console.log(`[ProMentor Dashboard] Found application ${application.tempId}, creating MentorProfile`);
            await MentorProfile.create({
                userId: userId,
                skills: application.skills || [],
                experienceTitle: application.domain || '',
                experienceYears: application.professionalYears || 0,
                description: application.qWhyMentor || '',
                pricing: application.expectedPricing || 0,
                verified: true,
                profilePicture: application.avatar || ''
            });
            console.log(`[ProMentor Dashboard] MentorProfile created with avatar: ${application.avatar ? 'YES' : 'NO'}, continuing to dashboard`);
        } else {
            console.log(`[ProMentor Dashboard] No approved application found for user ${userId}, redirecting to onboarding`);
            return redirect("/onboarding/promentor");
        }
    }

    // IMPORTANT: Sessions store mentorId as the MentorProfile._id, not the userId!
    // We need to use the mentorProfile._id to query sessions
    const mentorProfileId = (mentorProfile as any)?._id?.toString() || userId;
    console.log(`[ProMentor Dashboard] Querying sessions with mentorProfileId: ${mentorProfileId}`);

    // Try querying by mentorProfileId first, then by userId as fallback
    let sessions = await Session.find({ mentorId: mentorProfileId })
        .populate("menteeId", "name email avatar profilePicture")
        .sort({ createdAt: -1 })
        .lean();
    
    // If no sessions found, try by userId (for backward compatibility)
    if (sessions.length === 0) {
        console.log(`[ProMentor Dashboard] No sessions with mentorProfileId, trying userId: ${userId}`);
        sessions = await Session.find({ mentorId: userId })
            .populate("menteeId", "name email avatar profilePicture")
            .sort({ createdAt: -1 })
            .lean();
    }
    
    console.log(`[ProMentor Dashboard] Found ${sessions.length} sessions`);

    const pendingRequests = sessions.filter(s => s.status === 'pending');
    const upcomingSessions = sessions.filter(s => s.status === 'accepted' || s.status === 'chat_active');
    const paidSessions = upcomingSessions.filter(s => s.paymentStatus === 'completed');
    const unpaidSessions = upcomingSessions.filter(s => s.paymentStatus !== 'completed');
    const pastSessions = sessions.filter(s => s.status === 'completed');

    // Fetch reviews for this mentor (reuse mentorProfileId from line 83)
    const reviews = await Review.find({ revieweeId: mentorProfileId || userId })
        .populate('reviewerId', 'name')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();

    // Real pricing from mentor profile, 0 if not set
    const flatRate = (mentorProfile as any)?.pricing || 0;
    // Use actual totalEarnings from profile, fallback to calculation
    const totalEarnings = (mentorProfile as any)?.totalEarnings || (pastSessions.length * flatRate);
    const pendingEarnings = paidSessions.length * flatRate; // Only count paid sessions

    const displayName = (currentUser as any)?.name || 'Mentor';
    const rating = (mentorProfile as any)?.rating;
    const reviewsCount = (mentorProfile as any)?.reviewsCount || 0;
    const isVerified = (mentorProfile as any)?.verified || false;

    const quickActions = [
        { label: "Profile Settings", href: "/dashboard/promentor/profile", icon: UserIcon, bg: "bg-purple-50 text-purple-600 border-purple-100 hover:bg-purple-100" },
        { label: "View History", href: "/dashboard/promentor/history", icon: Clock, bg: "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100" },
        { label: "Preferences", href: "/dashboard/promentor/settings", icon: Settings, bg: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100" },
        { label: "Support", href: "mailto:support@letask.com", icon: Headset, bg: "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" },
    ];

    return (
        <div className="pb-24 font-sans selection:bg-purple-200">
            {/* Dark Mode Gradient Header Backdrop */}
            <div className="bg-[#09090b] text-white pt-16 pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
                <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-purple-600/30 to-fuchsia-600/30 rounded-full blur-[100px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 rounded-full blur-[80px] pointer-events-none"></div>
                
                <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white text-xs font-bold uppercase tracking-widest mb-4 backdrop-blur-md">
                            <Rocket className="w-3.5 h-3.5 text-fuchsia-400" /> Pro-Mentor Workspace
                            {isVerified && <span className="ml-2 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[10px]">Verified</span>}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-purple-400">{displayName.split(' ')[0]}</span>
                        </h1>
                        <p className="text-slate-400 mt-3 text-lg font-medium max-w-xl">
                            {pendingRequests.length > 0
                                ? `You have ${pendingRequests.length} pending session request${pendingRequests.length > 1 ? 's' : ''}.`
                                : 'Your queue is clear. Great job staying on top of requests!'}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        {rating && (
                            <div className="flex items-center gap-2 px-5 py-2.5 bg-white/10 border border-white/10 rounded-xl text-sm font-bold backdrop-blur-sm">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                <span>{rating.toFixed(1)}</span>
                                <span className="text-slate-400 font-medium">({reviewsCount} reviews)</span>
                            </div>
                        )}
                        <button className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-bold transition-all backdrop-blur-sm flex items-center gap-2">
                            <Copy className="w-4 h-4" /> Copy Booking Link
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
                
                {/* Quick Actions */}
                <div className="flex flex-wrap gap-3 mb-6">
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

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10">
                    <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 flex flex-col justify-between overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-emerald-50 rounded-bl-full transition-all group-hover:scale-110"></div>
                        <div>
                            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" /> Gross Revenue
                            </div>
                            <div className="text-2xl sm:text-4xl font-black text-slate-900" suppressHydrationWarning>${totalEarnings.toLocaleString('en-US')}</div>
                        </div>
                        <div className="mt-4 sm:mt-6 text-xs sm:text-sm font-medium text-slate-400">
                            {pastSessions.length} completed session{pastSessions.length !== 1 ? 's' : ''}
                            {flatRate > 0 && <span> · ${flatRate}/session</span>}
                        </div>
                    </div>

                    <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 flex flex-col justify-between overflow-hidden relative group">
                        <div>
                           <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-400" /> Upcoming Sessions
                           </div>
                           <div className="text-2xl sm:text-4xl font-black text-slate-900">{paidSessions.length} <span className="text-base sm:text-xl text-slate-300">paid</span></div>
                           {unpaidSessions.length > 0 && (
                              <div className="text-xs sm:text-sm text-amber-600 font-medium mt-1">
                                 {unpaidSessions.length} awaiting payment
                              </div>
                           )}
                        </div>
                        <div className="mt-4 sm:mt-6 text-xs sm:text-sm font-medium text-slate-400">
                           {pendingRequests.length} pending review
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[1.5rem] sm:rounded-[2rem] p-6 sm:p-8 shadow-xl text-white flex flex-col justify-between overflow-hidden relative group sm:col-span-2 lg:col-span-1">
                        <div className="absolute -top-10 -right-10 w-32 h-32 sm:w-40 sm:h-40 bg-white/10 rounded-full blur-2xl pointer-events-none transition-all group-hover:bg-white/20"></div>
                        <div>
                            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-indigo-200 mb-2 flex items-center gap-2">
                                <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-300" /> Escrow Balance
                            </div>
                            <div className="text-2xl sm:text-4xl font-black text-white" suppressHydrationWarning>${pendingEarnings.toLocaleString('en-US')}</div>
                        </div>
                        <div className="mt-4 sm:mt-6 text-xs sm:text-sm text-indigo-200 font-medium">
                            {flatRate > 0 ? `${upcomingSessions.length} confirmed · $${flatRate} each` : 'Set your pricing in Profile settings'}
                        </div>
                    </div>
                </div>
</div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20" suppressHydrationWarning>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8" suppressHydrationWarning>
                
                {/* Active Workload */}
                <div className="xl:col-span-2 space-y-8" suppressHydrationWarning>
                    
                    <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative group overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full opacity-50 group-hover:scale-110 transition-transform"></div>
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-amber-500" />
                                        <Clock className="w-5 h-5 text-amber-500" />
                                    </span>
                                    Pending Contracts
                                </h2>
                                {pendingRequests.length > 0 && flatRate > 0 && (
                                    <span className="bg-amber-100 text-amber-700 font-bold px-3 py-1 rounded-lg text-sm shadow-sm border border-amber-200">${flatRate} / Session</span>
                                )}
                            </div>
                            
                            <div className="relative z-10">
                                <MentorDashboardClient 
                                    pendingRequests={JSON.parse(JSON.stringify(pendingRequests))} 
                                    upcomingSessions={JSON.parse(JSON.stringify(upcomingSessions))}
                                />
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 relative">
                            <h2 className="text-2xl font-extrabold text-slate-900 mb-8 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                                    <MessageSquare className="w-5 h-5 text-purple-600" />
                                </span>
                                Confirmed Sessions (Chat Only)
                            </h2>
                            
                            {upcomingSessions.length === 0 ? (
                                <div className="border-2 border-dashed border-slate-100 rounded-3xl py-12 flex flex-col items-center justify-center bg-slate-50/50">
                                    <Calendar className="w-12 h-12 text-slate-300 mb-4" />
                                    <p className="text-slate-500 font-medium text-lg">Your queue is empty.</p>
                                    <p className="text-slate-400 text-sm mt-1">Accept pending requests to build your schedule.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {upcomingSessions.map(session => (
                                        <div key={session._id} className="group flex flex-col sm:flex-row items-center justify-between p-5 bg-white border border-slate-100 rounded-2xl hover:border-purple-200 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300">
                                            <div className="flex items-center gap-5 w-full">
                                                {(session.menteeId as any)?.avatar || (session.menteeId as any)?.profilePicture ? (
                                            <img 
                                                src={(session.menteeId as any)?.avatar || (session.menteeId as any)?.profilePicture} 
                                                alt={(session.menteeId as any)?.name || 'Client'}
                                                className="w-14 h-14 rounded-2xl object-cover border border-white shadow-inner shrink-0"
                                            />
                                        ) : (
                                            <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-fuchsia-50 text-purple-700 rounded-2xl flex items-center justify-center font-black text-2xl border border-white shadow-inner shrink-0">
                                                {(session.menteeId as any)?.name?.[0]?.toUpperCase() || 'M'}
                                            </div>
                                        )}
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg font-bold text-slate-800 truncate group-hover:text-purple-700 transition-colors">{(session.menteeId as any)?.name || 'Client'}</h3>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-md truncate max-w-[150px]">{session.subject || 'Mentorship'}</span>
                                                        {session.date && <span className="text-sm font-medium text-slate-500">{session.date} {session.timeSlot && `@ ${session.timeSlot}`}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-5 sm:mt-0 flex gap-3 text-sm font-bold w-full sm:w-auto">
                                                <Link href={`/dashboard/chat/${session._id}`} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#09090b] text-white hover:bg-purple-600 rounded-xl shadow-lg transition-all">
                                                    <MessageSquare className="w-4 h-4 text-purple-300" /> Start Chat
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>

                    {/* Historical Logs Sidebar */}
                    <div className="xl:col-span-1">
                        <div className="sticky top-10 bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                            <h2 className="text-lg font-black text-slate-800 mb-6 uppercase tracking-wider flex items-center justify-between">
                                Ledger
                                <Link href="/dashboard/promentor/history" className="text-xs text-indigo-600 font-bold hover:underline lowercase tracking-normal">View all</Link>
                            </h2>
                            <div className="space-y-6">
                                {pastSessions.slice(0, 6).map((session) => (
                                    <div key={session._id} className="group flex justify-between items-center relative">
                                        <div className="flex items-center gap-3">
                                            {(session.menteeId as any)?.avatar || (session.menteeId as any)?.profilePicture ? (
                                                <img 
                                                    src={(session.menteeId as any)?.avatar || (session.menteeId as any)?.profilePicture} 
                                                    alt={(session.menteeId as any)?.name || 'Mentee'}
                                                    className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm shrink-0">
                                                    {(session.menteeId as any)?.name?.[0]?.toUpperCase() || 'M'}
                                                </div>
                                            )}
                                            <div>
                                                <h4 className="font-bold text-sm text-slate-800">{(session.menteeId as any)?.name || 'Mentee'}</h4>
                                                <p className="text-xs text-slate-400 font-medium">{session.date || 'No date'}</p>
                                            </div>
                                        </div>
                                        
                                        {flatRate > 0 && (
                                            <div className="text-right">
                                                <div className="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md inline-block border border-emerald-100">+${flatRate}</div>
                                            </div>
                                        )}
                                        {flatRate === 0 && (
                                            <CheckCircle className="w-4 h-4 text-emerald-500" />
                                        )}
                                    </div>
                                ))}
                                {pastSessions.length === 0 && (
                                    <div className="text-center py-6 text-sm text-slate-400 font-medium">No completed sessions yet.</div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
