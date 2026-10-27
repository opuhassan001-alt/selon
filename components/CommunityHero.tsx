"use client";

import React, { useState } from "react";

const OUTER_MEMBERS = [
  {
    id: "m-1",
    name: "Master Belal",
    message: "Midnight fade slots live!",
    image: "/assets/barber-1.jpg",
    angle: 0,
    online: true,
    dotColor: "#10B981",
    ringColor: "#00F0FF",
    reverseBubble: true,
  },
  {
    id: "m-2",
    name: "Zubair K.",
    message: "Booked skin fade Dhanmondi",
    image: "/assets/service-hair.jpg",
    angle: 72,
    online: true,
    dotColor: "#00F0FF",
    ringColor: "#FF1E56",
    reverseBubble: false,
  },
  {
    id: "m-3",
    name: "Farhan",
    message: "VIP cabin open 10PM - 2AM",
    image: "/assets/barber-3.jpg",
    angle: 150,
    online: true,
    dotColor: "#10B981",
    ringColor: "#00F0FF",
    isPulseBubble: true,
    reverseBubble: false,
  },
  {
    id: "m-4",
    name: "Tanvir Ahmed",
    message: "Straight razor shave is elite",
    image: "/assets/service-shave.jpg",
    angle: 225,
    online: true,
    dotColor: "#10B981",
    ringColor: "#00F0FF",
    reverseBubble: false,
  },
  {
    id: "m-5",
    name: "Ayman S.",
    message: "Syndicate member #412",
    image: "/assets/service-style.jpg",
    angle: 300,
    online: true,
    dotColor: "#FF1E56",
    ringColor: "#FF1E56",
    reverseBubble: true,
  },
];

const MIDDLE_MEMBERS = [
  {
    id: "mid-1",
    name: "Shafikur",
    message: "Beard sculpting masterclass",
    image: "/assets/barber-2.jpg",
    angle: 35,
    online: true,
    dotColor: "#00F0FF",
    ringColor: "#00F0FF",
    reverseBubble: true,
  },
  {
    id: "mid-2",
    name: "Riyad M.",
    message: "Best taper in Banani",
    image: "/assets/service-trim.jpg",
    angle: 120,
    online: true,
    dotColor: "#FF1E56",
    ringColor: "#FF1E56",
    reverseBubble: false,
  },
  {
    id: "mid-3",
    name: "Tariqul",
    message: "Locking slots for Friday night",
    image: "/assets/barber-4.jpg",
    angle: 210,
    online: true,
    dotColor: "#10B981",
    ringColor: "#00F0FF",
    reverseBubble: true,
  },
  {
    id: "mid-4",
    name: "Saifullah",
    message: "Hot towel compress ready",
    image: "/assets/client-callum.jpg",
    angle: 315,
    online: true,
    dotColor: "#10B981",
    ringColor: "#FF1E56",
    reverseBubble: false,
  },
];

const getCircleCoords = (angleDeg: number) => {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    left: `${(50 + 50 * Math.cos(rad)).toFixed(2)}%`,
    top: `${(50 + 50 * Math.sin(rad)).toFixed(2)}%`,
  };
};

interface CommunityHeroProps {
  onJoinClick?: () => void;
  onExploreClick?: () => void;
}

