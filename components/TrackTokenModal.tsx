"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Booking } from "@/types";
import { platformStore } from "@/lib/store";

interface TrackTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TrackTokenModal({ isOpen, onClose }: TrackTokenModalProps) {
  const [tokenInput, setTokenInput] = useState("");
  const [foundBooking, setFoundBooking] = useState<Booking | null>(null);
  const [searched, setSearched] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = tokenInput.trim().toUpperCase();
    if (!cleanId) return;

    const bookings = platformStore.getBookings();
    const match = bookings.find((b) => b.id.toUpperCase() === cleanId);

    if (match) {
      setFoundBooking(match);
    } else {
      // Sample fallback token for demonstration
      if (cleanId.includes("SLN") || cleanId.includes("VIN") || cleanId.includes("THE")) {
        setFoundBooking({
          id: cleanId,
          salon_name: "Vintage Crown Barbershop",
          customer_name: "Tanvir Ahmed",
          customer_phone: "+880 1711-554433",
          barber: "Kabir Hossain",
          chair: 1,
          service: "Signature Scissor Fade",
          time_slot: "11:30 AM",
          booking_date: new Date().toISOString().split("T")[0],
          total: 500,
          deposit_paid: 50,
          deposit_method: "bKash",
          trx_id: "TRX-BK-918204",
          due_at_salon: 450,
          status: "confirmed",
        });
      } else {
        setFoundBooking(null);
      }
    }
    setSearched(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121622] border border-[#1f2639] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#1f2639] bg-[#0c1220] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
              Live Queue Tracker
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">Track My Token Slip</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              required
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Enter your Token ID (e.g. SLN-DHN-8940)..."
              className="flex-1 bg-[#0c1220] border border-[#243050] rounded-lg px-4 py-2.5 text-xs text-white uppercase focus:outline-none focus:border-[#e8220a]"
            />
            <button type="submit" className="btn-barber-primary px-4 py-2 text-xs font-bold shrink-0">
              Check Status
            </button>
          </form>

          {searched && foundBooking && (
            <div className="p-5 rounded-xl bg-[#0c1220] border border-emerald-500/30 space-y-4 text-xs">
              <div className="flex items-center justify-between border-b border-[#1f2639] pb-3">
                <div>
                  <span className="text-slate-400 text-[10px] block">Verified Token:</span>
                  <strong className="text-emerald-400 text-sm">{foundBooking.id}</strong>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold uppercase text-[10px]">
                  {foundBooking.status}
                </span>
              </div>

              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-500">Studio:</span>
                  <span className="text-white font-sans font-semibold">{foundBooking.salon_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Barber:</span>
                  <span>{foundBooking.barber} (Chair #{foundBooking.chair})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time Slot:</span>
                  <span className="text-amber-400">{foundBooking.time_slot} ({foundBooking.booking_date})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Service:</span>
                  <span>{foundBooking.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Deposit Paid:</span>
                  <span className="text-emerald-400">৳{foundBooking.deposit_paid} ({foundBooking.deposit_method})</span>
                </div>
                <div className="flex justify-between border-t border-[#1f2639] pt-1.5">
                  <span className="text-slate-500">Due at Chair:</span>
                  <span className="text-white font-bold">৳{foundBooking.due_at_salon}</span>
                </div>
              </div>

              {/* Verified Review Link */}
              <div className="pt-2">
                <Link
                  href={`/review?token=${foundBooking.id}`}
                  onClick={onClose}
                  className="w-full py-2 rounded-lg bg-[#172138] hover:bg-[#243050] text-center block text-xs font-sans font-semibold text-amber-300 border border-[#243050] transition-colors"
                >
                  Write Verified Review For This Cut →
                </Link>
              </div>
            </div>
          )}

          {searched && !foundBooking && (
            <div className="p-6 text-center border border-dashed border-[#243050] rounded-xl text-xs text-slate-400">
              No reservation found for token &quot;{tokenInput}&quot;. Please verify the spelling or book a chair below.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

