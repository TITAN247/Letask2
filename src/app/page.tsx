"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Sparkles, MessageCircle, Users, Calendar, Star, Shield, Zap } from "lucide-react";
import Logo from "@/components/Logo";

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loginStep, setLoginStep] = useState<'main' | 'mentor'>('main');

  return (
    <main className="min-h-screen bg-white overflow-x-hidden font-sans">
      {/* 
        HERO SECTION 
        Background: Gradient blue with subtle grid/texture 
        Content: Navbar + Hero Text + Character + Floating Cards
      */}
      {/* 
        HERO SECTION 
        Background: Gradient blue with subtle grid/texture 
        Content: Navbar + Hero Text + Character + Floating Cards
      */}
      <section className="relative hero-bg pb-32 pt-6 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute top-40 right-20 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-float-medium"></div>
          <div className="absolute bottom-20 left-1/3 w-32 h-32 bg-amber-300/20 rounded-full blur-xl animate-float-fast"></div>
          <div className="absolute top-10 right-1/3 w-24 h-24 bg-white/10 rounded-full blur-lg animate-float-slow"></div>
          <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-20 h-20 bg-amber-200/10 rounded-full blur-2xl animate-float-medium"></div>
        </div>
        
        {/* Star particles - static positions for SSR compatibility */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
              style={{
                top: `${[15, 25, 35, 45, 55, 65, 75, 85, 20, 30, 40, 50, 60, 70, 80, 90, 10, 33, 67, 88][i]}%`,
                left: `${[10, 20, 30, 40, 50, 60, 70, 80, 90, 15, 25, 35, 45, 55, 65, 75, 85, 5, 40, 72][i]}%`,
                animationDelay: `${[0.1, 0.3, 0.5, 0.7, 0.9, 1.1, 1.3, 1.5, 1.7, 1.9, 2.1, 2.3, 2.5, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4][i]}s`,
                opacity: [0.5, 0.7, 0.4, 0.8, 0.6, 0.9, 0.3, 0.5, 0.7, 0.4, 0.8, 0.6, 0.9, 0.3, 0.5, 0.7, 0.4, 0.8, 0.6, 0.9][i]
              }}
            />
          ))}
        </div>
        
        {/* Navbar */}
        <nav className="relative z-50 flex items-center justify-between px-4 sm:px-6 md:px-10 py-4 sm:py-5 max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2 sm:gap-3 cursor-pointer">
            <Logo size={40} textColor="text-white" showText={true} />
          </Link>
          <div className="flex items-center gap-4">
            <button
              className="hidden md:block px-8 py-2.5 text-white bg-[#EF4444] rounded-full font-bold text-sm shadow-lg hover:bg-[#DC2626] hover:scale-105 active:scale-95 transition-all duration-300"
              onClick={() => setIsLoginOpen(true)}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLoginOpen(true)}
              className="px-8 py-2.5 text-[#0EA5E9] bg-white rounded-full font-bold text-sm shadow-lg hover:shadow-xl hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all duration-300">
              Get Started
            </button>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 px-6 max-w-5xl mx-auto text-center mt-12 md:mt-16">
          {/* Glow effect behind headline */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-[#0EA5E9]/20 via-[#FCD34D]/20 to-[#0EA5E9]/20 blur-[100px] rounded-full pointer-events-none"></div>
          
          <h1 className="relative text-4xl md:text-5xl lg:text-[64px] font-extrabold text-white mb-6 leading-[1.15] drop-shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
            Stuck on a problem? Confused about<br className="hidden md:block" />
            your next step? <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">Stop Searching.</span>
          </h1>
          <p className="text-sky-50 text-base md:text-lg max-w-3xl mx-auto mb-16 font-medium leading-relaxed drop-shadow-md">
            Connect with mentors who've already been there. Get guidance that actually helps across
            careers, learning, business, and life decisions.
          </p>
          
          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/70 animate-bounce">
            <span className="text-xs font-medium">Scroll to explore</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          {/* Character & Cards Container */}
          <div className="relative w-full max-w-5xl mx-auto h-[450px] md:h-[550px]">

            {/* Main Character */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 z-20 w-80 md:w-[520px] transition-all duration-500 hover:scale-[1.02]">
              <Image
                src="/assets/hero-smiling.png"
                alt="Smiling Mentor"
                width={500}
                height={500}
                className="w-full h-auto drop-shadow-2xl"
                priority
              />
            </div>

            {/* Floating Card: Mentee (Left) */}
            <Link href="/mentee" className="absolute top-10 left-2 md:left-4 bg-white/95 backdrop-blur-sm rounded-3xl px-6 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-56 md:w-72 text-center transform -rotate-3 z-10 border border-white/50 hover:rotate-0 transition-all duration-500 hover:scale-105 hover:shadow-[0_25px_60px_rgba(0,0,0,0.15)] cursor-pointer block">
              <h3 className="text-[#0EA5E9] font-black text-xl mb-2">For Mentee</h3>
              <p className="text-xs text-slate-500 leading-snug mb-4 font-medium">
                Get mentorship from experienced professionals. Book sessions, chat, and grow your career.
              </p>
              <div className="flex items-center justify-center gap-2 text-[#0EA5E9] text-xs font-bold">
                Learn More <span className="text-lg">→</span>
              </div>

              {/* Floating Badges */}
              <div className="absolute -bottom-10 -right-20 bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold text-slate-700 whitespace-nowrap animate-bounce-slow">
                <span className="text-[#EF4444] bg-red-100 rounded-full w-5 h-5 flex items-center justify-center text-[10px]">!</span>
                Career?
              </div>
              <div className="absolute -bottom-28 -right-8 bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold text-slate-700 whitespace-nowrap animate-bounce-slower">
                <span className="text-[#EF4444] bg-red-100 rounded-full w-5 h-5 flex items-center justify-center text-[10px]">!</span>
                Switching fields?
              </div>
            </Link>

            {/* Floating Card: Pre-mentor (Right Top) */}
            <Link href="/prementor" className="absolute top-8 right-2 md:right-4 bg-white/95 backdrop-blur-sm rounded-3xl px-6 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-56 md:w-72 text-center transform rotate-3 z-10 border border-white/50 hover:rotate-0 transition-all duration-500 hover:scale-105 hover:shadow-[0_25px_60px_rgba(0,0,0,0.15)] cursor-pointer block">
              <h3 className="text-[#84CC16] font-black text-xl mb-2">For Pre-mentor</h3>
              <p className="text-xs text-slate-500 leading-snug mb-4 font-medium">
                Early in your career? Start mentoring others and build your profile while helping others grow.
              </p>
              <div className="flex items-center justify-center gap-2 text-[#84CC16] text-xs font-bold">
                Learn More <span className="text-lg">→</span>
              </div>
            </Link>

            {/* Floating Card: Pro-mentor (Right Bottom) */}
            <Link href="/promentor" className="absolute bottom-12 right-0 md:-right-6 bg-white/95 backdrop-blur-sm rounded-3xl px-6 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.1)] w-56 md:w-72 text-center transform md:rotate-2 z-30 border border-white/50 hover:rotate-0 transition-all duration-500 hover:scale-105 hover:shadow-[0_25px_60px_rgba(0,0,0,0.15)] cursor-pointer block">
              <h3 className="text-[#8B5CF6] font-black text-xl mb-2">For Pro-mentor</h3>
              <p className="text-xs text-slate-500 leading-snug mb-4 font-medium">
                Experienced professional? Turn your expertise into income with paid mentorship sessions.
              </p>
              <div className="flex items-center justify-center gap-2 text-[#8B5CF6] text-xs font-bold">
                Learn More <span className="text-lg">→</span>
              </div>

              {/* Floating Badge */}
              <div className="absolute -top-12 -left-12 bg-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold text-slate-700 whitespace-nowrap animate-pulse-slow">
                <span className="text-[#22C55E] bg-green-100 rounded-full w-5 h-5 flex items-center justify-center text-[10px]">✓</span>
                Coding?
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* LOGIN MODAL */}
      {/* LOGIN MODAL */}
      {isLoginOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.currentTarget === e.target) {
              setIsLoginOpen(false);
              setLoginStep('main');
            }
          }}
        >
          <div className="relative w-full max-w-[1100px] mx-4 overflow-hidden rounded-[40px] bg-gradient-to-br from-[#E0F7FF] via-[#F0Faff] to-[#FFFFFF] shadow-2xl border-4 border-white">

            {/* Close Button */}
            <button
              aria-label="Close"
              className="absolute top-6 right-8 z-10 text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => {
                setIsLoginOpen(false);
                setLoginStep('main');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </button>

            {/* Content */}
            <div className="flex flex-col items-center pt-8 pb-16 px-8">

              {/* Header */}
              <h2 className="text-5xl font-bold text-[#0EA5E9] mb-12 drop-shadow-sm tracking-tight font-sans">
                {loginStep === 'main' ? 'Log in' : 'Select Mentor Type'}
              </h2>

              {loginStep === 'main' ? (
                /* Step 1: Main Options - Mentee | Mentor */
                <div className="flex flex-col md:flex-row items-end justify-center gap-8 lg:gap-16 w-full">

                  {/* Mentee Option */}
                  <div className="flex flex-col items-center group cursor-pointer">
                    <div className="relative z-10 transition-transform duration-300 group-hover:-translate-y-2">
                      <Image
                        src="/assets/login-mentee-new.png"
                        alt="Login as Mentee"
                        width={320}
                        height={360}
                        className="object-contain h-[380px] w-auto drop-shadow-xl"
                      />
                    </div>
                    <Link href="/login/mentee">
                      <button className="relative -mt-4 z-20 bg-[#EBCB7F] hover:bg-[#E5C065] text-[#3F2E12] font-semibold text-lg py-3 px-10 rounded-lg shadow-md border-b-4 border-[#C7A860] active:border-b-0 active:translate-y-1 transition-all w-64 text-center">
                        Login as Mentee
                      </button>
                    </Link>
                  </div>

                  {/* Mentor Option */}
                  <Link href="/select-role?mode=login">
                    <div className="flex flex-col items-center group cursor-pointer">
                      <div className="relative z-10 transition-transform duration-300 group-hover:-translate-y-2">
                        <Image
                          src="/assets/login-mentor-combo.png"
                          alt="Login as Mentor"
                          width={320}
                          height={360}
                          className="object-contain h-[400px] w-auto drop-shadow-xl"
                        />
                      </div>
                      <button 
                        onClick={() => setIsLoginOpen(false)}
                        className="relative -mt-4 z-20 bg-[#EBCB7F] hover:bg-[#E5C065] text-[#3F2E12] font-semibold text-lg py-3 px-10 rounded-lg shadow-md border-b-4 border-[#C7A860] active:border-b-0 active:translate-y-1 transition-all w-64 text-center"
                      >
                        Login as Mentor
                      </button>
                    </div>
                  </Link>

                </div>
              ) : (
                /* Step 2: Mentor Options - PreMentor | ProMentor */
                <div className="flex flex-col md:flex-row items-end justify-center gap-8 lg:gap-16 w-full">

                  {/* PreMentor Option */}
                  <div className="flex flex-col items-center group cursor-pointer">
                    <div className="relative z-10 transition-transform duration-300 group-hover:-translate-y-2">
                      <Image
                        src="/assets/login-prementor-new.png"
                        alt="Login as PreMentor"
                        width={320}
                        height={360}
                        className="object-contain h-[400px] w-auto drop-shadow-xl"
                      />
                    </div>
                    <Link href="/login/prementor">
                      <button className="relative -mt-4 z-20 bg-[#EBCB7F] hover:bg-[#E5C065] text-[#3F2E12] font-semibold text-lg py-3 px-10 rounded-lg shadow-md border-b-4 border-[#C7A860] active:border-b-0 active:translate-y-1 transition-all w-64 text-center">
                        Login as PreMentor
                      </button>
                    </Link>
                  </div>

                  {/* ProMentor Option */}
                  <div className="flex flex-col items-center group cursor-pointer">
                    <div className="relative z-10 transition-transform duration-300 group-hover:-translate-y-2">
                      <Image
                        src="/assets/login-promentor-new.png"
                        alt="Login as ProMentor"
                        width={320}
                        height={360}
                        className="object-contain h-[400px] w-auto drop-shadow-xl"
                      />
                    </div>
                    <Link href="/login/promentor">
                      <button className="relative -mt-4 z-20 bg-[#EBCB7F] hover:bg-[#E5C065] text-[#3F2E12] font-semibold text-lg py-3 px-10 rounded-lg shadow-md border-b-4 border-[#C7A860] active:border-b-0 active:translate-y-1 transition-all w-64 text-center">
                        Login as ProMentor
                      </button>
                    </Link>
                  </div>

                </div>
              )}

              {/* Back Button for Mentor Step */}
              {loginStep === 'mentor' && (
                <button
                  onClick={() => setLoginStep('main')}
                  className="mt-8 text-gray-500 hover:text-gray-700 flex items-center gap-2 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Back to main options
                </button>
              )}
            </div>
          </div>
        </div>
      )}


      {/* 
        "YOU'RE NOT CONFUSED" SECTION 
      */}
      {/* 
        "YOU'RE NOT CONFUSED" SECTION 
      */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-left mb-16 md:max-w-3xl">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-4 tracking-tight">
            You're not <span className="text-[#0EA5E9]">confused.</span>
          </h2>
          <p className="text-xl md:text-2xl text-slate-500 font-medium leading-relaxed">
            You just need the right conversation.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-20">
          {/* List Items */}
          <div className="flex-1 space-y-6 w-full max-w-xl">
            {/* Item 1 */}
            <div className="bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-full py-4 px-8 flex items-center gap-5 w-fit md:ml-4 transform -rotate-1 hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-default group">
              <div className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-sm font-bold group-hover:bg-red-500 group-hover:text-white transition-colors">!</div>
              <span className="text-slate-600 text-base font-semibold">Making freelancing actually sustainable?</span>
            </div>
            {/* Item 2 */}
            <div className="bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-full py-4 px-8 flex items-center gap-5 w-fit md:ml-12 transform rotate-1 hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-default group">
              <div className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-sm font-bold group-hover:bg-red-500 group-hover:text-white transition-colors">!</div>
              <span className="text-slate-600 text-base font-semibold">Exam preparation strategy that fits YOUR schedule?</span>
            </div>
            {/* Item 3 (Green) */}
            <div className="bg-[#84CC16] shadow-[0_10px_30px_rgba(132,204,22,0.3)] rounded-full py-4 px-8 flex items-center gap-5 w-fit transform -rotate-2 hover:scale-110 hover:-rotate-1 transition-all duration-300 cursor-default">
              <div className="w-6 h-6 rounded-full bg-white text-[#84CC16] flex items-center justify-center text-sm font-bold">✓</div>
              <span className="text-white text-base font-bold tracking-wide">Career paths that actually work?</span>
            </div>
            {/* Item 4 */}
            <div className="bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-full py-4 px-8 flex items-center gap-5 w-fit md:ml-8 transform rotate-1 hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-default group">
              <div className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-sm font-bold group-hover:bg-red-500 group-hover:text-white transition-colors">!</div>
              <span className="text-slate-600 text-base font-semibold">Learning to code but don't know where to start?</span>
            </div>
            {/* Item 5 */}
            <div className="bg-white border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-full py-4 px-8 flex items-center gap-5 w-fit md:ml-2 transform -rotate-1 hover:scale-105 hover:shadow-lg transition-all duration-300 cursor-default group">
              <div className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-sm font-bold group-hover:bg-red-500 group-hover:text-white transition-colors">!</div>
              <span className="text-slate-600 text-base font-semibold">Startup Idea is good or just another shares?</span>
            </div>
          </div>

          {/* Pointing Character */}
          <div className="flex-1 relative flex justify-center lg:justify-end">
            <Image
              src="/assets/hero-pointing.png"
              alt="Pointing Mentor"
              width={650}
              height={650}
              className="w-full max-w-[550px] drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* 
        "STOP ENDLESS SEARCH" SECTION - Infinite Scrolling Logos
      */}
      <section className="py-20 text-center bg-slate-50/50 overflow-hidden">
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-3 tracking-tight">
          <span className="text-[#0EA5E9]">Stop</span> Endless Search
        </h2>
        <p className="text-lg md:text-xl text-slate-600 mb-14 font-medium max-w-2xl mx-auto">
          You have searched everywhere, on every platform
        </p>

        {/* Scrolling Marquee Container */}
        <div className="relative overflow-hidden">
          {/* Gradient Overlays for smooth fade */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50/50 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50/50 to-transparent z-10 pointer-events-none"></div>
          
          {/* Scrolling Track */}
          <div className="flex animate-scroll-infinite w-max">
            {/* First set of logos */}
            <div className="flex gap-8 px-4 shrink-0">
              {/* YouTube */}
              <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 min-w-[280px]">
                <div className="w-12 h-12 bg-[#FF0000] rounded-xl flex items-center justify-center shadow-lg shadow-red-200 shrink-0">
                  <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">YouTube</p>
                  <p className="text-slate-900 font-black text-lg">12 Videos watched</p>
                </div>
              </div>

              {/* Medium */}
              <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 min-w-[280px]">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shadow-lg shrink-0">
                  <span className="text-white font-serif font-bold text-xl">M</span>
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Medium</p>
                  <p className="text-slate-900 font-black text-lg">15 Articles read</p>
                </div>
              </div>

              {/* Reddit */}
              <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 min-w-[280px]">
                <div className="w-12 h-12 bg-[#FF4500] rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 shrink-0">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.56 4.679 1.481.308.245.497.608.497 1.007 0 .68-.546 1.251-1.251 1.25-.423 0-.818-.211-1.054-.562-.739-.88-2.029-1.439-3.422-1.439-1.387 0-2.67.556-3.407 1.431-.236.355-.631.57-1.055.57-.705 0-1.25-.571-1.25-1.25 0-.405.196-.772.512-1.02 1.203-.918 2.844-1.406 4.607-1.474l-.832-3.859-3.773.83c-.339.076-.628.283-.786.566-.155.283-.184.61-.08.919.186.554.765.876 1.327.789l1.78-.39 1.396 6.466c-1.849.14-3.535.633-4.73 1.489-.416.306-.684.786-.684 1.319 0 .906.736 1.642 1.642 1.642.508 0 .97-.231 1.277-.593.66-.781 1.82-1.275 3.137-1.275 1.319 0 2.478.492 3.138 1.272.307.363.77.596 1.277.596.906 0 1.642-.736 1.642-1.641 0-.539-.274-1.025-.699-1.334-1.203-.858-2.897-1.35-4.744-1.49l1.496-6.909z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Reddit</p>
                  <p className="text-slate-900 font-black text-lg">3 Threads asked</p>
                </div>
              </div>

              {/* Quora */}
              <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 min-w-[280px]">
                <div className="w-12 h-12 bg-[#B92B27] rounded-xl flex items-center justify-center shadow-lg shadow-red-200 shrink-0">
                  <span className="text-white font-bold text-xl">Q</span>
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Quora</p>
                  <p className="text-slate-900 font-black text-lg">8 Questions posted</p>
                </div>
              </div>

              {/* Twitter/X */}
              <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 min-w-[280px]">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shadow-lg shrink-0">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">X / Twitter</p>
                  <p className="text-slate-900 font-black text-lg">25 Tweets scrolled</p>
                </div>
              </div>

              {/* LinkedIn */}
              <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 min-w-[280px]">
                <div className="w-12 h-12 bg-[#0A66C2] rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">LinkedIn</p>
                  <p className="text-slate-900 font-black text-lg">10 Posts viewed</p>
                </div>
              </div>

              {/* Stack Overflow */}
              <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 min-w-[280px]">
                <div className="w-12 h-12 bg-[#F48024] rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 shrink-0">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
                    <path d="M15.725 0l-1.72 1.277 6.39 8.588 1.72-1.277L15.725 0zm-3.94 3.418l-1.369 1.644 8.225 6.85 1.369-1.644-8.225-6.85zm-3.15 4.465l-.905 1.94 9.702 4.517.904-1.94-9.701-4.517zm-1.85 4.86l-.44 2.093 10.473 2.201.44-2.092-10.473-2.203zM1.89 15.47V24h19.19v-8.53h-2.133v6.397H4.021v-6.396H1.89zm4.265 2.133v2.13h10.66v-2.13H6.154z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Stack Overflow</p>
                  <p className="text-slate-900 font-black text-lg">15 Questions searched</p>
                </div>
              </div>
            </div>

            {/* Duplicate set for seamless loop */}
            <div className="flex gap-8 px-4 shrink-0">
              {/* YouTube */}
              <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 min-w-[280px]">
                <div className="w-12 h-12 bg-[#FF0000] rounded-xl flex items-center justify-center shadow-lg shadow-red-200 shrink-0">
                  <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">YouTube</p>
                  <p className="text-slate-900 font-black text-lg">12 Videos watched</p>
                </div>
              </div>

              {/* Medium */}
              <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 min-w-[280px]">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shadow-lg shrink-0">
                  <span className="text-white font-serif font-bold text-xl">M</span>
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Medium</p>
                  <p className="text-slate-900 font-black text-lg">15 Articles read</p>
                </div>
              </div>

              {/* Reddit */}
              <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 min-w-[280px]">
                <div className="w-12 h-12 bg-[#FF4500] rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 shrink-0">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.56 4.679 1.481.308.245.497.608.497 1.007 0 .68-.546 1.251-1.251 1.25-.423 0-.818-.211-1.054-.562-.739-.88-2.029-1.439-3.422-1.439-1.387 0-2.67.556-3.407 1.431-.236.355-.631.57-1.055.57-.705 0-1.25-.571-1.25-1.25 0-.405.196-.772.512-1.02 1.203-.918 2.844-1.406 4.607-1.474l-.832-3.859-3.773.83c-.339.076-.628.283-.786.566-.155.283-.184.61-.08.919.186.554.765.876 1.327.789l1.78-.39 1.396 6.466c-1.849.14-3.535.633-4.73 1.489-.416.306-.684.786-.684 1.319 0 .906.736 1.642 1.642 1.642.508 0 .97-.231 1.277-.593.66-.781 1.82-1.275 3.137-1.275 1.319 0 2.478.492 3.138 1.272.307.363.77.596 1.277.596.906 0 1.642-.736 1.642-1.641 0-.539-.274-1.025-.699-1.334-1.203-.858-2.897-1.35-4.744-1.49l1.496-6.909z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Reddit</p>
                  <p className="text-slate-900 font-black text-lg">3 Threads asked</p>
                </div>
              </div>

              {/* Quora */}
              <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 min-w-[280px]">
                <div className="w-12 h-12 bg-[#B92B27] rounded-xl flex items-center justify-center shadow-lg shadow-red-200 shrink-0">
                  <span className="text-white font-bold text-xl">Q</span>
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Quora</p>
                  <p className="text-slate-900 font-black text-lg">8 Questions posted</p>
                </div>
              </div>

              {/* Twitter/X */}
              <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 min-w-[280px]">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center shadow-lg shrink-0">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">X / Twitter</p>
                  <p className="text-slate-900 font-black text-lg">25 Tweets scrolled</p>
                </div>
              </div>

              {/* LinkedIn */}
              <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 min-w-[280px]">
                <div className="w-12 h-12 bg-[#0A66C2] rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">LinkedIn</p>
                  <p className="text-slate-900 font-black text-lg">10 Posts viewed</p>
                </div>
              </div>

              {/* Stack Overflow */}
              <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 min-w-[280px]">
                <div className="w-12 h-12 bg-[#F48024] rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 shrink-0">
                  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
                    <path d="M15.725 0l-1.72 1.277 6.39 8.588 1.72-1.277L15.725 0zm-3.94 3.418l-1.369 1.644 8.225 6.85 1.369-1.644-8.225-6.85zm-3.15 4.465l-.905 1.94 9.702 4.517.904-1.94-9.701-4.517zm-1.85 4.86l-.44 2.093 10.473 2.201.44-2.092-10.473-2.203zM1.89 15.47V24h19.19v-8.53h-2.133v6.397H4.021v-6.396H1.89zm4.265 2.133v2.13h10.66v-2.13H6.154z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Stack Overflow</p>
                  <p className="text-slate-900 font-black text-lg">15 Questions searched</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* 
        "STILL NOT SURE" SECTION 
      */}
      {/* 
        "STILL NOT SURE" SECTION 
      */}
      <section className="py-24 text-center">
        <h2 className="text-3xl md:text-4xl font-black text-[#0EA5E9] mb-12 tracking-wide uppercase drop-shadow-sm">
          Still not sure what applies to <span className="text-[#0284C7] underline decoration-4 decoration-[#FCD34D] underline-offset-4">YOU</span>.
        </h2>

        <div className="relative inline-block mt-8">
          {/* Scribble effect over head */}
          <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 w-64 h-40 z-10 opacity-60">
            <svg viewBox="0 0 200 100" className="w-full h-full stroke-slate-400 fill-none stroke-[2] animate-pulse-slow">
              <path d="M40,50 Q60,20 90,50 T140,50 Q160,80 120,60 T80,40 Q50,70 90,80" />
              <path d="M50,40 Q80,10 110,40 T150,30" />
              <path d="M30,60 Q70,90 120,70" />
            </svg>
          </div>

          <Image
            src="/assets/confused.png"
            alt="Confused Student"
            width={480}
            height={480}
            className="relative z-0 hover:scale-105 transition-transform duration-500"
          />
        </div>
      </section>

      {/* 
        FEATURES SECTION
      */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] text-sm font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-4 h-4" /> Why Choose LetAsk
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Everything you need to <span className="text-[#0EA5E9]">grow faster</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            From casual advice to structured mentorship, we've got you covered.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: MessageCircle, title: "1-on-1 Video Calls", desc: "Face-to-face mentorship sessions with screen sharing and recording", color: "#0EA5E9" },
            { icon: Users, title: "Community Chat", desc: "Join group discussions and learn from peers in the community", color: "#84CC16" },
            { icon: Calendar, title: "Smart Scheduling", desc: "Book sessions that fit your timezone with automatic reminders", color: "#8B5CF6" },
            { icon: Star, title: "Verified Mentors", desc: "All mentors are vetted and rated by the community", color: "#F97316" },
            { icon: Shield, title: "Safe & Secure", desc: "Your data and conversations are encrypted and private", color: "#EF4444" },
            { icon: Zap, title: "Instant Matching", desc: "AI-powered matching to find the perfect mentor for your goals", color: "#FCD34D" },
          ].map((feature, idx) => (
            <div key={idx} className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${feature.color}15` }}>
                <feature.icon className="w-7 h-7" style={{ color: feature.color }} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 
        HOW IT WORKS SECTION
      */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              How it <span className="text-[#0EA5E9]">works</span>
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Get started in minutes, not days
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Create Profile", desc: "Sign up and tell us what you're looking for" },
              { step: "02", title: "Find Mentor", desc: "Browse and filter mentors by expertise" },
              { step: "03", title: "Book Session", desc: "Schedule a time that works for both of you" },
              { step: "04", title: "Start Learning", desc: "Connect via video call and level up" },
            ].map((item, idx) => (
              <div key={idx} className="relative text-center">
                {idx < 3 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-[#0EA5E9]/30 to-[#0EA5E9]/10"></div>
                )}
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] text-white flex flex-col items-center justify-center mx-auto mb-6 shadow-lg shadow-[#0EA5E9]/20 relative z-10">
                  <span className="text-3xl font-black">{item.step}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 
        STATS SECTION
      */}
      <section className="py-20 bg-[#0EA5E9]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10K+", label: "Active Mentees" },
              { number: "2,500+", label: "Expert Mentors" },
              { number: "50K+", label: "Sessions Completed" },
              { number: "4.9/5", label: "Average Rating" },
            ].map((stat, idx) => (
              <div key={idx} className="text-white">
                <div className="text-4xl md:text-5xl font-black mb-2">{stat.number}</div>
                <div className="text-sky-100 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 
        TESTIMONIALS SECTION
      */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            Loved by <span className="text-[#0EA5E9]">thousands</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            See what our community has to say
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: "Sarah K.", role: "Software Engineer", quote: "LetAsk helped me transition from marketing to tech. My mentor guided me through every step of learning to code.", rating: 5 },
            { name: "Michael R.", role: "Product Manager", quote: "The quality of mentors here is incredible. I found a senior PM who helped me nail my interviews at top companies.", rating: 5 },
            { name: "Priya M.", role: "Startup Founder", quote: "As a first-time founder, having access to experienced mentors saved me from so many mistakes. Worth every penny.", rating: 5 },
          ].map((testimonial, idx) => (
            <div key={idx} className="p-8 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-slate-700 mb-6 leading-relaxed">"{testimonial.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] flex items-center justify-center text-white font-bold">
                  {testimonial.name[0]}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{testimonial.name}</div>
                  <div className="text-sm text-slate-500">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 
        FAQ SECTION
      */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
              Frequently <span className="text-[#0EA5E9]">Asked</span>
            </h2>
            <p className="text-xl text-slate-600">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { q: "How much does it cost?", a: "Pre-Mentors offer free sessions. Pro-Mentors set their own rates, typically $20-100 per hour. You only pay for the sessions you book." },
              { q: "Can I switch mentors?", a: "Absolutely! You're free to book sessions with any mentor. Find the one whose style and expertise match your needs." },
              { q: "What if I'm not satisfied?", a: "We offer a satisfaction guarantee. If your first session doesn't meet expectations, we'll credit your account for another mentor." },
              { q: "How do I become a mentor?", a: "Anyone can apply to be a Pre-Mentor. For Pro-Mentor status, you'll need 5+ years of professional experience and pass our verification process." },
            ].map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 
        CTA / FOOTER 
      */}
      <section className="pb-32 pt-16 text-center bg-gradient-to-t from-slate-50 to-white">
        <p className="text-slate-600 text-xl mb-10 max-w-2xl mx-auto px-6 font-semibold leading-relaxed">
          Why search endlessly when you can talk to someone who faced something similar.
        </p>

        <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-12 tracking-tight">
          Don't stay stuck, <span className="text-[#0EA5E9]">just letAsk!!!</span>
        </h2>

        <button 
          onClick={() => setIsLoginOpen(true)}
          className="px-10 py-4 bg-white border-2 border-red-100 text-[#EF4444] text-lg font-bold rounded-xl hover:bg-red-50 hover:border-red-200 transition-all shadow-md hover:shadow-lg flex items-center gap-3 mx-auto group">
          Get Started <span className="text-[#EF4444] group-hover:translate-x-1 transition-transform">→</span>
        </button>
      </section>

    </main>
  );
}