export function CommunityHero({ onJoinClick, onExploreClick }: CommunityHeroProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleJoin = () => {
    if (onJoinClick) {
      onJoinClick();
    } else {
      setModalOpen(true);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText("https://discord.gg/hairandcare-bd");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="relative w-full min-h-[92vh] flex items-center justify-center overflow-hidden bg-[#050508] select-none pt-16">
      {/* Background Batman Visual Art */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/hero-batman-bg.jpg"
          alt="Hair and Care Batman Barbershop"
          className="w-full h-full object-cover object-center filter brightness-[1.08] contrast-[1.18]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050508]/45 via-transparent to-[#0c1220]" />
      </div>

      {/* Orbit Rings Canvas */}
      <div className="relative w-full h-[85vmin] max-h-[750px] flex items-center justify-center pointer-events-none z-10">
        {/* Ring 1 - Inner */}
        <div className="absolute w-[44vmin] h-[44vmin] rounded-full border border-cyan-400/20 shadow-[0_0_20px_rgba(0,240,255,0.06)]" />

        {/* Ring 2 - Middle (Counter-clockwise) */}
        <div className="absolute w-[64vmin] h-[64vmin] rounded-full border border-pink-500/25 animate-[spin_55s_linear_infinite_reverse]">
          {MIDDLE_MEMBERS.map((m) => {
            const coords = getCircleCoords(m.angle);
            return (
              <div
                key={m.id}
                style={{
                  position: "absolute",
                  left: coords.left,
                  top: coords.top,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div
                  className={`animate-[spin_55s_linear_infinite] flex items-center gap-2.5 pointer-events-auto ${
                    m.reverseBubble ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="relative shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.image}
                      alt={m.name}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-white shadow-lg"
                      style={{
                        outline: `2px solid ${m.ringColor}`,
                        outlineOffset: "2px",
                      }}
                    />
                    <span
                      className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#050508]"
                      style={{ backgroundColor: m.dotColor }}
                    />
                  </div>
                  <div className="hidden sm:flex items-center shrink-0 whitespace-nowrap gap-2 py-1 px-3 rounded-full bg-[#12121A]/95 border border-cyan-400/40 shadow-lg backdrop-blur-md">
                    <span
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: m.dotColor }}
                    />
                    <div className="text-left shrink-0">
                      <span className="font-bold text-white text-xs block leading-tight">
                        {m.name}
                      </span>
                      <span className="text-slate-400 text-[10px] block leading-tight">
                        {m.message}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ring 3 - Outer (Clockwise) */}
        <div className="absolute w-[84vmin] h-[84vmin] rounded-full border border-cyan-400/30 animate-[spin_68s_linear_infinite]">
          {OUTER_MEMBERS.map((m) => {
            const coords = getCircleCoords(m.angle);
            return (
              <div
                key={m.id}
                style={{
                  position: "absolute",
                  left: coords.left,
                  top: coords.top,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div
                  className={`animate-[spin_68s_linear_infinite_reverse] flex items-center gap-3 pointer-events-auto ${
                    m.reverseBubble ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="relative shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={m.image}
                      alt={m.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white shadow-xl"
                      style={{
                        outline: `2px solid ${m.ringColor}`,
                        outlineOffset: "2px",
                      }}
                    />
                    <span
                      className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#050508]"
                      style={{ backgroundColor: m.dotColor }}
                    />
                  </div>
                  <div className="hidden sm:flex items-center shrink-0 whitespace-nowrap gap-2.5 py-1.5 px-3.5 rounded-full bg-[#12121A]/95 border border-cyan-400/50 shadow-xl backdrop-blur-md">
                    <span
                      className="w-2.5 h-2.5 rounded-full animate-pulse"
                      style={{ backgroundColor: m.dotColor }}
                    />
                    <div className="text-left shrink-0">
                      <span className="font-bold text-white text-xs block leading-tight">
                        {m.name}
                      </span>
                      <span className="text-slate-400 text-[10px] block leading-tight">
                        {m.message}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Center Headline */}
        <div className="absolute z-20 pointer-events-auto text-center flex flex-col items-center justify-center max-w-sm px-4">
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-cyan-300 font-bold mb-2 bg-black/60 px-3 py-1 rounded-full border border-cyan-400/30 backdrop-blur-md">
            Bangladesh Grooming Network
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-white font-bold tracking-tight uppercase leading-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
            The Next Cut <br />
            <span className="text-[#e8220a] drop-shadow-[0_0_20px_rgba(232,34,10,0.6)]">
              Is Yours.
            </span>
          </h1>
          <p className="text-xs text-slate-300 mt-3 font-medium leading-relaxed max-w-xs drop-shadow bg-black/40 p-2 rounded-lg backdrop-blur-sm">
            Live queue reservations, master barbers, and authentic reviews across 64 districts.
          </p>
          <div className="flex items-center gap-3 mt-5">
            <a
              href="#booking-engine"
              className="px-5 py-2.5 rounded-full bg-[#e8220a] hover:bg-[#c11a07] text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-[#e8220a]/30 transition-all hover:scale-105"
            >
              Book a Chair Now
            </a>
            <button
              onClick={handleJoin}
              className="px-4 py-2.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-cyan-400/30 transition-all hover:scale-105"
            >
              Join Syndicate
            </button>
          </div>
        </div>
      </div>

      {/* Syndicate Community Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121622] border border-[#243050] rounded-2xl w-full max-w-md p-6 space-y-5 text-slate-200">
            <div className="flex items-center justify-between border-b border-[#243050] pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold text-cyan-400">
                  Exclusive Grooming Community
                </span>
                <h3 className="text-lg font-bold text-white">Join The Hair & Care Syndicate</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Connect with 2,400+ master barbers and grooming enthusiasts in Bangladesh.
              Get secret midnight booking slots, 15% VIP discounts, and exclusive haircut art drops.
            </p>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleCopy}
                className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>{copied ? "✓ Invite Link Copied!" : "Copy Community Discord Invite"}</span>
              </button>

              <button
                onClick={() => setModalOpen(false)}
                className="w-full py-2.5 rounded-lg bg-[#172138] hover:bg-[#243050] text-slate-200 font-semibold text-xs transition-colors"
              >
                Continue Browsing Salons
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

