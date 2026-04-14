import { Target, ArrowRight } from "lucide-react";

export default function GoalSuggestions({ suggestions = [] }: { suggestions?: string[] }) {
  const displaySuggestions = suggestions.length > 0 ? suggestions : [
    "Crack product interviews",
    "Start a startup",
    "Learn backend development",
    "Transition to AI roles"
  ];

  return (
    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 border border-indigo-800 shadow-sm relative overflow-hidden">
      {/* Decorative background vectors */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
      
      <div className="relative z-10">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-indigo-400" />
          Share your goal, meet your mentor
        </h2>
        <p className="text-sm text-indigo-200 mt-1">
          Tell us what you want to achieve, and we'll find the right guide for you.
        </p>

        <div className="flex flex-wrap gap-2 mt-5">
          {displaySuggestions.map((suggestion) => (
            <button 
              key={suggestion} 
              className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm font-medium rounded-lg border border-white/10 backdrop-blur-sm transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <button className="mt-6 px-5 py-2.5 bg-white text-indigo-900 font-bold rounded-xl text-sm shadow-md hover:shadow-lg hover:bg-indigo-50 transition-all flex items-center gap-2 group">
          Set My Goal
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
