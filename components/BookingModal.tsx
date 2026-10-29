"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Check } from "lucide-react";
import { platformStore } from "@/lib/store";
import { Booking } from "@/types";

export interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  venueName?: string;
  defaultVenue?: {
    id: string;
    name: string;
    area: string;
    district: string;
    starting_price: number;
  } | null;
  onBookingSuccess?: (token: string, venue: string, service: string, slot: string) => void;
}

const VENUE_SERVICES: Record<string, Array<{ name: string; duration: string; price: number }>> = {
  "Trendy Trim": [
    { name: "Haircut & Deluxe Beard Sculpting", duration: "45 mins", price: 450 },
    { name: "Classic Fade & Scissor Cut", duration: "30 mins", price: 300 },
    { name: "Charcoal Scalp Detox & Wash", duration: "20 mins", price: 250 },
    { name: "Executive Grooming Package", duration: "75 mins", price: 850 },
  ],
  "Vintage Crown Barbershop": [
    { name: "Signature Skin Fade & Hot Towel Shave", duration: "50 mins", price: 600 },
    { name: "Straight-Razor Beard Contouring", duration: "30 mins", price: 350 },
    { name: "Organic Scalp Massage & Treatment", duration: "25 mins", price: 400 },
    { name: "The Gentleman's Royal Ritual", duration: "90 mins", price: 1200 },
  ],
  "Aura Medspa & Skincare": [
    { name: "Hydrafacial Glow & Deep Exfoliation", duration: "60 mins", price: 1500 },
    { name: "Anti-Aging LED Collagen Therapy", duration: "45 mins", price: 1800 },
    { name: "Microdermabrasion & Pore Refining", duration: "50 mins", price: 1400 },
    { name: "Customized Medical Peels", duration: "40 mins", price: 2000 },
  ],
  "The Royal Blade Studio": [
    { name: "Precision Scissor Cut & Finish", duration: "35 mins", price: 500 },
    { name: "Royal Hot Towel Shave", duration: "25 mins", price: 300 },
    { name: "Beard Trimming & Conditioning", duration: "20 mins", price: 250 },
  ],
  "LashXtend | Dear Skin": [
    { name: "Classic Lash Full Set", duration: "90 mins", price: 1800 },
    { name: "Volume Lash Extensions (Russian Volume)", duration: "120 mins", price: 2500 },
    { name: "Brow Lamination & Hybrid Tint", duration: "45 mins", price: 1200 },
    { name: "Lash Lift & Keratin Infusion", duration: "60 mins", price: 1500 },
  ],
  "Truefitt & Hill Heritage": [
    { name: "The Ultimate Shaving Experience", duration: "45 mins", price: 1200 },
    { name: "Traditional Haircut & Friction Wash", duration: "40 mins", price: 950 },
    { name: "Gentleman's Facial & Scalp Therapy", duration: "60 mins", price: 1800 },
  ],
};

const DEFAULT_SERVICES = [
  { name: "Executive Haircut & Styling", duration: "40 mins", price: 500 },
  { name: "Beard Sculpting & Contouring", duration: "25 mins", price: 300 },
  { name: "Hot Towel Shave & Steam", duration: "25 mins", price: 350 },
  { name: "Deep Scalp Massage & Wash", duration: "20 mins", price: 300 },
];

