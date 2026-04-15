"use client";

import Link from "next/link";
import { Search, Home, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center max-w-2xl mx-auto">
        {/* 404 Illustration */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full animate-pulse"></div>
          <div className="relative z-10 flex items-center justify-center h-full">
            <span className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              404
            </span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">
          Page Not Found
        </h1>

        {/* Description */}
        <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
          Oops! The page you&apos;re looking for seems to have wandered off. 
          Let&apos;s get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>

          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-xl border-2 border-slate-200 hover:border-indigo-300 hover:bg-slate-50 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-500 mb-4">Looking for something specific?</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/dashboard/mentee/explore"
              className="text-indigo-600 hover:text-indigo-800 font-medium text-sm underline underline-offset-2"
            >
              Find Mentors
            </Link>
            <Link
              href="/login/mentee"
              className="text-indigo-600 hover:text-indigo-800 font-medium text-sm underline underline-offset-2"
            >
              Login
            </Link>
            <Link
              href="/select-role"
              className="text-indigo-600 hover:text-indigo-800 font-medium text-sm underline underline-offset-2"
            >
              Become a Mentor
            </Link>
          </div>
        </div>

        {/* Search Suggestion */}
        <div className="mt-8 p-4 bg-white rounded-2xl shadow-sm border border-slate-100 max-w-sm mx-auto">
          <div className="flex items-center gap-3 text-slate-600">
            <Search className="w-5 h-5 text-slate-400" />
            <span className="text-sm">
              Try searching for mentors or topics in the explore page
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
