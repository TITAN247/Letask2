"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
    CheckCircle, 
    XCircle, 
    Clock, 
    Eye, 
    Play,
    Loader2,
    Search,
    Filter,
    ArrowLeft,
    User,
    Award,
    GraduationCap,
    FileText,
    Video,
    Check,
    FileCheck,
    ExternalLink,
    Shield
} from "lucide-react";

interface Application {
    _id: string;
    tempId: string;
    userId: {
        name: string;
        email: string;
    };
    currentStatus: string;
    domain: string;
    location: string;
    skills: string[];
    experienceYears: number;
    teachingStyle: string;
    qWhyMentor: string;
    qProblemSolved: string;
    qGuideBeginners: string;
    qDifference: string;
    qConfidence: number;
    qHandleDoubts: string;
    qCommStyle: string;
    qAchievement: string;
    mockTestScore?: number;
    mockTestPercentage?: number;
    mcqAnswers?: any[];
    videoUrl?: string;
    professionalYears?: number;
    expectedPricing?: number;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
    type: 'prementor' | 'promentor';
    // Document fields
    identityDocumentType?: string;
    identityDocument?: string;
    resumeDocument?: string;
    documentsVerified?: boolean;
    adminVerificationNotes?: string;
}

export default function AdminApplicationsPanel() {
    const router = useRouter();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'prementor' | 'promentor'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [adminNotes, setAdminNotes] = useState("");
    const [adminVerificationNotes, setAdminVerificationNotes] = useState("");
    const [error, setError] = useState("");
    const [verifyLoading, setVerifyLoading] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, [filter, statusFilter]);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/applications?type=${filter}&status=${statusFilter}`);
            if (res.ok) {
                const data = await res.json();
                const preApps = data.prementorApplications.map((a: any) => ({ ...a, type: 'prementor' }));
                const proApps = data.promentorApplications.map((a: any) => ({ ...a, type: 'promentor' }));
                setApplications([...preApps, ...proApps]);
            } else {
                let errorMessage = "Failed to fetch applications";
                try {
                    const errorData = await res.json();
                    errorMessage = errorData.message || errorData.error || `Error ${res.status}: ${res.statusText}`;
                    console.error("Fetch error:", errorData);
                } catch (e) {
                    errorMessage = `Server error (${res.status}): ${res.statusText}`;
                    console.error("Failed to parse error response:", res.status, res.statusText);
                }
                setError(errorMessage);
                // If unauthorized, redirect to login
                if (res.status === 403) {
                    router.push('/login/admin');
                }
            }
        } catch (error) {
            setError("Error loading applications");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyDocuments = async (verified: boolean) => {
        if (!selectedApp) return;
        
        setVerifyLoading(true);
        try {
            const res = await fetch("/api/admin/applications/verify-docs", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    applicationId: selectedApp._id,
                    type: selectedApp.type,
                    documentsVerified: verified,
                    adminVerificationNotes
                }),
            });

            if (res.ok) {
                const data = await res.json();
                setSelectedApp({ ...selectedApp, documentsVerified: verified, adminVerificationNotes });
                fetchApplications();
            } else {
                const errorData = await res.json().catch(() => ({}));
                setError(errorData.message || "Failed to update document verification");
            }
        } catch (error) {
            setError("Error updating document verification");
        } finally {
            setVerifyLoading(false);
        }
    };

    const handleAction = async (action: 'approve' | 'reject') => {
        if (!selectedApp) return;
        
        setActionLoading(true);
        try {
            const res = await fetch("/api/admin/applications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    applicationId: selectedApp._id,
                    type: selectedApp.type,
                    action,
                    notes: adminNotes
                }),
            });

            if (res.ok) {
                const data = await res.json();
                
                // If new user was created, show credentials
                if (data.newUserCreated) {
                    alert(`Application Approved!\n\nNew user account created:\nEmail: ${data.userEmail}\nTemp Password: ${data.tempPassword}\n\nPlease save these credentials and share with the applicant.`);
                }
                
                setSelectedApp(null);
                setAdminNotes("");
                fetchApplications();
            } else {
                const errorData = await res.json().catch(() => ({}));
                setError(errorData.message || "Failed to process application");
            }
        } catch (error) {
            setError("Error processing application");
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium flex items-center gap-1"><Clock className="w-4 h-4" /> Pending</span>;
            case 'approved':
                return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Approved</span>;
            case 'rejected':
                return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center gap-1"><XCircle className="w-4 h-4" /> Rejected</span>;
            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#0EA5E9] animate-spin" />
            </div>
        );
    }

    // Detail View
    if (selectedApp) {
        // Handle missing userId data (populate failed or user deleted)
        const hasUserData = selectedApp.userId && typeof selectedApp.userId === 'object';
        const userName = hasUserData ? selectedApp.userId.name : 'User Not Found';
        const userEmail = hasUserData ? selectedApp.userId.email : (selectedApp.userId || 'N/A');
        
        return (
            <div className="min-h-screen bg-slate-50 p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => setSelectedApp(null)}
                            className="p-2 bg-white rounded-lg shadow-sm hover:bg-slate-100 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black text-slate-900">Application Review</h1>
                            <p className="text-slate-500">{selectedApp.tempId} • {typeof userEmail === 'string' ? userEmail : 'N/A'}</p>
                        </div>
                        <div className="ml-auto">
                            {getStatusBadge(selectedApp.status)}
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                            <p className="font-bold">{error}</p>
                            <p className="text-sm mt-1">Please check the browser console for details.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Applicant Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Info */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-[#0EA5E9]" />
                                    Applicant Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-slate-500">Name</p>
                                        <p className="font-medium">{userName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Status</p>
                                        <p className="font-medium">{selectedApp.currentStatus}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Domain</p>
                                        <p className="font-medium">{selectedApp.domain}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Location</p>
                                        <p className="font-medium">{selectedApp.location}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Experience</p>
                                        <p className="font-medium">{selectedApp.experienceYears} years</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Teaching Style</p>
                                        <p className="font-medium capitalize">{selectedApp.teachingStyle}</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm text-slate-500">Skills</p>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {(selectedApp.skills || []).map((skill, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-slate-100 rounded-full text-sm">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Advanced Questions */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-[#0EA5E9]" />
                                    Questionnaire Responses
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="font-medium text-slate-700 mb-1">Why do you want to become a mentor?</p>
                                        <p className="text-slate-600 bg-slate-50 p-3 rounded-lg text-sm">{selectedApp.qWhyMentor}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-700 mb-1">Problem solved</p>
                                        <p className="text-slate-600 bg-slate-50 p-3 rounded-lg text-sm">{selectedApp.qProblemSolved}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-700 mb-1">How to guide beginners</p>
                                        <p className="text-slate-600 bg-slate-50 p-3 rounded-lg text-sm">{selectedApp.qGuideBeginners}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-700 mb-1">What makes you different</p>
                                        <p className="text-slate-600 bg-slate-50 p-3 rounded-lg text-sm">{selectedApp.qDifference}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-slate-700">Confidence Level:</span>
                                        <span className="px-3 py-1 bg-[#0EA5E9] text-white rounded-full font-bold">
                                            {selectedApp.qConfidence}/10
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Mock Test Results (Pre-Mentor only) */}
                            {selectedApp.type === 'prementor' && selectedApp.mockTestScore !== undefined && (
                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <GraduationCap className="w-5 h-5 text-[#0EA5E9]" />
                                        Mock Test Results
                                    </h3>
                                    <div className="flex items-center gap-8 mb-4">
                                        <div className="text-center">
                                            <p className="text-3xl font-black text-[#0EA5E9]">{selectedApp.mockTestScore}</p>
                                            <p className="text-sm text-slate-500">MCQ Score</p>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-3xl font-black text-[#0EA5E9]">{selectedApp.mockTestPercentage}%</p>
                                            <p className="text-sm text-slate-500">Percentage</p>
                                        </div>
                                        <div className="text-center">
                                            <p className={`text-3xl font-black ${(selectedApp.mockTestPercentage || 0) >= 60 ? 'text-green-500' : 'text-red-500'}`}>
                                                {(selectedApp.mockTestPercentage || 0) >= 60 ? 'PASS' : 'FAIL'}
                                            </p>
                                            <p className="text-sm text-slate-500">Result</p>
                                        </div>
                                    </div>
                                    {selectedApp.mcqAnswers && selectedApp.mcqAnswers.length > 0 && (
                                        <div>
                                            <p className="font-medium text-slate-700 mb-2">MCQ Breakdown</p>
                                            <div className="grid grid-cols-4 gap-2">
                                                {selectedApp.mcqAnswers.map((ans, idx) => (
                                                    <div 
                                                        key={idx}
                                                        className={`p-2 rounded-lg text-center text-sm ${ans.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                                    >
                                                        Q{idx + 1}: {ans.isCorrect ? '✓' : '✗'}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Video (Pro-Mentor only) */}
                            {selectedApp.type === 'promentor' && selectedApp.videoUrl && (
                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Video className="w-5 h-5 text-[#0EA5E9]" />
                                        Video Introduction
                                    </h3>
                                    <video
                                        controls
                                        className="w-full rounded-xl"
                                        src={selectedApp.videoUrl}
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            )}
                        </div>

                        {/* Right Column - Actions */}
                        <div className="space-y-6">
                            {/* Pro-Mentor Info */}
                            {selectedApp.type === 'promentor' && (
                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Award className="w-5 h-5 text-[#0EA5E9]" />
                                        Pro-Mentor Details
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-slate-500">Professional Experience</p>
                                            <p className="font-medium">{selectedApp.professionalYears} years</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-500">Expected Pricing</p>
                                            <p className="font-medium text-[#0EA5E9]">${selectedApp.expectedPricing}/session</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Document Verification */}
                            {(selectedApp.identityDocument || selectedApp.resumeDocument) && (
                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Shield className="w-5 h-5 text-[#0EA5E9]" />
                                        Document Verification
                                        {selectedApp.documentsVerified && (
                                            <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                                ✓ Verified
                                            </span>
                                        )}
                                    </h3>
                                    <div className="space-y-4">
                                        {selectedApp.identityDocument && (
                                            <div>
                                                <p className="text-sm text-slate-500 mb-1">ID Document ({selectedApp.identityDocumentType || 'Not specified'})</p>
                                                <a 
                                                    href={selectedApp.identityDocument} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-[#0EA5E9] hover:underline font-medium"
                                                >
                                                    <FileCheck className="w-4 h-4" />
                                                    View ID Document <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        )}
                                        {selectedApp.resumeDocument && (
                                            <div>
                                                <p className="text-sm text-slate-500 mb-1">Resume/CV</p>
                                                <a 
                                                    href={selectedApp.resumeDocument} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-[#0EA5E9] hover:underline font-medium"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    View Resume <ExternalLink className="w-3 h-3" />
                                                </a>
                                            </div>
                                        )}
                                        
                                        {/* Verification Notes */}
                                        <div className="pt-4 border-t border-slate-100">
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Verification Notes
                                            </label>
                                            <textarea
                                                value={adminVerificationNotes}
                                                onChange={(e) => setAdminVerificationNotes(e.target.value)}
                                                placeholder="Add notes about document verification..."
                                                rows={3}
                                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent resize-none text-sm"
                                            />
                                            <div className="flex gap-2 mt-3">
                                                <button
                                                    onClick={() => handleVerifyDocuments(true)}
                                                    disabled={verifyLoading}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-70 text-sm"
                                                >
                                                    {verifyLoading ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Check className="w-4 h-4" /> Verify Documents
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleVerifyDocuments(false)}
                                                    disabled={verifyLoading}
                                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors disabled:opacity-70 text-sm"
                                                >
                                                    {verifyLoading ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-4 h-4" /> Unverify
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Admin Actions */}
                            {selectedApp.status === 'pending' && (
                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4">Admin Actions</h3>
                                    
                                    {!hasUserData && (
                                        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700">
                                            <p className="font-bold">⚠️ User Account Missing</p>
                                            <p className="text-sm">This application has no associated user. A new user will be created automatically when you approve.</p>
                                        </div>
                                    )}
                                    
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Notes (optional)
                                            </label>
                                            <textarea
                                                value={adminNotes}
                                                onChange={(e) => setAdminNotes(e.target.value)}
                                                placeholder="Add feedback or notes for the applicant..."
                                                rows={4}
                                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0EA5E9] focus:border-transparent resize-none"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => handleAction('approve')}
                                                disabled={actionLoading}
                                                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors disabled:opacity-70"
                                            >
                                                {actionLoading ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <Check className="w-5 h-5" /> Approve
                                                    </>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleAction('reject')}
                                                disabled={actionLoading}
                                                className="flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-70"
                                            >
                                                {actionLoading ? (
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                ) : (
                                                    <>
                                                        <XCircle className="w-5 h-5" /> Reject
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Submission Info */}
                            <div className="bg-white rounded-2xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-slate-900 mb-4">Submission Info</h3>
                                <div className="space-y-2 text-sm">
                                    <p><span className="text-slate-500">Submitted:</span> {new Date(selectedApp.submittedAt).toLocaleDateString()}</p>
                                    <p><span className="text-slate-500">Type:</span> <span className="capitalize">{selectedApp.type}</span></p>
                                    <p><span className="text-slate-500">Application ID:</span> {selectedApp.tempId}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">Mentor Applications</h1>
                        <p className="text-slate-500 mt-1">Review and manage Pre-Mentor and Pro-Mentor applications</p>
                    </div>
                    <button
                        onClick={() => router.push('/dashboard/admin')}
                        className="px-6 py-3 bg-white rounded-xl shadow-sm font-medium hover:bg-slate-100 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex items-center gap-2 bg-white rounded-xl p-2 shadow-sm">
                        <Filter className="w-5 h-5 text-slate-400 ml-2" />
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="px-3 py-2 bg-transparent font-medium focus:outline-none"
                        >
                            <option value="all">All Types</option>
                            <option value="prementor">Pre-Mentor</option>
                            <option value="promentor">Pro-Mentor</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 bg-white rounded-xl p-2 shadow-sm">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="px-3 py-2 bg-transparent font-medium focus:outline-none"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                        <p className="font-bold">{error}</p>
                        <p className="text-sm mt-1">Please check the browser console for details or try logging in again.</p>
                    </div>
                )}

                {/* Applications Table */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Applicant</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Type</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Domain</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Score/Video</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Docs</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Submitted</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {applications.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                            No applications found
                                        </td>
                                    </tr>
                                ) : (
                                    applications.map((app) => (
                                        <tr key={app._id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-slate-900">{typeof app.userId === 'object' && app.userId?.name ? app.userId.name : 'User Not Found'}</p>
                                                    <p className="text-sm text-slate-500">{typeof app.userId === 'object' && app.userId?.email ? app.userId.email : typeof app.userId === 'string' ? app.userId : 'Email unavailable'}</p>
                                                    <p className="text-xs text-slate-400">{app.tempId}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                    app.type === 'promentor' 
                                                        ? 'bg-purple-100 text-purple-700' 
                                                        : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {app.type === 'promentor' ? 'Pro-Mentor' : 'Pre-Mentor'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-700">{app.domain}</td>
                                            <td className="px-6 py-4">
                                                {app.type === 'prementor' ? (
                                                    <span className={`font-bold ${(app.mockTestPercentage || 0) >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                                                        {app.mockTestPercentage}%
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-purple-600">
                                                        <Video className="w-4 h-4" /> Video
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {(app.identityDocument || app.resumeDocument) ? (
                                                    <span className={`flex items-center gap-1 text-sm ${app.documentsVerified ? 'text-green-600' : 'text-amber-600'}`}>
                                                        <FileCheck className="w-4 h-4" />
                                                        {app.documentsVerified ? 'Verified' : 'Pending'}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400 text-sm">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">{getStatusBadge(app.status)}</td>
                                            <td className="px-6 py-4 text-sm text-slate-500">
                                                {new Date(app.submittedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => setSelectedApp(app)}
                                                    className="flex items-center gap-1 px-4 py-2 bg-[#0EA5E9] text-white rounded-lg font-medium hover:bg-[#0284c7] transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" /> Review
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
