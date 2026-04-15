"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { 
  Home, 
  MessageSquare, 
  Calendar, 
  Settings,
  ShieldQuestion,
  LogOut,
  UserCircle,
  Video,
  DollarSign,
  Search,
  Menu,
  X
} from "lucide-react";

interface MentorSidebarProps {
    role: 'prementor' | 'promentor';
}

export default function MentorSidebar({ role }: MentorSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [userName, setUserName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    
    // For promentors, also fetch from MentorProfile API if no picture yet
    const userId = (session?.user as any)?.id;
    if (role === 'promentor' && userId) {
      fetch(`/api/mentors/profile?userId=${userId}`)
        .then(res => res.json())
        .then(data => {
          if (data.profile?.profilePicture && !profilePic) {
            setProfilePic(data.profile.profilePicture);
          }
        })
        .catch(() => {});
    }
  }, [session, role, profilePic]);

  const initials = userName
    ? userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";
  const displayName = userName || "Mentor";
  
  const basePath = `/dashboard/${role}`;

  const NAV_ITEMS = [
    { label: "Dashboard", href: basePath, icon: Home },
    { label: "Messages", href: `${basePath}/chat`, icon: MessageSquare },
    { label: "Sessions", href: `${basePath}/history`, icon: Calendar },
    { label: "My Profile", href: `${basePath}/profile`, icon: UserCircle },
  ];

  // Prementor can explore and book promentors
  if (role === 'prementor') {
    NAV_ITEMS.splice(1, 0, { label: "Explore", href: `${basePath}/explore`, icon: Search });
  }

  if (role === 'promentor') {
    NAV_ITEMS.splice(3, 0, { label: "Earnings", href: `${basePath}/earnings`, icon: DollarSign });
  }

  const BOTTOM_NAV_ITEMS = [
    { label: "Settings", href: `${basePath}/profile`, icon: Settings },
    { label: "Support", href: "mailto:support@letask.com", icon: ShieldQuestion },
    { label: "Logout", href: "/", icon: LogOut },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white rounded-xl shadow-lg border border-slate-100"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-slate-700" />
      </button>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`w-64 h-screen bg-white border-r border-slate-100 flex flex-col justify-between p-4 hide-scrollbar overflow-y-auto z-50
        lg:sticky lg:top-0 lg:left-0 lg:translate-x-0
        fixed top-0 left-0 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      <div>
        {/* Logo / Brand */}
        <div className="flex items-center gap-2 mb-8 px-2">
          <img src="/logo.jpeg" alt="LetAsk" className="h-10 w-auto object-contain" />
          <span className="ml-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest hidden lg:block">
            {role === 'promentor' ? 'PRO' : 'MTR'}
          </span>
        </div>

        {/* Main Navigation */}
        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-indigo-50/80 text-indigo-700 font-medium"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    className={`w-5 h-5 ${
                      isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-700"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-8 pt-4 border-t border-slate-100">
        {/* Verification Status */}
        <div className="px-3 py-3 mb-4 rounded-2xl bg-slate-50 border border-slate-100/50 flex flex-col gap-3">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-200 to-teal-200 flex items-center justify-center shrink-0 border-2 border-white shadow-sm">
                <Video className="w-4 h-4 text-emerald-700" />
             </div>
             <div className="flex flex-col">
               <span className="text-sm font-semibold text-slate-800 line-clamp-1">KYC Verified</span>
               <span className="text-xs text-slate-500">Video call active</span>
             </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <nav className="flex flex-col gap-1">
          {BOTTOM_NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors group"
            >
              <item.icon className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Profile Section */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50">
            {profilePic ? (
              <img src={profilePic} alt={displayName} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white border-2 border-white shadow-sm">
                <span className="font-bold text-sm">{initials}</span>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-800 line-clamp-1">{displayName}</span>
              <span className="text-xs text-slate-500">{role === 'promentor' ? 'Pro Mentor' : 'Pre-Mentor'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Close Button */}
      <button
        onClick={() => setIsMobileMenuOpen(false)}
        className="lg:hidden absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full"
        aria-label="Close menu"
      >
        <X className="w-5 h-5 text-slate-500" />
      </button>
    </aside>
    </>
  );
}
