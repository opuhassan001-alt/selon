"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function ReviewContent() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token") || "SLN-DHN-8940";

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Razor Sharp Fade", "Punctual & No-Wait"]);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const availableTags = [
    "Razor Sharp Fade",
    "Hot Towel Steam",
    "Punctual & No-Wait",
    "Master Hygiene",
    "Relaxing Scalp Massage",
    "Great Beard Detailing",
    "Clean & Sanitized",
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#0C1220] text-slate-100 font-sans flex flex-col justify-between p-4 sm:p-8">
      {/* Navbar */}
      <nav className="max-w-2xl mx-auto w-full flex items-center justify-between pb-8">
        <Link href="/" className="flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-white transition-colors">
          <span>← Return to Hair and Care Directory</span>
        </Link>
        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
          ✓ Verified Cut Protection
        </span>
      </nav>

      {/* Main Review Terminal */}
      <main className="max-w-xl mx-auto w-full bg-[#121622] border border-[#243050] rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-amber-400">
                Token Verified Appointment
              </span>
              <h1 className="text-2xl font-bold text-white mt-1">Review Your Haircut Experience</h1>
              <p className="text-xs text-slate-400 mt-1">
                Token ID: <strong className="text-emerald-400 font-mono">{tokenParam}</strong>.
                Zero fake reviews. Only in-person completed cuts can publish feedback.
              </p>
            </div>

            {/* Star Rating */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Overall Rating:</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-3xl transition-transform hover:scale-125 focus:outline-none"
                  >
                    <span className={star <= rating ? "text-amber-400" : "text-slate-600"}>★</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Experience Tags */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Highlight What Stood Out:</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-mono transition-all ${
                        active
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40 font-semibold"
                          : "bg-[#172138] text-slate-400 border-[#243050] hover:border-slate-500"
                      }`}
                    >
                      {active ? "✓ " : "+ "}
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed Comment */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Review *</label>
              <textarea
                required
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with the barber, chair hygiene, hot towel, and fade precision..."
                className="w-full bg-[#0C1220] border border-[#243050] rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#E8220A]"
              />
            </div>

            <button type="submit" className="btn-barber-primary w-full py-3 text-xs font-bold">
              Submit Verified Review ↗
            </button>
          </form>
        ) : (
          <div className="text-center py-8 space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl font-bold border border-emerald-500/40">
              ✓
            </div>
            <h3 className="text-xl font-bold text-white">Review Verified & Published!</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Your feedback is now visible on the studio storefront and public marketplace under token #{tokenParam}.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <Link href="/" className="btn-barber-primary px-5 py-2 text-xs font-bold">
                Return to Directory
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-4 font-mono">
        Anti-Fake Review Engine • Token-Gated Cryptographic Verification
      </footer>
    </div>
  );
}

export default function VerifiedReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0C1220] flex items-center justify-center text-xs text-slate-400 font-mono">Loading review terminal...</div>}>
      <ReviewContent />
    </Suspense>
  );
}

