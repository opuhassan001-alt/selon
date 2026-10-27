"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Salon, Service, Barber, Booking } from "@/types";
import { platformStore, getCanonicalSalonPhoto } from "@/lib/store";

export default function SalonStorefrontPage() {
  const params = useParams();
  const slugParam = (params?.slug as string) || "";

  const [salon, setSalon] = useState<Salon | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>("11:30 AM");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [depositMfs, setDepositMfs] = useState<"bKash" | "Nagad">("bKash");
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  useEffect(() => {
    if (slugParam) {
      const match = platformStore.getSalonBySlug(slugParam);
      if (match) {
        setSalon(match);
        if (match.services?.length) setSelectedService(match.services[0]);
        if (match.barbers?.length) setSelectedBarber(match.barbers[0]);
      } else {
        // Fallback to first available salon
        const all = platformStore.getSalons();
        if (all.length > 0) {
          setSalon(all[0]);
          if (all[0].services?.length) setSelectedService(all[0].services[0]);
          if (all[0].barbers?.length) setSelectedBarber(all[0].barbers[0]);
        }
      }
    }
  }, [slugParam]);

  const copyBioLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      showToast("✓ Storefront Bio Link copied! Ready for Instagram/Facebook bio.");
    }
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!salon || !clientName || !clientPhone) return;

    const prefix = salon.slug.substring(0, 3).toUpperCase();
    const tokenId = `${prefix}-DHN-${Math.floor(1000 + Math.random() * 9000)}`;
    const depositAmount = 50;
    const price = selectedService ? selectedService.price_bdt : 350;
    const dueAmount = Math.max(0, price - depositAmount);
    const trxId = `TRX-${depositMfs === "Nagad" ? "NG" : "BK"}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newBooking: Booking = {
      id: tokenId,
      salon_id: salon.id,
      salon_name: salon.name,
      customer_name: clientName,
      customer_phone: clientPhone,
      barber: selectedBarber ? selectedBarber.name : "Master Stylist",
      chair: selectedBarber ? selectedBarber.chair : 1,
      service: selectedService ? selectedService.name : "Haircut",
      time_slot: selectedSlot,
      booking_date: new Date().toISOString().split("T")[0],
      total: price,
      deposit_paid: depositAmount,
      deposit_method: depositMfs,
      trx_id: trxId,
      due_at_salon: dueAmount,
      status: "confirmed",
      payment_status: "paid",
      created_at: new Date().toISOString(),
    };

    platformStore.createBooking(newBooking);
    setConfirmedBooking(newBooking);
    showToast(`✓ Chair reserved! ৳50 deposit secured via ${depositMfs}. Token ID: ${tokenId}`);
  };

  if (!salon) {
    return (
      <div className="min-h-screen bg-[#0C1220] flex items-center justify-center text-xs font-mono text-slate-400">
        Loading salon storefront...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C1220] text-slate-100 font-sans flex flex-col justify-between">
      {/* Top Storefront Navbar */}
      <nav className="sticky top-0 z-50 bg-[#0C1220]/90 backdrop-blur-md border-b border-[#243050] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 text-xs font-mono text-slate-400 hover:text-white transition-colors">
            <span>←</span>
            <span>Hair and Care <strong className="text-[#E8220A] font-semibold">bd</strong></span>
          </Link>
          <div className="hidden sm:block h-4 w-[1px] bg-[#243050]"></div>
          <span className="text-xs uppercase font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
            ⭐ Verified Studio Storefront
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={copyBioLink}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#172138] hover:bg-[#1f2c4a] border border-[#243050] hover:border-amber-400 text-xs font-semibold text-amber-300 transition-all shadow-sm"
          >
            <span>Copy Bio Link</span>
          </button>

          <a
            href={`tel:${salon.phone.replace(/[^0-9+]/g, "")}`}
            className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[#243050] hover:bg-white/5 text-xs text-slate-300 transition-colors"
          >
            <span>📞 {salon.phone}</span>
          </a>

          <a
            href="#storefront-booking"
            className="px-3.5 py-1.5 rounded-lg bg-[#E8220A] hover:bg-[#CC1C07] text-white text-xs font-semibold shadow-md shadow-[#E8220A]/20 transition-all"
          >
            Book Chair Now
          </a>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="relative border-b border-[#243050] bg-[#0E1526] overflow-hidden py-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-2 text-xs font-mono text-amber-400">
              <span>★ {salon.rating} Rated Studio</span>
              <span>•</span>
              <span className="text-slate-400">{salon.reviews_count} Verified Cuts</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white tracking-tight leading-tight">
              {salon.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              📍 {salon.address} ({salon.area}, {salon.district}) • Master Grooming, Precision Fades & Classic Hot-Towel Shaves.
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs font-mono">
              <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                Open Daily BST {salon.opening_time} – {salon.closing_time}
              </span>
              <span className="text-slate-400">
                {salon.chairs_count || 4} Barber Chairs Active
              </span>
            </div>
          </div>

          <div className="w-full md:w-80 h-52 rounded-2xl overflow-hidden border border-[#243050] shadow-2xl relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                salon.cover_photo_url && (salon.cover_photo_url !== "/assets/studio-haven.jpg" || salon.name.toLowerCase().includes("haven"))
                  ? salon.cover_photo_url
                  : getCanonicalSalonPhoto(salon.name, salon.slug)
              }
              alt={salon.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0E1526] via-transparent to-transparent opacity-60"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-8 space-y-16 w-full">
        {/* Services & Rate Card Catalog */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#243050] pb-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Services & Transparent Rate Card</h2>
              <p className="text-xs text-slate-400 mt-0.5">Fixed prices, master hygiene standards, and zero hidden charges.</p>
            </div>
            <span className="text-xs font-mono text-slate-400">{salon.services.length} Services Offered</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {salon.services.map((srv) => (
              <div
                key={srv.id}
                className="p-5 rounded-xl bg-[#111A2E] border border-[#243050] flex flex-col justify-between hover:border-[#E8220A]/50 transition-all space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-[10px] uppercase font-bold text-[#E8220A] px-2 py-0.5 rounded bg-[#E8220A]/10 border border-[#E8220A]/20">
                      {srv.category}
                    </span>
                    <span className="font-mono text-slate-400">{srv.duration_minutes} mins</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-2">{srv.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {srv.description || "Master grooming finish with razor edge line."}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#243050] flex items-center justify-between">
                  <div className="text-base font-bold text-emerald-400 font-mono">৳ {srv.price_bdt}</div>
                  <button
                    onClick={() => {
                      setSelectedService(srv);
                      const el = document.getElementById("storefront-booking");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#E8220A] hover:bg-[#CC1C07] text-white text-xs font-semibold shadow-sm transition-all"
                  >
                    Select & Book →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Master Barbers */}
        <section className="space-y-6">
          <div className="border-b border-[#243050] pb-4">
            <h2 className="text-xl font-bold text-white tracking-tight">Our Master Barbers & Station Chairs</h2>
            <p className="text-xs text-slate-400 mt-0.5">Experienced stylists dedicated to chair hygiene and precision cutting.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {salon.barbers.map((b) => (
              <div key={b.id || b.name} className="p-4 rounded-xl bg-[#111A2E] border border-[#243050] text-center space-y-3">
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-[#243050]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.avatar} alt={b.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{b.name}</h4>
                  <div className="text-[11px] text-amber-400 font-mono mt-0.5">{b.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">Station: Chair #{b.chair} • {b.exp}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dedicated Storefront Booking Terminal */}
        <section id="storefront-booking" className="p-8 rounded-2xl bg-[#111A2E] border border-[#243050] space-y-6">
          <div>
            <span className="text-[10px] font-mono uppercase font-bold text-[#E8220A] tracking-wider">
              Direct Reservation
            </span>
            <h2 className="text-2xl font-bold text-white mt-1">Reserve A Chair at {salon.name}</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Lock your time slot with ৳50 bKash/Nagad advance deposit. The balance (৳{Math.max(0, (selectedService?.price_bdt || 350) - 50)}) is payable at the salon desk.
            </p>
          </div>

          <form onSubmit={handleBookingSubmit} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Service</label>
                <select
                  value={selectedService?.id || ""}
                  onChange={(e) => {
                    const found = salon.services.find((s) => String(s.id) === e.target.value);
                    if (found) setSelectedService(found);
                  }}
                  className="w-full bg-[#0C1220] border border-[#243050] rounded-lg px-3 py-2 text-white"
                >
                  {salon.services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — ৳{s.price_bdt} ({s.duration_minutes}m)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Preferred Barber</label>
                <select
                  value={selectedBarber?.name || ""}
                  onChange={(e) => {
                    const found = salon.barbers.find((b) => b.name === e.target.value);
                    if (found) setSelectedBarber(found);
                  }}
                  className="w-full bg-[#0C1220] border border-[#243050] rounded-lg px-3 py-2 text-white"
                >
                  {salon.barbers.map((b) => (
                    <option key={b.id || b.name} value={b.name}>
                      {b.name} (Chair #{b.chair})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Time Slot (BST)</label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full bg-[#0C1220] border border-[#243050] rounded-lg px-3 py-2 text-white font-mono"
                >
                  {["10:00 AM", "11:00 AM", "12:00 PM", "02:30 PM", "03:30 PM", "05:00 PM", "06:30 PM", "08:00 PM", "09:00 PM"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Shakib Ahmed"
                  className="w-full bg-[#0C1220] border border-[#243050] rounded-lg px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mobile Number (+880) *</label>
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="01712-445566"
                  className="w-full bg-[#0C1220] border border-[#243050] rounded-lg px-3 py-2 text-white font-mono"
                />
              </div>
            </div>

            {/* Advance Deposit Section */}
            <div className="p-4 rounded-xl bg-[#0C1220] border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-amber-400">Advance Chair Deposit</span>
                <div className="text-white font-bold text-sm">৳ 50 Advance via bKash or Nagad</div>
                <div className="flex gap-4 mt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input type="radio" name="sf-mfs" checked={depositMfs === "bKash"} onChange={() => setDepositMfs("bKash")} />
                    <span>bKash</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                    <input type="radio" name="sf-mfs" checked={depositMfs === "Nagad"} onChange={() => setDepositMfs("Nagad")} />
                    <span>Nagad</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="btn-barber-primary px-6 py-2.5 text-xs font-bold shrink-0"
              >
                Confirm Booking & Pay ৳50 →
              </button>
            </div>
          </form>

          {/* Confirmed Slip */}
          {confirmedBooking && (
            <div className="p-6 rounded-xl bg-[#0C1220] border border-emerald-500/40 text-xs font-mono space-y-3">
              <div className="flex justify-between items-center border-b border-[#243050] pb-2">
                <span className="text-slate-400">Token ID:</span>
                <strong className="text-emerald-400 text-sm">{confirmedBooking.id}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="text-white">{confirmedBooking.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Time:</span>
                <span className="text-amber-400">{confirmedBooking.time_slot} ({confirmedBooking.booking_date})</span>
              </div>
              <div className="flex justify-between border-t border-[#243050] pt-2">
                <span className="text-slate-400">Due at Salon:</span>
                <span className="text-white font-bold">৳ {confirmedBooking.due_at_salon}</span>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl border border-emerald-500/40 bg-emerald-950/90 text-emerald-200 text-xs font-semibold shadow-xl backdrop-blur-md">
          {toastMsg}
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#243050] bg-[#090D17] text-slate-400 text-xs py-6 px-4 sm:px-8 text-center">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} {salon.name}. Powered by Hair and Care bd.</span>
          <div className="flex items-center space-x-3">
            <Link href="/" className="hover:text-white">Directory Home</Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-white">Super Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

