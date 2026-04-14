"use client";

import { useState } from "react";
import { CheckCircle, XCircle, FileText, UserCircle, PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AdminClient({ pendingApps, historicalApps }: { pendingApps: any[], historicalApps: any[] }) {
    const [selectedApp, setSelectedApp] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleDecision = async (id: string, decision: 'approved' | 'rejected') => {
        if (!confirm(`Are you sure you want to ${decision} this application?`)) return;
        
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/applications/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status: decision, adminNotes: `Admin ${decision} on ${new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}` })
            });

            if (res.ok) {
                alert(`Application ${decision}! An email has been sent to the user.`);
                setSelectedApp(null);
                router.refresh(); // Refresh server component data
            } else {
                alert("Action failed.");
            }
        } catch (e) {
            alert("Error connecting to server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left: Application List */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                    <h2 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                        Pending Reviews
                        <span className="bg-indigo-100 text-indigo-700 text-xs py-1 px-2 rounded-full">{pendingApps.length}</span>
                    </h2>
                    
                    <div className="space-y-3">
                        {pendingApps.length === 0 && (
                            <div className="text-sm text-slate-400 py-4 text-center">No pending applications</div>
                        )}
                        {pendingApps.map(app => (
                            <button 
                                key={app._id} 
                                onClick={() => setSelectedApp(app)}
                                className={`w-full text-left p-4 rounded-xl border transition-all ${selectedApp?._id === app._id ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-slate-100 hover:border-slate-300 bg-slate-50'}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold text-slate-800">{app.userId?.name || 'Unknown User'}</h3>
                                    <span className={`text-[10px] font-bold uppercase py-0.5 px-2 rounded-full ${app.targetRole === 'prementor' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>
                                        {app.targetRole}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 truncate">{app.userId?.email}</p>
                                <p className="text-xs text-slate-400 mt-2">Applied: {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* History */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 opacity-75">
                    <h2 className="font-bold text-slate-800 mb-4">Recent Decisions</h2>
                    <div className="space-y-3">
                        {historicalApps.map(app => (
                            <div key={app._id} className="flex justify-between items-center p-3 text-sm border-b border-slate-50 last:border-0">
                                <div>
                                    <span className="font-semibold text-slate-700 block">{app.userId?.name}</span>
                                    <span className="text-xs text-slate-400">{app.targetRole}</span>
                                </div>
                                <span className={`text-xs font-bold ${app.status === 'approved' ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {app.status.toUpperCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Detail View */}
            <div className="lg:col-span-2">
                {selectedApp ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-in fade-in slide-in-from-right-4">
                        <div className="flex justify-between items-start border-b border-slate-100 pb-6 mb-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
                                    <UserCircle className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-800">{selectedApp.userId?.name}</h2>
                                    <p className="text-slate-500">{selectedApp.userId?.email}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="block text-sm font-semibold text-slate-500 mb-1">Target Role</span>
                                <span className={`inline-block text-xs font-bold uppercase py-1 px-3 rounded-full ${selectedApp.targetRole === 'prementor' ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-purple-700'}`}>
                                    {selectedApp.targetRole}
                                </span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Professional Profile</h3>
                                    <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                                        <div className="flex justify-between"><span className="text-sm text-slate-500">Status</span><span className="text-sm font-semibold text-slate-800">{selectedApp.currentStatus || '-'}</span></div>
                                        <div className="flex justify-between"><span className="text-sm text-slate-500">Institution</span><span className="text-sm font-semibold text-slate-800 truncate max-w-[150px]">{selectedApp.institution || '-'}</span></div>
                                        <div className="flex justify-between"><span className="text-sm text-slate-500">Location</span><span className="text-sm font-semibold text-slate-800">{selectedApp.location || '-'}</span></div>
                                        <div className="flex justify-between"><span className="text-sm text-slate-500">Domain</span><span className="text-sm font-semibold text-slate-800">{selectedApp.subDomain || selectedApp.domain || '-'}</span></div>
                                        <div className="flex justify-between"><span className="text-sm text-slate-500">Experience</span><span className="text-sm font-semibold text-slate-800 truncate max-w-[150px]">{selectedApp.experienceLevel || `${selectedApp.experienceYears || 0} Yrs`}</span></div>
                                        <div className="flex justify-between"><span className="text-sm text-slate-500">Availability</span><span className="text-sm font-semibold text-slate-800">{selectedApp.availability || '-'}</span></div>
                                        <div className="flex justify-between"><span className="text-sm text-slate-500">Mentorship Style</span><span className="text-sm font-semibold text-slate-800 truncate max-w-[120px]">{selectedApp.mentorshipStyle || '-'}</span></div>
                                        <div>
                                            <span className="block text-sm text-slate-500 mb-1">Top Skills</span>
                                            <div className="flex flex-wrap gap-1">
                                                {selectedApp.skills?.map((s: string) => <span key={s} className="bg-white border border-slate-200 text-slate-600 text-xs px-2 py-0.5 rounded-md">{s}</span>)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Verification Data</h3>
                                    {selectedApp.targetRole === 'prementor' ? (
                                        <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center justify-between">
                                            <div>
                                                <h4 className="font-bold text-emerald-800">Mock Test Score</h4>
                                                <p className="text-xs text-emerald-600">Auto-graded domain assessment</p>
                                            </div>
                                            <div className="text-2xl font-black text-emerald-600">{selectedApp.mockTestScore || 0}%</div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-bold text-purple-800">Pro-Mentor Video</h4>
                                                    <p className="text-xs text-purple-600">Verification recording</p>
                                                </div>
                                                <a href={selectedApp.videoUrl} target="_blank" className="text-purple-600 hover:text-purple-800">
                                                    <PlayCircle className="w-8 h-8" />
                                                </a>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
                                                    <span className="block text-[10px] font-black uppercase text-rose-400">Rate</span>
                                                    <span className="text-sm font-bold text-rose-700">${selectedApp.expectedPricing}/hr</span>
                                                </div>
                                                <div className="bg-rose-50 p-3 rounded-lg border border-rose-100">
                                                    <span className="block text-[10px] font-black uppercase text-rose-400">Tenure</span>
                                                    <span className="text-sm font-bold text-rose-700">{selectedApp.professionalYears} Yrs</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedApp.documents?.length > 0 && (
                                        <div className="mt-3 flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-medium text-slate-700">
                                            <FileText className="w-5 h-5 text-indigo-500" />
                                            <a href={selectedApp.documents[0]} target="_blank" className="hover:text-indigo-600 hover:underline">View Uploaded ID Document</a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider">Behavioral Responses</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                            <p className="text-xs font-bold text-slate-500 mb-1">Why do you want to become a mentor?</p>
                                            <p className="text-sm text-slate-800">{selectedApp.qWhyMentor || <span className="italic text-slate-400">Did not answer</span>}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                            <p className="text-xs font-bold text-slate-500 mb-1">Describe a problem you solved</p>
                                            <p className="text-sm text-slate-800">{selectedApp.qProblemSolved || <span className="italic text-slate-400">Did not answer</span>}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                            <p className="text-xs font-bold text-slate-500 mb-1">How will you guide beginners?</p>
                                            <p className="text-sm text-slate-800">{selectedApp.qGuideBeginners || <span className="italic text-slate-400">Did not answer</span>}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                            <p className="text-xs font-bold text-slate-500 mb-1">How do you handle technical doubts?</p>
                                            <p className="text-sm text-slate-800">{selectedApp.qHandleDoubts || <span className="italic text-slate-400">Did not answer</span>}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                            <p className="text-xs font-bold text-slate-500 mb-1">What is your communication style?</p>
                                            <p className="text-sm text-slate-800">{selectedApp.qCommStyle || <span className="italic text-slate-400">Did not answer</span>}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                                            <p className="text-xs font-bold text-slate-500 mb-1">Biggest Achievement</p>
                                            <p className="text-sm text-slate-800">{selectedApp.qAchievement || <span className="italic text-slate-400">Did not answer</span>}</p>
                                        </div>
                                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex justify-between items-center">
                                            <p className="text-xs font-bold text-slate-500">Self-Confidence Score</p>
                                            <p className="text-lg font-black text-indigo-600">{selectedApp.qConfidence || '-'}/10</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4 justify-end">
                            <button 
                                onClick={() => handleDecision(selectedApp._id, 'rejected')}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-white border-2 border-slate-200 text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition"
                            >
                                <XCircle className="w-5 h-5" /> Reject Application
                            </button>
                            <button 
                                onClick={() => handleDecision(selectedApp._id, 'approved')}
                                disabled={loading}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md transition"
                            >
                                <CheckCircle className="w-5 h-5" /> Approve Upgrade
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center h-[500px] flex flex-col items-center justify-center">
                        <UserCircle className="w-16 h-16 text-slate-300 mb-4" />
                        <h3 className="text-lg font-bold text-slate-500">Select an application</h3>
                        <p className="text-slate-400 text-sm mt-1">Review applicant details, test scores, and videos to approve or reject them.</p>
                    </div>
                )}
            </div>
            
        </div>
    );
}
