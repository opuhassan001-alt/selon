"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { CommunityHero } from "@/components/CommunityHero";
import { SalonsDirectory } from "@/components/SalonsDirectory";
import { BookingEngine } from "@/components/BookingEngine";
import { RegisterSalonModal } from "@/components/RegisterSalonModal";
import { TrackTokenModal } from "@/components/TrackTokenModal";
import { Footer } from "@/components/Footer";
import { Salon } from "@/types";

export default function Home() {
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSelectSalonForBooking = (salon: Salon) => {
    setSelectedSalon(salon);
    const bookingEl = document.getElementById("booking-engine");
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: "smooth" });
    }
    showToast(`Selected "${salon.name}". Choose your preferred slot and service.`);
  };

  return (
    <main className="min-h-screen bg-[#0C1220] text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <Navbar
        onOpenRegister={() => setRegisterModalOpen(true)}
        onOpenTrack={() => setTrackModalOpen(true)}
      />

      {/* Hero Section */}
      <CommunityHero
        onJoinClick={() => setRegisterModalOpen(true)}
        onExploreClick={() => {
          const el = document.getElementById("recommended-studios");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* Salons Directory (Dynamic backend data, zero hard-coded items) */}
      <SalonsDirectory onSelectSalonForBooking={handleSelectSalonForBooking} />

      {/* Interactive 5-Step Booking Engine */}
      <BookingEngine
        preselectedSalon={selectedSalon}
        onBookingComplete={(b) => {
          showToast(`✓ Chair reserved! Token ID: ${b.id} issued for ${b.salon_name}.`);
        }}
      />

      {/* Master Barbers Showcase */}
      <section id="barbers" className="py-20 px-4 sm:px-8 bg-[#0c1220] border-b border-[#1f2639]">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <span className="text-[11px] font-mono text-[#e8220a] font-bold uppercase tracking-widest">
              Craft & Precision
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight mt-1">
              Master Barbers Behind The Chair
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xl">
              Every barber on Hair and Care has verified experience in precision tapers, hot-towel straight-razor contouring, and scalp therapy.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Kabir Hossain", title: "Master Barber", exp: "14 Years Exp", chair: "Station #1", salon: "The Haven / Vintage Crown", img: "/assets/barber-1.jpg" },
              { name: "Jewel Ahmed", title: "Senior Fade Stylist", exp: "8 Years Exp", chair: "Station #2", salon: "Vintage Crown Barbershop", img: "/assets/barber-2.jpg" },
              { name: "James Kingston", title: "Master Partner", exp: "20 Years Exp", chair: "Station #1", salon: "Barbarian Traditional", img: "/assets/barber-3.jpg" },
              { name: "Tanvir Mia", title: "Hot-Towel Specialist", exp: "9 Years Exp", chair: "Station #3", salon: "The Haven Studio", img: "/assets/barber-4.jpg" },
            ].map((barber) => (
              <div key={barber.name} className="p-4 rounded-xl bg-[#121622] border border-[#1f2639] space-y-3 group hover:border-[#e8220a]/50 transition-all">
                <div className="aspect-[4/5] rounded-lg overflow-hidden bg-[#0c1220]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={barber.img} alt={barber.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{barber.name}</h4>
                  <div className="text-xs font-mono text-amber-400 mt-0.5">{barber.title}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">{barber.chair} • {barber.exp}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">📍 {barber.salon}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modals */}
      <RegisterSalonModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSuccess={(name) => {
          showToast(`✓ Onboarding application submitted for "${name}"! Super Admin will review within 24 hours.`);
        }}
      />

      <TrackTokenModal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border border-emerald-500/40 bg-emerald-950/90 text-emerald-200 text-xs font-semibold shadow-2xl backdrop-blur-md animate-fade-in flex items-center space-x-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </main>
  );
}

