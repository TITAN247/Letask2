"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Sparkles, GraduationCap, Heart, Users, Trophy, CheckCircle } from "lucide-react";
import Logo from "@/components/Logo";

export default function PreMentorPage() {
  return (
    <main className="min-h-screen bg-white overflow-x-hidden font-sans">
      {/* Header */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-10 py-5 max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-3 cursor-pointer">
          <Logo size={40} showText={true} />
        </Link>
        <Link 
          href="/"
          className="flex items-center gap-2 text-slate-600 hover:text-[#84CC16] font-semibold transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Home
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#F0FDF4] via-[#ECFCCB] to-white pb-24 pt-12 overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 right-10 w-72 h-72 bg-[#84CC16]/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-[#FCD34D]/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#84CC16]/10 text-[#65A30D] text-sm font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-4 h-4" /> For Pre-Mentors
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
              Start Your <span className="text-[#84CC16]">Mentorship Journey</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              You do not need decades of experience to help someone. Share what you have learned 
              and grow alongside your mentees. Perfect for early-career professionals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative order-2 md:order-1">
              <div className="absolute inset-0 bg-gradient-to-br from-[#84CC16]/20 to-[#FCD34D]/20 rounded-3xl transform -rotate-3"></div>
              <Image
                src="/assets/hero-pointing.png"
                alt="Pre-Mentor"
                width={500}
                height={500}
                className="relative z-10 w-full h-auto drop-shadow-2xl"
              />
            </div>

            {/* Benefits */}
            <div className="space-y-6 order-1 md:order-2">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">Why Become a Pre-Mentor?</h2>
              
              {[
                { icon: GraduationCap, title: "Build Your Profile", desc: "Establish yourself as a mentor while learning the ropes" },
                { icon: Heart, title: "Give Back", desc: "Help others who are where you were just a few years ago" },
                { icon: Users, title: "Grow Your Network", desc: "Connect with mentees and other mentors in the community" },
                { icon: Trophy, title: "Upgrade to Pro", desc: "Top Pre-Mentors can apply to become paid Pro-Mentors" },
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-4 p-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-xl bg-[#84CC16]/10 flex items-center justify-center shrink-0">
                    <benefit.icon className="w-6 h-6 text-[#84CC16]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1">{benefit.title}</h3>
                    <p className="text-slate-600 text-sm">{benefit.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Who Is This For */}
          <div className="mt-24">
            <h2 className="text-3xl font-black text-center text-slate-900 mb-12">Who Can Be a Pre-Mentor?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Early Career Professionals", desc: "2-5 years of experience in your field" },
                { title: "Career Switchers", desc: "Successfully transitioned between industries" },
                { title: "Skilled Learners", desc: "Self-taught experts with practical knowledge" },
              ].map((item, idx) => (
                <div key={idx} className="text-center p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#84CC16] to-[#65A30D] text-white flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#84CC16]/20">
                    <GraduationCap className="w-8 h-8" />
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
              <span className="text-slate-700 font-semibold">Join 500+ Pre-Mentors already helping others</span>
            </div>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login/prementor">
                <button className="px-10 py-4 bg-[#84CC16] text-white font-bold rounded-full shadow-lg hover:bg-[#65A30D] hover:scale-105 transition-all">
                  Apply as Pre-Mentor
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
