"use client";

import { Search, Bell } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function TopHeader() {
  const { data: session } = useSession();
  const [userName, setUserName] = useState<string>("");

  const [greeting, setGreeting] = useState<string>("Hi");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");

    // Try next-auth session first
    if (session?.user?.name) {
      setUserName(session.user.name);
      return;
    }
    // Fall back to localStorage (JWT auth)
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.name) setUserName(parsed.name);
      } catch {}
    }
  }, [session]);

  const firstName = userName ? userName.split(" ")[0] : "there";

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-8 py-5 bg-white/80 backdrop-blur-md border-b border-slate-100">
      <div className="flex flex-col">
        <h1 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 uppercase tracking-tight">
          {greeting}, {firstName} 👋
        </h1>
        <p className="text-sm text-slate-500 font-medium mt-0.5 tracking-tight italic opacity-80">Let&apos;s continue your learning journey.</p>
      </div>

      <div className="flex items-center gap-6">
        {/* Search Bar */}
        <div className="relative group hidden md:block">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <Search className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          </div>
          <input
            type="text"
            className="w-80 bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-full focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 block pl-10 p-2.5 transition-all outline-none"
            placeholder="Search mentors, skills, or problems..."
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="relative p-2.5 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors border border-slate-200/60">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
          </button>
          
          <Link href="/mentors" className="px-5 py-2.5 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-200 block text-center">
            Book Mentor
          </Link>
        </div>
      </div>
    </header>
  );
}
