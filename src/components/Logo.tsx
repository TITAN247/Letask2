"use client";

import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: number;
  showText?: boolean;
  textColor?: string;
}

export default function Logo({ size = 40, showText = true, textColor = "text-slate-800" }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Logo Image */}
      <Image
        src="/assets/logo.jpeg?v=2"
        alt="LetAsk Logo"
        width={size}
        height={size}
        className="rounded-lg object-contain"
        priority
      />
      
      {showText && (
        <span className={`text-xl md:text-2xl font-black tracking-tight ${textColor}`}>
          LetAsk
        </span>
      )}
    </div>
  );
}

// Simple logo icon variant for small spaces
export function LogoIcon({ size = 40 }: { size?: number }) {
  return (
    <Image
      src="/assets/logo.jpeg?v=2"
      alt="LetAsk Logo"
      width={size}
      height={size}
      className="rounded-lg object-contain"
      priority
    />
  );
}
