import dbConnect from "@/lib/db";
import MentorProfile from "@/models/MentorProfile";
import PreMentorApplication from "@/models/PreMentorApplication";
import User from "@/models/User";
import { Star, Briefcase, Award, MapPin, Calendar, Clock, Sparkles, ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";
import BookSessionClient from "./BookSessionClient";

export default async function MentorProfilePage({ params }: { params: { id: string } }) {
  await dbConnect();
  const mentorId = (await params).id;
  
  // Try to find in MentorProfile first (Pro-Mentors)
  let mentor = await MentorProfile.findById(mentorId)
    .populate('userId', 'name email avatar profilePicture image')
    .lean();
  let mentorType = 'promentor';
  
  // If not found, try PreMentorApplication (Pre-Mentors)
  if (!mentor) {
    mentor = await PreMentorApplication.findById(mentorId)
      .populate('userId', 'name email avatar profilePicture image')
      .lean();
    mentorType = 'prementor';
  }
  
  // If still not found, return 404
  if (!mentor) {
    return <div className="p-10 text-center">Mentor not found.</div>;
  }
  
  // Get profile picture
  const profilePicture = mentor.profilePicture || 
                        (mentor.userId as any)?.avatar || 
                        (mentor.userId as any)?.profilePicture || 
                        (mentor.userId as any)?.image;
  
  // Format data consistently
  const formattedMentor = {
    ...mentor,
    mentorType,
    profilePicture,
    // Map PreMentor fields to match MentorProfile format
    experienceTitle: mentor.experienceTitle || mentor.domain || 'Industry Expert',
    experienceYears: mentor.experienceYears || (mentor.experienceYears + (mentor.experienceMonths || 0) / 12) || 0,
    description: mentor.description || mentor.qWhyMentor || '',
    skills: mentor.skills || [],
    pricing: mentor.pricing || (mentorType === 'prementor' ? 0 : mentor.pricing),
    verified: mentor.verified || (mentorType === 'prementor' ? false : true)
  };
  
  const isPro = mentorType === 'promentor';

  return (
    <div className="w-full max-w-5xl mx-auto pb-20 space-y-6 animate-in fade-in duration-700">
      {/* Back Button */}
      <Link 
        href="/dashboard/mentee/explore" 
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Mentors
      </Link>

      {/* Hero Profile Card */}
      <div className="relative bg-white rounded-[2.5rem] overflow-hidden shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-slate-100">
        {/* Cover Banner */}
        <div className={`h-48 relative ${isPro ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500' : 'bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500'}`}>
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl -ml-20 -mb-20"></div>
          
          {/* Badge */}
          <div className="absolute top-6 right-6">
            <span className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider shadow-lg border-2 border-white/50 ${
              isPro 
                ? 'bg-amber-400 text-white' 
                : 'bg-emerald-400 text-white'
            }`}>
              {isPro ? <><Award className="w-4 h-4" /> Pro Mentor</> : <><Zap className="w-4 h-4" /> Free Session</>}
            </span>
          </div>
        </div>

        {/* Profile Content */}
        <div className="relative px-8 pb-8">
          {/* Profile Picture - Positioned to overlap banner */}
          <div className="relative -mt-20 mb-6">
            <div className="relative inline-block">
              {profilePicture ? (
                <div className="relative">
                  <img 
                    src={profilePicture}
                    alt={formattedMentor.userId?.name || 'Mentor'}
                    className="w-40 h-40 rounded-[2rem] object-cover shadow-2xl ring-8 ring-white"
                  />
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg" title="Online">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className={`w-40 h-40 rounded-[2rem] flex items-center justify-center text-white font-black text-6xl shadow-2xl ring-8 ring-white ${isPro ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-emerald-400 to-teal-500'}`}>
                    {String(formattedMentor.userId?.name || 'M')[0]}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Main Info */}
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">
                {formattedMentor.userId?.name || 'Unknown Mentor'}
              </h1>
              <p className={`text-lg font-bold mb-4 ${isPro ? 'text-amber-600' : 'text-emerald-600'}`}>
                {formattedMentor.experienceTitle}
              </p>
              
              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-700">{formattedMentor.experienceYears} Years Exp</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-xl border border-amber-100">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-amber-700">{formattedMentor.rating || 'New'} Rating</span>
                </div>
                {isPro && formattedMentor.pricing > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
                    <span className="font-bold text-indigo-700">₹{formattedMentor.pricing}/session</span>
                  </div>
                )}
              </div>

              {/* About */}
              <div className="mb-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" /> About
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {formattedMentor.description || 'Passionate professional dedicated to sharing knowledge and helping mentees achieve their goals.'}
                </p>
              </div>

              {/* Skills */}
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-3">Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {formattedMentor.skills?.map((skill: string, idx: number) => (
                    <span key={`skill-${idx}`} className={`px-3 py-1.5 text-sm font-bold rounded-lg border transition-colors ${
                      isPro 
                        ? 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                    }`}>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Booking Form */}
            <div className="md:pl-8 md:border-l border-slate-100">
              <BookSessionClient 
                mentorId={mentorId} 
                mentorType={mentorType}
                mentorName={formattedMentor.userId?.name || 'Mentor'}
                pricing={formattedMentor.pricing}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
