import { CheckCircle2, Circle } from "lucide-react";

interface OnboardingStep {
  label: string;
  completed: boolean;
}

export default function OnboardingCard({ steps = [] }: { steps: OnboardingStep[] }) {
  const completedCount = steps.filter((s) => s.completed).length;
  const progressPercent = steps.length > 0 ? Math.round((completedCount / steps.length) * 100) : 0;

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col gap-6 h-full">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Let’s start with the basics</h2>
          <p className="text-sm text-slate-500 mt-1 font-medium">Get more by setting up a profile you love.</p>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black border border-indigo-100 shadow-inner text-lg">
          {progressPercent}%
        </div>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div 
          className="bg-emerald-500 h-2.5 rounded-full transition-all duration-700 ease-out" 
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      <div className="flex flex-col gap-3 mt-2">
        {steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-3">
            {step.completed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-50" />
            ) : (
              <Circle className="w-5 h-5 text-slate-300" />
            )}
            <span className={`text-sm font-medium ${step.completed ? 'text-slate-700' : 'text-slate-500'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
