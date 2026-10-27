"use client";

import React, { useState, useEffect } from "react";
import { Salon, Service, Barber, Booking } from "@/types";
import { platformStore } from "@/lib/store";

interface BookingEngineProps {
  preselectedSalon?: Salon | null;
  onBookingComplete?: (booking: Booking) => void;
}

const TIME_SLOTS = [
  "10:00 AM",
  "10:45 AM",
  "11:30 AM",
  "12:15 PM",
  "01:00 PM",
  "02:30 PM",
  "03:15 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:15 PM",
  "08:00 PM",
  "09:00 PM",
];

export function BookingEngine({ preselectedSalon, onBookingComplete }: BookingEngineProps) {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("11:30 AM");
  const [clientName, setClientName] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [depositMethod, setDepositMethod] = useState<"bKash" | "Nagad">("bKash");
  const [step, setStep] = useState<number>(1);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);

  useEffect(() => {
    const list = platformStore.getSalons();
    setSalons(list);
    if (preselectedSalon) {
      setSelectedSalon(preselectedSalon);
      if (preselectedSalon.services?.length) setSelectedServices([preselectedSalon.services[0]]);
      if (preselectedSalon.barbers?.length) setSelectedBarber(preselectedSalon.barbers[0]);
    } else if (list.length > 0) {
      setSelectedSalon(list[0]);
      if (list[0].services?.length) setSelectedServices([list[0].services[0]]);
      if (list[0].barbers?.length) setSelectedBarber(list[0].barbers[0]);
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSelectedDate(tomorrow.toISOString().split("T")[0]);
  }, [preselectedSalon]);

  const handleSalonChange = (salonId: string) => {
    const s = salons.find((item) => item.id === salonId);
    if (s) {
      setSelectedSalon(s);
      setSelectedServices(s.services.length > 0 ? [s.services[0]] : []);
      setSelectedBarber(s.barbers.length > 0 ? s.barbers[0] : null);
    }
  };

  const toggleService = (srv: Service) => {
    const exists = selectedServices.some((s) => s.id === srv.id);
    if (exists) {
      if (selectedServices.length === 1) return; // Keep at least one
      setSelectedServices(selectedServices.filter((s) => s.id !== srv.id));
    } else {
      setSelectedServices([...selectedServices, srv]);
    }
  };

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price_bdt, 0);
  const depositAmount = 50;
  const dueAmount = Math.max(0, totalPrice - depositAmount);

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      alert("Please provide your name and phone number.");
      return;
    }

    if (!selectedSalon) return;

    const prefix = selectedSalon.slug.substring(0, 3).toUpperCase();
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const tokenId = `${prefix}-DHN-${randNum}`;
    const trxId = `TRX-${depositMethod === "Nagad" ? "NG" : "BK"}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newBooking: Booking = {
      id: tokenId,
      salon_id: selectedSalon.id,
      salon_name: selectedSalon.name,
      customer_name: clientName,
      customer_phone: clientPhone,
      barber: selectedBarber ? selectedBarber.name : "Master Stylist",
      chair: selectedBarber ? selectedBarber.chair : 1,
      service: selectedServices.map((s) => s.name).join(" + "),
      time_slot: selectedSlot,
      booking_date: selectedDate,
      total: totalPrice,
      deposit_paid: depositAmount,
      deposit_method: depositMethod,
      trx_id: trxId,
      due_at_salon: dueAmount,
      status: "confirmed",
      payment_status: "paid",
      created_at: new Date().toISOString(),
    };

    platformStore.createBooking(newBooking);
    setConfirmedBooking(newBooking);
    setStep(5);
    if (onBookingComplete) onBookingComplete(newBooking);
  };

  const copyToken = () => {
    if (confirmedBooking) {
      navigator.clipboard.writeText(confirmedBooking.id);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <section id="booking-engine" className="py-20 px-4 sm:px-8 bg-[#090d17] border-b border-[#1f2639]">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-[11px] font-mono text-[#e8220a] font-bold uppercase tracking-widest bg-[#e8220a]/10 px-3 py-1 rounded-full border border-[#e8220a]/20">
            Real-Time Slot Engine
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Reserve Your Chair In 5 Steps
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
            Zero queue waiting. ৳50 bKash/Nagad advance deposit locks your chair station.
          </p>
        </div>

        {/* Wizard Steps Bar */}
        <div className="flex items-center justify-between border-b border-[#1f2639] pb-4 text-xs font-mono">
          {[
            { num: 1, label: "Studio" },
            { num: 2, label: "Services" },
            { num: 3, label: "Slot & Barber" },
            { num: 4, label: "Deposit & Pay" },
            { num: 5, label: "Token Slip" },
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-1.5 ${
                step === s.num
                  ? "text-[#e8220a] font-bold"
                  : step > s.num
                  ? "text-emerald-400"
                  : "text-slate-500"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step === s.num
                    ? "bg-[#e8220a] text-white"
                    : step > s.num
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                    : "bg-[#172138] text-slate-400"
                }`}
              >
                {step > s.num ? "✓" : s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Step 1: Select Studio */}
        {step === 1 && (
          <div className="bg-[#121622] p-6 rounded-2xl border border-[#1f2639] space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Choose Verified Studio:
              </label>
              <select
                value={selectedSalon?.id || ""}
                onChange={(e) => handleSalonChange(e.target.value)}
                className="w-full bg-[#0c1220] border border-[#243050] rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-[#e8220a]"
              >
                {salons.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.area}, {s.district}) — Rated {s.rating}★
                  </option>
                ))}
              </select>
            </div>

            {selectedSalon && (
              <div className="p-4 rounded-xl bg-[#172138] border border-[#243050] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#e8220a] font-bold">
                    Active Partner Studio
                  </span>
                  <h4 className="text-base font-bold text-white mt-0.5">{selectedSalon.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">📍 {selectedSalon.address}</p>
                </div>
                <div className="text-left sm:text-right font-mono text-xs">
                  <span className="text-emerald-400 font-semibold block">
                    BST {selectedSalon.opening_time} – {selectedSalon.closing_time}
                  </span>
                  <span className="text-slate-400 text-[11px] block mt-0.5">
                    Phone: {selectedSalon.phone}
                  </span>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStep(2)}
                className="btn-barber-primary px-6 py-2.5 text-xs font-bold"
              >
                Continue to Services →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Choose Services */}
        {step === 2 && (
          <div className="bg-[#121622] p-6 rounded-2xl border border-[#1f2639] space-y-6">
            <div className="flex items-center justify-between border-b border-[#1f2639] pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Select Services & Treatments</h3>
                <p className="text-xs text-slate-400">Choose one or more craft grooming options.</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-mono block">Subtotal</span>
                <span className="text-base font-bold text-emerald-400 font-mono">৳ {totalPrice}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedSalon?.services.map((srv) => {
                const isSelected = selectedServices.some((s) => s.id === srv.id);
                return (
                  <div
                    key={srv.id}
                    onClick={() => toggleService(srv)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                      isSelected
                        ? "bg-[#e8220a]/10 border-[#e8220a] shadow-md shadow-[#e8220a]/10"
                        : "bg-[#172138] border-[#243050] hover:border-slate-500"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-[#e8220a] px-1.5 py-0.5 rounded bg-[#e8220a]/20">
                          {srv.category}
                        </span>
                        <span className="text-xs font-bold text-white">{srv.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        {srv.description || "Master grooming finish"}
                      </p>
                      <span className="text-[10px] text-slate-500 font-mono mt-2 block">
                        ⏱ {srv.duration_minutes} Mins
                      </span>
                    </div>
                    <div className="text-right pl-3">
                      <span className="text-sm font-bold text-emerald-400 font-mono block">
                        ৳ {srv.price_bdt}
                      </span>
                      <span className={`text-xs mt-2 block ${isSelected ? "text-[#e8220a]" : "text-slate-500"}`}>
                        {isSelected ? "✓ Selected" : "+ Add"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#1f2639]">
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-lg border border-[#243050] text-xs font-medium text-slate-300 hover:bg-white/5"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="btn-barber-primary px-6 py-2.5 text-xs font-bold"
              >
                Choose Slot & Barber →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Date, Time & Barber */}
        {step === 3 && (
          <div className="bg-[#121622] p-6 rounded-2xl border border-[#1f2639] space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full bg-[#0c1220] border border-[#243050] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#e8220a]"
              />
            </div>

            {/* Barber Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Select Master Barber / Chair:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {selectedSalon?.barbers.map((b) => {
                  const isSelected = selectedBarber?.id === b.id;
                  return (
                    <div
                      key={b.id || b.name}
                      onClick={() => setSelectedBarber(b)}
                      className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                        isSelected
                          ? "bg-[#e8220a]/15 border-[#e8220a]"
                          : "bg-[#172138] border-[#243050] hover:border-slate-500"
                      }`}
                    >
                      <div className="w-12 h-12 mx-auto rounded-full overflow-hidden border border-[#243050] mb-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={b.avatar} alt={b.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-xs font-bold text-white">{b.name}</div>
                      <div className="text-[10px] text-amber-400 font-mono">{b.title}</div>
                      <div className="text-[9px] text-slate-400 font-mono mt-0.5">Station #{b.chair}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Time Slot Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Available Chair Slots (BST Time):
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-2 text-xs font-mono rounded-lg border transition-all ${
                        isSelected
                          ? "bg-[#e8220a] border-[#e8220a] text-white font-bold"
                          : "bg-[#172138] border-[#243050] text-slate-300 hover:border-slate-400"
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#1f2639]">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-lg border border-[#243050] text-xs font-medium text-slate-300 hover:bg-white/5"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="btn-barber-primary px-6 py-2.5 text-xs font-bold"
              >
                Contact & Deposit →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Client Details & MFS Advance Deposit */}
        {step === 4 && (
          <form onSubmit={handleConfirmReservation} className="bg-[#121622] p-6 rounded-2xl border border-[#1f2639] space-y-6">
            <div>
              <h3 className="text-base font-bold text-white">Guest Identification & Chair Lock</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Provide your mobile number to receive token slip SMS and verify your appointment.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full bg-[#0c1220] border border-[#243050] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#e8220a]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Mobile Number (+880) *</label>
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="e.g. 01712-445566"
                  className="w-full bg-[#0c1220] border border-[#243050] rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-[#e8220a]"
                />
              </div>
            </div>

            {/* Advance Deposit Section (bKash/Nagad No-Show Protection) */}
            <div className="p-4 rounded-xl bg-[#172138] border border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-amber-400">
                    Advance Chair Protection
                  </span>
                  <h4 className="text-sm font-bold text-white">৳ 50 Advance Booking Deposit</h4>
                </div>
                <div className="text-right font-mono">
                  <span className="text-xs text-slate-400">Due at Salon:</span>
                  <strong className="text-emerald-400 block text-base font-bold">৳ {dueAmount}</strong>
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="radio"
                    name="mfs"
                    value="bKash"
                    checked={depositMethod === "bKash"}
                    onChange={() => setDepositMethod("bKash")}
                    className="accent-[#e8220a]"
                  />
                  <span>bKash (Instant Checkout)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-200 cursor-pointer">
                  <input
                    type="radio"
                    name="mfs"
                    value="Nagad"
                    checked={depositMethod === "Nagad"}
                    onChange={() => setDepositMethod("Nagad")}
                    className="accent-[#e8220a]"
                  />
                  <span>Nagad</span>
                </label>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed italic">
                Deposit is instantly credited toward your service total upon chair check-in.
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#1f2639]">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 rounded-lg border border-[#243050] text-xs font-medium text-slate-300 hover:bg-white/5"
              >
                ← Back
              </button>
              <button type="submit" className="btn-barber-primary px-6 py-2.5 text-xs font-bold">
                Lock Chair & Pay ৳50 Deposit →
              </button>
            </div>
          </form>
        )}

        {/* Step 5: Official Token Confirmation Slip */}
        {step === 5 && confirmedBooking && (
          <div className="bg-[#121622] p-8 rounded-2xl border border-emerald-500/40 shadow-2xl space-y-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl font-bold border border-emerald-500/40">
              ✓
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 tracking-wider">
                Chair Reserved & Token Generated
              </span>
              <h3 className="text-2xl font-bold text-white mt-1">Booking Confirmed!</h3>
              <p className="text-xs text-slate-400 mt-1">
                Show this digital token slip to the salon front desk when you arrive.
              </p>
            </div>

            {/* Token Card */}
            <div className="max-w-md mx-auto p-5 rounded-xl bg-[#0c1220] border border-[#243050] text-left space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center border-b border-[#1f2639] pb-3">
                <span className="text-slate-400">Token ID:</span>
                <div className="flex items-center gap-2">
                  <strong className="text-emerald-400 text-sm font-bold">{confirmedBooking.id}</strong>
                  <button
                    onClick={copyToken}
                    className="px-2 py-0.5 rounded bg-[#172138] hover:bg-[#243050] text-[10px] text-slate-300 border border-[#243050]"
                  >
                    {copiedToken ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Studio:</span>
                <span className="text-white font-sans font-semibold">{confirmedBooking.salon_name}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Customer:</span>
                <span className="text-white">{confirmedBooking.customer_name} ({confirmedBooking.customer_phone})</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Barber / Chair:</span>
                <span className="text-white">{confirmedBooking.barber} (Station #{confirmedBooking.chair})</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Appointment:</span>
                <span className="text-amber-400 font-bold">{confirmedBooking.booking_date} at {confirmedBooking.time_slot} BST</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Service:</span>
                <span className="text-white font-sans">{confirmedBooking.service}</span>
              </div>

              <div className="flex justify-between border-t border-[#1f2639] pt-2">
                <span className="text-slate-400">Deposit Paid:</span>
                <span className="text-emerald-400 font-bold">৳ {confirmedBooking.deposit_paid} ({confirmedBooking.deposit_method})</span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-400">Remaining Balance:</span>
                <span className="text-white font-bold">৳ {confirmedBooking.due_at_salon}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-5 py-2.5 rounded-lg bg-[#172138] hover:bg-[#243050] text-xs font-semibold text-slate-200 transition-colors"
              >
                Book Another Chair
              </button>
              <a
                href="#recommended-studios"
                className="btn-barber-primary px-5 py-2.5 text-xs font-bold"
              >
                Browse More Studios
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

