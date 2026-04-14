"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
    ChevronRight, 
    ChevronLeft,
    GraduationCap,
    UserCheck,
    Briefcase,
    FileText,
    Rocket,
    MoreHorizontal,
    Check,
    Loader2,
    AlertCircle,
    Upload,
    Video,
    X,
    Play,
    DollarSign,
    Award
} from "lucide-react";

const STATUS_OPTIONS = [
    { id: "college_student", label: "College Student", icon: GraduationCap },
    { id: "recent_grad", label: "Recent Graduate", icon: UserCheck },
    { id: "working_pro", label: "Working Professional", icon: Briefcase },
    { id: "exam_prep", label: "Preparing For Competitive Exams", icon: FileText },
    { id: "freelancer", label: "Freelancer/Entrepreneur", icon: Rocket },
    { id: "other", label: "Other", icon: MoreHorizontal },
];

const DOMAINS = [
    { id: "frontend", label: "Frontend Development", icon: "💻" },
    { id: "backend", label: "Backend Development", icon: "⚙️" },
    { id: "fullstack", label: "Full Stack Development", icon: "🌐" },
    { id: "mobile", label: "Mobile App Development", icon: "📱" },
    { id: "ai_ml", label: "Data Science & Machine Learning", icon: "🤖" },
    { id: "devops", label: "DevOps & Cloud", icon: "☁️" },
    { id: "competitive", label: "Competitive Programming", icon: "🏆" },
    { id: "game", label: "Game Development", icon: "🎮" },
    { id: "blockchain", label: "Blockchain Development", icon: "⛓️" },
    { id: "cybersecurity", label: "Cybersecurity", icon: "🔒" },
];

