import { TrendingUp, Users, Star, Activity } from "lucide-react";

export default function ProgressScore({ score = 0 }: { score: number }) {
  // Determine Level Title
  let level = "Newcomer 🌱";
  if (score >= 80) level = "Expert Mentee 👑";
  else if (score >= 60) level = "Advanced Learner 🔥";
  else if (score >= 40) level = "Dedicated Soul 🚀";
  else if (score >= 20) level = "Rising Learner ✨";

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white rounded-[2rem] p-8 border border-indigo-100 shadow-sm flex flex-col h-full relative overflow-hidden group">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:bg-indigo-200 transition-colors duration-700"></div>

      <div className="relative z-10 flex flex-col h-full justify-between gap-8">
        <div>
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.15em] mb-2">Your Growth Level</h2>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-indigo-50">
               <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700 leading-none">
              {level}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Activity className="w-3.5 h-3.5 text-indigo-500" /> Activity
            </span>
            <span className="text-xl font-black text-slate-800">{score}%</span>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
              <div 
                className="bg-indigo-500 h-1.5 rounded-full transition-all duration-1000 ease-out" 
                style={{ width: `${score}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Star className="w-3.5 h-3.5 text-amber-500" /> Reputation
            </span>
            <div className="flex items-end gap-1">
               <span className="text-xl font-black text-slate-800">4.9</span>
               <span className="text-[10px] font-bold text-slate-400 mb-1">/5</span>
            </div>
            <div className="flex gap-0.5 mt-2">
               {[1,2,3,4,5].map(i => (
                 <div key={i} className={`w-2 h-1 rounded-full ${i <= 5 ? 'bg-amber-400' : 'bg-slate-1100'}`} />
               ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
