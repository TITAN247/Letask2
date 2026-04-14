"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
    ChevronRight, 
    ChevronLeft,
    Upload,
    Globe,
    Briefcase,
    Sparkles,
    UserCircle,
    CheckCircle2,
    PenTool,
    X,
    Loader2
} from "lucide-react";
import { useSession } from "next-auth/react";

const FIELDS = [
    { id: "ai", label: "AI & Data" },
    { id: "design", label: "Product Design" },
    { id: "eng", label: "Software Engineering" },
    { id: "product", label: "Product Management" },
    { id: "marketing", label: "Marketing" },
    { id: "business", label: "Business Strategy" },
];

const EXPERIENCE_LEVELS = ["Entry Level", "Mid Level", "Senior Level", "Executive"];

const COUNTRIES = [
    "United States", "United Kingdom", "Canada", "Australia", "Germany", "France", "India", 
    "China", "Japan", "Singapore", "Netherlands", "Sweden", "Switzerland", "Spain", "Italy",
    "Brazil", "Mexico", "Argentina", "South Africa", "Nigeria", "Kenya", "UAE", "Saudi Arabia",
    "Israel", "South Korea", "Indonesia", "Malaysia", "Thailand", "Vietnam", "Philippines",
    "Russia", "Poland", "Ukraine", "Turkey", "Portugal", "Belgium", "Austria", "Denmark",
    "Norway", "Finland", "Ireland", "New Zealand", "Pakistan", "Bangladesh", "Sri Lanka",
    "Nepal", "Egypt", "Morocco", "Ghana", "Ethiopia", "Colombia", "Chile", "Peru",
    "Venezuela", "Ecuador", "Greece", "Czech Republic", "Hungary", "Romania", "Bulgaria"
];

