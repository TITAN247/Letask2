import dbConnect from "@/lib/db";
import Session from "@/models/Session";
import { getUserFromSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { 
    TrendingUp, 
    Wallet, 
    ArrowUpRight, 
    Clock, 
    CheckCircle,
    AlertCircle,
    CreditCard,
    ChevronRight
} from "lucide-react";
import MentorProfile from "@/models/MentorProfile";

export default async function ProMentorEarnings() {
    const sessionUser = await getUserFromSession();
    if (!sessionUser) redirect("/login/promentor");

    await dbConnect();
    const userId = (sessionUser as any).id;

    // Fetch mentor profile for pricing and mentorProfileId
    const profile = await MentorProfile.findOne({ userId }).lean() || { _id: null, pricing: 125 };
    const flatRate = (profile as any).pricing || 125;
    const mentorProfileId = (profile as any)?._id;

    // For promentors, mentorId in Session is the MentorProfile._id, not User ID
    // Fetch completed sessions for total earnings - use actual session amounts
    const completedSessions = mentorProfileId 
        ? await Session.find({ mentorId: mentorProfileId, status: 'completed' }).lean()
        : [];
    // Calculate from actual session amounts
    const totalEarnings = completedSessions.reduce((sum, s) => sum + ((s as any).amount || flatRate), 0);

    // Fetch upcoming sessions for pending earnings - use actual session amounts
    const upcomingSessions = mentorProfileId
        ? await Session.find({ mentorId: mentorProfileId, status: { $in: ['accepted', 'chat_active', 'paid'] } }).lean()
        : [];
    // Calculate from actual session amounts for paid/upcoming sessions
    const pendingEarnings = upcomingSessions.reduce((sum, s) => {
        // Only count sessions that are paid or have paymentStatus completed
        if ((s as any).paymentStatus === 'completed' || (s as any).paymentStatus === 'paid') {
            return sum + ((s as any).amount || flatRate);
        }
        return sum;
    }, 0);

    // Fetch real payout data from API if available
    let realPayouts: any[] = [];
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/payments/earnings`, {
            headers: { 'Cookie': `auth_token=${(sessionUser as any).token || ''}` },
        });
        if (res.ok) {
            const data = await res.json();
            if (data.success && data.data?.completedPayouts) {
                realPayouts = data.data.completedPayouts.map((p: any) => ({
                    id: p.id?.toString().slice(-8) || 'P-XXXX',
                    date: new Date(p.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
                    amount: Math.round(p.amount / 100), // Convert from paise
                    status: p.status === 'paid' ? 'Paid' : 'Processing'
                }));
            }
        }
    } catch (e) {
        console.log('[Earnings] Could not fetch real payouts:', e);
    }

    // Use real payouts if available, otherwise fallback to mock
    const payouts = realPayouts.length > 0 ? realPayouts : [
        { id: "P-1234", date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }), amount: pendingEarnings > 0 ? pendingEarnings : 0, status: pendingEarnings > 0 ? 'Processing' : 'Pending' },
    ];

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 font-sans">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Earnings Hub</h1>
                    <p className="text-slate-500 mt-1 font-medium">Manage your revenue, payouts, and financial performance.</p>
                </div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm">
                    <a 
                    href="/dashboard/promentor/withdraw"
                    className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all text-sm inline-block text-center"
                >
                    Request Payout
                </a>
                    <button className="p-2.5 text-slate-400 hover:text-slate-600 transition-colors">
                        <CreditCard className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Wallet className="w-24 h-24 text-indigo-600" />
                    </div>
                    <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                        <span className="text-2xl font-bold text-indigo-600">₹</span>
                    </div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Revenue</div>
                    <div className="text-4xl font-black text-slate-900 leading-none">
                        ₹{totalEarnings.toLocaleString('en-IN')}
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-emerald-600 font-bold text-xs bg-emerald-50 w-fit px-2 py-1 rounded-lg">
                        <ArrowUpRight className="w-3 h-3" /> +12% this month
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Clock className="w-24 h-24 text-amber-600" />
                    </div>
                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
                        <TrendingUp className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Pending Income</div>
                    <div className="text-4xl font-black text-slate-900 leading-none">
                        ₹{pendingEarnings.toLocaleString('en-IN')}
                    </div>
                    <p className="mt-4 text-xs text-slate-400 font-medium">To be settled after session completion.</p>
                </div>

                <div className="bg-[#09090b] p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-[60px]"></div>
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/5">
                        <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Next Payout</div>
                    <div className="text-4xl font-black text-white leading-none">
                        Nov 15
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-white/50 text-xs font-medium">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Automatic withdrawal enabled
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Payout History */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Payout History</h2>
                        <button className="text-sm font-bold text-indigo-600 hover:underline">View All</button>
                    </div>
                    
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                                <tr>
                                    <th className="px-8 py-5">Payout ID</th>
                                    <th className="px-8 py-5">Date</th>
                                    <th className="px-8 py-5">Amount</th>
                                    <th className="px-8 py-5">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {payouts.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5 text-sm font-bold text-slate-700">{p.id}</td>
                                        <td className="px-8 py-5 text-sm font-medium text-slate-500">{p.date}</td>
                                        <td className="px-8 py-5 text-sm font-black text-slate-900">₹{p.amount.toLocaleString('en-IN')}</td>
                                        <td className="px-8 py-5">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                p.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                            }`}>
                                                {p.status === 'Paid' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                {p.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Account Details */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Payout Method</h2>
                    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center shrink-0">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="w-6 h-6" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5">Primary Account</div>
                                <div className="text-sm font-bold text-slate-800 truncate">{sessionUser.email}</div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-300" />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="font-bold text-slate-400">Processing Fee</span>
                                <span className="font-black text-slate-900">2.5%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="font-bold text-slate-400">Minimum Payout</span>
                                <span className="font-black text-slate-900">₹500</span>
                            </div>
                            <div className="pt-4 border-t border-slate-50">
                                <button className="w-full py-4 text-sm font-black text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all">
                                    Change Payout Method
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100/50 flex gap-4">
                        <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0" />
                        <p className="text-xs font-bold text-indigo-700 leading-relaxed">
                            Earnings are held for 48 hours after session completion as a grace period for mentee feedback before being added to your withdrawable balance.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
