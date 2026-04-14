import { Star, Sparkles, TrendingUp, Award } from "lucide-react";

export default function NewPage() {
  const updates = [
    { title: "New AI Mentorship Track", category: "Course", date: "Oct 20, 2024", desc: "Unlock specialized pathways for AI and Data Engineering." },
    { title: "Top 10 Mentors of the Week", category: "Featured", date: "Oct 19, 2024", desc: "Check out the most active and highly rated mentors this week." },
    { title: "Community Event: Design Sprint", category: "Event", date: "Oct 22, 2024", desc: "Join our first collaborative design sprint with industry experts." }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10 space-y-2">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <Star className="w-8 h-8 text-indigo-600 fill-indigo-600/10" />
          What's New
        </h1>
        <p className="text-slate-500 font-bold text-sm">Stay updated with the latest from LetAsk.</p>
      </div>

      <div className="grid gap-6">
        {updates.map((u, i) => (
          <div key={i} className="p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all flex gap-8 items-start relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/20 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-indigo-100/30 transition-colors"></div>
            
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
                {u.category === 'Course' ? <Award className="w-6 h-6" /> : 
                 u.category === 'Featured' ? <TrendingUp className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
            </div>

            <div className="flex-1 space-y-2 relative z-10">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-indigo-100">
                  {u.category}
                </span>
                <span className="text-[10px] font-bold text-slate-400">{u.date}</span>
              </div>
              <h3 className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{u.title}</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-2xl">
                {u.desc}
              </p>
            </div>
            
            <button className="self-center px-6 py-3 bg-slate-50 text-slate-600 rounded-xl font-black text-xs hover:bg-slate-900 hover:text-white transition-all shadow-sm">
              Read More
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