export default function MenteeOnboardingRedesign() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const { data: session, status } = useSession();

    const [formData, setFormData] = useState({
        country: "",
        title: "",
        company: "",
        fieldOfWork: "",
        experienceLevel: "",
        bio: "",
        avatar: "",
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>("");
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [isEnhancingBio, setIsEnhancingBio] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (status === "loading") return;
        const storedUser = localStorage.getItem("user");
        if (session?.user) {
            setUser(session.user);
        } else if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            router.push("/login/mentee");
        }
    }, [session, status, router]);

    const handleNext = () => setStep(prev => Math.min(prev + 1, 4));
    const handlePrev = () => setStep(prev => Math.max(prev - 1, 1));

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const requestData = { 
                userId: user?.id || user?._id, 
                email: user?.email,
                ...formData 
            };
            console.log("[Onboarding] Submitting, avatar exists:", !!requestData.avatar, "length:", requestData.avatar?.length || 0);
            const res = await fetch("/api/auth/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestData)
            });
            if (res.ok) {
                router.push("/dashboard/mentee");
            } else {
                alert("Failed to save onboarding data.");
            }
        } catch (e) {
            alert("Error saving data.");
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (2MB = 2 * 1024 * 1024 bytes)
        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            alert("File size must be less than 2MB");
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert("Please upload an image file");
            return;
        }

        setAvatarFile(file);
        setIsUploadingAvatar(true);

        // Create preview
        const previewUrl = URL.createObjectURL(file);
        setAvatarPreview(previewUrl);

        try {
            // Upload to server
            const formDataUpload = new FormData();
            formDataUpload.append('image', file);

            const res = await fetch('/api/upload/profile-picture', {
                method: 'POST',
                body: formDataUpload,
            });

            if (res.ok) {
                const data = await res.json();
                setFormData(prev => ({ ...prev, avatar: data.url }));
                setAvatarPreview("");
            } else {
                alert("Failed to upload image. Please try again.");
                setAvatarPreview("");
            }
        } catch (error) {
            console.error("Upload error:", error);
            alert("Failed to upload image. Please try again.");
            setAvatarPreview("");
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const removeAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview("");
        setFormData(prev => ({ ...prev, avatar: "" }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    if (!user) return null;

    const isStepValid = () => {
        if (step === 1) return formData.country !== "";
        if (step === 2) return formData.title !== "" && formData.company !== "";
        if (step === 3) return formData.fieldOfWork !== "" && formData.experienceLevel !== "";
        return formData.bio !== "";
    };

    // Helper function to generate enhanced bio locally
    const generateEnhancedBio = (data: typeof formData) => {
        const { title, company, fieldOfWork, experienceLevel, bio } = data;
        const intros = [
            "Passionate about creating impactful solutions,",
            "Driven by curiosity and a love for innovation,",
            "With a strong focus on delivering excellence,",
            "Combining creativity with technical expertise,",
            "Committed to continuous growth and learning,"
        ];
        const intro = intros[Math.floor(Math.random() * intros.length)];
        
        let enhanced = bio ? bio + "\n\n" : "";
        
        if (title && company) {
            enhanced += `${intro} I work as a ${title.toLowerCase()} at ${company}. `;
        } else if (title) {
            enhanced += `${intro} I am a ${title.toLowerCase()}. `;
        }
        
        if (fieldOfWork) {
            const fields: Record<string, string> = {
                "AI & Data": "leveraging data and AI to solve complex problems",
                "Product Design": "crafting user-centered designs that make a difference",
                "Software Engineering": "building robust and scalable software solutions",
                "Product Management": "leading product strategy and execution",
                "Marketing": "creating compelling stories that connect with audiences",
                "Business Strategy": "developing strategies that drive business growth"
            };
            enhanced += `My expertise lies in ${fieldOfWork.toLowerCase()}, ${fields[fieldOfWork] || "delivering impactful results"}. `;
        }
        
        if (experienceLevel) {
            const expTexts: Record<string, string> = {
                "Entry Level": "I'm eager to learn and grow in my field, bringing fresh perspectives and enthusiasm.",
                "Mid Level": "With solid experience under my belt, I'm ready to tackle challenging projects and mentor others.",
                "Senior Level": "My years of experience have equipped me with deep insights and leadership capabilities.",
                "Executive": "I bring strategic vision and extensive experience to drive organizational success."
            };
            enhanced += expTexts[experienceLevel] || "";
        }
        
        enhanced += " I'm always excited to connect with like-minded professionals and explore new opportunities for collaboration and growth.";
        
        return enhanced.slice(0, 1300);
    };

    const progressValue = (step / 4) * 100;

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans">
            {/* Top Navigation */}
            <header className="px-8 py-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-50">
                <div className="flex items-center gap-2">
                    <img src="/logo.jpeg" alt="LetAsk" className="h-10 w-auto object-contain" />
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500 font-medium">Have an account?</span>
                    <button onClick={() => router.push("/login/mentee")} className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Log in</button>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="w-full h-1 bg-slate-50 relative">
                <div 
                    className="h-full bg-indigo-600 transition-all duration-500 ease-in-out"
                    style={{ width: `${progressValue}%` }}
                />
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Left Side: Form Steps */}
                <div className="flex-1 overflow-y-auto px-8 py-16 md:px-24 flex flex-col items-center">
                    <div className="w-full max-w-md">
                        {/* Step 1: Profile & Country */}
                        {step === 1 && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="space-y-4">
                                    <h1 className="text-3xl font-black text-slate-900">Welcome! You're about to set up your new profile.</h1>
                                    <p className="text-slate-500 font-medium">This is how other members will see you on LetAsk.</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-700">Upload a clear profile photo (Optional)</label>
                                        <div className="flex items-center gap-6">
                                            <div 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-400 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all overflow-hidden"
                                            >
                                                {avatarPreview ? (
                                                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                                                ) : formData.avatar ? (
                                                    <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Upload className="w-8 h-8" />
                                                )}
                                            </div>
                                            <div className="space-y-1">
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    accept="image/*"
                                                    onChange={handleAvatarUpload}
                                                    className="hidden"
                                                />
                                                <button 
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={isUploadingAvatar}
                                                    className="text-sm font-bold text-indigo-600 hover:underline disabled:opacity-50"
                                                >
                                                    {isUploadingAvatar ? (
                                                        <span className="flex items-center gap-2">
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                            Uploading...
                                                        </span>
                                                    ) : (
                                                        avatarPreview || formData.avatar ? "Change photo" : "Select a photo"
                                                    )}
                                                </button>
                                                {(avatarPreview || formData.avatar) && (
                                                    <button 
                                                        onClick={removeAvatar}
                                                        className="text-xs text-red-500 hover:underline block"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                                <p className="text-xs text-slate-400">Make sure the file is below 2mb</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                            Which country do you live in? <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <select 
                                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all font-medium appearance-none cursor-pointer"
                                                value={formData.country} 
                                                onChange={e => setFormData({...formData, country: e.target.value})}
                                            >
                                                <option value="">Select your country</option>
                                                {COUNTRIES.map(country => (
                                                    <option key={country} value={country}>{country}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 2: Role Details */}
                        {step === 2 && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="space-y-4">
                                    <h1 className="text-3xl font-black text-slate-900">What do you do as a professional?</h1>
                                    <p className="text-slate-500 font-medium">Tell us about your current title and workplace.</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-700">Your title <span className="text-rose-500">*</span></label>
                                        <input 
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all font-medium"
                                            placeholder="e.g. Student, Software Engineer"
                                            value={formData.title} 
                                            onChange={e => setFormData({...formData, title: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-700">Company/School <span className="text-rose-500">*</span></label>
                                        <input 
                                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all font-medium"
                                            placeholder="e.g. Harvard University, Google"
                                            value={formData.company} 
                                            onChange={e => setFormData({...formData, company: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Superpower */}
                        {step === 3 && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="space-y-4">
                                    <h1 className="text-3xl font-black text-slate-900">Awesome, what's your super power like?</h1>
                                    <p className="text-slate-500 font-medium">Help us understand your skills and experience level.</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-700">What is your field of work? (Max 5) <span className="text-rose-500">*</span></label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {FIELDS.map((f) => (
                                                <button 
                                                    key={f.id}
                                                    onClick={() => setFormData({...formData, fieldOfWork: f.label})}
                                                    className={`p-3 rounded-lg border text-sm font-bold transition-all ${formData.fieldOfWork === f.label ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                                                >
                                                    {f.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-sm font-bold text-slate-700">Level of experience? <span className="text-rose-500">*</span></label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {EXPERIENCE_LEVELS.map((lvl) => (
                                                <button 
                                                    key={lvl}
                                                    onClick={() => setFormData({...formData, experienceLevel: lvl})}
                                                    className={`p-3 rounded-lg border text-sm font-bold transition-all ${formData.experienceLevel === lvl ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300'}`}
                                                >
                                                    {lvl}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Bio */}
                        {step === 4 && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="space-y-4">
                                    <h1 className="text-3xl font-black text-slate-900">Everyone has a story, what's yours? <span className="text-rose-500">*</span></h1>
                                    <p className="text-slate-500 font-medium">Write a short bio that highlights your passion and goals.</p>
                                </div>
                                <div className="space-y-6">
                                    <div className="relative">
                                        <textarea 
                                            className="w-full p-6 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-600/5 focus:border-indigo-600 outline-none transition-all font-medium text-slate-700 h-40 resize-none"
                                            placeholder="I am a product designer who loves building things..."
                                            value={formData.bio} 
                                            onChange={e => setFormData({...formData, bio: e.target.value})}
                                        />
                                        <div className="absolute bottom-4 right-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                            {formData.bio.length} / 1300
                                        </div>
                                    </div>
                                    <button 
                                        onClick={async () => {
                                            if (!formData.bio && !formData.title && !formData.fieldOfWork) {
                                                alert("Please enter some information about yourself first!");
                                                return;
                                            }
                                            setIsEnhancingBio(true);
                                            try {
                                                const response = await fetch('/api/ai/enhance-bio', {
                                                    method: 'POST',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        bio: formData.bio,
                                                        title: formData.title,
                                                        company: formData.company,
                                                        fieldOfWork: formData.fieldOfWork,
                                                        experienceLevel: formData.experienceLevel
                                                    })
                                                });
                                                if (response.ok) {
                                                    const data = await response.json();
                                                    setFormData(prev => ({ ...prev, bio: data.enhancedBio }));
                                                } else {
                                                    // Fallback: generate locally if API fails
                                                    const enhancedBio = generateEnhancedBio(formData);
                                                    setFormData(prev => ({ ...prev, bio: enhancedBio }));
                                                }
                                            } catch (error) {
                                                const enhancedBio = generateEnhancedBio(formData);
                                                setFormData(prev => ({ ...prev, bio: enhancedBio }));
                                            } finally {
                                                setIsEnhancingBio(false);
                                            }
                                        }}
                                        disabled={isEnhancingBio}
                                        className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:underline disabled:opacity-50"
                                    >
                                        {isEnhancingBio ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" /> Enhancing...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-4 h-4" /> Enhance Bio with AI
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Navigation Buttons */}
                        <div className="mt-12 flex flex-col gap-4">
                            <button 
                                onClick={step === 4 ? handleSubmit : handleNext}
                                disabled={!isStepValid() || loading}
                                className={`w-full py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-600/10 ${isStepValid() ? 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                            >
                                {loading ? "Saving Profile..." : step === 4 ? "I'm all set! 🚀" : "Continue"}
                                {step < 4 && <span className="text-xs block font-medium opacity-60 mt-1">press "Enter" to continue</span>}
                            </button>
                            {step > 1 && (
                                <button 
                                    onClick={handlePrev}
                                    className="flex items-center justify-center gap-2 text-slate-400 font-bold text-sm hover:text-slate-600 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Back
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side: Profile Preview (Sticky) */}
                <div className="hidden lg:flex w-[500px] bg-slate-50/80 border-l border-slate-100 items-center justify-center p-12">
                    <div className="w-full max-w-sm bg-white rounded-[2.5rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] overflow-hidden animate-in zoom-in-95 duration-700 border border-slate-100">
                        {/* Preview Cover */}
                        <div className="h-32 bg-indigo-50 relative">
                             <div className="absolute -bottom-10 left-8">
                                <div className="w-24 h-24 rounded-full bg-white p-1 shadow-md border border-slate-50">
                                    <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                                        {formData.avatar ? <img src={formData.avatar} className="w-full h-full rounded-full object-cover" /> : <UserCircle className="w-12 h-12" />}
                                    </div>
                                </div>
                             </div>
                        </div>
                        {/* Preview Content */}
                        <div className="pt-14 px-8 pb-8 space-y-6">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black text-slate-900 tracking-tight">{user.name || "Your Name"}</h2>
                                <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                                    <Globe className="w-3.5 h-3.5" /> {formData.country || "Your Country"}
                                </div>
                                <p className="text-sm font-bold text-slate-400 leading-snug">
                                    {formData.title ? formData.title : "Your Professional Title"} 
                                    {formData.company ? ` @ ${formData.company}` : " @ Current Company"}
                                </p>
                            </div>

                            <div className="flex gap-4 border-b border-slate-50 pb-2">
                                <span className="text-xs font-black text-indigo-600 border-b-2 border-indigo-600 pb-2">Overview</span>
                                <span className="text-xs font-bold text-slate-400 pb-2 cursor-not-allowed">My mentors</span>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[13px] text-slate-600 font-medium leading-relaxed line-clamp-3">
                                    {formData.bio || "Your inspiring story will show up here. Tell people what drives you and what you're looking for in a mentor."}
                                </p>
                                <div className="flex gap-1.5 flex-wrap">
                                    {[formData.fieldOfWork, formData.experienceLevel].filter(Boolean).map(tag => (
                                        <span key={tag} className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black rounded-full border border-slate-100 capitalize">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
