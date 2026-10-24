import React, { useState, useEffect } from "react";

// ============================================================================
// BRAND & COLOR PALETTE: "Neon Underworld" (Cyber-Goth / Dark Gaming Vibe)
// ============================================================================
// Void Background:  #050508 (Rich midnight black with subtle blue undertone)
// Card/Panels:      #12121A (Dark slate-indigo)
// Primary Accent:   #FF1E56 (Hyper-vibrant neon magenta-red glow)
// Secondary Pop:    #00F0FF (Electric cyan)
// Headlines:        #FFFFFF (Pure punchy white)
// Subtext:          #8F90A6 (Muted slate-gray)
// ============================================================================

// Sample Community Data (Barbers & Clients Cutting Hair)
const OUTER_MEMBERS = [
  {
    id: "m-1",
    name: "Master Belal",
    message: "Midnight fade slots live!",
    image: "assets/barber-1.jpg",
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
    image: "assets/service-hair.jpg",
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
    image: "assets/barber-3.jpg",
    angle: 150,
    online: true,
    dotColor: "#10B981",
    ringColor: "#00F0FF",
    isPulseBubble: true, // Repeating expand/contract cycle
    reverseBubble: false,
  },
  {
    id: "m-4",
    name: "Tanvir Ahmed",
    message: "Straight razor shave is elite",
    image: "assets/service-shave.jpg",
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
    image: "assets/service-style.jpg",
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
    image: "assets/barber-2.jpg",
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
    image: "assets/service-trim.jpg",
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
    image: "assets/barber-4.jpg",
    angle: 210,
    online: true,
    dotColor: "#10B981",
    ringColor: "#00F0FF",
    reverseBubble: false,
  },
  {
    id: "mid-4",
    name: "Nafis I.",
    message: "Zero waiting line ever",
    image: "assets/hero-barber.jpg",
    angle: 290,
    online: true,
    dotColor: "#00F0FF",
    ringColor: "#00F0FF",
    reverseBubble: true,
  },
];

// Helper to calculate percentage position on a circle
const getCircleCoords = (angleDeg) => {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    left: `${(50 + 50 * Math.cos(rad)).toFixed(2)}%`,
    top: `${(50 + 50 * Math.sin(rad)).toFixed(2)}%`,
  };
};

