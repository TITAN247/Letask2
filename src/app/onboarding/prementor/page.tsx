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
    X
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
const MENTEE_LEVELS = [
    { id: "beginner", label: "Beginners" },
    { id: "intermediate", label: "Intermediate" },
    { id: "advanced", label: "Advanced" },
    { id: "all", label: "All Levels" },
];

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

export default function PreMentorOnboarding() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [error, setError] = useState("");

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

        // Documentation Verification
        identityDocumentType: "",
        identityDocument: "",
        resumeDocument: "",
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>("");
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (status === "loading") return;

        const storedUser = localStorage.getItem("user");
        if (session?.user) {
            setUser(session.user);
        } else if (storedUser) {
            setUser(JSON.parse(storedUser));
        } else {
            router.push("/login/prementor");
        }
    }, [session, status, router]);

    const handleNext = () => {
        if (!isStepValid()) {
            setError("Please fill in all required fields");
            return;
        }
        setError("");
        setStep(prev => Math.min(prev + 1, 6));
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
                return formData.teachingStyle !== "" && formData.availabilityDays.length > 0 && formData.availabilityTime !== "" && formData.preferredMenteeLevel !== "";
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
                return formData.identityDocumentType !== "" && 
                       formData.identityDocument !== "" &&
                       formData.resumeDocument !== "";
            default:
                return true;
        }
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setError("");
        
        console.log("[PreMentor] Starting submission...");

        try {
            // Prepare data
            const applicationData = {
                ...formData,
                skills: formData.skills.split(",").map(s => s.trim()).filter(Boolean),
                tools: formData.tools.split(",").map(s => s.trim()).filter(Boolean),
            };

            console.log("[PreMentor] Sending request to /api/prementor/apply");
            const res = await fetch("/api/prementor/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(applicationData),
            });

            const data = await res.json();
            console.log("[PreMentor] Response:", { status: res.status, ok: res.ok, data });

            if (res.ok) {
                // Store application ID for mock test
                localStorage.setItem("prementor_application_id", data.application._id);
                localStorage.setItem("prementor_domain", formData.domain);
                
                console.log("[PreMentor] Redirecting to mock test NOW...");
                // Use window.location for hard redirect
                window.location.href = "/onboarding/prementor/mock-test";
            } else {
                console.error("[PreMentor] API error:", data.message);
                setError(data.message || "Failed to submit application");
            }
        } catch (e) {
            console.error("[PreMentor] Exception:", e);
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

        setAvatarFile(file);
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
        setAvatarFile(null);
        setAvatarPreview("");
        setFormData(prev => ({ ...prev, avatar: "" }));
        if (fileInputRef.current) fileInputRef.current.value = '';
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
                    style={{ width: `${(step / 6) * 100}%` }}
                />
            </div>

            <main className="flex-1 flex flex-col items-center p-6 md:p-12 max-w-6xl mx-auto w-full">
                {/* Header */}
                <div className="w-full text-center mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                    <h1 className="text-3xl md:text-5xl font-black text-[#1E293B] tracking-tight">
                        Pre-Mentor <span className="text-[#0EA5E9]">Onboarding</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 mt-2 font-medium">
                        Step {step} of 6: {step === 1 ? "Basic Details" : step === 2 ? "Skills & Experience" : step === 3 ? "Mentorship Style" : step === 4 ? "Tell Us About Yourself" : step === 5 ? "Final Questions" : "Documentation"}
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
                        {/* Current Status */}
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
                                    onClick={() => fileInputRef.current?.click()}
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
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        className="hidden"
                                    />
                                    <button 
                                        onClick={() => fileInputRef.current?.click()}
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

                        {/* Institution/Company */}
                        <div className="space-y-3">
                            <label className="text-lg font-bold text-slate-800">Institution / Company Name</label>
                            <input
                                type="text"
                                value={formData.institutionOrCompany}
                                onChange={(e) => setFormData({...formData, institutionOrCompany: e.target.value})}
                                placeholder="e.g., Harvard University, Google"
                                className="w-full p-4 bg-white rounded-xl border-2 border-slate-200 focus:border-[#0EA5E9] focus:outline-none transition-colors font-medium"
                            />
                        </div>

                        {/* Location */}
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
                        {/* Domain Selection */}
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

                        {/* Skills */}
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

                        {/* Tools */}
                        <div className="space-y-3">
                            <label className="text-lg font-bold text-slate-800">Tools & Technologies (comma separated)</label>
                            <input
                                type="text"
                                value={formData.tools}
                                onChange={(e) => setFormData({...formData, tools: e.target.value})}
                                placeholder="e.g., VS Code, Git, Docker, AWS, Figma"
                                className="w-full p-4 bg-white rounded-xl border-2 border-slate-200 focus:border-[#0EA5E9] focus:outline-none transition-colors font-medium"
                            />
                        </div>

                        {/* Experience */}
                        <div className="space-y-4">
                            <label className="text-lg font-bold text-slate-800">Experience</label>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.experienceYears}
                                        onChange={(e) => setFormData({...formData, experienceYears: parseInt(e.target.value) || 0})}
                                        className="w-full p-4 bg-white rounded-xl border-2 border-slate-200 focus:border-[#0EA5E9] focus:outline-none transition-colors font-medium"
                                    />
                                    <span className="text-sm text-slate-500 mt-1 block">Years</span>
                                </div>
                                <div className="flex-1">
                                    <input
                                        type="number"
                                        min="0"
                                        max="11"
                                        value={formData.experienceMonths}
                                        onChange={(e) => setFormData({...formData, experienceMonths: parseInt(e.target.value) || 0})}
                                        className="w-full p-4 bg-white rounded-xl border-2 border-slate-200 focus:border-[#0EA5E9] focus:outline-none transition-colors font-medium"
                                    />
                                    <span className="text-sm text-slate-500 mt-1 block">Months</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Mentorship Style */}
                {step === 3 && (
                    <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        {/* Teaching Style */}
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

                        {/* Availability Days */}
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

                        {/* Availability Time */}
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

                        {/* Preferred Mentee Level */}
                        <div className="space-y-4">
                            <label className="text-lg font-bold text-slate-800">Preferred Mentee Level</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {MENTEE_LEVELS.map((level) => {
                                    const isActive = formData.preferredMenteeLevel === level.id;
                                    return (
                                        <button
                                            key={level.id}
                                            onClick={() => setFormData({...formData, preferredMenteeLevel: level.id})}
                                            className={`p-4 bg-white rounded-xl border-2 transition-all text-center ${
                                                isActive ? 'border-[#0EA5E9] bg-[#E2F5FF]/30' : 'border-transparent hover:border-[#0EA5E9]/30'
                                            } shadow-sm`}
                                        >
                                            <span className={`font-semibold ${isActive ? 'text-[#0EA5E9]' : 'text-slate-700'}`}>
                                                {level.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Advanced Questions Part 1 */}
                {step === 4 && (
                    <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-8">
                            {/* Q1: Why Mentor */}
                            <div className="space-y-3">
                                <label className="text-lg font-bold text-slate-800">
                                    1. Why do you want to become a mentor? <span className="text-red-500">*</span>
                                    <span className="text-sm font-normal text-slate-500 block mt-1">(Min 50 characters)</span>
                                </label>
                                <textarea
                                    value={formData.qWhyMentor}
                                    onChange={(e) => setFormData({...formData, qWhyMentor: e.target.value})}
                                    placeholder="Share your motivation for becoming a mentor..."
                                    rows={4}
                                    className="w-full p-4 bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-[#0EA5E9] focus:outline-none transition-colors font-medium resize-none"
                                />
                                <span className="text-xs text-slate-400">{formData.qWhyMentor.length} characters</span>
                            </div>

                            {/* Q2: Problem Solved */}
                            <div className="space-y-3">
                                <label className="text-lg font-bold text-slate-800">
                                    2. Describe a real problem you solved in your domain <span className="text-red-500">*</span>
                                    <span className="text-sm font-normal text-slate-500 block mt-1">(Min 50 characters)</span>
                                </label>
                                <textarea
                                    value={formData.qProblemSolved}
                                    onChange={(e) => setFormData({...formData, qProblemSolved: e.target.value})}
                                    placeholder="Describe a challenging problem and how you solved it..."
                                    rows={4}
                                    className="w-full p-4 bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-[#0EA5E9] focus:outline-none transition-colors font-medium resize-none"
                                />
                                <span className="text-xs text-slate-400">{formData.qProblemSolved.length} characters</span>
                            </div>

                            {/* Q3: Guide Beginners */}
                            <div className="space-y-3">
                                <label className="text-lg font-bold text-slate-800">
                                    3. How will you teach beginners step-by-step? <span className="text-red-500">*</span>
                                    <span className="text-sm font-normal text-slate-500 block mt-1">(Min 50 characters)</span>
                                </label>
                                <textarea
                                    value={formData.qGuideBeginners}
                                    onChange={(e) => setFormData({...formData, qGuideBeginners: e.target.value})}
                                    placeholder="Explain your approach to teaching complete beginners..."
                                    rows={4}
                                    className="w-full p-4 bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-[#0EA5E9] focus:outline-none transition-colors font-medium resize-none"
                                />
                                <span className="text-xs text-slate-400">{formData.qGuideBeginners.length} characters</span>
                            </div>

                            {/* Q4: Difference */}
                            <div className="space-y-3">
                                <label className="text-lg font-bold text-slate-800">
                                    4. What makes you different from other mentors? <span className="text-red-500">*</span>
                                    <span className="text-sm font-normal text-slate-500 block mt-1">(Min 30 characters)</span>
                                </label>
                                <textarea
                                    value={formData.qDifference}
                                    onChange={(e) => setFormData({...formData, qDifference: e.target.value})}
                                    placeholder="What unique qualities do you bring?..."
                                    rows={3}
                                    className="w-full p-4 bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-[#0EA5E9] focus:outline-none transition-colors font-medium resize-none"
                                />
                                <span className="text-xs text-slate-400">{formData.qDifference.length} characters</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 5: Advanced Questions Part 2 */}
                {step === 5 && (
                    <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-white p-6 rounded-2xl shadow-sm space-y-8">
                            {/* Q5: Confidence */}
                            <div className="space-y-4">
                                <label className="text-lg font-bold text-slate-800">
                                    5. Rate your confidence in mentoring (1-10) <span className="text-red-500">*</span>
                                </label>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={formData.qConfidence}
                                        onChange={(e) => setFormData({...formData, qConfidence: parseInt(e.target.value)})}
                                        className="flex-1 h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0EA5E9]"
                                    />
                                    <span className="text-2xl font-black text-[#0EA5E9] w-12 text-center">
                                        {formData.qConfidence}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Not confident</span>
                                    <span>Very confident</span>
                                </div>
                            </div>

                            {/* Q6: Handle Doubts */}
                            <div className="space-y-3">
                                <label className="text-lg font-bold text-slate-800">
                                    6. How do you handle questions you don't know the answer to? <span className="text-red-500">*</span>
                                    <span className="text-sm font-normal text-slate-500 block mt-1">(Min 30 characters)</span>
                                </label>
                                <textarea
                                    value={formData.qHandleDoubts}
                                    onChange={(e) => setFormData({...formData, qHandleDoubts: e.target.value})}
                                    placeholder="Describe your approach when faced with unknown questions..."
                                    rows={3}
                                    className="w-full p-4 bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-[#0EA5E9] focus:outline-none transition-colors font-medium resize-none"
                                />
                                <span className="text-xs text-slate-400">{formData.qHandleDoubts.length} characters</span>
                            </div>

                            {/* Q7: Communication Style */}
                            <div className="space-y-3">
                                <label className="text-lg font-bold text-slate-800">
                                    7. Describe your communication style <span className="text-red-500">*</span>
                                    <span className="text-sm font-normal text-slate-500 block mt-1">(Min 30 characters)</span>
                                </label>
                                <textarea
                                    value={formData.qCommStyle}
                                    onChange={(e) => setFormData({...formData, qCommStyle: e.target.value})}
                                    placeholder="How do you communicate complex ideas simply?..."
                                    rows={3}
                                    className="w-full p-4 bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-[#0EA5E9] focus:outline-none transition-colors font-medium resize-none"
                                />
                                <span className="text-xs text-slate-400">{formData.qCommStyle.length} characters</span>
                            </div>

                            {/* Q8: Achievement */}
                            <div className="space-y-3">
                                <label className="text-lg font-bold text-slate-800">
                                    8. What is your biggest achievement? <span className="text-red-500">*</span>
                                    <span className="text-sm font-normal text-slate-500 block mt-1">(Min 30 characters)</span>
                                </label>
                                <textarea
                                    value={formData.qAchievement}
                                    onChange={(e) => setFormData({...formData, qAchievement: e.target.value})}
                                    placeholder="Share a significant achievement you're proud of..."
                                    rows={3}
                                    className="w-full p-4 bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-[#0EA5E9] focus:outline-none transition-colors font-medium resize-none"
                                />
                                <span className="text-xs text-slate-400">{formData.qAchievement.length} characters</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 6: Document Verification */}
                {step === 6 && (
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
                <div className="fixed bottom-8 left-0 right-0 px-6 md:px-12 flex justify-center gap-4">
                    {step > 1 && (
                        <button
                            onClick={handlePrev}
                            className="px-8 py-4 bg-white text-slate-700 font-bold rounded-full shadow-lg hover:bg-slate-50 transition-all flex items-center gap-2"
                        >
                            <ChevronLeft className="w-5 h-5" /> Previous
                        </button>
                    )}
                    
                    {step < 6 ? (
                        <button
                            onClick={handleNext}
                            className="px-10 py-4 bg-[#0EA5E9] text-white font-bold rounded-full shadow-lg hover:bg-[#0284c7] transition-all flex items-center gap-2"
                        >
                            Next <ChevronRight className="w-5 h-5" />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
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
