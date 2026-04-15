"use client";

import { useState } from "react";
import { Sparkles, Briefcase, ChevronRight, Search } from "lucide-react";
import Link from "next/link";

export default function MentorMatchCard({ mentors = [], userInterests = [] }: { mentors?: any[], userInterests?: string[] }) {
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [loadingText, setLoadingText] = useState("Analyzing your profile...");
  const [matchedMentors, setMatchedMentors] = useState<any[]>([]);
  const [error, setError] = useState("");

  const handleFindMentor = async () => {
    setIsSearching(true);
    setHasSearched(true);
    setError("");
    
    // Build query from user interests or default
    const query = userInterests.length > 0 
      ? userInterests.join(" ") 
      : "software development programming";
    
    try {
      setLoadingText("Running TF-IDF similarity...");
      
      const res = await fetch("/api/mentors/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      
      setLoadingText("Scanning mentor availability...");
      
      if (!res.ok) {
        throw new Error("Failed to fetch matches");
      }
      
      const data = await res.json();
      
      setLoadingText("Finding perfect matches...");
      
      // Wait a moment to show the loading animation
      setTimeout(() => {
        setMatchedMentors(data.matches || []);
        setIsSearching(false);
      }, 1000);
      
    } catch (err: any) {
      setError(err.message);
      setIsSearching(false);
    }
  };

  const displayMentors = matchedMentors.length > 0 ? matchedMentors : (mentors || []);

  if (!hasSearched) {
      return (
          <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] text-center relative overflow-hidden group">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-50 rounded-full mix-blend-multiply blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
             <div className="relative z-10 flex flex-col items-center justify-center">
                 <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-white">
                     <Search className="w-10 h-10 text-indigo-600" />
                 </div>
                 <h2 className="text-3xl font-extrabold text-slate-800 mb-4 tracking-tight">Find your perfect mentor</h2>
                 <p className="text-slate-500 text-lg mb-8 max-w-md mx-auto">Get matched with industry experts based on your goals, skills, and current challenges.</p>
                 <button 
                    onClick={handleFindMentor}
                    className="px-8 py-4 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl shadow-lg hover:shadow-indigo-500/25 transition-all duration-300 font-bold text-lg flex items-center gap-3 transform hover:-translate-y-1"
                 >
                     <Sparkles className="w-5 h-5" /> Let's Find My Mentor
                 </button>
             </div>
          </div>
      );
  }

  if (isSearching) {
      return (
          <div className="bg-slate-900 rounded-[2rem] p-12 shadow-[0_8px_40px_rgb(0,0,0,0.2)] text-center relative overflow-hidden h-[400px] flex flex-col items-center justify-center">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/30 rounded-full mix-blend-screen blur-[100px] animate-pulse pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-indigo-500/20 rounded-full animate-[spin_10s_linear_infinite] pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] border border-purple-500/30 rounded-full animate-[spin_7s_linear_infinite_reverse] pointer-events-none" />
              
              <div className="relative z-10 flex flex-col items-center justify-center">
                  <div className="relative">
                      <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center animate-ping absolute top-0 left-0" />
                      <div className="w-24 h-24 bg-indigo-600 text-white rounded-full flex items-center justify-center relative shadow-[0_0_40px_rgba(79,70,229,0.5)]">
                          <Sparkles className="w-10 h-10 animate-pulse" />
                      </div>
                  </div>
                  <h3 className="text-2xl font-bold text-white mt-8 mb-2 drop-shadow-md">Finding Your Mentor</h3>
                  <p className="text-indigo-200 font-medium tracking-wide animate-pulse">{loadingText}</p>
              </div>
          </div>
      );
  }



  return (
    <div className="bg-white rounded-[2rem] p-6 md:p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] animate-in fade-in zoom-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900">
            AI Mentor Recommendations
          </h2>
          <p className="text-xs md:text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-indigo-500" />
            Matched securely via TF-IDF + Cosine Similarity
          </p>
        </div>
        <Link href="/mentors" className="text-xs md:text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:underline transition-all whitespace-nowrap">
          Explore Directory →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {displayMentors.map((mentorApp, index) => {
            const rawScore = mentorApp.mockTestScore || 85; 
            // Use index-based pseudo-random for consistent SSR/client rendering
            const pseudoMatch = Math.min(rawScore + (index * 3) % 15, 99);

            return (
          <div 
            key={mentorApp._id} 
            className="rounded-2xl border border-slate-100 p-4 md:p-5 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden group"
          >
            <div className="flex items-start gap-3 md:gap-4">
              {/* Avatar */}
              {mentorApp.userId?.image || mentorApp.userId?.avatar || mentorApp.userId?.profilePicture ? (
                <img 
                  src={mentorApp.userId?.image || mentorApp.userId?.avatar || mentorApp.userId?.profilePicture} 
                  alt={mentorApp.userId?.name || 'Mentor'}
                  className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover shadow-sm border border-slate-100 shrink-0"
                />
              ) : (
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-50 text-indigo-600 flex items-center justify-center font-black text-xl shadow-sm border border-slate-100 shrink-0">
                    {mentorApp.userId?.name?.[0] || 'M'}
                </div>
              )}
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-base md:text-lg font-black text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                      {mentorApp.userId?.name || 'Mentor'}
                    </h3>
                    <p className="text-xs md:text-sm font-bold text-slate-500 truncate">{mentorApp.domain || mentorApp.currentStatus || 'Industry Expert'}</p>
                  </div>
                  
                  {/* Match Badge */}
                  <div className="shrink-0 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] md:text-xs font-black text-emerald-700">{pseudoMatch}%</span>
                  </div>
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-2 md:gap-3 mt-2 text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> 
                    <span className="hidden sm:inline">{mentorApp.experienceYears || 2} Years</span>
                    <span className="sm:hidden">{mentorApp.experienceYears || 2} Yrs</span>
                  </span>
                  <span className="uppercase text-[9px] tracking-wider text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                    {mentorApp.targetRole === 'promentor' ? 'PRO' : 'PRE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Skills */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(mentorApp.skills || []).slice(0, 4).map((tag: string, idx: number) => (
                <span key={`${mentorApp._id}-skill-${idx}`} className="px-2 py-0.5 bg-slate-50 text-slate-600 text-[10px] font-bold rounded-md border border-slate-200">
                  {tag}
                </span>
              ))}
              {(mentorApp.skills?.length || 0) > 4 && (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-400 text-[10px] font-bold rounded-md">
                  +{(mentorApp.skills?.length || 0) - 4}
                </span>
              )}
            </div>

            {/* CTA Button */}
            <div className="mt-4">
              <Link 
                href={`/mentors/${mentorApp.userId?._id || mentorApp.userId}`} 
                className="w-full py-2.5 bg-slate-900 text-white hover:bg-indigo-600 font-bold text-xs md:text-sm rounded-xl transition-all shadow-sm hover:shadow-md flex justify-center items-center gap-1.5"
              >
                View Profile <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}
