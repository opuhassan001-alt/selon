"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { platformStore } from "@/lib/store";

interface RegisterSalonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (salonName: string) => void;
}

export function RegisterSalonModal({ isOpen, onClose, onSuccess }: RegisterSalonModalProps) {
  const [salonName, setSalonName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [district, setDistrict] = useState("Dhaka");
  const [area, setArea] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [tradeLicense, setTradeLicense] = useState("");
  const [chairsCount, setChairsCount] = useState(4);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!salonName || !phone) {
      alert("Please enter the salon name and contact phone number.");
      return;
    }

    setSubmitting(true);
    try {
      platformStore.submitApplication({
        salon_name: salonName,
        owner_name: ownerName || "Salon Partner",
        owner_phone: phone,
        owner_email: email || "partner@hairandcare.bd",
        district: district,
        area: area || "Main Area",
        full_address: fullAddress || `${area || "Main Area"}, ${district}`,
        trade_license_number: tradeLicense || "TRAD/DNCC/PENDING",
        chairs_count: Number(chairsCount) || 4,
        opening_time: "10:00",
        closing_time: "22:00",
        notes: `Application submitted via web portal for ${chairsCount} chairs.`,
      });

      onSuccess(salonName);
      onClose();
    } catch (err) {
      alert("Failed to submit application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#121622] border border-[#1f2639] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-[#1f2639] bg-[#0c1220] flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#e8220a] tracking-wider">
              Salon Partner Onboarding
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">List Your Business on Hair and Care</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Salon / Studio Name *</label>
            <input
              type="text"
              required
              value={salonName}
              onChange={(e) => setSalonName(e.target.value)}
              placeholder="e.g. Vintage Crown Barbershop"
              className="w-full bg-[#0c1220] border border-[#243050] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#e8220a]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Owner / Manager Name *</label>
              <input
                type="text"
                required
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Rafiqul Islam"
                className="w-full bg-[#0c1220] border border-[#243050] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#e8220a]"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Phone Number (+880) *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01712-445566"
                className="w-full bg-[#0c1220] border border-[#243050] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#e8220a]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">District Hub *</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-[#0c1220] border border-[#243050] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-[#e8220a]"
              >
                <option value="Dhaka">Dhaka</option>
                <option value="Chittagong">Chittagong</option>
                <option value="Sylhet">Sylhet</option>
                <option value="Rajshahi">Rajshahi</option>
                <option value="Khulna">Khulna</option>
                <option value="Barisal">Barisal</option>
                <option value="Rangpur">Rangpur</option>
                <option value="Mymensingh">Mymensingh</option>
              </select>
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Area / Neighborhood *</label>
              <input
                type="text"
                required
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Dhanmondi 27"
                className="w-full bg-[#0c1220] border border-[#243050] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#e8220a]"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Full Physical Address</label>
            <input
              type="text"
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              placeholder="House #, Road #, Landmark"
              className="w-full bg-[#0c1220] border border-[#243050] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#e8220a]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Trade License / NID Number</label>
              <input
                type="text"
                value={tradeLicense}
                onChange={(e) => setTradeLicense(e.target.value)}
                placeholder="TRAD/DNCC/12345/2026"
                className="w-full bg-[#0c1220] border border-[#243050] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#e8220a]"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Active Barber Chairs</label>
              <input
                type="number"
                min="1"
                max="25"
                value={chairsCount}
                onChange={(e) => setChairsCount(parseInt(e.target.value, 10) || 1)}
                className="w-full bg-[#0c1220] border border-[#243050] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#e8220a]"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-emerald-300 text-[11px] leading-relaxed">
            Upon submitting, your application enters the Super Admin review queue. You will receive an SMS and email notification once verified.
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="btn-barber-primary w-full py-2.5 text-xs font-bold"
            >
              {submitting ? "Submitting..." : "Submit Application for Triage →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

