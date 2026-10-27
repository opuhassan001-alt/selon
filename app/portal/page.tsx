"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Salon, Booking } from "@/types";
import { platformStore } from "@/lib/store";

export default function MerchantPortalPage() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [activeSalon, setActiveSalon] = useState<Salon | null>(null);
  const [activeRole, setActiveRole] = useState<"owner" | "manager" | "receptionist" | "stylist">("owner");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tokenSearch, setTokenSearch] = useState<string>("");
  const [scannedBooking, setScannedBooking] = useState<Booking | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const list = platformStore.getSalons();
    setSalons(list);
    if (list.length > 0) {
      setActiveSalon(list[0]);
    }
    setBookings(platformStore.getBookings());
  }, []);

  const handleSalonChange = (id: string) => {
    const found = salons.find((s) => s.id === id);
    if (found) setActiveSalon(found);
  };

  const handleVerifyToken = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tokenSearch.trim().toUpperCase();
    if (!clean) return;

    const b = bookings.find((item) => item.id.toUpperCase() === clean);
    if (b) {
      setScannedBooking(b);
      showToast(`✓ Verified Token ${b.id} for ${b.customer_name}!`);
    } else {
      // Demonstration token fallback
      const demoBooking: Booking = {
        id: clean,
        salon_name: activeSalon ? activeSalon.name : "Vintage Crown Barbershop",
        customer_name: "Mahmud Hasan",
        customer_phone: "+880 1819-887766",
        barber: "Kabir Hossain",
        chair: 1,
        service: "Signature Scissor Fade",
        time_slot: "11:30 AM",
        booking_date: new Date().toISOString().split("T")[0],
        total: 500,
        deposit_paid: 50,
        deposit_method: "bKash",
        trx_id: "TRX-BK-778811",
        due_at_salon: 450,
        status: "confirmed",
      };
      setScannedBooking(demoBooking);
      showToast(`Token ${clean} loaded.`);
    }
  };

  const handleCheckIn = () => {
    if (scannedBooking) {
      showToast(`✓ Checked in ${scannedBooking.customer_name} at Chair #${scannedBooking.chair}! Collect ৳${scannedBooking.due_at_salon}.`);
      setScannedBooking(null);
      setTokenSearch("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D13] text-slate-100 font-sans flex flex-col justify-between">
      {/* Top Bar */}
      <header className="h-16 border-b border-[#1F2639] bg-[#0E121C]/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-serif font-bold text-lg shadow-md border border-amber-500/30">
            {activeSalon ? activeSalon.name.substring(0, 2).toUpperCase() : "SL"}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white tracking-tight">
                {activeSalon?.name || "Merchant Portal"}
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                Verified Tenant
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
              <span>📍 {activeSalon?.area || "Dhanmondi"}, {activeSalon?.district || "Dhaka"}</span>
              <span>•</span>
              <span className="text-emerald-400">Open Daily BST</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Active Tenant Switcher */}
          <div className="hidden sm:flex items-center space-x-2 bg-[#121622] px-2.5 py-1.5 rounded-lg border border-[#1F2639] text-xs">
            <span className="text-slate-400 font-mono text-[10px] uppercase">Salon:</span>
            <select
              value={activeSalon?.id || ""}
              onChange={(e) => handleSalonChange(e.target.value)}
              className="bg-transparent text-amber-400 font-semibold focus:outline-none cursor-pointer"
            >
              {salons.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#121622] text-white">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Role Switcher */}
          <div className="hidden md:flex items-center space-x-2 bg-[#121622] px-2.5 py-1.5 rounded-lg border border-[#1F2639] text-xs">
            <span className="text-slate-400 font-mono text-[10px] uppercase">Role:</span>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as any)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="owner" className="bg-[#121622]">Salon Owner</option>
              <option value="manager" className="bg-[#121622]">Manager</option>
              <option value="receptionist" className="bg-[#121622]">Receptionist (POS)</option>
              <option value="stylist" className="bg-[#121622]">Stylist</option>
            </select>
          </div>

          {activeSalon && (
            <Link
              href={`/salon/${activeSalon.slug}`}
              target="_blank"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-amber-500/30 hover:border-amber-400 bg-amber-500/10 text-xs text-amber-300 font-semibold transition-all"
            >
              <span>Public Storefront</span>
              <span className="text-[10px]">↗</span>
            </Link>
          )}

          <Link
            href="/admin"
            className="px-3 py-1.5 rounded-lg bg-[#E8220A] text-white text-xs font-semibold"
          >
            Super Admin
          </Link>
        </div>
      </header>

      {/* Main Merchant Canvas */}
      <main className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8 w-full flex-1">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-[#121622] border border-[#1F2639]">
            <span className="text-slate-400 uppercase text-[10px]">Today&apos;s Bookings</span>
            <div className="text-2xl font-bold text-white mt-1">18 Cuts</div>
            <div className="text-emerald-400 text-[10px] mt-1">4 Completed • 2 In Chair</div>
          </div>
          <div className="p-4 rounded-xl bg-[#121622] border border-[#1F2639]">
            <span className="text-slate-400 uppercase text-[10px]">Advance Deposits Collected</span>
            <div className="text-2xl font-bold text-emerald-400 mt-1">৳ 900</div>
            <div className="text-slate-500 text-[10px] mt-1">bKash & Nagad (৳50/seat)</div>
          </div>
          <div className="p-4 rounded-xl bg-[#121622] border border-[#1F2639]">
            <span className="text-slate-400 uppercase text-[10px]">Desk Due Balance</span>
            <div className="text-2xl font-bold text-white mt-1">৳ 7,150</div>
            <div className="text-slate-500 text-[10px] mt-1">Pay-at-salon cash/card</div>
          </div>
          <div className="p-4 rounded-xl bg-[#121622] border border-[#1F2639]">
            <span className="text-slate-400 uppercase text-[10px]">Chair Occupancy</span>
            <div className="text-2xl font-bold text-amber-400 mt-1">85%</div>
            <div className="text-slate-500 text-[10px] mt-1">4 of 4 Stations Active</div>
          </div>
        </div>

        {/* Desk POS Token Scanner */}
        <div className="p-6 rounded-2xl bg-[#121622] border border-[#1F2639] space-y-4">
          <div className="flex items-center justify-between border-b border-[#1F2639] pb-3">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-emerald-400">Receptionist Desk Mode</span>
              <h3 className="text-base font-bold text-white">Desk POS: Verify Client Token</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Real-Time Check-In</span>
          </div>

          <form onSubmit={handleVerifyToken} className="flex gap-2">
            <input
              type="text"
              value={tokenSearch}
              onChange={(e) => setTokenSearch(e.target.value)}
              placeholder="Scan or enter Client Token ID (e.g. SLN-DHN-8940)..."
              className="flex-1 bg-[#0C1220] border border-[#243050] rounded-lg px-4 py-2.5 text-xs text-white font-mono uppercase focus:outline-none focus:border-emerald-500"
            />
            <button type="submit" className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all">
              Verify Token
            </button>
          </form>

          {scannedBooking && (
            <div className="p-4 rounded-xl bg-[#0C1220] border border-emerald-500/40 text-xs font-mono flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-emerald-400 font-bold text-sm">{scannedBooking.id}</span>
                <div className="text-white font-sans font-semibold mt-0.5">
                  {scannedBooking.customer_name} ({scannedBooking.customer_phone})
                </div>
                <div className="text-slate-400 text-[11px] mt-0.5">
                  Barber: <strong className="text-white">{scannedBooking.barber}</strong> (Station #{scannedBooking.chair}) • Service: {scannedBooking.service}
                </div>
                <div className="text-amber-400 text-[11px] mt-0.5">
                  Slot: {scannedBooking.time_slot} • Deposit ৳{scannedBooking.deposit_paid} Paid
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-slate-400 text-[11px]">Collect At Desk:</div>
                <div className="text-xl font-bold text-white font-mono">৳ {scannedBooking.due_at_salon}</div>
                <button
                  onClick={handleCheckIn}
                  className="mt-2 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                >
                  ✓ Check-In Chair
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Chair Radar Stations */}
        <div className="space-y-4">
          <div className="border-b border-[#1F2639] pb-3">
            <h3 className="text-base font-bold text-white">Live Chair Stations Radar</h3>
            <p className="text-xs text-slate-400">Real-time status of master barber stations.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { station: "Chair #1", barber: "Kabir Hossain", status: "Occupied", client: "Zubair Ahmed", service: "Skin Fade", timeRemaining: "12 mins left" },
              { station: "Chair #2", barber: "Jewel Ahmed", status: "Available", client: "Ready for Next", service: "Station Sanitized", timeRemaining: "Next: 11:30 AM" },
              { station: "Chair #3", barber: "Tanvir Mia", status: "Occupied", client: "Farhan K.", service: "Hot Towel Shave", timeRemaining: "8 mins left" },
              { station: "Chair #4", barber: "Nayeem Islam", status: "Available", client: "Ready for Next", service: "Station Sanitized", timeRemaining: "Next: 12:15 PM" },
            ].map((st) => (
              <div key={st.station} className="p-4 rounded-xl bg-[#121622] border border-[#1F2639] space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-white">{st.station}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      st.status === "Occupied"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {st.status}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">{st.barber}</div>
                  <div className="text-[11px] text-slate-400">{st.client}</div>
                  <div className="text-[10px] text-slate-500 font-mono mt-1">{st.service} • {st.timeRemaining}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Floating Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl border border-emerald-500/40 bg-emerald-950/90 text-emerald-200 text-xs font-semibold shadow-xl backdrop-blur-md">
          {toast}
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-[#1F2639] bg-[#090D17] text-slate-400 text-xs py-4 px-6 text-center">
        <span>Hair and Care bd Merchant Workspace • Tenant DB Isolated via Supabase RLS</span>
      </footer>
    </div>
  );
}

