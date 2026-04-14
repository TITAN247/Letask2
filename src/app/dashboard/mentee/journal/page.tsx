import { BookOpen, PenTool, Plus } from "lucide-react";

export default function JournalPage() {
  const journals = [
    { title: "First Mentorship Session", date: "Oct 12, 2024", preview: "Great session with Sarah, learned about PM roles..." },
    { title: "Self Reflection: Career Goals", date: "Oct 15, 2024", preview: "Thinking about transitioning to AI/Data space..." }
  ];

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-10">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Mentee Journal</h1>
          <p className="text-slate-500 font-bold text-sm">Reflect on your growth and sessions.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-600/20 hover:bg-indigo-700 transition-all active:scale-95">
          <Plus className="w-5 h-5" /> Write New Journal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {journals.map((j, i) => (
          <div key={i} className="p-6 bg-white border border-slate-100 rounded-[2rem] shadow-sm hover:shadow-xl transition-all group">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
              <PenTool className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-1">{j.title}</h3>
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-3">{j.date}</p>
            <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-3">
              {j.preview}
            </p>
          </div>
        ))}
        {/* Empty State / Add Card */}
        <div className="p-6 border-2 border-dashed border-slate-100 rounded-[2rem] flex flex-col items-center justify-center text-center group hover:border-indigo-200 cursor-pointer transition-all">
          <BookOpen className="w-8 h-8 text-slate-200 group-hover:text-indigo-300 mb-3" />
          <p className="text-sm font-bold text-slate-400 group-hover:text-indigo-400">Add a New Reflection</p>
        </div>
      </div>
    </div>
  );
}