export function BookingModal({
  isOpen,
  onClose,
  venueName,
  defaultVenue,
  onBookingSuccess,
}: BookingModalProps) {
  const effectiveVenue = venueName || defaultVenue?.name || "Vintage Crown Barbershop";
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState("");
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [selectedStaff, setSelectedStaff] = useState("Any Professional");
  const [selectedDay, setSelectedDay] = useState("Today");
  const [selectedSlot, setSelectedSlot] = useState("11:30 AM");
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("bKash");
  const [generatedToken, setGeneratedToken] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Resolve matching salon and dynamic services directly from platform store (BEFORE conditional return)
  const matchedSalon = useMemo(() => {
    if (!isOpen) return undefined;
    return platformStore.getSalons().find(
      (s) =>
        s.name.toLowerCase() === effectiveVenue.toLowerCase() ||
        (defaultVenue?.id && s.id === defaultVenue.id)
    );
  }, [isOpen, effectiveVenue, defaultVenue]);

  const services = useMemo(() => {
    if (!isOpen) return DEFAULT_SERVICES;
    if (matchedSalon?.services && matchedSalon.services.length > 0) {
      return matchedSalon.services.map((srv) => ({
        name: srv.name,
        duration: `${srv.duration_minutes || 30} mins`,
        price: srv.price_bdt,
      }));
    }
    return VENUE_SERVICES[effectiveVenue] || DEFAULT_SERVICES;
  }, [isOpen, matchedSalon, effectiveVenue]);

  if (!isOpen) return null;

  const currentService = selectedService || services[0].name;
  const currentPrice = selectedPrice || services[0].price;

  const handleNext = () => {
    setErrorMsg("");
    if (step === 1) {
      if (!selectedService) {
        setSelectedService(services[0].name);
        setSelectedPrice(services[0].price);
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      if (!clientName.trim()) {
        setErrorMsg("Please enter your full name.");
        return;
      }
      if (!clientPhone.trim() || clientPhone.length < 10) {
        setErrorMsg("Please enter a valid mobile number for SMS Token notification.");
        return;
      }

      const token = "TK-" + Math.floor(1000 + Math.random() * 9000);
      setGeneratedToken(token);

      const newBookingRecord: Booking = {
        id: token,
        salon_id: matchedSalon?.id || defaultVenue?.id || "",
        salon_name: effectiveVenue,
        customer_name: clientName.trim(),
        customer_phone: clientPhone.trim(),
        barber: selectedStaff || "Master Stylist",
        chair: 1,
        service: currentService,
        time_slot: selectedSlot,
        booking_date: new Date().toISOString().split("T")[0],
        total: currentPrice,
        deposit_paid: 50,
        deposit_method: paymentMethod === "Nagad" ? "Nagad" : "bKash",
        trx_id: `TRX-${paymentMethod === "Nagad" ? "NG" : "BK"}-${Math.floor(100000 + Math.random() * 900000)}`,
        due_at_salon: Math.max(0, currentPrice - 50),
        status: "confirmed",
        payment_status: "pay_at_salon",
        created_at: new Date().toISOString(),
      };

      // Persist to unified central platformStore so TrackTokenModal & Portal find it instantly
      try {
        platformStore.createBooking(newBookingRecord);
      } catch (e) {
        console.error("Failed to persist booking into platformStore:", e);
      }

      if (onBookingSuccess) {
        onBookingSuccess(token, effectiveVenue, currentService, `${selectedDay} • ${selectedSlot}`);
      }
      setStep(5);
    }
  };

  const handleBack = () => {
    setErrorMsg("");
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 z-50 modal-backdrop-blur flex items-center justify-center p-4">
      <div className="bg-white rounded-[28px] max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div>
            <span className="font-bold text-lg text-[#0D0D0D] block">{effectiveVenue}</span>
            <span className="text-xs text-gray-500">
              {step === 1 && "Step 1 of 4 • Select Service"}
              {step === 2 && "Step 2 of 4 • Select Specialist"}
              {step === 3 && "Step 3 of 4 • Choose Appointment Slot"}
              {step === 4 && "Step 4 of 4 • Contact & Deposit"}
              {step === 5 && "Confirmed • Booking Receipt"}
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-black transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Step 1: Select Service */}
          {step === 1 && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-[#0D0D0D]">Featured Treatments</h4>
              <div className="space-y-2">
                {services.map((s) => {
                  const isSelected = (selectedService || services[0].name) === s.name;
                  return (
                    <label
                      key={s.name}
                      onClick={() => {
                        setSelectedService(s.name);
                        setSelectedPrice(s.price);
                      }}
                      className={`p-4 rounded-2xl border ${
                        isSelected ? "border-[#0D0D0D] bg-[#F9F9FB]" : "border-gray-200"
                      } hover:border-black flex items-center justify-between cursor-pointer transition-all`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="service"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 text-black accent-black"
                        />
                        <div>
                          <span className="text-xs font-bold text-[#0D0D0D] block">{s.name}</span>
                          <span className="text-[11px] text-gray-500">{s.duration}</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-[#0D0D0D]">৳{s.price}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Select Specialist */}
          {step === 2 && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-[#0D0D0D]">Select Specialist / Barber</h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Any Professional", sub: "Fastest available chair" },
                  { name: "Kabir Hossain", sub: "Master Barber • 14 yrs" },
                  { name: "Jewel Ahmed", sub: "Fade Specialist • 8 yrs" },
                  { name: "Tanvir Mia", sub: "Scalp & Spa Specialist" },
                ].map((staff) => {
                  const isSelected = selectedStaff === staff.name;
                  return (
                    <button
                      key={staff.name}
                      type="button"
                      onClick={() => setSelectedStaff(staff.name)}
                      className={`p-4 rounded-2xl text-left border ${
                        isSelected ? "border-[#0D0D0D] bg-[#F9F9FB] ring-1 ring-black" : "border-gray-200"
                      } hover:border-black transition-all`}
                    >
                      <span className="text-xs font-bold text-[#0D0D0D] block">{staff.name}</span>
                      <span className="text-[11px] text-gray-500">{staff.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Date & Time */}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-[#0D0D0D]">Choose Appointment Slot</h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                {["Today", "Tomorrow", "Friday"].map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      selectedDay === day ? "border-black bg-black text-white" : "border-gray-200 text-gray-800 hover:border-black"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <span className="text-xs font-semibold text-gray-500 block mb-2">Available Time Slots</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    "09:30 AM", "10:00 AM", "10:45 AM",
                    "11:30 AM", "01:00 PM", "02:30 PM",
                    "04:00 PM", "05:30 PM", "07:00 PM",
                  ].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-2 rounded-xl border text-xs font-semibold transition-all ${
                        selectedSlot === slot ? "border-black bg-black text-white" : "border-gray-200 text-gray-800 hover:border-black"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Contact & Deposit */}
          {step === 4 && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-[#0D0D0D]">Client Details & Chair Confirmation</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Arif Chowdhury"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 block mb-1">Mobile Phone (For SMS Token)</label>
                  <input
                    type="tel"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    placeholder="017XXXXXXXX"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-black"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-[#F9F9FB] border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0D0D0D]">Advance Token Deposit</span>
                    <span className="text-xs font-bold text-[#E8220A]">৳50 Advance</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Guarantees your reserved chair. Deducted from your final bill at the studio. Pay via bKash or Nagad.
                  </p>
                  <div className="flex gap-4 pt-1">
                    {["bKash", "Nagad", "Venue"].map((method) => (
                      <label key={method} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === method}
                          onChange={() => setPaymentMethod(method)}
                          className="text-[#0D0D0D] accent-[#0D0D0D]"
                        />
                        <span>{method === "Venue" ? "Pay at Venue" : method}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Instant Booking Slip */}
          {step === 5 && (
            <div className="text-center space-y-4 py-3">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-[#0D0D0D]">Chair Reserved!</h3>
              <p className="text-xs text-gray-500">Your reservation is confirmed on Hair and Care bd.</p>

              <div className="p-5 rounded-2xl bg-[#F9F9FB] border border-gray-200 text-left max-w-sm mx-auto space-y-2 text-xs">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-400">Token ID:</span>
                  <span className="font-bold text-[#0D0D0D]">{generatedToken}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-400">Studio:</span>
                  <span className="font-bold text-[#0D0D0D]">{venueName}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-400">Service:</span>
                  <span className="font-bold text-[#0D0D0D]">{currentService}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Slot:</span>
                  <span className="font-bold text-green-600">{selectedDay} • {selectedSlot}</span>
                </div>
              </div>

              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-full bg-[#0D0D0D] text-white text-xs font-bold hover:bg-black"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        {step < 5 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white sticky bottom-0">
            {step > 1 ? (
              <button
                onClick={handleBack}
                className="text-xs font-bold text-gray-500 hover:text-black"
              >
                ← Back
              </button>
            ) : <div />}
            <button
              onClick={handleNext}
              className="ml-auto px-6 py-2.5 rounded-full bg-[#0D0D0D] hover:bg-black text-white text-xs font-bold transition-all shadow-sm"
            >
              {step === 1 && "Continue to Specialist"}
              {step === 2 && "Continue to Date & Time"}
              {step === 3 && "Continue to Details"}
              {step === 4 && "Confirm Reservation"}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
