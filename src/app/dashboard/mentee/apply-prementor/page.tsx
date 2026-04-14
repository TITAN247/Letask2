"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
    CheckCircle, 
    Briefcase, 
    GraduationCap, 
    Layout, 
    Database, 
    Blocks, 
    AlertCircle, 
    Sparkles, 
    ChevronRight, 
    ChevronLeft,
    ShieldCheck
} from "lucide-react";

export default function ApplyPreMentorPage() {
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
        tools: "",
        availability: "",
        mentorshipStyle: "",
        linkedinUrl: "",
        portfolioUrl: "",
        identityDocument: "",
        identityDocumentType: "",
        resumeDocument: ""
    });

    const [behavioral, setBehavioral] = useState({
        qWhyMentor: "",
        qProblemSolved: "",
        qGuideBeginners: "",
        qDifference: "",
        qConfidence: 8,
        qHandleDoubts: "",
        qCommStyle: "",
        qAchievement: ""
    });

    const [testAnswers, setTestAnswers] = useState<number[]>(new Array(5).fill(-1));
    const [descriptiveAnswer, setDescriptiveAnswer] = useState("");

    const STATUS_OPTIONS = [
        { id: "College Student", icon: GraduationCap },
        { id: "Recent Graduate", icon: Sparkles },
        { id: "Working Professional", icon: Briefcase },
        { id: "Preparing For Competitive Exams", icon: Layout },
        { id: "Freelancer/Entrepreneur", icon: Database },
        { id: "Other", icon: Blocks }
    ];

    const SPECIALIZATIONS = [
        "Frontend Development", "Backend Development", "Full Stack Development", 
        "Mobile App Development", "Data Science & AI", "DevOps & Cloud", 
        "Competitive Programming", "Cybersecurity", "Product Management", "UI/UX Design"
    ];

    const MOCK_QUESTIONS = [
        { q: "How do you handle a mentee who is consistently late?", options: ["Ignore it", "Warn them once, then cancel", "Discuss underlying causes and set boundaries", "Reporting to admin immediately"], a: 2 },
        { q: "A mentee asks a question you don't know. Best approach?", options: ["Pretend you know", "Admit you don't know and research together", "Tell them to Google it", "Change the subject"], a: 1 },
        { q: "What defines 'Effective Mentorship'?", options: ["Giving all answers", "Doing their projects", "Enabling self-discovery through guidance", "Focusing only on technical tasks"], a: 2 },
        { q: "Goal setting should be:", options: ["Vague", "Admin-driven", "SMART (Specific, Measurable, etc.)", "Only long-term"], a: 2 },
        { q: "If a mentee lacks motivation:", options: ["Criticize them", "Find their 'Why' and interests", "Ignore the lack of effort", "Give easier tasks"], a: 1 }
    ];

    const isStepValid = () => {
        if (step === 1) return !!form.status;
        if (step === 2) return !!form.specialization;
        if (step === 3) return !!form.experience;
        if (step === 4) return !!form.institution && !!form.skills && !!form.availability;
        if (step === 5) return Object.values(behavioral).every(v => v !== "");
        if (step === 6) return testAnswers.every(a => a !== -1) && descriptiveAnswer.length > 20;
        if (step === 7) return form.identityDocumentType && form.identityDocument && form.resumeDocument;
        return true;
    };

    const submitApplication = async () => {
        setLoading(true);
        try {
            let scoreCount = 0;
            const mappedAnswers = MOCK_QUESTIONS.map((q, idx) => {
                const isCorrect = testAnswers[idx] === q.a;
                if (isCorrect) scoreCount++;
                return {
                    question: q.q,
                    selectedOption: testAnswers[idx],
                    correctOption: q.a,
                    isCorrect
                };
            });

            const finalScore = (scoreCount / MOCK_QUESTIONS.length) * 100;

            const res = await fetch("/api/applications/upgrade", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetRole: "prementor",
                    currentStatus: form.status,
                    domain: form.domain,
                    subDomain: form.specialization,
                    experienceLevel: form.experience,
                    institution: form.institution,
                    location: form.location,
                    skills: form.skills.split(",").map(s => s.trim()),
                    tools: form.tools.split(",").map(t => t.trim()),
                    availability: form.availability,
                    mentorshipStyle: form.mentorshipStyle,
                    ...behavioral,
                    mockTestScore: finalScore,
                    mockTestAnswers: mappedAnswers,
                    descriptiveAnswer
                })
            });

            if (res.ok) router.push("/dashboard/mentee?review=prementor");
            else alert("Submission failed.");
        } catch (e) {
            alert("Error submitting application.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F0F9FF] font-sans pb-20">
            {/* Nav Header */}
            <header className="px-8 py-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-white">
                        <span className="font-bold text-xs text-center">L</span>
                    </div>
                    <span className="text-xl font-bold text-slate-900 tracking-tight">LetAsk <span className="text-sky-600">PreMentor</span></span>
                </div>
                <div className="hidden md:flex items-center gap-1">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className={`h-1.5 w-10 rounded-full transition-all ${step >= i ? 'bg-sky-600' : 'bg-slate-200'}`} />
                    ))}
                </div>
            </header>

            <main className="max-w-4xl mx-auto pt-12 px-6">
                
                {/* Step 1: Status */}
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-5xl font-black text-slate-900">Pre-Mentor <span className="text-sky-600">Onboarding</span></h1>
                            <h2 className="text-3xl font-bold text-slate-500">What's your current status?</h2>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                            {STATUS_OPTIONS.map((opt) => {
                                const Icon = opt.icon;
                                const isSelected = form.status === opt.id;
                                return (
                                    <button 
                                        key={opt.id} onClick={() => setForm({...form, status: opt.id})}
                                        className={`p-8 bg-white rounded-3xl border-2 transition-all flex flex-col items-center gap-4 text-center group shadow-sm ${isSelected ? 'border-sky-600 bg-sky-50 shadow-xl scale-105' : 'border-slate-100 hover:border-sky-200 hover:shadow-lg hover:scale-[1.02]'}`}
                                    >
                                        <div className={`p-4 rounded-2xl ${isSelected ? 'bg-sky-600 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-sky-100 group-hover:text-sky-600 font-black'}`}>
                                            <Icon className="w-12 h-12" />
                                        </div>
                                        <span className={`text-sm font-black leading-tight ${isSelected ? 'text-sky-700' : 'text-slate-600'}`}>{opt.id}</span>
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
                            <h1 className="text-5xl font-black text-slate-900">What's your <span className="text-sky-600">tech specialization?</span></h1>
                            <h2 className="text-2xl font-bold text-slate-500">Select the area you're most experienced in</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {SPECIALIZATIONS.map((spec) => {
                                const isSelected = form.specialization === spec;
                                return (
                                    <button 
                                        key={spec} onClick={() => setForm({...form, specialization: spec})}
                                        className={`p-6 bg-white rounded-2xl border-2 transition-all flex items-center justify-between shadow-sm ${isSelected ? 'border-sky-600 bg-sky-50 shadow-md ring-1 ring-sky-600' : 'border-slate-100 hover:border-sky-200'}`}
                                    >
                                        <span className={`font-black tracking-tight text-lg ${isSelected ? 'text-sky-700' : 'text-slate-700'}`}>{spec}</span>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-sky-600 bg-sky-600 text-white shadow-lg' : 'border-slate-200 ring-4 ring-slate-50'}`}>
                                            {isSelected && <CheckCircle className="w-4 h-4" />}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Step 3: Experience Level */}
                {step === 3 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-center space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-5xl font-black text-slate-900">Your experience level in <span className="text-sky-600">{form.specialization}</span></h1>
                            <h2 className="text-2xl font-bold text-slate-500">Select the most appropriate one</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[
                                { id: "Learning (0-6 months)", desc: "Building foundational projects" },
                                { id: "Beginner (6M - 1Yr)", desc: "Completed basic projects, understand fundamentals" },
                                { id: "Intermediate (1-2 years)", desc: "Built multiple projects, comfortable with core concepts" },
                                { id: "Advanced (2+ years)", desc: "Professional experience or extensive projects" }
                            ].map((lvl) => {
                                const isSelected = form.experience === lvl.id;
                                return (
                                    <button 
                                        key={lvl.id} onClick={() => setForm({...form, experience: lvl.id})}
                                        className={`p-8 bg-white rounded-3xl border-2 transition-all text-left shadow-sm flex flex-col gap-4 ${isSelected ? 'border-sky-600 bg-sky-50 shadow-2xl scale-105' : 'border-slate-100 hover:border-sky-200'}`}
                                    >
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-200'}`}>
                                            {isSelected && <CheckCircle className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <h3 className={`font-black text-xl leading-tight ${isSelected ? 'text-sky-700' : 'text-slate-800'}`}>{lvl.id}</h3>
                                            <p className="text-sm font-bold text-slate-400 mt-2">{lvl.desc}</p>
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Step 4: Pro Details */}
                {step === 4 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto space-y-8">
                        <div className="text-center space-y-4">
                            <h1 className="text-5xl font-black text-slate-900">Professional <span className="text-sky-600">Background</span></h1>
                            <h2 className="text-2xl font-bold text-slate-500 font-sans">Details for your mentor profile</h2>
                        </div>
                        <div className="bg-white rounded-[3rem] p-12 border border-slate-200 shadow-2xl space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Institution / Company</label>
                                    <input className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-sky-600/10 focus:bg-white transition-all font-bold" placeholder="E.g. Apple, Stanford..." value={form.institution} onChange={e=>setForm({...form, institution:e.target.value})} />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Location</label>
                                    <input className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-sky-600/10 focus:bg-white transition-all font-bold" placeholder="City, State" value={form.location} onChange={e=>setForm({...form, location:e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Skills (Comma separated list)</label>
                                <input className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-sky-600/10 focus:bg-white transition-all font-bold" placeholder="E.g. React, Python, UI Design" value={form.skills} onChange={e=>setForm({...form, skills:e.target.value})} />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] ml-2">General Availability</label>
                                <input className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-sky-600/10 focus:bg-white transition-all font-bold" placeholder="E.g. Weekends, 6 PM - 9 PM IST" value={form.availability} onChange={e=>setForm({...form, availability:e.target.value})} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 5: Behavioral Questionnaire */}
                {step === 5 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto space-y-8">
                        <div className="text-center space-y-4">
                            <h1 className="text-5xl font-black text-slate-900">Mentorship <span className="text-sky-600">Assessment</span></h1>
                            <h2 className="text-2xl font-bold text-slate-500">Part 1: Your Mentoring Philosophy</h2>
                        </div>
                        <div className="space-y-8">
                            {[
                                { id: "qWhyMentor", q: "Why do you want to become a mentor?" },
                                { id: "qProblemSolved", q: "Describe a real complex problem you solved independently" },
                                { id: "qGuideBeginners", q: "How will you guide absolute beginners step-by-step?" },
                                { id: "qHandleDoubts", q: "How do you handle a doubt if you don't know the answer?" },
                                { id: "qCommStyle", q: "Describe your communication and teaching style" },
                                { id: "qAchievement", q: "What is your biggest measurable achievement?" }
                            ].map((item) => (
                                <div key={item.id} className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl space-y-4">
                                    <label className="text-lg font-black text-slate-800 ml-1">{item.q}</label>
                                    <textarea 
                                        className="w-full p-6 bg-slate-50/50 border border-slate-100 rounded-[1.5rem] focus:bg-white focus:ring-4 focus:ring-sky-600/10 outline-none font-bold text-slate-600 h-32 resize-none transition-all placeholder:text-slate-300"
                                        value={(behavioral as any)[item.id]}
                                        onChange={e => setBehavioral({...behavioral, [item.id]: e.target.value})}
                                        placeholder="Type your detailed response here..."
                                    />
                                </div>
                            ))}
                            <div className="p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl space-y-6">
                                <label className="text-xl font-black text-slate-800">Rate your overall confidence as a mentor (1-10)</label>
                                <input type="range" min="1" max="10" className="w-full accent-sky-600 h-3 bg-slate-100 rounded-full appearance-none cursor-pointer" value={behavioral.qConfidence} onChange={e => setBehavioral({...behavioral, qConfidence: Number(e.target.value)})} />
                                <div className="text-center text-4xl font-black text-sky-600 bg-sky-50 inline-block px-10 py-4 rounded-3xl border border-sky-100 w-full">{behavioral.qConfidence} / 10</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 6: Mock Test */}
                {step === 6 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto space-y-8">
                        <div className="bg-indigo-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-indigo-200 flex items-center justify-between overflow-hidden relative">
                            <div className="relative z-10 space-y-2">
                                <h1 className="text-4xl font-black tracking-tight">Technical & Ethics Assessment</h1>
                                <p className="text-indigo-100 font-bold opacity-80 uppercase tracking-[0.2em] text-xs">Part 2: Domain-Specific Evaluation</p>
                            </div>
                            <ShieldCheck className="w-24 h-24 text-indigo-400 absolute right-[-20px] bottom-[-20px] opacity-30" />
                        </div>

                        <div className="space-y-8">
                            {MOCK_QUESTIONS.map((q, qIdx) => (
                                <div key={qIdx} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-black">0{qIdx+1}</div>
                                        <h3 className="font-black text-2xl text-slate-900 tracking-tight">{q.q}</h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        {q.options.map((opt, oIdx) => (
                                            <button 
                                                key={oIdx} onClick={() => {
                                                    const fresh = [...testAnswers];
                                                    fresh[qIdx] = oIdx;
                                                    setTestAnswers(fresh);
                                                }}
                                                className={`w-full p-6 text-left border-2 rounded-[1.5rem] font-bold transition-all ${testAnswers[qIdx] === oIdx ? 'border-sky-600 bg-sky-50 text-sky-700 shadow-lg shadow-sky-600/5 scale-[1.01]' : 'border-slate-50 bg-slate-50 text-slate-500 hover:border-sky-200 hover:bg-sky-50/50'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-4 h-4 rounded-full border-2 ${testAnswers[qIdx] === oIdx ? 'border-sky-600 bg-sky-600 ring-4 ring-sky-100' : 'border-slate-200'}`} />
                                                    {opt}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center font-black">06</div>
                                    <h3 className="font-black text-2xl text-slate-900 tracking-tight">Situational Case Study</h3>
                                </div>
                                <p className="text-slate-500 font-bold border-l-4 border-sky-500 pl-4 py-1">Describe a specific time you had to explain a highly complex technical concept to someone with zero technical knowledge. How did you structure your explanation?</p>
                                <textarea 
                                    className="w-full p-8 bg-slate-50/50 border border-slate-100 rounded-[2rem] focus:bg-white focus:ring-8 focus:ring-sky-600/5 outline-none font-bold text-slate-600 h-52 resize-none transition-all"
                                    placeholder="Structure your answer clearly. Minimum 20 characters..."
                                    value={descriptiveAnswer}
                                    onChange={e => setDescriptiveAnswer(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 7: Document Verification */}
                {step === 7 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-3xl mx-auto space-y-8">
                        <div className="text-center space-y-4">
                            <h1 className="text-5xl font-black text-slate-900">Document <span className="text-sky-600">Verification</span></h1>
                            <h2 className="text-2xl font-bold text-slate-500">Required for admin approval (Mandatory)</h2>
                        </div>
                        <div className="bg-white rounded-[3rem] p-12 border border-slate-200 shadow-2xl space-y-8">
                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] ml-2">ID Document Type *</label>
                                <select 
                                    className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-sky-600/10 focus:bg-white transition-all font-bold"
                                    value={form.identityDocumentType}
                                    onChange={e => setForm({...form, identityDocumentType: e.target.value})}
                                >
                                    <option value="">Select ID Type</option>
                                    <option value="passport">Passport</option>
                                    <option value="driving_license">Driving License</option>
                                    <option value="national_id">National ID Card</option>
                                    <option value="aadhar">Aadhar Card</option>
                                </select>
                            </div>
                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] ml-2">ID Document URL (Upload to cloud and paste link) *</label>
                                <input 
                                    className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-sky-600/10 focus:bg-white transition-all font-bold" 
                                    placeholder="https://drive.google.com/... or https://cloudinary.com/..."
                                    value={form.identityDocument}
                                    onChange={e => setForm({...form, identityDocument: e.target.value})}
                                />
                                <p className="text-xs text-slate-400 ml-2">Upload your ID to Google Drive/Dropbox/Cloudinary and share the link</p>
                            </div>
                            <div className="space-y-4">
                                <label className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Resume/CV URL (Upload to cloud and paste link) *</label>
                                <input 
                                    className="w-full px-6 py-5 bg-slate-50 border-none rounded-[1.5rem] focus:ring-4 focus:ring-sky-600/10 focus:bg-white transition-all font-bold" 
                                    placeholder="https://drive.google.com/... or https://cloudinary.com/..."
                                    value={form.resumeDocument}
                                    onChange={e => setForm({...form, resumeDocument: e.target.value})}
                                />
                                <p className="text-xs text-slate-400 ml-2">Upload your resume to Google Drive/Dropbox/Cloudinary and share the link</p>
                            </div>
                            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200">
                                <p className="text-sm text-amber-700 font-bold">⚠️ Important: Your application will be reviewed by admin after document verification. You cannot login until approved.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Navigation Controls */}
                <div className="mt-12 flex items-center justify-between gap-8 pb-32">
                    {step > 1 ? (
                        <button onClick={() => setStep(step - 1)} className="px-10 py-5 bg-white border-2 border-slate-100 rounded-[1.5rem] font-black text-slate-600 hover:bg-slate-50 hover:border-slate-300 flex items-center gap-3 group transition-all active:scale-95">
                            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" /> Back
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
                        className={`px-16 py-5 rounded-[1.5rem] font-black text-xl transition-all flex items-center gap-4 shadow-2xl ${isStepValid() ? 'bg-sky-600 text-white hover:bg-sky-700 active:scale-95 shadow-sky-600/30' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'}`}
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-4 border-sky-400 border-t-white rounded-full animate-spin" />
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