const TEACHING_STYLES = [
    { id: "practical", label: "Practical / Hands-on", desc: "Learn by doing, building projects together" },
    { id: "theory", label: "Theory / Conceptual", desc: "Deep dive into concepts and fundamentals" },
    { id: "hybrid", label: "Hybrid Approach", desc: "Balance of theory and practical application" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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

export default function ProMentorOnboarding() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>("");
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

    const [formData, setFormData] = useState({
        // Basic Details
        currentStatus: "",
        institutionOrCompany: "",
        location: "",
        domain: "",
        subDomain: "",
        avatar: "",

        // Skills & Experience
        skills: "",
        tools: "",
        experienceMonths: 0,
        experienceYears: 0,

        // Mentorship Style
        teachingStyle: "",
        availabilityDays: [] as string[],
        availabilityTime: "",
        preferredMenteeLevel: "",

        // Advanced Questions
        qWhyMentor: "",
        qProblemSolved: "",
        qGuideBeginners: "",
        qDifference: "",
        qConfidence: 5,
        qHandleDoubts: "",
        qCommStyle: "",
        qAchievement: "",

        // Pro-Mentor Specific
        professionalYears: 2,
        prevMentoringExp: "",
        industryExpertise: "",
        certifications: "",
        expectedPricing: 50,

        // Video
        videoUrl: "",
        videoPublicId: "",

        // Documentation Verification
        identityDocumentType: "",
        identityDocument: "",
        resumeDocument: "",
    });

    useEffect(() => {
        if (status === "loading") return;

        const storedUser = localStorage.getItem("user");
        if (session?.user) {
            setUser(session.user);
        } else if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            router.push("/login/promentor");
        }
    }, [session, status, router]);

    const handleNext = () => {
        if (!isStepValid()) {
            setError("Please fill in all required fields");
            return;
        }
        setError("");
        setStep(prev => Math.min(prev + 1, 7));
    };

    const handlePrev = () => {
        setError("");
        setStep(prev => Math.max(prev - 1, 1));
    };

    const isStepValid = () => {
        switch (step) {
            case 1:
                return formData.currentStatus !== "" && formData.institutionOrCompany !== "" && formData.location !== "";
            case 2:
                return formData.domain !== "" && formData.skills !== "" && formData.tools !== "";
            case 3:
                return formData.teachingStyle !== "" && formData.availabilityDays.length > 0 && formData.availabilityTime !== "";
            case 4:
                return formData.qWhyMentor.length >= 50 && 
                       formData.qProblemSolved.length >= 50 && 
                       formData.qGuideBeginners.length >= 50 &&
                       formData.qDifference.length >= 30;
            case 5:
                return formData.qHandleDoubts.length >= 30 && 
                       formData.qCommStyle.length >= 30 && 
                       formData.qAchievement.length >= 30;
            case 6:
                return formData.professionalYears >= 2 && 
                       formData.expectedPricing > 0 &&
                       formData.videoUrl !== "";
            case 7:
                return formData.identityDocumentType !== "" && 
                       formData.identityDocument !== "" &&
                       formData.resumeDocument !== "";
            default:
                return true;
        }
    };

    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('video/')) {
            setError("Please upload a video file");
            return;
        }
        if (file.size > 100 * 1024 * 1024) {
            setError("Video size should be less than 100MB");
            return;
        }

        setIsUploading(true);
        setUploadProgress(0);
        setError("");

        try {
            const videoUrl = URL.createObjectURL(file);
            
            for (let i = 0; i <= 100; i += 10) {
                await new Promise(resolve => setTimeout(resolve, 200));
                setUploadProgress(i);
            }

            setFormData(prev => ({
                ...prev,
                videoUrl: videoUrl,
                videoPublicId: `video_${Date.now()}`
            }));

            await fetch("/api/promentor/video-upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    videoUrl: videoUrl,
                    publicId: `video_${Date.now()}`
                }),
            });

        } catch (error) {
            setError("Failed to upload video. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const removeVideo = async () => {
        if (formData.videoPublicId) {
            try {
                await fetch(`/api/promentor/video-upload?publicId=${formData.videoPublicId}`, {
                    method: "DELETE"
                });
            } catch (error) {
                console.error("Error removing video:", error);
            }
        }
        setFormData(prev => ({ ...prev, videoUrl: "", videoPublicId: "" }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        console.log("[ProMentor] Starting submission...");

        try {
            const applicationData = {
                ...formData,
                skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
                tools: formData.tools.split(",").map(s => s.trim()).filter(Boolean),
                industryExpertise: formData.industryExpertise.split(",").map(s => s.trim()).filter(Boolean),
                certifications: formData.certifications.split(",").map(s => s.trim()).filter(Boolean),
            };

            console.log("[ProMentor] Sending request to /api/promentor/apply");
            const res = await fetch("/api/promentor/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(applicationData),
            });

            const data = await res.json();

            if (res.ok) {
                console.log("[ProMentor] Response:", { status: res.status, ok: res.ok, data });
                
                // Store application ID in localStorage for success page
                if (data.tempId) {
                    localStorage.setItem("promentor_application_id", data.tempId);
                }
                
                console.log("[ProMentor] Redirecting to success page NOW...");
                // Use window.location for hard redirect
                window.location.href = "/onboarding/promentor/success";
            } else {
                console.error("[ProMentor] API error:", data.message);
                setError(data.message || "Failed to submit application");
            }
        } catch (e) {
            console.error("[ProMentor] Exception:", e);
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const toggleDay = (day: string) => {
        setFormData(prev => ({
            ...prev,
            availabilityDays: prev.availabilityDays.includes(day)
                ? prev.availabilityDays.filter(d => d !== day)
                : [...prev.availabilityDays, day]
        }));
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const maxSize = 2 * 1024 * 1024;
        if (file.size > maxSize) {
            setError("File size must be less than 2MB");
            return;
        }
        if (!file.type.startsWith('image/')) {
            setError("Please upload an image file");
            return;
        }

        setIsUploadingAvatar(true);
        setError("");
        const previewUrl = URL.createObjectURL(file);
        setAvatarPreview(previewUrl);

        try {
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
                setError("Failed to upload image. Please try again.");
                setAvatarPreview("");
            }
        } catch (error) {
            setError("Failed to upload image. Please try again.");
            setAvatarPreview("");
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const removeAvatar = () => {
        setAvatarPreview("");
        setFormData(prev => ({ ...prev, avatar: "" }));
        if (avatarInputRef.current) avatarInputRef.current.value = '';
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-[#E2F5FF] flex flex-col font-sans">
            {/* Top Navigation with Logo */}
            <header className="px-6 py-4 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-50">
                <img src="/logo.jpeg" alt="LetAsk" className="h-10 w-auto object-contain" />
                <button onClick={() => router.push("/")} className="text-sm font-bold text-slate-600 hover:text-slate-900">Exit</button>
            </header>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-white/50 flex">
                <div 
                    className="h-full bg-[#0EA5E9] transition-all duration-500 ease-out"
                    style={{ width: `${(step / 7) * 100}%` }}
                />
            </div>

            <main className="flex-1 flex flex-col items-center p-6 md:p-12 max-w-6xl mx-auto w-full pb-32">
                {/* Header */}
                <div className="w-full text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <Award className="w-8 h-8 text-[#0EA5E9]" />
                        <h1 className="text-3xl md:text-5xl font-black text-[#1E293B] tracking-tight">
                            Pro-Mentor <span className="text-[#0EA5E9]">Onboarding</span>
                        </h1>
                    </div>
                    <p className="text-lg md:text-xl text-slate-600 mt-2 font-medium">
                        Step {step} of 7: {step === 1 ? "Basic Details" : step === 2 ? "Skills & Experience" : step === 3 ? "Mentorship Style" : step === 4 ? "Tell Us About Yourself" : step === 5 ? "Final Questions" : step === 6 ? "Video Submission" : "Documentation"}
                    </p>
                </div>

                {error && (
                    <div className="w-full max-w-3xl mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-600 animate-in fade-in">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium">{error}</span>
                    </div>
                )}

                {/* Step 1: Basic Details */}
                {step === 1 && (
                    <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-4">
                            <label className="text-lg font-bold text-slate-800">What is your current status?</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {STATUS_OPTIONS.map((opt) => {
                                    const Icon = opt.icon;
                                    const isActive = formData.currentStatus === opt.label;
                                    return (
                                        <button
                                            key={opt.id}
                                            onClick={() => setFormData({...formData, currentStatus: opt.label})}
                                            className={`flex flex-col items-center p-6 bg-white rounded-2xl border-2 transition-all ${
                                                isActive ? 'border-[#0EA5E9] bg-[#E2F5FF]/50' : 'border-transparent hover:border-[#0EA5E9]/30'
                                            } shadow-sm`}
                                        >
                                            <Icon className={`w-8 h-8 mb-2 ${isActive ? 'text-[#0EA5E9]' : 'text-slate-400'}`} />
                                            <span className={`text-sm font-semibold text-center ${isActive ? 'text-[#0EA5E9]' : 'text-slate-600'}`}>
                                                {opt.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Profile Photo Upload */}
                        <div className="space-y-3">
                            <label className="text-lg font-bold text-slate-800">Upload a clear profile photo (Optional)</label>
                            <div className="flex items-center gap-6">
                                <div 
                                    onClick={() => avatarInputRef.current?.click()}
                                    className="w-24 h-24 rounded-full bg-white border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 cursor-pointer hover:border-[#0EA5E9] hover:bg-[#E2F5FF]/30 transition-all overflow-hidden"
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
                                        ref={avatarInputRef}
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        className="hidden"
                                    />
                                    <button 
                                        onClick={() => avatarInputRef.current?.click()}
                                        disabled={isUploadingAvatar}
                                        className="text-sm font-bold text-[#0EA5E9] hover:underline disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isUploadingAvatar && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {avatarPreview || formData.avatar ? "Change photo" : "Select a photo"}
                                    </button>
                                    {(avatarPreview || formData.avatar) && (
                                        <button 
                                            onClick={removeAvatar}
                                            className="text-xs text-red-500 hover:underline block"
                                        >
                                            Remove
                                        </button>
                                    )}
                                    <p className="text-xs text-slate-500">Make sure the file is below 2mb</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-lg font-bold text-slate-800">Institution / Company Name</label>
                            <input
                                type="text"
                                value={formData.institutionOrCompany}
                                onChange={(e) => setFormData({...formData, institutionOrCompany: e.target.value})}
                                placeholder="e.g., Google, Microsoft"
                                className="w-full p-4 bg-white rounded-xl border-2 border-slate-200 focus:border-[#0EA5E9] focus:outline-none transition-colors font-medium"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-lg font-bold text-slate-800">Your Location (Country) <span className="text-red-500">*</span></label>
                            <select
                                value={formData.location}
                                onChange={(e) => setFormData({...formData, location: e.target.value})}
                                className="w-full p-4 bg-white rounded-xl border-2 border-slate-200 focus:border-[#0EA5E9] focus:outline-none transition-colors font-medium cursor-pointer appearance-none"
                            >
                                <option value="">Select your country</option>
                                {COUNTRIES.map(country => (
                                    <option key={country} value={country}>{country}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                )}

                {/* Step 2: Skills & Experience */}
                {step === 2 && (
                    <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-4">
                            <label className="text-lg font-bold text-slate-800">Select your domain</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {DOMAINS.map((domain) => {
                                    const isActive = formData.domain === domain.label;
                                    return (
                                        <button
                                            key={domain.id}
                                            onClick={() => setFormData({...formData, domain: domain.label})}
                                            className={`flex items-center gap-3 p-4 bg-white rounded-xl border-2 transition-all text-left ${
                                                isActive ? 'border-[#0EA5E9] bg-[#E2F5FF]/30' : 'border-transparent hover:border-[#0EA5E9]/30'
                                            } shadow-sm`}
                                        >
                                            <span className="text-2xl">{domain.icon}</span>
                                            <span className={`font-semibold text-sm ${isActive ? 'text-[#0EA5E9]' : 'text-slate-700'}`}>
                                                {domain.label}
                                            </span>
                                            {isActive && <Check className="w-5 h-5 text-[#0EA5E9] ml-auto" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-lg font-bold text-slate-800">Skills (comma separated)</label>
                            <input
                                type="text"
                                value={formData.skills}
                                onChange={(e) => setFormData({...formData, skills: e.target.value})}
                                placeholder="e.g., React, Node.js, Python, Machine Learning"
                                className="w-full p-4 bg-white rounded-xl border-2 border-slate-200 focus:border-[#0EA5E9] focus:outline-none transition-colors font-medium"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-lg font-bold text-slate-800">Tools & Technologies</label>
                            <input
                                type="text"
                                value={formData.tools}
                                onChange={(e) => setFormData({...formData, tools: e.target.value})}
                                placeholder="e.g., VS Code, Git, Docker, AWS"
                                className="w-full p-4 bg-white rounded-xl border-2 border-slate-200 focus:border-[#0EA5E9] focus:outline-none transition-colors font-medium"
                            />
                        </div>
                    </div>
                )}

                {/* Step 3: Mentorship Style */}
                {step === 3 && (
                    <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="space-y-4">
                            <label className="text-lg font-bold text-slate-800">Your Teaching Style</label>
                            <div className="space-y-3">
                                {TEACHING_STYLES.map((style) => {
                                    const isActive = formData.teachingStyle === style.id;
                                    return (
                                        <button
                                            key={style.id}
                                            onClick={() => setFormData({...formData, teachingStyle: style.id})}
                                            className={`w-full flex flex-col p-5 bg-white rounded-xl border-2 transition-all text-left ${
                                                isActive ? 'border-[#0EA5E9] bg-[#E2F5FF]/30' : 'border-transparent hover:border-[#0EA5E9]/30'
                                            } shadow-sm`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className={`font-bold text-lg ${isActive ? 'text-[#0EA5E9]' : 'text-slate-800'}`}>
                                                    {style.label}
                                                </span>
                                                {isActive && <Check className="w-6 h-6 text-[#0EA5E9]" />}
                                            </div>
                                            <span className="text-slate-500 text-sm mt-1">{style.desc}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-lg font-bold text-slate-800">Available Days</label>
                            <div className="flex flex-wrap gap-2">
                                {DAYS.map((day) => {
                                    const isActive = formData.availabilityDays.includes(day);
                                    return (
                                        <button
                                            key={day}
                                            onClick={() => toggleDay(day)}
                                            className={`px-4 py-2 rounded-full border-2 font-medium transition-all ${
                                                isActive 
                                                    ? 'border-[#0EA5E9] bg-[#0EA5E9] text-white' 
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#0EA5E9]'
                                            }`}
                                        >
                                            {day}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="space-y-3">
                            <label className="text-lg font-bold text-slate-800">Preferred Time Slots</label>
                            <input
                                type="text"
                                value={formData.availabilityTime}
                                onChange={(e) => setFormData({...formData, availabilityTime: e.target.value})}
                                placeholder="e.g., 6:00 PM - 9:00 PM IST"
                                className="w-full p-4 bg-white rounded-xl border-2 border-slate-200 focus:border-[#0EA5E9] focus:outline-none transition-colors font-medium"
                            />
                        </div>
                    </div>
                )}

                {/* Step 4: Advanced Questions Part 1 */}
                {step === 4 && (
                    <div className="w-full max-w-4xl space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
                            {[
                                { key: "qWhyMentor", label: "1. Why do you want to become a mentor?", min: 50 },
                                { key: "qProblemSolved", label: "2. Describe a real problem you solved in your domain", min: 50 },
                                { key: "qGuideBeginners", label: "3. How will you teach beginners step-by-step?", min: 50 },
                                { key: "qDifference", label: "4. What makes you different from other mentors?", min: 30 },
                            ].map((q) => (
                                <div key={q.key} className="space-y-3">
                                    <label className="text-lg font-bold text-slate-800">
                                        {q.label} <span className="text-red-500">*</span>
                                        <span className="text-sm font-normal text-slate-500 block mt-1">(Min {q.min} characters)</span>
                                    </label>
                                    <textarea
                                        value={(formData as any)[q.key]}
                                        onChange={(e) => setFormData({...formData, [q.key]: e.target.value})}
                                        rows={4}
                                        className="w-full p-4 bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-[#0EA5E9] focus:outline-none transition-colors font-medium resize-none"
                                    />
                                    <span className="text-xs text-slate-400">{(formData as any)[q.key].length} characters</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 5: Advanced Questions Part 2 */}
                {step === 5 && (
                    <div className="w-full max-w-4xl space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
                            <div className="space-y-4">
                                <label className="text-lg font-bold text-slate-800">5. Rate your confidence in mentoring (1-10)</label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={formData.qConfidence}
                                        onChange={(e) => setFormData({...formData, qConfidence: parseInt(e.target.value)})}
                                        className="flex-1 h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0EA5E9]"
                                    />
                                    <span className="text-2xl font-black text-[#0EA5E9] w-12 text-center">{formData.qConfidence}</span>
                                </div>
                            </div>
                            {[
                                { key: "qHandleDoubts", label: "6. How do you handle questions you don't know the answer to?", min: 30 },
                                { key: "qCommStyle", label: "7. Describe your communication style", min: 30 },
                                { key: "qAchievement", label: "8. What is your biggest achievement?", min: 30 },
                            ].map((q) => (
                                <div key={q.key} className="space-y-3">
                                    <label className="text-lg font-bold text-slate-800">
                                        {q.label} <span className="text-red-500">*</span>
                                        <span className="text-sm font-normal text-slate-500 block mt-1">(Min {q.min} characters)</span>
                                    </label>
                                    <textarea
                                        value={(formData as any)[q.key]}
                                        onChange={(e) => setFormData({...formData, [q.key]: e.target.value})}
                                        rows={3}
                                        className="w-full p-4 bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-[#0EA5E9] focus:outline-none transition-colors font-medium resize-none"
                                    />
                                    <span className="text-xs text-slate-400">{(formData as any)[q.key].length} characters</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 6: Pro-Mentor Specific + Video Upload */}
                {step === 6 && (
                    <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-8">
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Award className="w-6 h-6 text-[#0EA5E9]" />
                                    Professional Details
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-lg font-bold text-slate-800">Years of Professional Experience</label>
                                        <input
                                            type="number"
                                            min="2"
                                            value={formData.professionalYears}
                                            onChange={(e) => setFormData({...formData, professionalYears: parseInt(e.target.value) || 2})}
                                            className="w-full p-4 bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-[#0EA5E9] focus:outline-none transition-colors font-medium"
                                        />
                                        <p className="text-sm text-slate-500">Minimum 2 years required for Pro-Mentor</p>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                            <DollarSign className="w-5 h-5" />
                                            Expected Session Price ($)
                                        </label>
                                        <input
                                            type="number"
                                            min="10"
                                            value={formData.expectedPricing}
                                            onChange={(e) => setFormData({...formData, expectedPricing: parseInt(e.target.value) || 50})}
                                            className="w-full p-4 bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-[#0EA5E9] focus:outline-none transition-colors font-medium"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-lg font-bold text-slate-800">Previous Mentoring Experience (Optional)</label>
                                    <textarea
                                        value={formData.prevMentoringExp}
                                        onChange={(e) => setFormData({...formData, prevMentoringExp: e.target.value})}
                                        placeholder="Describe any previous mentoring or teaching experience..."
                                        rows={3}
                                        className="w-full p-4 bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-[#0EA5E9] focus:outline-none transition-colors font-medium resize-none"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-lg font-bold text-slate-800">Industry Expertise (comma separated)</label>
                                    <input
                                        type="text"
                                        value={formData.industryExpertise}
                                        onChange={(e) => setFormData({...formData, industryExpertise: e.target.value})}
                                        placeholder="e.g., FinTech, HealthTech, E-commerce"
                                        className="w-full p-4 bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-[#0EA5E9] focus:outline-none transition-colors font-medium"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-lg font-bold text-slate-800">Certifications (comma separated, optional)</label>
                                    <input
                                        type="text"
                                        value={formData.certifications}
                                        onChange={(e) => setFormData({...formData, certifications: e.target.value})}
                                        placeholder="e.g., AWS Certified, Google Cloud Professional"
                                        className="w-full p-4 bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-[#0EA5E9] focus:outline-none transition-colors font-medium"
                                    />
                                </div>
                            </div>

                            <div className="border-t border-slate-200 pt-8">
                                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
                                    <Video className="w-6 h-6 text-[#0EA5E9]" />
                                    Teaching Video Upload <span className="text-red-500">*</span>
                                </h3>
                                
                                <div className="bg-[#E2F5FF]/50 rounded-2xl p-6">
                                    <p className="text-slate-600 mb-4">
                                        Record a 2-5 minute video explaining a concept in your domain. This helps us evaluate your teaching style and clarity.
                                    </p>
                                    <ul className="list-disc list-inside text-sm text-slate-500 mb-6 space-y-1">
                                        <li>Explain any technical concept clearly</li>
                                        <li>Show your face and speak clearly</li>
                                        <li>Use examples or demonstrations</li>
                                        <li>Keep it between 2-5 minutes</li>
                                        <li>Max file size: 100MB</li>
                                    </ul>

                                    {!formData.videoUrl ? (
                                        <div className="space-y-4">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleVideoUpload}
                                                accept="video/*"
                                                className="hidden"
                                            />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploading}
                                                className="w-full p-8 border-3 border-dashed border-[#0EA5E9] rounded-2xl bg-white hover:bg-[#E2F5FF] transition-colors flex flex-col items-center gap-3"
                                            >
                                                {isUploading ? (
                                                    <>
                                                        <Loader2 className="w-10 h-10 text-[#0EA5E9] animate-spin" />
                                                        <span className="font-semibold text-[#0EA5E9]">Uploading... {uploadProgress}%</span>
                                                        <div className="w-48 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-[#0EA5E9] transition-all"
                                                                style={{ width: `${uploadProgress}%` }}
                                                            />
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="w-10 h-10 text-[#0EA5E9]" />
                                                        <span className="font-semibold text-[#0EA5E9]">Click to upload video</span>
                                                        <span className="text-sm text-slate-500">MP4, MOV, or WebM (max 100MB)</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="relative bg-slate-900 rounded-2xl overflow-hidden">
                                                <video 
                                                    src={formData.videoUrl} 
                                                    controls
                                                    className="w-full max-h-64"
                                                />
                                                <button
                                                    onClick={removeVideo}
                                                    className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <p className="text-green-600 font-medium flex items-center gap-2">
                                                <Check className="w-5 h-5" /> Video uploaded successfully
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 7: Document Verification */}
                {step === 7 && (
                    <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-8">
                            <div className="text-center space-y-4">
                                <h1 className="text-3xl md:text-5xl font-black text-[#1E293B]">Document <span className="text-[#0EA5E9]">Verification</span></h1>
                                <h2 className="text-xl text-slate-500">Required for admin approval (Mandatory)</h2>
                            </div>
                            
                            <div className="space-y-4">
                                <label className="text-lg font-bold text-slate-800">ID Document Type *</label>
                                <select
                                    className="w-full p-4 bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-[#0EA5E9] focus:outline-none transition-colors font-medium"
                                    value={formData.identityDocumentType}
                                    onChange={e => setFormData({...formData, identityDocumentType: e.target.value})}
                                >
                                    <option value="">Select ID Type</option>
                                    <option value="passport">Passport</option>
                                    <option value="driving_license">Driving License</option>
                                    <option value="national_id">National ID Card</option>
                                    <option value="aadhar">Aadhar Card</option>
                                </select>
                            </div>
                            
                            <div className="space-y-4">
                                <label className="text-lg font-bold text-slate-800">ID Document URL (Upload to cloud and paste link) *</label>
                                <input
                                    className="w-full p-4 bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-[#0EA5E9] focus:outline-none transition-colors font-medium"
                                    placeholder="https://drive.google.com/... or https://cloudinary.com/..."
                                    value={formData.identityDocument}
                                    onChange={e => setFormData({...formData, identityDocument: e.target.value})}
                                />
                                <p className="text-sm text-slate-500">Upload your ID to Google Drive/Dropbox/Cloudinary and share the link</p>
                            </div>
                            
                            <div className="space-y-4">
                                <label className="text-lg font-bold text-slate-800">Resume/CV URL (Upload to cloud and paste link) *</label>
                                <input
                                    className="w-full p-4 bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-[#0EA5E9] focus:outline-none transition-colors font-medium"
                                    placeholder="https://drive.google.com/... or https://cloudinary.com/..."
                                    value={formData.resumeDocument}
                                    onChange={e => setFormData({...formData, resumeDocument: e.target.value})}
                                />
                                <p className="text-sm text-slate-500">Upload your resume to Google Drive/Dropbox/Cloudinary and share the link</p>
                            </div>
                            
                            <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200">
                                <p className="text-sm text-amber-700 font-bold flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5" />
                                    Important: Your application will be reviewed by admin after document verification. You cannot login until approved.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation */}
                <div className="fixed bottom-8 left-0 right-0 px-6 md:px-12 flex justify-center gap-4 z-50">
                    {step > 1 && (
                        <button
                            onClick={handlePrev}
                            className="px-8 py-4 bg-white text-slate-700 font-bold rounded-full shadow-lg hover:bg-slate-50 transition-all flex items-center gap-2"
                        >
                            <ChevronLeft className="w-5 h-5" /> Previous
                        </button>
                    )}
                    
                    {step < 7 ? (
                        <button
                            onClick={handleNext}
                            className="px-10 py-4 bg-[#0EA5E9] text-white font-bold rounded-full shadow-lg hover:bg-[#0284c7] transition-all flex items-center gap-2"
                        >
                            Next <ChevronRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading || isUploading}
                            className="px-10 py-4 bg-[#0EA5E9] text-white font-bold rounded-full shadow-lg hover:bg-[#0284c7] transition-all flex items-center gap-2 disabled:opacity-70"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> Submitting...
                                </>
                            ) : (
                                <>
                                    Submit Application <ChevronRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
}
