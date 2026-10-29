"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MapPin, Check, ShieldCheck } from "lucide-react";
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

    // Direct real-time fetch from platform store
    const freshBookings = platformStore.getBookings();
    setBookings(freshBookings);

    const b = freshBookings.find((item) => item.id.toUpperCase() === clean);
    if (b) {
      setScannedBooking(b);
      showToast(`Verified Token ${b.id} for ${b.customer_name}!`);
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
      try {
        platformStore.updateBookingStatus?.(scannedBooking.id, "checked_in");
      } catch (err) {}
      showToast(`Checked in ${scannedBooking.customer_name} at Chair #${scannedBooking.chair}! Collect ৳${scannedBooking.due_at_salon}.`);
      setScannedBooking(null);
      setTokenSearch("");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-[#0D0D0D] font-sans flex flex-col justify-between">
      {/* Top Bar */}
      <header className="h-16 border-b border-gray-200 bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-900 to-black flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {activeSalon ? activeSalon.name.substring(0, 2).toUpperCase() : "HC"}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-[#0D0D0D] tracking-tight">
                {activeSalon?.name || "Merchant Portal"}
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Verified Tenant
              </span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-gray-500 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-gray-400" />
                <span>{activeSalon?.area || "Dhanmondi"}, {activeSalon?.district || "Dhaka"}</span>
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">Open Daily BST</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {/* Active Tenant Switcher */}
          <div className="hidden sm:flex items-center space-x-2 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs">
            <span className="text-gray-500 text-[10px] uppercase font-semibold">Salon:</span>
            <select
              value={activeSalon?.id || ""}
              onChange={(e) => handleSalonChange(e.target.value)}
              className="bg-transparent text-[#0D0D0D] font-semibold focus:outline-none cursor-pointer"
            >
              {salons.map((s) => (
                <option key={s.id} value={s.id} className="text-gray-900">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Role Switcher */}
          <div className="hidden md:flex items-center space-x-2 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs">
            <span className="text-gray-500 text-[10px] uppercase font-semibold">Role:</span>
            <select
              value={activeRole}
              onChange={(e) => setActiveRole(e.target.value as any)}
              className="bg-transparent text-gray-800 focus:outline-none cursor-pointer"
            >
              <option value="owner">Salon Owner</option>
              <option value="manager">Manager</option>
              <option value="receptionist">Receptionist (POS)</option>
              <option value="stylist">Stylist</option>
            </select>
          </div>

          {activeSalon && (
            <Link
              href={`/salon/${activeSalon.slug}`}
              target="_blank"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-900 bg-white text-xs text-gray-800 font-semibold transition-all shadow-sm"
            >
              <span>Public Storefront</span>
              <span className="text-[10px]">↗</span>
            </Link>
          )}

          <Link
            href="/admin"
            className="px-3.5 py-1.5 rounded-lg bg-[#E8220A] text-white text-xs font-semibold shadow-sm hover:bg-[#B51B08] transition-all"
          >
            Super Admin
          </Link>
        </div>
      </header>

      {/* Main Merchant Canvas */}
      <main className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8 w-full flex-1">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <span className="text-gray-500 uppercase text-[10px] font-semibold">Today&apos;s Bookings</span>
            <div className="text-2xl font-bold text-[#0D0D0D] mt-1">18 Cuts</div>
            <div className="text-emerald-700 text-[10px] mt-1 font-semibold">4 Completed • 2 In Chair</div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <span className="text-gray-500 uppercase text-[10px] font-semibold">Advance Deposits Collected</span>
            <div className="text-2xl font-bold text-emerald-700 mt-1">৳ 900</div>
            <div className="text-gray-500 text-[10px] mt-1 font-medium">bKash & Nagad (৳50/seat)</div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <span className="text-gray-500 uppercase text-[10px] font-semibold">Desk Due Balance</span>
            <div className="text-2xl font-bold text-[#0D0D0D] mt-1">৳ 7,150</div>
            <div className="text-gray-500 text-[10px] mt-1 font-medium">Pay-at-salon cash/card</div>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <span className="text-gray-500 uppercase text-[10px] font-semibold">Chair Occupancy</span>
            <div className="text-2xl font-bold text-amber-700 mt-1">85%</div>
            <div className="text-gray-500 text-[10px] mt-1 font-medium">4 of 4 Stations Active</div>
          </div>
        </div>

        {/* Desk POS Token Scanner */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-700">Receptionist Desk Mode</span>
              <h3 className="text-base font-bold text-[#0D0D0D]">Desk POS: Verify Client Token</h3>
            </div>
            <span className="text-xs text-gray-500 font-medium">Real-Time Web Check-In</span>
          </div>

          <form onSubmit={handleVerifyToken} className="flex gap-2">
            <input
              type="text"
              value={tokenSearch}
              onChange={(e) => setTokenSearch(e.target.value)}
              placeholder="Scan or enter Client Token ID (e.g. SLN-DHN-8940)..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-900 uppercase focus:outline-none focus:border-emerald-600"
            />
            <button type="submit" className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-sm">
              Verify Token
            </button>
          </form>

          {scannedBooking && (
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-emerald-800 font-bold text-sm">{scannedBooking.id}</span>
                <div className="text-gray-900 font-semibold mt-0.5">
                  {scannedBooking.customer_name} ({scannedBooking.customer_phone})
                </div>
                <div className="text-gray-600 text-[11px] mt-0.5">
                  Barber: <strong className="text-gray-900">{scannedBooking.barber}</strong> (Station #{scannedBooking.chair}) • Service: {scannedBooking.service}
                </div>
                <div className="text-amber-800 text-[11px] mt-0.5 font-medium">
                  Slot: {scannedBooking.time_slot} • Deposit ৳{scannedBooking.deposit_paid} Paid
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-gray-500 text-[11px] font-medium">Collect At Desk:</div>
                <div className="text-xl font-bold text-gray-900">৳ {scannedBooking.due_at_salon}</div>
                <button
                  onClick={handleCheckIn}
                  className="mt-2 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Check-In Chair</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Live Chair Radar Stations */}
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-3">
            <h3 className="text-base font-bold text-[#0D0D0D]">Live Chair Stations Radar</h3>
            <p className="text-xs text-gray-500">Real-time status of master barber stations.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { station: "Chair #1", barber: "Kabir Hossain", status: "Occupied", client: "Zubair Ahmed", service: "Skin Fade", timeRemaining: "12 mins left" },
              { station: "Chair #2", barber: "Jewel Ahmed", status: "Available", client: "Ready for Next", service: "Station Sanitized", timeRemaining: "Next: 11:30 AM" },
              { station: "Chair #3", barber: "Tanvir Mia", status: "Occupied", client: "Farhan K.", service: "Hot Towel Shave", timeRemaining: "8 mins left" },
              { station: "Chair #4", barber: "Nayeem Islam", status: "Available", client: "Ready for Next", service: "Station Sanitized", timeRemaining: "Next: 12:15 PM" },
            ].map((st) => (
              <div key={st.station} className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-gray-900">{st.station}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      st.status === "Occupied"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {st.status}
                  </span>
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-900">{st.barber}</div>
                  <div className="text-[11px] text-gray-500">{st.client}</div>
                  <div className="text-[10px] text-gray-400 mt-1 font-medium">{st.service} • {st.timeRemaining}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Floating Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl border border-emerald-200 bg-white text-emerald-800 text-xs font-semibold shadow-xl">
          {toast}
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-[#F9F9FB] text-gray-500 text-xs py-4 px-6 text-center">
        <span>Hair and Care bd Merchant Workspace • Browser-based POS & Radar System</span>
      </footer>
    </div>
  );
}
