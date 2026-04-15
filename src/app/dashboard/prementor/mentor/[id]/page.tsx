import dbConnect from "@/lib/db";
import MentorProfile from "@/models/MentorProfile";
import User from "@/models/User";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, Star, Briefcase, MapPin, Calendar, Clock, CheckCircle, DollarSign } from "lucide-react";
import Link from "next/link";
import BookSessionClient from "./BookSessionClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PreMentorMentorProfilePage({ params }: PageProps) {
  const { id } = await params;
  
  await dbConnect();
  
  // Try to find as Pro Mentor first
  let mentor = await MentorProfile.findById(id)
    .populate('userId', 'name email avatar profilePicture image')
    .lean();
  
  let mentorType: 'promentor' | 'prementor' = 'promentor';
  
  if (!mentor) {
    notFound();
  }

  const user = mentor.userId as any;
  const mentorName = user?.name || 'Unknown Mentor';
  const isPro = mentorType === 'promentor';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20">
      {/* Back Navigation */}
      <div className="max-w-5xl mx-auto px-4 pt-6">
        <Link 
          href="/dashboard/prementor/explore" 
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 font-medium transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Explore
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Main Profile Card */}
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          {/* Cover Header */}
          <div className="relative h-48 bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500">
            <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>
          </div>

          <div className="relative px-8 pb-8">
            {/* Profile Image */}
            <div className="relative -mt-20 mb-6">
              <div className="relative inline-block">
                {user?.avatar || user?.profilePicture || user?.image ? (
                  <img 
                    src={user.avatar || user.profilePicture || user.image}
                    alt={mentorName}
                    className="w-40 h-40 rounded-3xl object-cover shadow-2xl ring-4 ring-white"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-5xl shadow-2xl ring-4 ring-white">
                    {mentorName[0]}
                  </div>
                )}
                {/* Online Status */}
                <div className="absolute bottom-3 right-3 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white shadow-lg"></div>
                {/* Pro Badge */}
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-amber-400 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
                  <Award className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>

            {/* Header Info */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black text-slate-900">{mentorName}</h1>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-black uppercase tracking-wider rounded-full border border-amber-200">
                  Pro Mentor
                </span>
              </div>
              <p className="text-lg text-slate-600 font-medium mb-4">{mentor.experienceTitle || 'Industry Expert'}</p>
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-slate-700">{mentor.rating || 'New'} Rating</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
                  <Briefcase className="w-5 h-5 text-slate-400" />
                  <span className="font-bold text-slate-700">{mentor.experienceYears || 0} Years Experience</span>
                </div>
                {mentor.pricing > 0 && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
                    <DollarSign className="w-5 h-5 text-indigo-500" />
                    <span className="font-bold text-indigo-700">₹{mentor.pricing}/hour</span>
                  </div>
                )}
              </div>
            </div>

            {/* About Section */}
            <div className="mb-8">
              <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                </div>
                About
              </h2>
              <p className="text-slate-600 leading-relaxed">
                {mentor.description || 'Experienced professional passionate about mentoring and helping others grow in their career journey.'}
              </p>
            </div>

            {/* Expertise */}
            {mentor.skills && mentor.skills.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-black text-slate-900 mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  Expertise
                </h2>
                <div className="flex flex-wrap gap-2">
                  {mentor.skills.map((skill: string, idx: number) => (
                    <span key={idx} className="px-4 py-2 bg-slate-50 text-slate-700 font-bold rounded-xl border border-slate-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-colors">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Booking Section */}
            <div className="border-t border-slate-100 pt-8">
              <BookSessionClient 
                mentorId={id}
                mentorType="promentor"
                mentorName={mentorName}
                pricing={mentor.pricing || 0}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
