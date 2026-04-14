"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Compass, 
  BookOpen, 
  MessageSquare, 
  Calendar, 
  MoreHorizontal,
  Settings,
  ShieldQuestion,
  Info,
  LogOut,
  Star,
  GraduationCap,
  X,
  Play,
  CheckCircle,
  Heart,
  Zap,
  Award
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const NAV_ITEMS = [
  { label: "Home", href: "/dashboard/mentee", icon: Home },
  { label: "Explore", href: "/dashboard/mentee/explore", icon: Compass },
  { label: "Journal", href: "/dashboard/mentee/journal", icon: BookOpen },
  { label: "New", href: "/dashboard/mentee/new", icon: Star, badge: "Update" },
  { label: "Messages", href: "/dashboard/mentee/messages", icon: MessageSquare },
  { label: "Bookings", href: "/dashboard/mentee/bookings", icon: Calendar },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);

  useEffect(() => {
    if (session?.user?.name) { setUserName(session.user.name); }
    if (session?.user?.image) { setProfilePic(session.user.image); }
    const stored = localStorage.getItem("user");
    if (stored) { 
      try { 
        const p = JSON.parse(stored); 
        if (p?.name) setUserName(p.name); 
        if (p?.avatar || p?.profilePicture || p?.image) setProfilePic(p.avatar || p.profilePicture || p.image);
      } catch {} 
    }
  }, [session]);

  const initials = userName
    ? userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";
  const displayName = userName || "User";

  const handleLogout = async () => {
    localStorage.removeItem("user");
    await signOut({ redirect: false });
    router.push("/login/mentee");
  };

  const MORE_MENU_ITEMS = [
    { 
      label: "View profile", 
      icon: CheckCircle, 
      onClick: () => {
        setIsMoreOpen(false);
        router.push("/dashboard/mentee/profile");
      }
    },
    { 
      label: "Connect your calendar", 
      icon: Calendar, 
      onClick: () => {
        setIsMoreOpen(false);
        setShowCalendarModal(true);
      }
    },
    { 
      label: "Quality", 
      icon: Award, 
      onClick: () => {
        setIsMoreOpen(false);
        setShowQualityModal(true);
      }
    },
    { 
      label: "Wishlist", 
      icon: Heart, 
      onClick: () => {
        setIsMoreOpen(false);
        setShowWishlistModal(true);
      }
    },
    { 
      label: "Get A Match", 
      icon: Zap, 
      onClick: () => {
        setIsMoreOpen(false);
        router.push("/dashboard/mentee/explore");
      }
    },
    { 
      label: "Become a Mentor", 
      icon: GraduationCap, 
      onClick: () => {
        setIsMoreOpen(false);
        router.push("/dashboard/mentee/apply-prementor");
      }
    },
    { 
      label: "Watch tutorial", 
      icon: Play, 
      onClick: () => {
        setIsMoreOpen(false);
        setShowTutorial(true);
      }
    },
    { 
      label: "Settings", 
      icon: Settings, 
      onClick: () => {
        setIsMoreOpen(false);
        router.push("/dashboard/mentee");
      }
    },
    { 
      label: "Logout", 
      icon: LogOut, 
      onClick: handleLogout,
      color: "text-rose-500" 
    },
  ];

  return (
    <>
    <aside className="w-64 h-screen sticky top-0 bg-white border-r border-slate-100 flex flex-col justify-between p-4 hide-scrollbar overflow-y-auto">
      <div className="relative h-full flex flex-col">
        {/* Logo / Brand */}
        <div className="flex items-center gap-2 mb-8 px-2">
          <img src="/logo.jpeg" alt="LetAsk" className="h-10 w-auto object-contain" />
        </div>

        {/* Main Navigation */}
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between px-3 py-3 rounded-2xl transition-all duration-200 group ${
                  isActive
                    ? "bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/20"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`w-5 h-5 ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  />
                  <span className="text-sm font-bold tracking-tight">{item.label}</span>
                </div>
                {item.badge && !isActive && (
                  <span className="text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* More Toggle */}
          <button 
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={`flex items-center gap-3 px-3 py-3 rounded-2xl transition-all text-slate-500 hover:bg-slate-50 hover:text-slate-900 mt-2 ${isMoreOpen ? 'bg-slate-50 text-slate-900' : ''}`}
          >
             <MoreHorizontal className={`w-5 h-5 ${isMoreOpen ? 'text-slate-900' : 'text-slate-400'}`} />
             <span className="text-sm font-bold tracking-tight">More</span>
          </button>
        </nav>

        {/* More Menu Dropdown */}
        {isMoreOpen && (
          <div className="absolute bottom-20 left-0 w-full bg-white border border-slate-100 shadow-2xl rounded-3xl p-2 z-50 animate-in slide-in-from-bottom-5 duration-300">
             <div className="flex items-center gap-3 p-3 mb-2 border-b border-slate-50">
                {profilePic ? (
                  <img src={profilePic} alt={displayName} className="w-8 h-8 rounded-full object-cover border border-slate-200" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">{initials}</div>
                )}
                <div className="flex flex-col">
                  <span className="text-xs font-black text-slate-800 line-clamp-1">{displayName}</span>
                  <button 
                    onClick={() => {
                      setIsMoreOpen(false);
                      router.push("/dashboard/mentee/profile");
                    }}
                    className="text-[10px] text-indigo-600 font-bold hover:underline text-left"
                  >
                    View profile
                  </button>
                </div>
             </div>
             <div className="max-h-64 overflow-y-auto custom-scrollbar">
                {MORE_MENU_ITEMS.map((item) => (
                  <button 
                    key={item.label} 
                    onClick={item.onClick}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-slate-50 text-left ${item.color || 'text-slate-600 hover:text-slate-900'}`}
                  >
                    <item.icon className="w-4 h-4 opacity-70" />
                    {item.label}
                  </button>
                ))}
             </div>
          </div>
        )}
      </div>

      <div className="mt-8">
        {/* Bottom Profile Section Redesigned */}
        <div className="p-1 rounded-[2rem] bg-slate-50 border border-slate-100/50">
          <div className="w-full flex items-center gap-3 p-2">
             {profilePic ? (
               <img src={profilePic} alt={displayName} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm ring-2 ring-indigo-50" />
             ) : (
               <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white border-2 border-white shadow-sm ring-2 ring-indigo-50">
                  <span className="font-bold text-sm">{initials}</span>
               </div>
             )}
             <div className="flex flex-col">
               <span className="text-xs font-black text-slate-800 line-clamp-1">{displayName}</span>
               <span className="text-[10px] font-bold text-slate-400">Mentee Account</span>
             </div>
          </div>
        </div>
      </div>
    </aside>

      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Welcome to LetAsk!</h3>
              <button onClick={() => setShowTutorial(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 text-slate-600">
              <p>Here's how to get started:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600">1.</span>
                  <span>Explore mentors in the <strong>Explore</strong> section</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600">2.</span>
                  <span>Book sessions with mentors who match your goals</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600">3.</span>
                  <span>Track your progress in the <strong>Journal</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600">4.</span>
                  <span>Message mentors anytime through <strong>Messages</strong></span>
                </li>
              </ul>
            </div>
            <button 
              onClick={() => setShowTutorial(false)}
              className="w-full mt-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Connect Your Calendar</h3>
              <button onClick={() => setShowCalendarModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 text-slate-600 text-center">
              <Calendar className="w-16 h-16 mx-auto text-indigo-600" />
              <p>Connect your Google or Outlook calendar to automatically sync your mentoring sessions.</p>
              <p className="text-sm text-slate-400">This feature is coming soon!</p>
            </div>
            <button 
              onClick={() => setShowCalendarModal(false)}
              className="w-full mt-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Quality Modal */}
      {showQualityModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Quality Score</h3>
              <button onClick={() => setShowQualityModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 text-slate-600 text-center">
              <Award className="w-16 h-16 mx-auto text-yellow-500" />
              <div className="text-4xl font-bold text-slate-900">85/100</div>
              <p>Your profile quality score based on completeness and engagement.</p>
              <div className="text-sm text-left space-y-2 bg-slate-50 p-4 rounded-xl">
                <div className="flex justify-between"><span>Profile completed</span> <span className="text-green-600 font-bold">✓</span></div>
                <div className="flex justify-between"><span>Bio added</span> <span className="text-green-600 font-bold">✓</span></div>
                <div className="flex justify-between"><span>First session</span> <span className="text-slate-400">Pending</span></div>
                <div className="flex justify-between"><span>Review given</span> <span className="text-slate-400">Pending</span></div>
              </div>
            </div>
            <button 
              onClick={() => setShowQualityModal(false)}
              className="w-full mt-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Wishlist Modal */}
      {showWishlistModal && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Your Wishlist</h3>
              <button onClick={() => setShowWishlistModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4 text-slate-600">
              <p className="text-center text-slate-400">Mentors you have wishlisted will appear here.</p>
              <div className="text-center py-8">
                <Heart className="w-16 h-16 mx-auto text-slate-200" />
                <p className="mt-4 text-sm">No mentors in your wishlist yet.</p>
                <button 
                  onClick={() => {
                    setShowWishlistModal(false);
                    router.push("/dashboard/mentee/explore");
                  }}
                  className="mt-4 px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700"
                >
                  Explore Mentors
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
