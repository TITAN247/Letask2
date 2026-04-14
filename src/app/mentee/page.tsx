"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Sparkles, Users, MessageCircle, Calendar, Star, CheckCircle } from "lucide-react";
import Logo from "@/components/Logo";

export default function MenteePage() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white overflow-x-hidden font-sans">
      {/* Header */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-10 py-5 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3 cursor-pointer">
          <Logo size={40} showText={true} />
        </Link>
        <Link 
          href="/"
          className="flex items-center gap-2 text-slate-600 hover:text-[#0EA5E9] font-semibold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Home
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#E0F7FF] via-[#F0Faff] to-white pb-24 pt-12 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#0EA5E9]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#FCD34D]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] text-sm font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-4 h-4" /> For Mentees
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
              Find Your <span className="text-[#0EA5E9]">Perfect Mentor</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Connect with experienced professionals who have been exactly where you are. 
              Get personalized guidance for your career, studies, and life decisions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Benefits */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">Why Join as a Mentee?</h2>
              
              {[
                { icon: Users, title: "Access to Verified Mentors", desc: "Connect with both Pro-Mentors and Pre-Mentors across various domains" },
                { icon: MessageCircle, title: "1-on-1 Personalized Sessions", desc: "Book video calls or chat sessions tailored to your specific needs" },
                { icon: Calendar, title: "Flexible Scheduling", desc: "Choose time slots that work for your schedule" },
                { icon: Star, title: "Free & Paid Options", desc: "Learn from Pre-Mentors for free or upgrade to Pro-Mentors" },
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-xl bg-[#0EA5E9]/10 flex items-center justify-center shrink-0">
                    <benefit.icon className="w-6 h-6 text-[#0EA5E9]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{benefit.title}</h3>
                    <p className="text-slate-600 text-sm">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0EA5E9]/20 to-[#FCD34D]/20 rounded-3xl transform rotate-3"></div>
              <Image
                src="/assets/hero-smiling.png"
                alt="Happy Mentee"
                width={500}
                height={500}
                className="relative z-10 w-full h-auto drop-shadow-2xl"
              />
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-24">
            <h2 className="text-3xl font-black text-center text-slate-900 mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "1", title: "Explore Mentors", desc: "Browse through our diverse pool of mentors and filter by expertise" },
                { step: "2", title: "Book a Session", desc: "Select your preferred time slot and book a video or chat session" },
                { step: "3", title: "Start Learning", desc: "Connect with your mentor and get personalized guidance" },
              ].map((item, idx) => (
                <div key={idx} className="text-center p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] text-white font-black text-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#0EA5E9]/20">
                    {item.step}
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
              <span className="text-slate-700 font-semibold">Join 1000+ mentees already learning</span>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login/mentee">
                <button className="px-10 py-4 bg-[#0EA5E9] text-white font-bold rounded-full shadow-lg hover:bg-[#0284C7] hover:scale-105 transition-all">
                  Get Started as Mentee
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
