import OnboardingCard from "@/components/dashboard/mentee/OnboardingCard";
import ProgressScore from "@/components/dashboard/mentee/ProgressScore";
import MentorMatchCard from "@/components/dashboard/mentee/MentorMatchCard";
import GoalSuggestions from "@/components/dashboard/mentee/GoalSuggestions";
import UpcomingSessions from "@/components/dashboard/mentee/UpcomingSessions";
import PreMentorUpgrade from "@/components/dashboard/mentee/PreMentorUpgrade";
import ChatWidget from "@/components/dashboard/mentee/ChatWidget";
import { MessageSquare, Clock, ArrowUpCircle, Headset, AlertCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import dbConnect from "@/lib/db";
import { getUserFromSession } from "@/lib/auth";
import User from "@/models/User";
import MenteeProfile from "@/models/MenteeProfile";
import Session from "@/models/Session";
import UpgradeApplication from "@/models/UpgradeApplication";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function MenteeDashboardPage() {
  const session = await getUserFromSession();
  if (!session) redirect('/login/mentee');

  await dbConnect();
  const user = await User.findById((session as any).id);
  
  // Guard: user not found in DB
  if (!user) {
    redirect('/login/mentee');
  }

  const profile = await MenteeProfile.findOne({ userId: user._id }).lean();
  const sessions = await Session.find({ menteeId: user._id }).lean();
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const upcomingSessions = sessions.filter(s => ['pending', 'accepted', 'chat_active'].includes(s.status));
  const activeSessions = sessions.filter(s => s.status === 'chat_active');
  const pendingApp = await UpgradeApplication.findOne({ userId: user._id, status: 'pending' });

  // Calculate Onboarding Steps
  const onboardingSteps = [
    { label: "Complete Profile", completed: !!(profile && profile.bio) },
    { label: "Define Interests", completed: !!(profile && profile.interests && profile.interests.length > 0) },
    { label: "Book First Session", completed: sessions.length > 0 },
  ];

  // Calculate Progress Score (20 points per completed session, capped at 100)
  const progressScore = Math.min(completedSessions.length * 20, 100);

  // Recommendations based on interests
  const interests = profile?.interests || [];
  const recommendedMentors = await UpgradeApplication.find({ 
    status: 'approved',
    ...(interests.length > 0 ? { skills: { $in: interests } } : {})
  })
    .populate('userId', 'name image avatar profilePicture email')
    .sort({ rating: -1 })
    .limit(4)
    .lean();

  // Only show Start Chat if there's a paid/ready session
  const readySessions = sessions.filter(s => s.status === 'accepted' && s.paymentStatus === 'completed');
  const paymentPendingSessions = sessions.filter(s => s.status === 'accepted' && s.paymentStatus === 'pending');
  
  const quickActions = [
    readySessions.length > 0 
      ? { label: "Start Chat", href: `/dashboard/chat/${readySessions[0]._id}`, icon: MessageSquare, bg: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100" }
      : paymentPendingSessions.length > 0
        ? { label: `Pay ₹${paymentPendingSessions[0].amount || 500}`, href: `/dashboard/mentee/payment/${paymentPendingSessions[0]._id}`, icon: ArrowUpCircle, bg: "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100" }
        : { label: "Book Session", href: "/mentors", icon: MessageSquare, bg: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100" },
    { label: "View History", href: "/dashboard/mentee/bookings", icon: Clock, bg: "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100" },
    { label: "Upgrade Premium", href: "/dashboard/mentee/apply-promentor", icon: ArrowUpCircle, bg: "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100" },
    { label: "Support", href: "mailto:support@letask.com", icon: Headset, bg: "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-20">
      
      {pendingApp && (
        <div className="relative overflow-hidden bg-white border border-indigo-100 rounded-[2.5rem] p-8 shadow-xl shadow-indigo-500/5 mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="absolute top-0 right-0 p-6 opacity-10">
             <ShieldCheck className="w-24 h-24 text-indigo-600" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <div className="relative">
                  <AlertCircle className="w-7 h-7" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-600 rounded-full animate-ping" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Application Under Review</h3>
                <p className="text-slate-500 font-medium mt-1 max-w-md">
                  Our team is currently verifying your <span className="text-indigo-600 font-bold uppercase tracking-wider text-xs px-2 py-0.5 bg-indigo-50 rounded-lg">{pendingApp.targetRole}</span> application. You will be notified via email once approved.
                </p>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 text-center">
               <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Tracking ID</div>
               <div className="text-lg font-black text-indigo-600 font-mono tracking-tighter">{pendingApp.tempId || 'PENDING'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Welcome */}
      <div className="mb-2">
         <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Welcome back, <span className="text-indigo-600">{(user as any).name.split(' ')[0]}!</span>
         </h1>
         <p className="text-slate-500 font-medium">Ready for your next learning journey?</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {[
          { label: "Paid Sessions", val: completedSessions.length, color: "text-blue-600" },
          { label: "Upcoming", val: upcomingSessions.length, color: "text-amber-600" },
          { label: "Met Mentors", val: new Set(completedSessions.map(s => s.mentorId.toString())).size, color: "text-emerald-600" },
          { label: "Active Now", val: activeSessions.length, color: "text-rose-600" },
        ].map((m, i) => (
          <div key={i} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
             <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">{m.label}</div>
             <div className={`text-2xl font-black ${m.color}`}>{m.val}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-2">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <OnboardingCard steps={onboardingSteps} />
        </div>
        <div className="lg:col-span-1">
          <ProgressScore score={progressScore} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <MentorMatchCard mentors={JSON.parse(JSON.stringify(recommendedMentors))} userInterests={interests} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
           <GoalSuggestions 
              suggestions={interests.length > 0 ? interests : ["Frontend", "Backend", "AI", "Mobile", "Product"]} 
           />
        </div>

        <div className="lg:col-span-2">
          <UpcomingSessions sessions={JSON.parse(JSON.stringify(upcomingSessions))} />
        </div>
        
        <div className="lg:col-span-1">
          <PreMentorUpgrade />
        </div>
      </div>

      <ChatWidget />
    </div>
  );
}