export default function CommunityHero({ onJoinClick, onExploreClick }) {
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
    navigator.clipboard.writeText("https://discord.gg/thetrimrealm-syndicate");
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <section className="community-hero-root">
      {/* Embedded Scoped Keyframes & Responsive Styles */}
      <style>{`
        .community-hero-root {
          background-color: #050508;
          min-height: 100vh;
          min-height: 100dvh;
          width: 100%;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .hero-art-backdrop {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
          user-select: none;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-art-backdrop img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          opacity: 1;
          filter: brightness(1.08) contrast(1.18);
          transform: scale(1.01);
        }

        .hero-art-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(5, 5, 8, 0.45) 0%, transparent 12%, transparent 88%, #050508 100%),
                      radial-gradient(circle at 50% 50%, rgba(5, 5, 8, 0.25) 0%, transparent 45%);
          pointer-events: none;
        }

        .ambient-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80vmin;
          height: 80vmin;
          background: radial-gradient(circle, rgba(0, 240, 255, 0.14) 0%, rgba(255, 30, 86, 0.08) 45%, transparent 75%);
          filter: blur(60px);
          pointer-events: none;
          z-index: 1;
          animation: pulse-glow 9s ease-in-out infinite alternate;
        }

        @keyframes pulse-glow {
          0% { transform: translate(-50%, -50%) scale(0.92); opacity: 0.55; }
          100% { transform: translate(-50%, -50%) scale(1.18); opacity: 0.9; }
        }

        /* 3 Concentric Rings */
        .ring-inner {
          width: 50vmin;
          height: 50vmin;
          border: 1px solid rgba(0, 240, 255, 0.16);
          box-shadow: 0 0 20px rgba(0, 240, 255, 0.06);
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 2;
        }

        .ring-middle img,
        .ring-outer img {
          aspect-ratio: 1 / 1 !important;
          object-fit: cover !important;
          flex-shrink: 0 !important;
        }

        .ring-middle {
          width: 74vmin;
          height: 74vmin;
          border: 1px solid rgba(255, 30, 86, 0.25);
          box-shadow: 0 0 25px rgba(255, 30, 86, 0.1), inset 0 0 25px rgba(255, 30, 86, 0.04);
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: orbit-ccw-anim 55s linear infinite;
          z-index: 4;
        }

        .ring-outer {
          width: 96vmin;
          height: 96vmin;
          border: 1px solid rgba(0, 240, 255, 0.28);
          box-shadow: 0 0 35px rgba(0, 240, 255, 0.12), inset 0 0 35px rgba(0, 240, 255, 0.05);
          border-radius: 50%;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: orbit-cw-anim 68s linear infinite;
          z-index: 3;
        }

        @keyframes orbit-cw-anim {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(360deg); }
        }

        @keyframes orbit-ccw-anim {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to { transform: translate(-50%, -50%) rotate(-360deg); }
        }

        /* Counter-rotations to keep faces upright */
        .counter-cw-anim {
          animation: counter-cw 68s linear infinite;
        }

        .counter-ccw-anim {
          animation: counter-ccw 55s linear infinite;
        }

        @keyframes counter-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }

        @keyframes counter-ccw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Repeating 7s notification cycle for message bubble */
        @keyframes bubble-cycle {
          0%, 15% {
            opacity: 0;
            transform: scale(0.65) translateY(6px);
            pointer-events: none;
          }
          25%, 80% {
            opacity: 1;
            transform: scale(1) translateY(0);
            pointer-events: auto;
          }
          90%, 100% {
            opacity: 0;
            transform: scale(0.65) translateY(-6px);
            pointer-events: none;
          }
        }

        .bubble-pulse-anim {
          animation: bubble-cycle 7s cubic-bezier(0.16, 1, 0.3, 1) infinite;
          animation-delay: 1.7s;
        }

        .twinkle-dot {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          animation: twinkle 5s ease-in-out infinite alternate;
        }

        @keyframes twinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.7); }
          50% { opacity: 0.95; transform: scale(1.35); box-shadow: 0 0 10px rgba(0, 240, 255, 0.85); }
        }

        .btn-syndicate {
          background-color: #00F0FF;
          color: #050508;
          font-weight: 800;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          box-shadow: 0 0 25px rgba(0, 240, 255, 0.65), 0 0 50px rgba(0, 240, 255, 0.25);
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
        }

        .btn-syndicate:hover {
          transform: translateY(-2px) scale(1.04);
          box-shadow: 0 0 35px rgba(0, 240, 255, 0.9), 0 0 70px rgba(0, 240, 255, 0.45);
          background-color: #33F5FF;
        }

        .btn-syndicate:active {
          transform: scale(0.97);
        }

        @media (prefers-reduced-motion: reduce) {
          .ring-outer,
          .ring-middle,
          .counter-cw-anim,
          .counter-ccw-anim,
          .bubble-pulse-anim,
          .ambient-glow,
          .twinkle-dot {
            animation: none !important;
          }
        }
      `}</style>

      {/* Cinematic Batman Art Backdrop (Behind Rotating Circles) */}
      <div className="hero-art-backdrop">
        <img src="assets/hero-batman-bg.jpg?v=clean3_nonexa" alt="The Next Realm Batman Barbershop" />
        <div className="hero-art-overlay" />
      </div>

      {/* Ambient Glow */}
      <div className="ambient-glow" />

      {/* Twinkling Particles */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {[
          { top: "12%", left: "18%", size: 3, delay: "0.3s", bg: "#00F0FF" },
          { top: "25%", left: "82%", size: 2.5, delay: "1.2s", bg: "#FFFFFF" },
          { top: "78%", left: "14%", size: 3.5, delay: "2.1s", bg: "#00F0FF" },
          { top: "85%", left: "88%", size: 3, delay: "0.8s", bg: "#FF1E56" },
          { top: "8%", left: "62%", size: 2, delay: "1.7s", bg: "#FFFFFF" },
          { top: "45%", left: "6%", size: 2.5, delay: "0.5s", bg: "#00F0FF" },
          { top: "60%", left: "94%", size: 3, delay: "2.6s", bg: "#FFFFFF" },
          { top: "92%", left: "42%", size: 2, delay: "1.4s", bg: "#00F0FF" },
        ].map((pt, idx) => (
          <span
            key={idx}
            className="twinkle-dot"
            style={{
              top: pt.top,
              left: pt.left,
              width: `${pt.size}px`,
              height: `${pt.size}px`,
              backgroundColor: pt.bg,
              animationDelay: pt.delay,
            }}
          />
        ))}
      </div>

      {/* Floating Corner Action Bar (Top Right) */}
      <div className="absolute top-6 sm:top-8 right-4 sm:right-8 z-30 pointer-events-auto flex items-center gap-2.5 p-1.5 sm:p-2 rounded-full bg-[#12121A]/85 border border-[#00F0FF]/30 backdrop-blur-md shadow-[0_4px_25px_rgba(0,240,255,0.2)]">
        <button
          onClick={handleJoin}
          className="btn-syndicate inline-flex items-center gap-2 px-4 sm:px-5 py-2 text-xs font-black tracking-wide cursor-pointer"
        >
          <span>Join the Syndicate</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>

        {onExploreClick && (
          <button
            onClick={onExploreClick}
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-[#12121A] hover:bg-white/10 text-white border border-[#00F0FF]/20 hover:border-[#00F0FF] text-xs font-bold transition-all cursor-pointer"
          >
            <span>Book a Haircut</span>
            <svg className="w-3 h-3 text-[#00F0FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Orbit Rings Container */}
      <div className="relative w-full h-full flex items-center justify-center pointer-events-none z-10">
        {/* 1. Inner Ring */}
        <div className="ring-inner">
          <span
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              backgroundColor: "#00F0FF",
              boxShadow: "0 0 10px #00F0FF",
            }}
          />
        </div>

        {/* 2. Middle Ring (Counter-clockwise: 55s) */}
        <div className="ring-middle">
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
                  className={`counter-ccw-anim flex items-center gap-3 pointer-events-auto ${
                    m.reverseBubble ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={m.image}
                      alt={m.name}
                      className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0 aspect-square rounded-full object-cover border-2 border-white"
                      style={{
                        boxShadow: `0 0 20px ${m.ringColor}77`,
                        outline: `2px solid ${m.ringColor}`,
                        outlineOffset: "2px",
                      }}
                    />
                    <span
                      className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#050508]"
                      style={{ backgroundColor: m.dotColor }}
                    />
                  </div>
                  <div className="hidden sm:flex items-center shrink-0 whitespace-nowrap gap-2 py-1.5 px-3.5 rounded-full bg-[#12121A]/95 border border-[#00F0FF]/40 shadow-[0_4px_25px_rgba(0,240,255,0.25)] backdrop-blur-md">
                    <span
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{ backgroundColor: m.dotColor }}
                    />
                    <div className="text-left shrink-0">
                      <span className="font-bold text-white text-xs block leading-tight">
                        {m.name}
                      </span>
                      <span className="text-[#8F90A6] text-[11px] block leading-tight">
                        {m.message}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 3. Outer Ring (Clockwise: 68s) */}
        <div className="ring-outer">
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
                  className={`counter-cw-anim flex items-center gap-3 pointer-events-auto ${
                    m.reverseBubble ? "flex-row-reverse" : ""
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={m.image}
                      alt={m.name}
                      className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 shrink-0 aspect-square rounded-full object-cover border-2 border-white"
                      style={{
                        boxShadow: `0 0 25px ${m.ringColor}88`,
                        outline: `2px solid ${m.ringColor}`,
                        outlineOffset: "2px",
                      }}
                    />
                    <span
                      className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#050508]"
                      style={{ backgroundColor: m.dotColor }}
                    />
                  </div>
                  <div
                    className={`${
                      m.isPulseBubble ? "bubble-pulse-anim" : "hidden sm:flex"
                    } items-center shrink-0 whitespace-nowrap gap-2.5 py-2 px-4 rounded-full bg-[#12121A]/95 border border-[#00F0FF]/50 shadow-[0_4px_30px_rgba(0,240,255,0.3)] backdrop-blur-md`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full animate-pulse"
                      style={{ backgroundColor: m.dotColor }}
                    />
                    <div className="text-left shrink-0">
                      <span className="font-bold text-white text-xs sm:text-sm block leading-tight">
                        {m.name}
                      </span>
                      <span className="text-[#8F90A6] text-[11px] block leading-tight">
                        {m.message}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Fixed Center Content (Pure Floating Gaming Calligraphy, No Card Container) */}
        <div className="absolute z-20 pointer-events-auto text-center flex flex-col items-center justify-center max-w-xs sm:max-w-sm px-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#12121A]/95 border border-[#FF1E56]/50 text-[#FF1E56] text-[10px] font-bold tracking-widest uppercase mb-1.5 shadow-[0_0_15px_rgba(255,30,86,0.35)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF1E56] animate-ping" />
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>THE TRIM REALM • SYNDICATE</span>
          </div>

          <h2
            style={{
              fontFamily: "'Orbitron', monospace",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              fontSize: "0.7rem",
              fontWeight: 800,
              color: "#00F0FF",
              textShadow: "0 0 12px rgba(0, 240, 255, 0.85)",
              marginBottom: "0.2rem",
            }}
          >
            Join Our
          </h2>

          <h1
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: "0.06em",
              fontSize: "2.75rem",
              lineHeight: 1,
              textTransform: "uppercase",
              color: "#FFFFFF",
              textShadow: "0 0 15px rgba(0,240,255,0.9), 0 0 30px rgba(0,240,255,0.5), 0 0 45px rgba(255,30,86,0.5), 0 2px 4px rgba(0,0,0,0.95)",
              filter: "drop-shadow(0 0 20px rgba(0,240,255,0.6))",
              marginBottom: "0.25rem",
            }}
          >
            COMMUNITY
          </h1>

          <p className="text-[11px] sm:text-xs text-[#8F90A6] max-w-[260px] mx-auto leading-relaxed" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9)" }}>
            The nocturnal grooming network. Master barbers, live slot alerts, and high-fashion hair artistry.
          </p>
        </div>
      </div>

      {/* Community Channels Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md rounded-3xl bg-[#12121A] border border-[#00F0FF]/50 shadow-[0_0_60px_rgba(0,240,255,0.3)] p-6 sm:p-8 text-white">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-[#FF1E56] text-white flex items-center justify-center text-sm font-bold cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#050508] border border-[#FF1E56]/50 text-[#FF1E56] text-[10px] font-bold tracking-widest uppercase mb-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF1E56] animate-ping" />
                <span>The Trim Realm Syndicate</span>
              </span>
              <h3 className="text-2xl font-black text-white">Enter the Collective</h3>
              <p className="text-xs text-[#8F90A6] mt-1.5">
                Join 2,480+ underground grooming artisans, VIP midnight cut alerts, and community-exclusive slots.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <a
                href="https://discord.gg"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#050508] border border-[#00F0FF]/30 hover:border-[#00F0FF] transition-all"
              >
                <div>
                  <span className="text-xs font-bold text-white block">Discord Guild</span>
                  <span className="text-[11px] text-[#8F90A6]">2,480 Active Members & Master Barbers</span>
                </div>
                <span className="text-[#00F0FF] text-xs font-bold">Join →</span>
              </a>

              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#050508] border border-[#00F0FF]/30 hover:border-[#00F0FF] transition-all"
              >
                <div>
                  <span className="text-xs font-bold text-white block">Telegram Broadcast</span>
                  <span className="text-[11px] text-[#8F90A6]">Instant Midnight VIP Slot Drops</span>
                </div>
                <span className="text-[#00F0FF] text-xs font-bold">Join →</span>
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-3.5 rounded-2xl bg-[#050508] border border-[#FF1E56]/30 hover:border-[#FF1E56] transition-all"
              >
                <div>
                  <span className="text-xs font-bold text-white block">Instagram Collective</span>
                  <span className="text-[11px] text-[#8F90A6]">@thetrimrealm.bd</span>
                </div>
                <span className="text-[#FF1E56] text-xs font-bold">Follow →</span>
              </a>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
              <button onClick={handleCopy} className="text-[#00F0FF] hover:underline font-bold cursor-pointer">
                {copied ? "✓ Copied to clipboard!" : "Copy Invite Link"}
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
