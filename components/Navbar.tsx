"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface NavbarProps {
  onOpenRegister: () => void;
  onOpenTrack: () => void;
}

export function Navbar({ onOpenRegister, onOpenTrack }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-200 border-b ${
        scrolled ? "border-[#EAEAEA] shadow-sm" : "border-[#EAEAEA]"
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 h-[72px] flex items-center justify-between">
        
        {/* Left: Hair and Care bd Brand Identity & Category Links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group focus:outline-none" aria-label="Hair and Care bd Homepage">
            <span className="w-8 h-8 rounded-lg bg-[#0D0D0D] flex items-center justify-center text-white shrink-0 group-hover:bg-[#E8220A] transition-colors shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.828 2.828a4 4 0 11-5.657-5.656l2.828-2.829 8.486 8.486z" />
              </svg>
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-extrabold tracking-tight text-[#0D0D0D] uppercase font-sans">
                Hair and Care
              </span>
              <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-[#E8220A] text-white tracking-wider uppercase">
                bd
              </span>
            </div>
          </Link>

          <nav className="hidden xl:flex items-center gap-6 text-[15px] font-medium text-[#5E5E5E]">
            <Link href="/browse?category=hair" className="hover:text-[#0D0D0D] transition-colors">Hair Salons</Link>
            <Link href="/browse?category=barber" className="hover:text-[#0D0D0D] transition-colors">Barbershops</Link>
            <Link href="/browse?category=nails" className="hover:text-[#0D0D0D] transition-colors">Nails</Link>
            <Link href="/browse?category=massage" className="hover:text-[#0D0D0D] transition-colors">Massage</Link>
            <Link href="/browse?category=spa" className="hover:text-[#0D0D0D] transition-colors">Spas</Link>
            <Link href="/browse?category=medspa" className="hover:text-[#0D0D0D] transition-colors">Medspas</Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          
          {/* Track Token Button */}
          <button
            onClick={onOpenTrack}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F3F3F6] hover:bg-[#EAEAEA] text-xs font-semibold text-[#0D0D0D] transition-all"
          >
            <svg className="w-3.5 h-3.5 text-[#5E5E5E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Track booking</span>
          </button>

          {/* Log In Link */}
          <button
            onClick={() => alert("Log in / Sign up: Ready via SMS OTP.")}
            className="text-sm font-semibold text-[#0D0D0D] hover:text-black px-3 py-2 transition-colors"
          >
            Log in
          </button>

          {/* For Businesses Button */}
          <button
            onClick={onOpenRegister}
            className="hidden md:inline-flex items-center justify-center px-4 py-2 rounded-full border border-[#D1D1D6] hover:border-[#0D0D0D] text-sm font-semibold text-[#0D0D0D] transition-all"
          >
            For businesses
          </button>

          {/* Hamburger Menu Toggle */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2.5 rounded-full hover:bg-[#F3F3F6] transition-colors text-[#0D0D0D] focus:outline-none"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#EAEAEA] py-2 z-50 animate-fadeIn">
                <button
                  onClick={() => { setMenuOpen(false); alert("Log in / Sign up ready."); }}
                  className="w-full text-left px-5 py-3 text-sm font-medium text-[#0D0D0D] hover:bg-[#F9F9FB] flex items-center justify-between"
                >
                  <span>Log in or sign up</span>
                  <span className="text-xs text-gray-400">→</span>
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onOpenTrack(); }}
                  className="w-full text-left px-5 py-3 text-sm font-medium text-[#0D0D0D] hover:bg-[#F9F9FB] block"
                >
                  Track booking / Queue radar
                </button>
                <Link
                  href="/browse"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-left px-5 py-3 text-sm font-medium text-[#0D0D0D] hover:bg-[#F9F9FB] block"
                >
                  Browse all salons
                </Link>
                <div className="my-1 border-t border-gray-100"></div>
                <button
                  onClick={() => { setMenuOpen(false); onOpenRegister(); }}
                  className="w-full text-left px-5 py-3 text-sm font-semibold text-[#E8220A] hover:bg-[#F9F9FB] block"
                >
                  For businesses & Partners
                </button>
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-left px-5 py-3 text-sm font-medium text-gray-600 hover:bg-[#F9F9FB] block"
                >
                  Super Admin Control Center
                </Link>
                <Link
                  href="/portal"
                  onClick={() => setMenuOpen(false)}
                  className="w-full text-left px-5 py-3 text-sm font-medium text-gray-600 hover:bg-[#F9F9FB] block"
                >
                  Merchant Portal
                </Link>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
