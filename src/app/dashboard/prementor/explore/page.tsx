import dbConnect from "@/lib/db";
import MentorProfile from "@/models/MentorProfile";
import User from "@/models/User";
import { Search, MapPin, Star, Briefcase, Sparkles, ArrowRight, Zap, Award, Calendar, Clock } from "lucide-react";
import Link from "next/link";
import { getUserFromSession } from "@/lib/auth";
import { redirect } from "next/navigation";

interface ExplorePageProps {
  searchParams?: Promise<{ query?: string }>;
}

export const dynamic = 'force-dynamic';

export default async function PreMentorExplorePage({ searchParams }: ExplorePageProps) {
  const sessionUser = await getUserFromSession();
  if (!sessionUser) redirect("/login/prementor");

  const resolvedParams = await searchParams;
  const query = resolvedParams?.query || "";

  await dbConnect();
  
  // Build the filter for pro mentors only
  let filter: any = {};
  if (query) {
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
        { domain: regex }
      ]
    };
  }

  // Fetch only Pro Mentors
  console.log("=== PreMentor Explore: Searching for Pro Mentors ===");
  console.log("Query:", query);
  
  const proMentors = await MentorProfile.find(filter)
    .populate('userId', 'name avatar profilePicture image')
    .sort({ rating: -1, createdAt: -1 })
    .lean();
    
  console.log("Pro-Mentors found:", proMentors.length);
  
  // Format mentors
  const mentors = proMentors.map(m => ({ 
    ...m, 
    mentorType: 'promentor',
    verified: m.verified || false 
  }));

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 pb-20 animate-in fade-in duration-700">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-10 text-white shadow-2xl shadow-indigo-500/20">
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
                <Award className="w-4 h-4 text-amber-300" />
                <span className="text-white/90 text-sm font-bold">{mentors.length} Pro Mentors Available</span>
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Find Your Pro Mentor</h1>
            <p className="text-white/90 font-medium text-lg max-w-xl">Connect with experienced professionals for personalized guidance</p>
          </div>
          
          <div className="flex gap-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-white/20">
              <div className="text-2xl font-black flex items-center gap-1">
                <Award className="w-5 h-5 text-amber-300" />
                {mentors.length}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-white/70">Pro Mentors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-[2rem] p-6 shadow-lg border border-slate-100">
        <form className="relative" action="/dashboard/prementor/explore">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="h-6 w-6 text-slate-400" />
          </div>
          <input
            type="text"
            name="query"
            defaultValue={query}
            className="block w-full pl-14 pr-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all text-lg font-medium"
            placeholder="Search by name, skills, or expertise..."
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Mentors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mentors.map((mentor: any) => {
          const hasImage = mentor.profilePicture || mentor.userId?.avatar || mentor.userId?.profilePicture || mentor.userId?.image;
          const imageUrl = mentor.profilePicture || mentor.userId?.avatar || mentor.userId?.profilePicture || mentor.userId?.image;
          
          return (
            <div key={mentor._id.toString()} className="group bg-white rounded-[2rem] p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-500 flex flex-col h-full relative overflow-hidden">
              {/* Hover Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/[0.02] group-hover:via-purple-500/[0.02] group-hover:to-pink-500/[0.02] transition-all duration-500"></div>
              
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
              
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
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center shadow-md" title="Pro Mentor">
                          <Award className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg ring-4 ring-white group-hover:ring-indigo-100 transition-all duration-300 bg-gradient-to-br from-amber-400 to-orange-500">
                          {String(mentor.userId?.name || 'M')[0]}
                        </div>
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                          <Award className="w-3.5 h-3.5 text-white" />
                        </div>
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
                      <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-600 border border-amber-100">
                        <Award className="w-3 h-3" /> Pro Mentor
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
                  {mentor.pricing > 0 && (
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

                {/* CTA Button - Links to booking */}
                <Link 
                  href={`/dashboard/prementor/mentor/${mentor._id}`} 
                  className="w-full flex items-center justify-center gap-2 py-3.5 text-white font-bold rounded-xl text-sm transition-all active:scale-95 shadow-lg hover:shadow-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/20"
                >
                  <Calendar className="w-4 h-4" />
                  Book Session <ArrowRight className="w-4 h-4" />
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
              <h3 className="text-xl font-black text-slate-600 mb-2">No pro mentors found</h3>
              <p className="text-slate-400 font-medium">Try adjusting your search criteria</p>
           </div>
        )}
      </div>
    </div>
  );
}
