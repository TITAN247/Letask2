import dbConnect from "@/lib/db";
import Session from "@/models/Session";
import PreMentorApplication from "@/models/PreMentorApplication";
import MentorProfile from "@/models/MentorProfile";
import { getUserFromSession } from "@/lib/auth";
import { Calendar, Clock, MessageCircle, Search, CreditCard, CheckCircle, Star, ArrowUpRight, Sparkles, BookOpen } from "lucide-react";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function BookingsPage() {
  await dbConnect();
  const sessionUser = await getUserFromSession();
  
  if (!sessionUser) return <div>Unauthorized</div>;

  await dbConnect();
  const sessions = await Session.find({ menteeId: (sessionUser as any).id })
     .sort({ date: 1, timeSlot: 1 })
     .lean();
  
  // Enrich sessions with mentor names and profile pictures
  const enrichedSessions = await Promise.all(
    sessions.map(async (session: any) => {
      let mentorName = 'Mentor';
      let mentorImage = '';
      
      if (session.mentorType === 'prementor') {
        // For prementors, mentorId is PreMentorApplication ID
        // Import User model to ensure it's registered for populate
        const User = (await import("@/models/User")).default;
        
        const preMentorDoc = await PreMentorApplication.findById(session.mentorId)
          .populate('userId', 'name avatar profilePicture')
          .lean();
        console.log('[Bookings] PreMentorDoc userId:', JSON.stringify(preMentorDoc?.userId, null, 2));
        
        if (preMentorDoc) {
          // Check userId first (populated)
          if ((preMentorDoc.userId as any)?.name) {
            mentorName = (preMentorDoc.userId as any).name;
          }
          // Check for avatar/profilePicture on userId (onboarding saves to 'avatar')
          mentorImage = (preMentorDoc.userId as any)?.avatar || 
                       (preMentorDoc.userId as any)?.profilePicture || '';
          
          console.log('[Bookings] Found mentorImage:', mentorImage?.substring(0, 50) + '...');
        }
      } else {
        // For promentors, mentorId is MentorProfile._id
        const MentorProfile = (await import("@/models/MentorProfile")).default;
        const User = (await import("@/models/User")).default;
        
        // First get MentorProfile to find userId and profilePicture
        const mentorProfile = await MentorProfile.findById(session.mentorId)
          .select('userId profilePicture name')
          .lean();
        
        if (mentorProfile) {
          // Use profilePicture from MentorProfile if available
          mentorImage = mentorProfile.profilePicture || '';
          
          // Get mentor name from User
          if (mentorProfile.userId) {
            const mentorUser = await User.findById(mentorProfile.userId).select('name image avatar profilePicture').lean();
            if (mentorUser?.name) {
              mentorName = mentorUser.name;
              // Fallback to User profile picture if MentorProfile doesn't have one
              if (!mentorImage) {
                mentorImage = mentorUser?.image || mentorUser?.avatar || mentorUser?.profilePicture || '';
              }
            }
          }
        }
      }
      
      return { ...session, mentorName, mentorImage };
    })
  );

  // Sort sessions by status priority
  const sortedSessions = [...enrichedSessions].sort((a: any, b: any) => {
    const statusPriority: Record<string, number> = {
      'chat_active': 1,
      'accepted': 2,
      'pending': 3,
      'completed': 4,
      'cancelled': 5
    };
    return (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99);
  });

  // Get active and completed counts
  const activeCount = sortedSessions.filter((s: any) => s.status === 'accepted' || s.status === 'chat_active' || s.status === 'pending').length;
  const completedCount = sortedSessions.filter((s: any) => s.status === 'completed').length;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-10 text-white shadow-2xl shadow-indigo-500/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/20 rounded-full blur-2xl -ml-10 -mb-10"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <span className="text-white/80 text-sm font-bold uppercase tracking-widest">My Learning Journey</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Your Bookings</h1>
            <p className="text-white/90 font-medium text-lg">Manage and attend your mentorship sessions</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 text-center border border-white/20">
              <div className="text-3xl font-black">{activeCount}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-white/70">Active</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 text-center border border-white/20">
              <div className="text-3xl font-black">{completedCount}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-white/70">Completed</div>
            </div>
          </div>
        </div>
      </div>
      
      {(!sortedSessions || sortedSessions.length === 0) ? (
        <div className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50"></div>
          <div className="relative z-10">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Calendar className="w-12 h-12 text-indigo-500" />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">No sessions yet</h3>
            <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">Start your learning journey by booking a session with our expert mentors.</p>
            <Link 
              href="/dashboard/mentee/explore"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 transition-all active:scale-95"
            >
              <Sparkles className="w-5 h-5" /> Find a Mentor
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
           {sortedSessions.map((session: any) => (
              <div key={session._id.toString()} className="group bg-white rounded-[2rem] border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] transition-all duration-500 overflow-hidden relative">
                {/* Gradient Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500"></div>
                
                <div className="relative z-10 p-8 flex flex-col lg:flex-row gap-8 lg:items-center justify-between">
                  {/* Left: Mentor Info */}
                  <div className="flex gap-5 items-start">
                    {/* Profile Picture with Ring */}
                    <div className="relative">
                      {session.mentorImage ? (
                        <div className="relative">
                          <img 
                            src={session.mentorImage} 
                            alt={session.mentorName}
                            className="w-20 h-20 rounded-2xl object-cover shadow-lg ring-4 ring-white group-hover:ring-indigo-100 transition-all duration-300"
                          />
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white font-black text-3xl shadow-lg ring-4 ring-white group-hover:ring-indigo-100 transition-all duration-300">
                            {String(session.mentorName || 'M')[0]}
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Session Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{session.subject || 'Mentorship Session'}</h3>
                        <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100" />
                      </div>
                      
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-slate-500 font-medium">with</span>
                        <span className="font-bold text-slate-700">{session.mentorName}</span>
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-xs font-bold rounded-full capitalize">
                          {session.mentorType === 'promentor' ? 'Pro Mentor' : 'Pre Mentor'}
                        </span>
                      </div>
                      
                      {/* Date & Time */}
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                          <Calendar className="w-4 h-4 text-indigo-500" />
                          <span className="text-sm font-bold text-slate-600">{session.date}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                          <Clock className="w-4 h-4 text-amber-500" />
                          <span className="text-sm font-bold text-slate-600">{session.timeSlot}</span>
                        </div>
                        {session.amount && (
                          <div className="flex items-center gap-2 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
                            <CreditCard className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-bold text-emerald-600">₹{session.amount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Right: Actions */}
                  <div className="flex flex-col items-start lg:items-end gap-4 min-w-[180px]">
                    {/* Status Badge */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border ${
                      session.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                      session.status === 'accepted' && session.paymentStatus === 'pending' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                      session.status === 'accepted' && session.paymentStatus === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 shadow-emerald-500/10' :
                      session.status === 'chat_active' ? 'bg-purple-50 text-purple-600 border-purple-200 animate-pulse' :
                      session.status === 'completed' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                      'bg-slate-50 text-slate-500 border-slate-200'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        session.status === 'pending' ? 'bg-amber-500' :
                        session.status === 'accepted' && session.paymentStatus === 'pending' ? 'bg-blue-500' :
                        session.status === 'accepted' && session.paymentStatus === 'completed' ? 'bg-emerald-500' :
                        session.status === 'chat_active' ? 'bg-purple-500' :
                        session.status === 'completed' ? 'bg-slate-400' :
                        'bg-slate-400'
                      }`}></div>
                      {session.status === 'accepted' && session.paymentStatus === 'pending' ? 'Payment Required' :
                       session.status === 'accepted' && session.paymentStatus === 'completed' ? 'Ready to Start' :
                       session.status === 'chat_active' ? 'In Progress' :
                       session.status}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2 w-full">
                      {/* Payment Button */}
                      {session.status === 'accepted' && session.paymentStatus === 'pending' && (
                         <Link href={`/dashboard/mentee/payment/${session._id.toString()}`} className="w-full">
                            <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] transition-all active:scale-95">
                               <CreditCard className="w-4 h-4" /> Pay Now ₹{session.amount || 500}
                            </button>
                         </Link>
                      )}
                      
                      {/* Join Chat Button */}
                      {(session.status === 'accepted' && session.paymentStatus === 'completed') || session.status === 'chat_active' ? (
                         <Link href={`/dashboard/chat/${session._id.toString()}`} className="w-full">
                            <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] transition-all active:scale-95">
                               <MessageCircle className="w-4 h-4" /> Join Session
                            </button>
                         </Link>
                      ) : null}
                      
                      {/* Feedback Button */}
                      {session.status === 'completed' && (
                         <Link href={`/dashboard/mentee/feedback/${session._id.toString()}`} className="w-full">
                            <button className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all active:scale-95">
                               <Star className="w-4 h-4" /> Rate & Review
                            </button>
                         </Link>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Bottom Progress Bar for Active Sessions */}
                {(session.status === 'accepted' || session.status === 'chat_active') && (
                  <div className="h-1 bg-slate-100">
                    <div className={`h-full ${
                      session.paymentStatus === 'completed' 
                        ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 w-full' 
                        : 'bg-gradient-to-r from-blue-400 to-blue-500 w-1/2'
                    }`}></div>
                  </div>
                )}
              </div>
           ))}
        </div>
      )}
    </div>
  );
}
