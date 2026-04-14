import { ArrowUpRight, Award, HeartHandshake, Mic } from "lucide-react";
import Link from "next/link";

export default function PreMentorUpgrade() {
  const benefits = [
    { icon: Award, label: "Build reputation in the community" },
    { icon: HeartHandshake, label: "Help juniors navigate their path" },
    { icon: Mic, label: "Get recognized & invited to events" },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm border-t-4 border-t-purple-500 flex flex-col h-full relative group">
      <div className="absolute top-4 right-4 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
        Upgrade
      </div>
      
      <h2 className="text-xl font-bold text-slate-800 mb-2">Become a Pre-Mentor</h2>
      <p className="text-sm text-slate-500 mb-5 leading-relaxed">
        Start guiding juniors and share your knowledge. Grow your reputation and unlock pro opportunities in the LetAsk ecosystem.
      </p>

      <ul className="flex flex-col gap-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100 flex-1">
        {benefits.map((benefit, idx) => (
          <li key={idx} className="flex items-center gap-3">
            <div className="bg-white p-1.5 rounded-md shadow-sm border border-slate-100">
               <benefit.icon className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">{benefit.label}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2">
        <Link href="/dashboard/mentee/apply-prementor" className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group-hover:gap-3">
          Apply as Pre-Mentor
          <ArrowUpRight className="w-4 h-4" />
        </Link>
        <p className="text-xs text-center text-slate-400 mt-1 flex justify-center items-center gap-1">
          You can switch roles anytime later.
        </p>
      </div>
    </div>
  );
}
