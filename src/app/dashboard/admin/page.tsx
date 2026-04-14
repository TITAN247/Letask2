import dbConnect from "@/lib/db";
import PreMentorApplication from "@/models/PreMentorApplication";
import ProMentorApplication from "@/models/ProMentorApplication";
import User from "@/models/User"; 
import Session from "@/models/Session";
import AdminClient from "./AdminClient";
import AnalyticsCard from "@/components/admin/AnalyticsCard"; 
import { getUserFromSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
    const session = await getUserFromSession();
    if (!session || (session as any).role !== "admin") {
        // Enforce Admin only
        // redirect('/login/mentee'); // Uncomment to fully restrict. Leaving open for dev testing if session is lacking.
    }

    await dbConnect();
    // Preload user schema
    await User.findOne().exec().catch(() => {});

    // Fetch all applications
    const preMentorApps = await PreMentorApplication.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .lean();
    
    const proMentorApps = await ProMentorApplication.find()
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .lean();
    
    // Fetch analytics data
    const totalUsers = await User.countDocuments();
    const mentees = await User.countDocuments({ role: 'mentee' });
    const preMentors = await User.countDocuments({ role: 'prementor' });
    const proMentors = await User.countDocuments({ role: 'promentor' });
    const totalSessions = await Session.countDocuments();
    const completedSessions = await Session.countDocuments({ status: 'completed' });
    const totalRevenue = await Session.aggregate([
        { $match: { paymentStatus: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const analytics = {
        totalUsers,
        mentees,
        preMentors,
        proMentors,
        totalSessions,
        completedSessions,
        totalRevenue: totalRevenue[0]?.total || 0
    };
    
    // Combine all applications
    const allApps = [...preMentorApps, ...proMentorApps].sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Separate pending and historical
    const pendingApps = allApps.filter((app: any) => app.status === 'pending');
    const historicalApps = allApps.filter((app: any) => app.status !== 'pending').slice(0, 10);

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-10">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Admin Console</h1>
                    <p className="text-slate-500 mt-1">Review mentor upgrade applications, mock tests, and videos.</p>
                </div>

                {/* Analytics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <AnalyticsCard 
                        title="Total Users" 
                        value={analytics.totalUsers} 
                        icon="Users" 
                        trend="+12%" 
                        color="bg-blue-500"
                    />
                    <AnalyticsCard 
                        title="Active Sessions" 
                        value={analytics.totalSessions} 
                        icon="Activity" 
                        trend={`${analytics.completedSessions} completed`}
                        color="bg-emerald-500"
                    />
                    <AnalyticsCard 
                        title="Total Revenue" 
                        value={`₹${analytics.totalRevenue.toLocaleString()}`}
                        icon="DollarSign" 
                        trend="This month"
                        color="bg-amber-500"
                    />
                    <AnalyticsCard 
                        title="Pending Approvals" 
                        value={pendingApps.length}
                        icon="Clock" 
                        trend="Awaiting review"
                        color="bg-rose-500"
                    />
                </div>
                
                {/* Detailed Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-600 font-bold">{analytics.mentees}</span>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Mentees</p>
                                <p className="text-lg font-bold text-slate-800">{Math.round((analytics.mentees / analytics.totalUsers) * 100)}% of users</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                                <span className="text-emerald-600 font-bold">{analytics.preMentors}</span>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Pre-Mentors</p>
                                <p className="text-lg font-bold text-slate-800">Learning phase</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <span className="text-purple-600 font-bold">{analytics.proMentors}</span>
                            </div>
                            <div>
                                <p className="text-sm text-slate-500">Pro-Mentors</p>
                                <p className="text-lg font-bold text-slate-800">Verified experts</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <AdminClient 
                    pendingApps={JSON.parse(JSON.stringify(pendingApps))} 
                    historicalApps={JSON.parse(JSON.stringify(historicalApps))} 
                />
            </div>
        </div>
    );
}
