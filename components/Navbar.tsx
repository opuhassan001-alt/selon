"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface NavbarProps {
  onOpenRegister: () => void;
  onOpenTrack: () => void;
}

export function Navbar({ onOpenRegister, onOpenTrack }: NavbarProps) {
  const [bstTime, setBstTime] = useState<string>("--:-- -- BST");
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      const timeStr = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Dhaka",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(now);
      setBstTime(`${timeStr} BST`);
    }

    updateClock();
    const interval = setInterval(updateClock, 1000);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      clearInterval(interval);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0c1220]/95 backdrop-blur-md border-b border-[#1f2639] py-3"
          : "bg-transparent py-4"
      } px-4 sm:px-8`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Monogram & Name */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-[#e8220a] flex items-center justify-center text-white font-serif font-bold text-lg shadow-lg shadow-[#e8220a]/20 group-hover:scale-105 transition-transform">
              H
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight text-white">
                Hair and Care <span className="text-[#e8220a]">bd</span>
              </span>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Bangladesh Salon Marketplace
              </p>
            </div>
          </Link>

          {/* BST Live Clock */}
          <div className="hidden lg:flex items-center space-x-1.5 pl-3 border-l border-[#1f2639] text-[11px] text-slate-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Dhaka Time:</span>
            <span className="text-slate-200 font-semibold">{bstTime}</span>
          </div>
        </div>

        {/* Navigation Quick Links */}
        <div className="hidden md:flex items-center space-x-6 text-xs font-medium text-slate-300">
          <a href="#recommended-studios" className="hover:text-white transition-colors">
            Recommended Studios
          </a>
          <a href="#booking-engine" className="hover:text-white transition-colors">
            Reserve Chair
          </a>
          <a href="#barbers" className="hover:text-white transition-colors">
            Master Barbers
          </a>
          <button
            onClick={onOpenTrack}
            className="hover:text-amber-400 flex items-center space-x-1 text-slate-300 transition-colors"
          >
            <span>Track Token</span>
          </button>
        </div>

        {/* Action Controls & Dashboards */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenRegister}
            className="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 rounded-md border border-[#243050] hover:border-[#e8220a] text-xs font-semibold text-white transition-all bg-[#172138]"
          >
            <span>+ List Your Salon</span>
          </button>

          <Link
            href="/admin"
            className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-md bg-[#e8220a] hover:bg-[#c11a07] text-white text-xs font-semibold shadow-md shadow-[#e8220a]/20 transition-all"
            title="Super Admin Control Center (The Super Page)"
          >
            <span>Super Admin</span>
          </Link>

          <Link
            href="/portal"
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-md border border-[#1f2639] hover:bg-white/5 text-xs text-slate-300 transition-colors"
            title="Salon Partner Merchant Portal"
          >
            <span>Merchant</span>
            <span className="text-[10px] text-slate-500">↗</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}

