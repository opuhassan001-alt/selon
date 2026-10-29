"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Sparkles, Star, MapPin, Phone, ArrowLeft, Copy, Check } from "lucide-react";
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
      showToast("Storefront Bio Link copied! Ready for Instagram/Facebook bio.");
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
    showToast(`Chair reserved! ৳50 deposit secured via ${depositMfs}. Token ID: ${tokenId}`);
  };

  if (!salon) {
    return (
      <div className="min-h-screen bg-[#FDFDFD] flex items-center justify-center text-xs text-gray-500 font-sans">
        Loading salon storefront...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#0D0D0D] font-sans flex flex-col justify-between">
      {/* Top Storefront Navbar */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2 text-xs font-medium text-gray-600 hover:text-black transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Hair and Care <strong className="text-[#E8220A] font-bold">bd</strong></span>
          </Link>
          <div className="hidden sm:block h-4 w-[1px] bg-gray-200"></div>
          <span className="text-xs uppercase font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Verified Studio Storefront</span>
          </span>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={copyBioLink}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-800 transition-all shadow-sm"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Bio Link</span>
          </button>

          <a
            href={`tel:${salon.phone.replace(/[^0-9+]/g, "")}`}
            className="hidden md:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 text-xs text-gray-700 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-gray-500" />
            <span>{salon.phone}</span>
          </a>

          <a
            href="#storefront-booking"
            className="px-4 py-1.5 rounded-full bg-[#E8220A] hover:bg-[#B51B08] text-white text-xs font-semibold shadow-sm transition-all"
          >
            Book Chair Now
          </a>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="relative border-b border-gray-200 bg-white overflow-hidden py-14 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center space-x-2 text-xs font-semibold text-amber-600">
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{salon.rating} Rated Studio</span>
              </span>
              <span>•</span>
              <span className="text-gray-500">{salon.reviews_count} Verified Cuts</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0D0D0D] tracking-tight leading-tight">
              {salon.name}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <span>{salon.address} ({salon.area}, {salon.district}) • Master Grooming, Precision Fades & Classic Hot-Towel Shaves.</span>
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs font-medium">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
                Open Daily BST {salon.opening_time} – {salon.closing_time}
              </span>
              <span className="text-gray-500">
                {salon.chairs_count || 4} Barber Chairs Active
              </span>
            </div>
          </div>

          <div className="w-full md:w-80 h-52 rounded-2xl overflow-hidden border border-gray-200 shadow-md relative shrink-0">
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto py-12 px-4 sm:px-8 space-y-16 w-full">
        {/* Services & Rate Card Catalog */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-xl font-bold text-[#0D0D0D] tracking-tight">Services & Transparent Rate Card</h2>
              <p className="text-xs text-gray-500 mt-0.5">Fixed prices, master hygiene standards, and zero hidden charges.</p>
            </div>
            <span className="text-xs font-semibold text-gray-500">{salon.services.length} Services Offered</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {salon.services.map((srv) => (
              <div
                key={srv.id}
                className="p-5 rounded-2xl bg-white border border-gray-200 flex flex-col justify-between hover:border-gray-400 hover:shadow-md transition-all space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[10px] uppercase font-bold text-[#E8220A] px-2 py-0.5 rounded-full bg-red-50 border border-red-100">
                      {srv.category}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">{srv.duration_minutes} mins</span>
                  </div>
                  <h3 className="text-base font-bold text-[#0D0D0D] mt-2">{srv.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                    {srv.description || "Master grooming finish with razor edge line."}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="text-base font-bold text-gray-900">৳ {srv.price_bdt}</div>
                  <button
                    onClick={() => {
                      setSelectedService(srv);
                      const el = document.getElementById("storefront-booking");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-[#E8220A] hover:bg-[#B51B08] text-white text-xs font-semibold shadow-sm transition-all"
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
          <div className="border-b border-gray-200 pb-4">
            <h2 className="text-xl font-bold text-[#0D0D0D] tracking-tight">Our Master Stylists & Station Chairs</h2>
            <p className="text-xs text-gray-500 mt-0.5">Experienced stylists dedicated to chair hygiene and precision cutting.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {salon.barbers.map((b) => (
              <div key={b.id || b.name} className="p-5 rounded-2xl bg-white border border-gray-200 text-center space-y-3 shadow-sm">
                <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-gray-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.avatar} alt={b.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0D0D0D]">{b.name}</h4>
                  <div className="text-[11px] text-amber-700 font-medium mt-0.5">{b.title}</div>
                  <div className="text-[10px] text-gray-500 mt-1 font-medium">Station: Chair #{b.chair} • {b.exp}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dedicated Storefront Booking Terminal */}
        <section id="storefront-booking" className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-6">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#E8220A] tracking-wider">
              Direct Instant Web Booking
            </span>
            <h2 className="text-2xl font-bold text-[#0D0D0D] mt-1">Reserve A Chair at {salon.name}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Lock your time slot with ৳50 bKash/Nagad advance deposit. The balance (৳{Math.max(0, (selectedService?.price_bdt || 350) - 50)}) is payable at the salon desk. No mobile apps needed.
            </p>
          </div>

          <form onSubmit={handleBookingSubmit} className="space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Service</label>
                <select
                  value={selectedService?.id || ""}
                  onChange={(e) => {
                    const found = salon.services.find((s) => String(s.id) === e.target.value);
                    if (found) setSelectedService(found);
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:border-[#E8220A]"
                >
                  {salon.services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — ৳{s.price_bdt} ({s.duration_minutes}m)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Preferred Barber</label>
                <select
                  value={selectedBarber?.name || ""}
                  onChange={(e) => {
                    const found = salon.barbers.find((b) => b.name === e.target.value);
                    if (found) setSelectedBarber(found);
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:border-[#E8220A]"
                >
                  {salon.barbers.map((b) => (
                    <option key={b.id || b.name} value={b.name}>
                      {b.name} (Chair #{b.chair})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Time Slot (BST)</label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-gray-900 focus:outline-none focus:border-[#E8220A]"
                >
                  {["10:00 AM", "11:00 AM", "12:00 PM", "02:30 PM", "03:30 PM", "05:00 PM", "06:30 PM", "08:00 PM", "09:00 PM"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Shakib Ahmed"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-900 focus:outline-none focus:border-[#E8220A]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-1">Mobile Number (+880) *</label>
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="01712-445566"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-gray-900 focus:outline-none focus:border-[#E8220A]"
                />
              </div>
            </div>

            {/* Advance Deposit Section */}
            <div className="p-5 rounded-2xl bg-amber-50/50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-800">Advance Chair Deposit</span>
                <div className="text-gray-900 font-bold text-sm">৳ 50 Advance via bKash or Nagad</div>
                <div className="flex gap-4 mt-1.5">
                  <label className="flex items-center gap-1.5 cursor-pointer text-gray-700 font-medium">
                    <input type="radio" name="sf-mfs" checked={depositMfs === "bKash"} onChange={() => setDepositMfs("bKash")} className="accent-[#E8220A]" />
                    <span>bKash</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-gray-700 font-medium">
                    <input type="radio" name="sf-mfs" checked={depositMfs === "Nagad"} onChange={() => setDepositMfs("Nagad")} className="accent-[#E8220A]" />
                    <span>Nagad</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#E8220A] hover:bg-[#B51B08] text-white text-xs font-bold shrink-0 shadow-sm transition-all"
              >
                Confirm Booking & Pay ৳50 →
              </button>
            </div>
          </form>

          {/* Confirmed Slip */}
          {confirmedBooking && (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-3">
              <div className="flex justify-between items-center border-b border-emerald-200/60 pb-2">
                <span className="text-gray-600 font-medium">Token ID:</span>
                <strong className="text-emerald-800 text-sm font-bold">{confirmedBooking.id}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Customer:</span>
                <span className="text-gray-900 font-bold">{confirmedBooking.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Time:</span>
                <span className="text-amber-800 font-semibold">{confirmedBooking.time_slot} ({confirmedBooking.booking_date})</span>
              </div>
              <div className="flex justify-between border-t border-emerald-200/60 pt-2">
                <span className="text-gray-600 font-medium">Due at Salon:</span>
                <span className="text-gray-900 font-bold">৳ {confirmedBooking.due_at_salon}</span>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl border border-emerald-200 bg-white text-emerald-800 text-xs font-semibold shadow-xl">
          {toastMsg}
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-[#F9F9FB] text-gray-500 text-xs py-8 px-4 sm:px-8 text-center">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>&copy; {new Date().getFullYear()} {salon.name}. Powered by Hair and Care bd.</span>
          <div className="flex items-center space-x-3">
            <Link href="/" className="hover:text-black">Directory Home</Link>
            <span>•</span>
            <Link href="/browse" className="hover:text-black">Browse All</Link>
            <span>•</span>
            <Link href="/admin" className="hover:text-black">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
