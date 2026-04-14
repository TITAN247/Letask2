"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Sparkles, Crown, DollarSign, Calendar, TrendingUp, CheckCircle, Star } from "lucide-react";
import Logo from "@/components/Logo";

export default function ProMentorPage() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden font-sans">
      {/* Header */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-10 py-5 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3 cursor-pointer">
          <Logo size={40} showText={true} />
        </Link>
        <Link 
          href="/"
          className="flex items-center gap-2 text-slate-600 hover:text-[#0284C7] font-semibold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Home
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#FDF4FF] via-[#F5F3FF] to-white pb-24 pt-12 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-1/2 w-72 h-72 bg-[#8B5CF6]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#FCD34D]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#8B5CF6]/10 text-[#7C3AED] text-sm font-bold uppercase tracking-wider mb-6">
              <Crown className="w-4 h-4" /> For Pro-Mentors
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
              Turn Experience into <span className="text-[#8B5CF6]">Impact & Income</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Share your expertise with those who need it most. Set your own rates, 
              manage your schedule, and build a reputation as a top-tier mentor.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Benefits */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">Why Become a Pro-Mentor?</h2>
              
              {[
                { icon: DollarSign, title: "Set Your Own Rates", desc: "Charge what you are worth. You control your pricing and session structure" },
                { icon: Calendar, title: "Flexible Schedule", desc: "Only accept bookings when you are available. Full control over your calendar" },
                { icon: TrendingUp, title: "Build Your Brand", desc: "Get verified status and build a reputation with ratings and reviews" },
                { icon: Star, title: "Premium Positioning", desc: "Featured placement and priority matching with serious mentees" },
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
                    <benefit.icon className="w-6 h-6 text-[#8B5CF6]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{benefit.title}</h3>
                    <p className="text-slate-600 text-sm">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Card */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/20 to-[#FCD34D]/20 rounded-3xl transform rotate-3"></div>
              <div className="relative z-10 bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
                <h3 className="text-xl font-bold text-slate-900 mb-6">Pro-Mentor Benefits</h3>
                <div className="space-y-4">
                  {[
                    { label: "Verified Badge", value: "Stand out with a verified pro status" },
                    { label: "Custom Profile", value: "Showcase your expertise and achievements" },
                    { label: "Priority Support", value: "Get help when you need it from our team" },
                    { label: "Analytics Dashboard", value: "Track your sessions and earnings" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-[#8B5CF6]" />
                      </div>
                      <div>
                        <span className="font-semibold text-slate-900">{item.label}</span>
                        <p className="text-slate-500 text-sm">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-[#8B5CF6]/10 to-[#FCD34D]/10 border border-[#8B5CF6]/20">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 text-sm">Average monthly earnings</span>
                    <span className="text-2xl font-black text-[#8B5CF6]">$500+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Requirements */}
          <div className="mt-24">
            <h2 className="text-3xl font-black text-center text-slate-900 mb-12">Pro-Mentor Requirements</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "5+ Years Experience", desc: "Proven track record in your domain" },
                { title: "Professional Background", desc: "Currently employed or established expert" },
                { title: "Verified Profile", desc: "Complete verification process" },
              ].map((item, idx) => (
                <div key={idx} className="text-center p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#8B5CF6]/20">
                    <Crown className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-20 text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-slate-200 shadow-lg">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-slate-700 font-semibold">Join 200+ Pro-Mentors earning on LetAsk</span>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login/promentor">
                <button className="px-10 py-4 bg-[#8B5CF6] text-white font-bold rounded-full shadow-lg hover:bg-[#7C3AED] hover:scale-105 transition-all">
                  Apply as Pro-Mentor
                </button>
              </Link>
              <Link href="/">
                <button className="px-10 py-4 bg-white text-slate-700 border-2 border-slate-200 font-bold rounded-full hover:bg-slate-50 transition-all">
                  Back to Home
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
