import dbConnect from "@/lib/db";
import MentorProfile from "@/models/MentorProfile";
import PreMentorApplication from "@/models/PreMentorApplication";
import User from "@/models/User";
import { Search, MapPin, Star, Briefcase, Sparkles, ArrowRight, Zap, Award } from "lucide-react";
import Link from "next/link";
import MentorSearchHeader from "@/components/dashboard/mentee/MentorSearchHeader";

interface ExplorePageProps {
  searchParams?: Promise<{ query?: string }>;
}

export default async function ExploreMentorsPage({ searchParams }: ExplorePageProps) {
  const resolvedParams = await searchParams;
  const query = resolvedParams?.query || "";

  await dbConnect();
  
  // 1. Build the filter
  let filter: any = {};
  if (query) {
    // Basic search on mentors: role, skills, description
    const regex = new RegExp(query, "i");
    
    // Find matching users by name first
    const users = await User.find({ name: regex }).select("_id").lean();
    const userIds = users.map(u => u._id);

    filter = {
      $or: [
        { userId: { $in: userIds } },
        { experienceTitle: regex },
        { skills: regex },
        { description: regex },
        { domain: regex }, // For Pre-Mentors
        { qWhyMentor: regex } // For Pre-Mentors
      ]
    };
  }

  // 2. Fetch mentors from both collections
  console.log("=== DEBUG: Searching for mentors ===");
  console.log("Query:", query);
  console.log("Filter:", filter);
  
  const proMentors = await MentorProfile.find(filter)
    .populate('userId', 'name avatar profilePicture image')
    .sort({ rating: -1, createdAt: -1 })
    .lean();
    
  const preMentors = await PreMentorApplication.find({ 
    status: { $in: ['approved', 'pending'] }, 
    ...filter 
  })
    .populate('userId', 'name avatar profilePicture image')
    .sort({ createdAt: -1 })
    .lean();
    
  console.log("Pro-Mentors found:", proMentors.length);
  console.log("Pre-Mentors found:", preMentors.length);
  
  preMentors.forEach(m => {
    console.log(`Pre-Mentor: ${m.userId?.name} - Status: ${m.status} - Skills: ${m.skills?.join(', ')}`);
  });
    
  // Combine and format mentors
  const mentors = [
    ...proMentors.map(m => ({ 
      ...m, 
      mentorType: 'promentor',
      verified: m.verified || false 
    })),
    ...preMentors.map(m => ({ 
      ...m, 
      mentorType: 'prementor',
      verified: false,
      // Map PreMentor fields to match MentorProfile format
      skills: m.skills || [],
      experienceTitle: m.domain || '',
      experienceYears: m.experienceYears + (m.experienceMonths / 12),
      description: m.qWhyMentor || '',
      pricing: 0 // Free for pre-mentors
    }))
  ].sort((a, b) => {
    // Sort by rating (Pro-Mentors first, then by rating)
    if (a.mentorType === 'promentor' && b.mentorType === 'prementor') return -1;
    if (a.mentorType === 'prementor' && b.mentorType === 'promentor') return 1;
    return (b.rating || 0) - (a.rating || 0);
  });

  // Get stats
  const proMentorCount = proMentors.length;
  const preMentorCount = preMentors.length;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-6 sm:p-10 text-white shadow-2xl shadow-indigo-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-2xl -ml-20 -mb-20"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-purple-500/30 rounded-full blur-xl"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <Zap className="w-4 h-4 text-amber-300" />
                <span className="text-white/90 text-sm font-bold">{mentors.length} Mentors Available</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Find Your Perfect Mentor</h1>
            <p className="text-white/90 font-medium text-lg max-w-xl">Connect with experienced professionals ready to guide your career journey</p>
          </div>
          
          <div className="flex gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-white/20">
              <div className="text-2xl font-black flex items-center gap-1">
                <Award className="w-5 h-5 text-amber-300" />
                {proMentorCount}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-white/70">Pro Mentors</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-white/20">
              <div className="text-2xl font-black text-emerald-300">{preMentorCount}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-white/70">Free Pre-Mentors</div>
            </div>
          </div>
        </div>
      </div>

      <MentorSearchHeader />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map((mentor: any) => {
          const hasImage = mentor.profilePicture || mentor.userId?.avatar || mentor.userId?.profilePicture || mentor.userId?.image;
          const imageUrl = mentor.profilePicture || mentor.userId?.avatar || mentor.userId?.profilePicture || mentor.userId?.image;
          const isPro = mentor.mentorType === 'promentor';
          
          return (
            <div key={mentor._id.toString()} className="group bg-white rounded-[2rem] p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-500 flex flex-col h-full relative overflow-hidden">
              {/* Hover Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/[0.02] group-hover:via-purple-500/[0.02] group-hover:to-pink-500/[0.02] transition-all duration-500"></div>
              
              {/* Top Accent Line */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${isPro ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>
              
              <div className="relative z-10">
                {/* Header with Image */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="relative">
                    {hasImage ? (
                      <div className="relative">
                        <img 
                          src={imageUrl} 
                          alt={mentor.userId?.name || 'Mentor'}
                          className="w-20 h-20 rounded-2xl object-cover shadow-lg ring-4 ring-white group-hover:ring-indigo-100 transition-all duration-300"
                        />
                        {isPro && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center shadow-md" title="Pro Mentor">
                            <Award className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="relative">
                        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg ring-4 ring-white group-hover:ring-indigo-100 transition-all duration-300 ${isPro ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-emerald-400 to-teal-500'}`}>
                          {String(mentor.userId?.name || 'M')[0]}
                        </div>
                        {isPro && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                            <Award className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-black text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight truncate">
                      {mentor.userId?.name || 'Unknown Mentor'}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 mt-1 line-clamp-1">{mentor.experienceTitle || 'Industry Expert'}</p>
                    
                    {/* Type Badge */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isPro 
                          ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                          : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                      }`}>
                        {isPro ? (
                          <><Award className="w-3 h-3" /> Pro Mentor</>
                        ) : (
                          <><Zap className="w-3 h-3" /> Free Session</>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Stats Row */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">{mentor.experienceYears || 0} Yrs</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-100">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="text-xs font-bold text-amber-600">{mentor.rating || 'New'}</span>
                  </div>
                  {isPro && mentor.pricing > 0 && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-lg border border-indigo-100">
                      <span className="text-xs font-bold text-indigo-600">₹{mentor.pricing}/hr</span>
                    </div>
                  )}
                </div>
                
                {/* Description */}
                <p className="text-sm text-slate-500 font-medium mb-5 line-clamp-2 leading-relaxed">
                  {mentor.description || 'Experienced professional ready to help you grow your career and achieve your goals.'}
                </p>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {(mentor.skills || []).slice(0, 4).map((skill: string, idx: number) => (
                    <span key={`${mentor._id}-skill-${idx}`} className="px-2.5 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-colors cursor-default">
                      {skill}
                    </span>
                  ))}
                  {(mentor.skills?.length || 0) > 4 && (
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-lg">
                      +{(mentor.skills?.length || 0) - 4}
                    </span>
                  )}
                </div>

                {/* CTA Button */}
                <Link 
                  href={`/dashboard/mentee/mentor/${mentor._id}`} 
                  className={`w-full flex items-center justify-center gap-2 py-3.5 text-white font-bold rounded-xl text-sm transition-all active:scale-95 shadow-lg hover:shadow-xl ${
                    isPro 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/20' 
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/20'
                  }`}
                >
                  View Profile <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          );
        })}

        {(!mentors || mentors.length === 0) && (
           <div className="col-span-full py-24 text-center bg-gradient-to-br from-slate-50 to-slate-100 rounded-[2.5rem] border border-dashed border-slate-200">
              <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-black text-slate-600 mb-2">No mentors found</h3>
              <p className="text-slate-400 font-medium">Try adjusting your search criteria</p>
           </div>
        )}
      </div>
    </div>
  );
}
