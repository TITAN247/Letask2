"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
    CheckCircle, 
    Briefcase, 
    Award, 
    TrendingUp, 
    VideoIcon, 
    AlertCircle, 
    ChevronRight, 
    ChevronLeft,
    ShieldCheck,
    Play,
    DollarSign,
    Zap
} from "lucide-react";

export default function ApplyProMentorPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        status: "",
        domain: "Technology",
        specialization: "",
        experience: "",
        institution: "",
        location: "",
        skills: "",
        availability: "",
        linkedinUrl: "",
        portfolioUrl: "",
        videoUrl: "",
        identityDocument: "",
        identityDocumentType: "",
        resumeDocument: "",
        pricing: 50,
        professionalYears: 5
    });

    const [behavioral, setBehavioral] = useState({
        qWhyMentor: "",
        qProblemSolved: "",
        qGuideBeginners: "",
        qDifference: "",
        qConfidence: 10,
        qHandleDoubts: "",
        qCommStyle: "",
        qAchievement: ""
    });

    const [videoUrl, setVideoUrl] = useState("");

    const STATUS_OPTIONS = [
        { id: "Senior Engineer", icon: Zap },
        { id: "Tech Lead / CTO", icon: Award },
        { id: "Industry Expert", icon: Briefcase },
        { id: "Freelance Consultant", icon: TrendingUp },
    ];

    const EXPERIENCE_TIERS = [
        { id: "Mid-Level (3-5 Years)", desc: "Solid industry experience" },
        { id: "Senior (5-10 Years)", desc: "Led teams and complex architectures" },
        { id: "Expert (10+ Years)", desc: "Decades of deep domain knowledge" },
    ];

    const isStepValid = () => {
        if (step === 1) return !!form.status;
        if (step === 2) return !!form.specialization;
        if (step === 3) return !!form.experience;
        if (step === 4) return !!form.institution && !!form.skills && !!form.location;
        if (step === 5) return Object.values(behavioral).every(v => v !== "");
        if (step === 6) return form.videoUrl?.length > 10;
        if (step === 7) return form.identityDocumentType && form.identityDocument && form.resumeDocument;
        return true;
    };

    const submitApplication = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/applications/upgrade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetRole: "promentor",
                    currentStatus: form.status,
                    domain: form.domain,
                    subDomain: form.specialization,
                    experienceLevel: form.experience,
                    professionalYears: form.professionalYears,
                    expectedPricing: form.pricing,
                    institution: form.institution,
                    location: form.location,
                    skills: form.skills.split(",").map(s => s.trim()),
                    availability: form.availability,
                    ...behavioral,
                    videoUrl
                })
            });

            if (res.ok) router.push("/dashboard/mentee?review=promentor");
            else alert("Submission failed.");
        } catch (e) {
            alert("Error submitting application.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFF0F5] font-sans pb-20">
            {/* Nav Header */}
            <header className="px-8 py-4 bg-white border-b border-rose-100 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-rose-600 flex items-center justify-center text-white">
                        <span className="font-bold text-xs text-center">L</span>
                    </div>
                    <span className="text-xl font-bold text-slate-900 tracking-tight">LetAsk <span className="text-rose-600">ProMentor</span></span>
                </div>
                <div className="hidden md:flex items-center gap-1">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className={`h-1.5 w-10 rounded-full transition-all ${step >= i ? 'bg-rose-600' : 'bg-slate-200'}`} />
                    ))}
                </div>
            </header>

            <main className="max-w-4xl mx-auto pt-12 px-6">
                
                {/* Step 1: Expert Status */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-5xl font-black text-slate-900">Pro-Mentor <span className="text-rose-600">Excellence</span></h1>
                            <h2 className="text-3xl font-bold text-slate-500">What best describes your seniority?</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {STATUS_OPTIONS.map((opt) => {
                                const Icon = opt.icon;
                                const isSelected = form.status === opt.id;
                                return (
                                    <button 
                                        key={opt.id} onClick={() => setForm({...form, status: opt.id})}
                                        className={`p-10 bg-white rounded-3xl border-2 transition-all flex items-center gap-6 text-left group shadow-sm ${isSelected ? 'border-rose-600 bg-rose-50 shadow-xl scale-105' : 'border-slate-100 hover:border-rose-200 hover:scale-[1.02]'}`}
                                    >
                                        <div className={`p-5 rounded-2xl ${isSelected ? 'bg-rose-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-rose-100 group-hover:text-rose-600'}`}>
                                            <Icon className="w-10 h-10" />
                                        </div>
                                        <div>
                                            <span className={`text-xl font-black block ${isSelected ? 'text-rose-700' : 'text-slate-800'}`}>{opt.id}</span>
                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Industry Professional</span>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Step 2: Specialization */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-5xl font-black text-slate-900">Your <span className="text-rose-600">Core Expertise</span></h1>
                            <h2 className="text-2xl font-bold text-slate-500 font-sans">Where can you provide high-impact guidance?</h2>
                        </div>
                        <div className="max-w-2xl mx-auto space-y-4">
                            <div className="relative">
                                <input 
                                    className="w-full p-8 bg-white border-2 border-slate-100 rounded-[2rem] focus:border-rose-600 focus:ring-8 focus:ring-rose-600/5 outline-none font-bold text-2xl transition-all shadow-xl"
                                    placeholder="Enter your specialization (e.g. System Design, AI Architecture)"
                                    value={form.specialization}
                                    onChange={e => setForm({...form, specialization: e.target.value})}
                                />
                                <div className="absolute right-8 top-1/2 -translate-y-1/2 p-3 bg-rose-50 rounded-2xl text-rose-600">
                                    <Award className="w-8 h-8" />
                                </div>
                            </div>
                            <div className="flex flex-wrap justify-center gap-2 pt-4">
                                {["Microservices", "Cloud Engineering", "DevSecOps", "Blockchain", "Leadership", "FinTech"].map(h => (
                                    <button 
                                        key={h} onClick={() => setForm({...form, specialization: h})}
                                        className="px-6 py-2 bg-white border border-slate-200 rounded-full text-sm font-bold text-slate-500 hover:border-rose-300 hover:text-rose-600 transition-colors"
                                    >
                                        {h}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Experience Tiers */}
                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-5xl font-black text-slate-900">Experience <span className="text-rose-600">Tenure</span></h1>
                            <h2 className="text-2xl font-bold text-slate-500">Select your professional experience tier</h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4 max-w-2xl mx-auto">
                            {EXPERIENCE_TIERS.map((lvl) => {
                                const isSelected = form.experience === lvl.id;
                                return (
                                    <button 
                                        key={lvl.id} onClick={() => setForm({...form, experience: lvl.id})}
                                        className={`p-8 bg-white rounded-[2rem] border-2 transition-all text-left shadow-lg flex items-center gap-6 ${isSelected ? 'border-rose-600 bg-rose-50 ring-4 ring-rose-600/10' : 'border-slate-50 hover:border-rose-200'}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'border-rose-600 bg-rose-600 text-white' : 'border-slate-200'}`}>
                                            {isSelected && <CheckCircle className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h3 className={`font-black text-2xl ${isSelected ? 'text-rose-700' : 'text-slate-800'}`}>{lvl.id}</h3>
                                            <p className="font-bold text-slate-400">{lvl.desc}</p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                        <div className="max-w-md mx-auto p-8 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                            <label className="text-sm font-black text-slate-700">Exact Years of Industry Experience</label>
                            <input type="number" className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none font-black text-center text-3xl text-rose-600" value={form.professionalYears} onChange={e => setForm({...form, professionalYears: Number(e.target.value)})} />
                        </div>
                    </div>
                )}

                {/* Step 4: Industry Details */}
                {step === 4 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto space-y-8">
                        <div className="text-center space-y-4">
                            <h1 className="text-5xl font-black text-slate-900">Industry <span className="text-rose-600">Credentials</span></h1>
                            <h2 className="text-2xl font-bold text-slate-500 font-sans">Verify your professional background</h2>
                        </div>
                        <div className="bg-white rounded-[3rem] p-12 border border-slate-200 shadow-2xl space-y-8">
                            <div className="grid grid-cols-1 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Current/Last Organization</label>
                                    <input className="w-full px-8 py-6 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-rose-600/10 focus:bg-white transition-all font-bold text-lg" placeholder="E.g. Google, Amazon, OpenAI..." value={form.institution} onChange={e=>setForm({...form, institution:e.target.value})} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Professional Location</label>
                                    <input className="w-full px-8 py-6 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-rose-600/10 focus:bg-white transition-all font-bold text-lg" placeholder="e.g. San Francisco, London, remote" value={form.location} onChange={e=>setForm({...form, location:e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Professional Sub-Expertise</label>
                                <input className="w-full px-8 py-6 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-rose-600/10 focus:bg-white transition-all font-bold text-lg" placeholder="E.g. React Native, AWS Lambda, Kubernetes" value={form.skills} onChange={e=>setForm({...form, skills:e.target.value})} />
                            </div>
                            <div className="space-y-3 p-8 bg-rose-50/50 rounded-3xl border-2 border-rose-100 flex items-center justify-between">
                                <div>
                                    <label className="text-xs font-black uppercase text-rose-400 tracking-[0.2em]">Expected hourly Rate</label>
                                    <p className="text-rose-900 font-black text-2xl">${form.pricing} / Hour</p>
                                </div>
                                <div className="flex items-center gap-4">
                                     <input type="range" min="10" max="500" className="w-32 accent-rose-600" value={form.pricing} onChange={e => setForm({...form, pricing: Number(e.target.value)})} />
                                     <DollarSign className="w-6 h-6 text-rose-400" />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 5: Advisory Philosophy */}
                {step === 5 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto space-y-8">
                        <div className="text-center space-y-4">
                            <h1 className="text-5xl font-black text-slate-900">Advisory <span className="text-rose-600">Model</span></h1>
                            <h2 className="text-2xl font-bold text-slate-500">Your high-level mentoring philosophy</h2>
                        </div>
                        <div className="space-y-8">
                            {[
                                { id: "qWhyMentor", q: "Why do you mentor industry peers?" },
                                { id: "qProblemSolved", q: "Describe a complex production-grade failure you resolved" },
                                { id: "qGuideBeginners", q: "How do you scale your knowledge for beginners?" },
                                { id: "qHandleDoubts", q: "How do you research unknown architectural challenges?" },
                                { id: "qCommStyle", q: "What is your executive communication style?" },
                                { id: "qAchievement", q: "What is your most notable industry impact?" }
                            ].map((item) => (
                                <div key={item.id} className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-2xl space-y-4">
                                    <label className="text-xl font-black text-slate-800 ml-1">{item.q}</label>
                                    <textarea 
                                        className="w-full p-8 bg-slate-50/50 border border-slate-100 rounded-[2rem] focus:bg-white focus:ring-8 focus:ring-rose-600/5 outline-none font-bold text-slate-600 h-40 resize-none transition-all placeholder:text-slate-300"
                                        value={(behavioral as any)[item.id]}
                                        onChange={e => setBehavioral({...behavioral, [item.id]: e.target.value})}
                                        placeholder="Detailed professional response..."
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 6: Video Verification */}
                {step === 6 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto space-y-8">
                        <div className="bg-rose-600 rounded-[3rem] p-12 text-white shadow-2xl shadow-rose-200 relative overflow-hidden">
                            <div className="relative z-10 space-y-2">
                                <h1 className="text-4xl font-black">Video Verification</h1>
                                <p className="text-rose-100 font-bold opacity-80">Complete your video introduction</p>
                            </div>
                            <VideoIcon className="w-32 h-32 text-rose-400 absolute right-[-20px] bottom-[-20px] opacity-30" />
                        </div>

                        <div className="bg-white rounded-[3rem] p-12 border border-slate-200 shadow-2xl space-y-8">
                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Video Link (YouTube, Drive, Loom)</label>
                                <div className="relative">
                                    <input 
                                        className="w-full px-10 py-6 bg-slate-50 border-none rounded-[2rem] focus:ring-8 focus:ring-rose-600/5 focus:bg-white transition-all font-bold text-lg"
                                        placeholder="Paste your video URL here..."
                                        value={videoUrl}
                                        onChange={e => setVideoUrl(e.target.value)}
                                    />
                                    <Play className="w-8 h-8 text-rose-500 absolute right-8 top-1/2 -translate-y-1/2" />
                                </div>
                                <div className="mt-4 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                                    <AlertCircle className="w-6 h-6 text-slate-400 shrink-0" />
                                    <p className="text-sm font-bold text-slate-400">Our team will watch this video to verify your advisory capabilities. Ensure it is public or accessible via the link.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Navigation */}
                <div className="mt-12 flex items-center justify-between gap-8 pb-32">
                    {step > 1 ? (
                        <button onClick={() => setStep(step - 1)} className="px-12 py-5 bg-white border-2 border-slate-100 rounded-[2rem] font-black text-slate-600 hover:bg-slate-50 hover:border-slate-300 flex items-center gap-3 transition-all">
                            <ChevronLeft className="w-7 h-7" /> Back
                        </button>
                    ) : <div />}

                    <button 
                        onClick={() => {
                            if (step === 7) submitApplication();
                            else {
                                setStep(step + 1);
                                window.scrollTo(0, 0);
                            }
                        }}
                        disabled={!isStepValid() || loading}
                        className={`px-16 py-5 rounded-[1.5rem] font-black text-xl transition-all flex items-center gap-4 shadow-2xl ${isStepValid() ? 'bg-rose-600 text-white hover:bg-rose-700 active:scale-95 shadow-rose-600/30' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-4 border-rose-400 border-t-white rounded-full animate-spin" />
                                Processing...
                            </>
                        ) : step === 7 ? 'Finalize & Submit' : 'Next Step'}
                        {step < 7 && <ChevronRight className="w-6 h-6" />}
                    </button>
                </div>
            </main>
        </div>
    );
}
