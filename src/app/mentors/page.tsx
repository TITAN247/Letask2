"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Star, Search, Sparkles, Award, Zap, ArrowRight, MapPin, Briefcase, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Mentor {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
    profilePicture?: string;
    image?: string;
  };
  name?: string;
  bio?: string;
  expertise?: string[];
  experience?: string;
  experienceYears?: number;
  hourlyRateINR?: number;
  averageRating?: number;
  totalReviews?: number;
  languages?: string[];
  profilePic?: string;
  profilePicture?: string;
  avatar?: string;
  image?: string;
  type: "promentor" | "prementor";
}

export default function MentorsPage() {
  const router = useRouter();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "promentor" | "prementor">("all");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/mentors/match");
      if (!res.ok) throw new Error("Failed to fetch mentors");
      const data = await res.json();
      if (data.success) {
        setMentors(data.data || []);
      } else {
        setError(data.message || "Failed to load mentors");
      }
    } catch (err) {
      setError("Could not load mentors. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch = 
      (mentor.name || mentor.userId?.name || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (mentor.expertise || [])
        .some((e) => e.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === "all" || mentor.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const getMentorName = (mentor: Mentor) => mentor.name || mentor.userId?.name || "Unknown";
  const getMentorImage = (mentor: Mentor) => {
    // Check all possible image sources in order of priority
    const imageSources = [
      mentor.profilePic,
      mentor.profilePicture,
      mentor.avatar,
      mentor.image,
      mentor.userId?.avatar,
      mentor.userId?.profilePicture,
      mentor.userId?.image
    ];
    
    for (const src of imageSources) {
      if (src && typeof src === 'string' && src.trim() !== '') {
        return src;
      }
    }
    return '';
  };

  // Get pro and pre mentor counts
  const proMentorsCount = mentors.filter(m => m.type === 'promentor').length;
  const preMentorsCount = mentors.filter(m => m.type === 'prementor').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/logo.jpeg" alt="LetAsk" className="h-12 w-auto object-contain" />
          </Link>
          <Link
            href="/dashboard/mentee"
            className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition shadow-lg shadow-slate-900/20"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-20 px-4">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/20 rounded-full blur-2xl -ml-20 -mb-20"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-purple-500/30 rounded-full blur-xl"></div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="text-white/90 text-sm font-bold">{mentors.length}+ Expert Mentors Available</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tight">Find Your Perfect Mentor</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto font-medium">
            Connect with experienced professionals ready to guide your career journey
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-6 mt-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-3xl font-black flex items-center gap-2">
                <Award className="w-6 h-6 text-amber-300" />
                {proMentorsCount}
              </div>
              <div className="text-xs font-bold uppercase tracking-wider text-white/70">Pro Mentors</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
              <div className="text-3xl font-black text-emerald-300">{preMentorsCount}</div>
              <div className="text-xs font-bold uppercase tracking-wider text-white/70">Free Pre-Mentors</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-slate-100 mb-10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, expertise, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-xl border border-slate-200 font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="flex gap-2">
              {(["all", "promentor", "prementor"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-5 py-4 rounded-xl font-bold transition-all ${
                    filterType === type
                      ? "bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25"
                      : "bg-slate-50 border border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-white"
                  }`}
                >
                  {type === "all" ? (
                    <><Sparkles className="w-4 h-4 inline mr-1" /> All</>
                  ) : type === "promentor" ? (
                    <><Award className="w-4 h-4 inline mr-1" /> Pro</>
                  ) : (
                    <><Zap className="w-4 h-4 inline mr-1" /> Pre</>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-16 bg-red-50 rounded-[2rem] border border-red-100">
            <p className="text-red-600 font-bold text-lg">{error}</p>
            <button
              onClick={fetchMentors}
              className="mt-4 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition shadow-lg"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 animate-pulse">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-20 h-20 bg-slate-200 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 rounded w-1/2" />
                  </div>
                </div>
                <div className="h-4 bg-slate-200 rounded mb-2" />
                <div className="h-4 bg-slate-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Mentors Grid */}
        {!loading && !error && (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-600 font-medium">
                Showing <span className="font-black text-slate-900">{filteredMentors.length}</span> mentor{filteredMentors.length !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Sparkles className="w-4 h-4" />
                <span>Matched securely via AI</span>
              </div>
            </div>
            
            {filteredMentors.length === 0 ? (
              <div className="text-center py-20 bg-gradient-to-br from-slate-50 to-slate-100 rounded-[2.5rem] border border-dashed border-slate-200">
                <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-2xl font-black text-slate-700 mb-2">No mentors found</h3>
                <p className="text-slate-500 font-medium">Try adjusting your search or filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMentors.map((mentor) => {
                  const isPro = mentor.type === 'promentor';
                  const hasImage = getMentorImage(mentor);
                  
                  return (
                    <div
                      key={mentor._id}
                      onClick={() => router.push(`/mentors/${mentor._id}`)}
                      className="group bg-white rounded-[2rem] p-6 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-500 cursor-pointer border border-slate-100 relative overflow-hidden"
                    >
                      {/* Hover Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/[0.02] group-hover:via-purple-500/[0.02] group-hover:to-pink-500/[0.02] transition-all duration-500"></div>
                      
                      {/* Top Accent */}
                      <div className={`absolute top-0 left-0 right-0 h-1 ${isPro ? 'bg-gradient-to-r from-amber-400 to-orange-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'} transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}></div>

                      {/* Header */}
                      <div className="flex items-start gap-4 mb-5 relative z-10">
                        <div className="relative">
                          {hasImage ? (
                            <img
                              src={hasImage}
                              alt={getMentorName(mentor)}
                              className="w-20 h-20 rounded-2xl object-cover shadow-lg ring-4 ring-white group-hover:ring-indigo-100 transition-all duration-300"
                            />
                          ) : (
                            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg ring-4 ring-white group-hover:ring-indigo-100 transition-all duration-300 ${isPro ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-emerald-400 to-teal-500'}`}>
                              {String(getMentorName(mentor))[0]}
                            </div>
                          )}
                          {isPro && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center shadow-md" title="Pro Mentor">
                              <Award className="w-3.5 h-3.5 text-white" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-black text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight truncate">
                            {getMentorName(mentor)}
                          </h3>
                          <p className="text-sm text-slate-500 font-medium mt-1 line-clamp-1">
                            {mentor.expertise?.[0] || (isPro ? 'Industry Expert' : 'Peer Mentor')}
                          </p>
                          
                          {/* Badge */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              isPro 
                                ? 'bg-amber-50 text-amber-600 border border-amber-100' 
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            }`}>
                              {isPro ? <><Award className="w-3 h-3" /> Pro</> : <><Zap className="w-3 h-3" /> Free</>}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bio */}
                      {mentor.bio && (
                        <p className="text-sm text-slate-500 font-medium mb-4 line-clamp-2 leading-relaxed relative z-10">
                          {mentor.bio}
                        </p>
                      )}

                      {/* Stats Row */}
                      <div className="flex items-center gap-3 mb-4 relative z-10">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs font-bold text-slate-600">{mentor.experienceYears || 1}+ Yrs</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg border border-amber-100">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-bold text-amber-600">{(mentor.averageRating || 0).toFixed(1)}</span>
                        </div>
                        {mentor.totalReviews ? (
                          <span className="text-xs text-slate-400 font-medium">({mentor.totalReviews} reviews)</span>
                        ) : (
                          <span className="text-xs text-emerald-600 font-bold">New Mentor</span>
                        )}
                      </div>

                      {/* Expertise */}
                      {mentor.expertise && mentor.expertise.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-5 relative z-10">
                          {mentor.expertise.slice(0, 4).map((skill, idx) => (
                            <span
                              key={`${mentor._id}-skill-${idx}`}
                              className="px-2.5 py-1 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-lg border border-slate-100 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-colors"
                            >
                              {skill}
                            </span>
                          ))}
                          {mentor.expertise.length > 4 && (
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-lg">
                              +{mentor.expertise.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 relative z-10">
                        <div className={`font-black text-lg ${isPro ? 'text-amber-600' : 'text-emerald-600'}`}>
                          {isPro ? (
                            <>₹{mentor.hourlyRateINR || 500}<span className="text-slate-400 text-sm font-medium">/hr</span></>
                          ) : (
                            <span className="flex items-center gap-1"><Sparkles className="w-4 h-4" /> Free</span>
                          )}
                        </div>
                        <button className={`flex items-center gap-1 font-bold text-sm transition-all ${isPro ? 'text-amber-600 hover:text-amber-700' : 'text-emerald-600 hover:text-emerald-700'}`}>
                          Book Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
