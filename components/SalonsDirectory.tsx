"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Salon } from "@/types";
import { platformStore, getCanonicalSalonPhoto } from "@/lib/store";

interface SalonsDirectoryProps {
  onSelectSalonForBooking: (salon: Salon) => void;
}

export function SalonsDirectory({ onSelectSalonForBooking }: SalonsDirectoryProps) {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [selectedHub, setSelectedHub] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const loadSalons = () => {
    const data = platformStore.getSalons();
    setSalons(data);
    setLoading(false);
  };

  useEffect(() => {
    loadSalons();
  }, []);

  const calculateStatus = (openStr: string, closeStr: string) => {
    try {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const bst = new Date(utc + 6 * 3600000);
      const curM = bst.getHours() * 60 + bst.getMinutes();

      const [oh, om] = (openStr || "10:00").split(":").map(Number);
      const [ch, cm] = (closeStr || "22:00").split(":").map(Number);
      const openM = oh * 60 + om;
      const closeM = ch * 60 + cm;

      const isOpen = curM >= openM && curM < closeM;
      return {
        isOpen,
        text: isOpen ? "Open Now" : "Closed",
        timeRange: `${openStr} – ${closeStr} BST`,
      };
    } catch {
      return { isOpen: true, text: "Open Today", timeRange: "10:00 AM – 10:00 PM BST" };
    }
  };

  const filteredSalons = salons.filter((s) => {
    const matchesHub =
      selectedHub === "all" ||
      s.area.toLowerCase().includes(selectedHub.toLowerCase()) ||
      s.district.toLowerCase().includes(selectedHub.toLowerCase()) ||
      (s.division && s.division.toLowerCase().includes(selectedHub.toLowerCase()));

    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.area.toLowerCase().includes(q) ||
      s.district.toLowerCase().includes(q) ||
      s.services.some((srv) => srv.name.toLowerCase().includes(q));

    return matchesHub && matchesQuery;
  });

  return (
    <section id="recommended-studios" className="py-20 px-4 sm:px-8 bg-[#0c1220] border-b border-[#1f2639]">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-[#e8220a] font-bold uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-[#e8220a] animate-pulse"></span>
              <span>Backend-Synchronized Directory</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Recommended Master Studios
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              Authentic barbershops verified by Super Admin with isolated merchant databases and real-time chair reservations.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400 bg-[#121622] px-3.5 py-2 rounded-lg border border-[#1f2639]">
            Active Studios: <strong className="text-white">{filteredSalons.length}</strong> / {salons.length}
          </div>
        </div>

        {/* Search & Hub Filters */}
        <div className="bg-[#121622] p-4 rounded-xl border border-[#1f2639] space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search studios by name, district, or service (e.g. Fade, Shave, Dhanmondi)..."
                className="w-full bg-[#0c1220] border border-[#243050] rounded-lg px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#e8220a]"
              />
            </div>

            <div className="sm:w-64">
              <select
                value={selectedHub}
                onChange={(e) => setSelectedHub(e.target.value)}
                className="w-full bg-[#0c1220] border border-[#243050] rounded-lg px-3 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-[#e8220a]"
              >
                <option value="all">All 64 Districts</option>
                <option value="Dhanmondi">Dhaka — Dhanmondi Hub</option>
                <option value="Banani">Dhaka — Banani Hub</option>
                <option value="Gulshan">Dhaka — Gulshan Hub</option>
                <option value="Mirpur">Dhaka — Mirpur Hub</option>
                <option value="Uttara">Dhaka — Uttara Hub</option>
                <option value="Chattogram">Chattogram Division</option>
                <option value="Sylhet">Sylhet Division</option>
              </select>
            </div>
          </div>

          {/* Quick Hub Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1f2639]/60 text-xs">
            <span className="text-slate-500 font-mono text-[11px] uppercase mr-1">Quick Select:</span>
            {["all", "Dhanmondi", "Banani", "Gulshan", "Mirpur", "Uttara", "Chattogram"].map((hub) => (
              <button
                key={hub}
                onClick={() => setSelectedHub(hub)}
                className={`px-3 py-1 rounded-md transition-all font-medium ${
                  selectedHub === hub
                    ? "bg-[#e8220a] text-white shadow-sm"
                    : "bg-[#172138] hover:bg-[#243050] text-slate-300 border border-[#243050]"
                }`}
              >
                {hub === "all" ? "All Studios" : hub}
              </button>
            ))}
          </div>
        </div>

        {/* Salons Grid (Dynamically Populated) */}
        {loading ? (
          <div className="py-16 text-center text-xs font-mono text-slate-400">
            Loading verified salons from backend...
          </div>
        ) : filteredSalons.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-[#243050] rounded-xl bg-[#121622] text-xs text-slate-400">
            No salons match your search criteria. Try another district or keyword.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSalons.map((salon, index) => {
              const status = calculateStatus(salon.opening_time, salon.closing_time);
              const isBoosted = salon.is_boosted !== false && salon.is_featured;
              const isHaven = salon.name.toLowerCase().includes("haven");
              const coverPhoto =
                salon.cover_photo_url && (salon.cover_photo_url !== "/assets/studio-haven.jpg" || isHaven)
                  ? salon.cover_photo_url
                  : getCanonicalSalonPhoto(salon.name, salon.slug, index);

              return (
                <div
                  key={salon.id}
                  className={`bg-[#121622] border rounded-xl overflow-hidden flex flex-col justify-between group transition-all duration-300 hover:border-[#e8220a]/60 ${
                    isBoosted
                      ? "border-amber-500/50 shadow-lg shadow-amber-500/5"
                      : "border-[#1f2639]"
                  }`}
                >
                  {/* Photo & Badges */}
                  <div className="relative h-48 bg-[#090d17] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverPhoto}
                      alt={salon.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-[0.88]"
                    />

                    {/* Boosted / Verified Tag */}
                    <div className="absolute top-3 left-3">
                      {isBoosted ? (
                        <span className="font-mono text-[10px] uppercase font-bold px-2.5 py-0.5 rounded bg-amber-400 text-black border border-amber-300 shadow flex items-center gap-1">
                          <span>⭐ FEATURED STUDIO</span>
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] uppercase font-bold px-2.5 py-0.5 rounded bg-[#172138]/90 text-slate-200 border border-[#243050] backdrop-blur-sm">
                          Verified Partner
                        </span>
                      )}
                    </div>

                    {/* Rating Pill */}
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-[#172138]/90 border border-[#243050] text-xs font-bold text-white flex items-center gap-1 backdrop-blur-sm">
                      <span className="text-amber-400">★</span>
                      <span>{salon.rating}</span>
                      <span className="text-slate-400 text-[10px]">({salon.reviews_count})</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <Link href={`/salon/${salon.slug}`} className="hover:underline">
                        <h3 className="font-display text-lg font-bold text-white group-hover:text-[#e8220a] transition-colors leading-snug">
                          {salon.name}
                        </h3>
                      </Link>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        📍 {salon.area}, {salon.district} • {salon.address}
                      </p>

                      {/* Hours Line */}
                      <div className="flex items-center gap-2 py-1.5 px-3 rounded bg-[#172138] border border-[#243050] my-3 text-xs">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            status.isOpen ? "bg-emerald-400 animate-pulse" : "bg-rose-500"
                          }`}
                        />
                        <span className={`font-semibold ${status.isOpen ? "text-emerald-400" : "text-rose-400"}`}>
                          {status.text}
                        </span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-400 font-mono text-[11px]">{status.timeRange}</span>
                      </div>

                      {/* Service Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {salon.services.slice(0, 3).map((srv) => (
                          <span
                            key={srv.id}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#172138] text-slate-300 border border-[#243050]"
                          >
                            {srv.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action Strip */}
                    <div className="pt-3 border-t border-[#1f2639] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-mono block">From</span>
                        <span className="text-base font-bold text-white font-mono">
                          ৳ {salon.starting_price}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Task 5: "View Shop" navigates to public link of selected salon */}
                        <Link
                          href={`/salon/${salon.slug}`}
                          className="px-2.5 py-1.5 rounded-lg border border-[#243050] hover:border-amber-400 text-amber-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1"
                          title="View Dedicated Studio Storefront"
                        >
                          <span>View Shop</span>
                          <span className="text-[10px]">↗</span>
                        </Link>

                        <button
                          onClick={() => onSelectSalonForBooking(salon)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#e8220a] hover:bg-[#c11a07] text-white font-semibold text-xs transition-all shadow-md shadow-[#e8220a]/20"
                        >
                          Book →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

