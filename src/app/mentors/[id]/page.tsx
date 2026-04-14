import dbConnect from "@/lib/db";
import User from "@/models/User";
import UpgradeApplication from "@/models/UpgradeApplication";
import { getUserFromSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Star, MapPin, Briefcase, GraduationCap, CheckCircle2 } from "lucide-react";
import BookingPanel from "./BookingPanel";

export default async function MentorProfilePage({ params }: { params: { id: string } }) {
    await dbConnect();

    // Reconstruct params based on Next.js 15
    const id = (await params).id; 
    
    let mentorUser: any = null;
    let mentorApp: any = null;

    // Fetch the Mentor Core Profile
    mentorUser = await User.findById(id).lean();
    if (!mentorUser || !['prementor', 'promentor'].includes(mentorUser.role as string)) {
        return notFound();
    }

    // Fetch their extensive Verification Application Data to hydrate the profile
    mentorApp = await UpgradeApplication.findOne({ userId: id, status: 'approved' }).lean();

    const roleLabel = mentorUser.role === 'promentor' ? 'Pro-Mentor' : 'Pre-Mentor';
    const rate = mentorUser.role === 'promentor' ? '$125/session' : 'Free Session';

    const sessionUser = await getUserFromSession();
    const canBook = sessionUser && (sessionUser as any).id !== id;

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-sans">
            {/* Header Blur */}
            <div className="h-64 bg-slate-900 w-full absolute top-0 left-0 z-0 overflow-hidden">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/30 blur-[100px] rounded-full pointer-events-none"></div>
            </div>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 pt-24 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left: Mentor Details */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* Core Identity */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex flex-col md:flex-row gap-8 items-start">
                            <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-br from-indigo-100 to-purple-50 text-indigo-600 flex items-center justify-center font-black text-5xl shadow-inner border border-white shrink-0">
                                {mentorUser.name?.[0] || 'M'}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-extrabold text-slate-800">{mentorUser.name}</h1>
                                    {mentorApp && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                                </div>
                                <h2 className="text-lg font-semibold text-indigo-600 flex items-center gap-2">
                                    {mentorApp?.domain || mentorApp?.currentStatus || 'Industry Expert'}
                                    <span className="text-xs px-2 py-0.5 bg-indigo-50 rounded-md text-indigo-700 uppercase tracking-widest">{roleLabel}</span>
                                </h2>
                                
                                <div className="flex flex-wrap gap-4 mt-4 text-sm font-medium text-slate-500">
                                    {mentorApp?.location && <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {mentorApp.location}</div>}
                                    {mentorApp?.experienceYears && <div className="flex items-center gap-1.5"><Briefcase className="w-4 h-4" /> {mentorApp.experienceYears} Years Exp.</div>}
                                    {mentorApp?.institution && <div className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4" /> {mentorApp.institution}</div>}
                                </div>
                            </div>
                        </div>

                        {/* About / Quals */}
                        {mentorApp && (
                            <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">About & Expertise</h3>
                                
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Technical Skills</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {mentorApp.skills?.map((skill: string, idx: number) => (
                                                <span key={`skill-${idx}`} className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg shadow-sm">
                                                    {skill}
                                                </span>
                                            ))}
                                            {(!mentorApp.skills || mentorApp.skills.length === 0) && <span className="text-sm text-slate-400">Expertise not listed</span>}
                                        </div>
                                    </div>

                                    {mentorApp.qGuideBeginners && (
                                        <div>
                                            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Mentorship Style</h4>
                                            <p className="text-slate-600 leading-relaxed text-[15px]">{mentorApp.qGuideBeginners}</p>
                                        </div>
                                    )}

                                    {mentorApp.qProblemSolved && (
                                        <div>
                                            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-2">Experience Highlights</h4>
                                            <p className="text-slate-600 leading-relaxed text-[15px]">{mentorApp.qProblemSolved}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right: Booking Interface */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-6">
                            <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-slate-100">
                                
                                <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-100">
                                    <div className="flex flex-col">
                                        <span className="text-3xl font-black text-slate-800">{rate}</span>
                                        <span className="text-sm text-slate-400 font-medium mt-1">100% money back guarantee</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                                        <span className="font-bold text-slate-800 text-lg">5.0</span>
                                    </div>
                                </div>

                                {canBook ? (
                                    <BookingPanel mentorId={id} mentorName={mentorUser.name || 'Mentor'} userRole={(sessionUser as any)?.role} />
                                ) : (
                                    <div className="text-center py-10 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                        {sessionUser ? (
                                            <p className="text-slate-500 font-medium">You cannot book a session with yourself.</p>
                                        ) : (
                                            <p className="text-slate-500 font-medium">Please <a href="/login/mentee" className="text-indigo-600 hover:underline">login</a> to book sessions.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
