"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { BookingModal } from "@/components/BookingModal";
import { RegisterSalonModal } from "@/components/RegisterSalonModal";
import { TrackTokenModal } from "@/components/TrackTokenModal";
import { Footer } from "@/components/Footer";

// City Data
const CITIES_DATA: Record<string, Array<{ name: string; count: string }>> = {
  bangladesh: [
    { name: "Dhanmondi, Dhaka", count: "142 venues" },
    { name: "Gulshan, Dhaka", count: "186 venues" },
    { name: "Banani, Dhaka", count: "124 venues" },
    { name: "Mirpur, Dhaka", count: "98 venues" },
    { name: "Uttara, Dhaka", count: "115 venues" },
    { name: "Bashundhara, Dhaka", count: "64 venues" },
    { name: "Chattogram Hub", count: "88 venues" },
    { name: "Sylhet Hub", count: "54 venues" },
    { name: "Rajshahi City", count: "32 venues" },
    { name: "Khulna Hub", count: "28 venues" },
    { name: "Cox's Bazar", count: "22 venues" },
    { name: "Cumilla City", count: "36 venues" },
  ],
  uk: [
    { name: "London", count: "2,840 venues" },
    { name: "Manchester", count: "740 venues" },
    { name: "Birmingham", count: "620 venues" },
    { name: "Glasgow", count: "410 venues" },
    { name: "Edinburgh", count: "390 venues" },
    { name: "Leeds", count: "310 venues" },
  ],
  us: [
    { name: "New York", count: "4,120 venues" },
    { name: "Los Angeles", count: "3,890 venues" },
    { name: "Miami", count: "1,450 venues" },
    { name: "Chicago", count: "1,210 venues" },
  ],
  uae: [
    { name: "Dubai", count: "1,680 venues" },
    { name: "Abu Dhabi", count: "840 venues" },
    { name: "Sharjah", count: "320 venues" },
  ],
};

export default function Home() {
  // Modal states
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingVenue, setBookingVenue] = useState("Trendy Trim");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search states
  const [selectedCategory, setSelectedCategory] = useState("All treatments");
  const [treatment, setTreatment] = useState("");
  const [location, setLocation] = useState("Dhaka, Bangladesh");
  const [timeSlot, setTimeSlot] = useState("Any time");

  // Dropdown states
  const [treatmentDropdownOpen, setTreatmentDropdownOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const [timeDropdownOpen, setTimeDropdownOpen] = useState(false);

  // City Tab
  const [activeCountry, setActiveCountry] = useState("bangladesh");

  // Favorites
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // Carousel Refs
  const recentSliderRef = useRef<HTMLDivElement>(null);
  const recommendedSliderRef = useRef<HTMLDivElement>(null);
  const newSliderRef = useRef<HTMLDivElement>(null);
  const reviewsSliderRef = useRef<HTMLDivElement>(null);

  const scrollCarousel = (ref: React.RefObject<HTMLDivElement>, direction: number) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 340 * direction, behavior: "smooth" });
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleFavorite = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextState = !favorites[name];
    setFavorites((prev) => ({ ...prev, [name]: nextState }));
    showToast(nextState ? `Saved "${name}" to your favourites! ❤️` : `Removed "${name}" from favourites.`);
  };

  const openBookingFor = (name: string) => {
    setBookingVenue(name);
    setBookingModalOpen(true);
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setTreatmentDropdownOpen(false);
    setLocationDropdownOpen(false);
    setTimeDropdownOpen(false);
    showToast(`Searching for "${treatment || 'All treatments'}" in ${location} (${timeSlot})...`);
    if (recommendedSliderRef.current) {
      recommendedSliderRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <main className="min-h-screen bg-white text-[#0D0D0D] flex flex-col font-sans selection:bg-[#0D0D0D] selection:text-white">
      {/* 1. Header Navigation */}
      <Navbar
        onOpenRegister={() => setRegisterModalOpen(true)}
        onOpenTrack={() => setTrackModalOpen(true)}
      />

      {/* 2. Hero Section & 3-Input Search Capsule */}
      <section className="pt-12 sm:pt-16 pb-12 px-4 sm:px-8 bg-white text-center">
        <div className="max-w-[1140px] mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-extrabold tracking-tight text-[#0D0D0D] leading-[1.08] mb-4">
            Book local selfcare services
          </h1>
          <p className="text-base sm:text-lg text-[#5E5E5E] max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Discover top-rated salons, barbers, medspas, wellness studios and grooming experts trusted across Bangladesh
          </p>

          {/* 3-Input Floating Search Capsule */}
          <div className="max-w-4xl mx-auto relative">
            <form
              onSubmit={handleHeroSearch}
              className="search-capsule p-2 sm:p-2.5 flex flex-col md:flex-row items-stretch md:items-center gap-1.5 relative bg-white"
            >
              {/* Field 1: Treatment */}
              <div
                className="relative flex-1 flex items-center px-4 py-2.5 rounded-full hover:bg-[#F9F9FB] transition-colors cursor-pointer group"
                onClick={() => {
                  setTreatmentDropdownOpen(!treatmentDropdownOpen);
                  setLocationDropdownOpen(false);
                  setTimeDropdownOpen(false);
                }}
              >
                <svg className="w-5 h-5 text-[#8A8A8E] group-hover:text-[#0D0D0D] shrink-0 mr-3 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <div className="text-left w-full">
                  <span className="block text-[11px] font-semibold text-[#8A8A8E] uppercase tracking-wider">Treatment or Venue</span>
                  <input
                    type="text"
                    placeholder="All treatments"
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-[#0D0D0D] placeholder-[#0D0D0D] focus:outline-none cursor-pointer"
                  />
                </div>

                {/* Treatment Dropdown */}
                {treatmentDropdownOpen && (
                  <div className="absolute top-full left-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-[#EAEAEA] p-3 z-50 text-left animate-fadeIn">
                    <div className="text-xs font-bold text-gray-400 px-3 py-1.5 uppercase tracking-wider">Popular Services</div>
                    <div className="space-y-0.5 mt-1">
                      {[
                        { icon: "✨", name: "All treatments" },
                        { icon: "✂️", name: "Hair Salons" },
                        { icon: "💈", name: "Barbershops" },
                        { icon: "💅", name: "Nail Salons" },
                        { icon: "👁️", name: "Eyebrows & Lashes" },
                        { icon: "💆", name: "Massage" },
                        { icon: "💉", name: "Medspas" },
                        { icon: "🧴", name: "Facials & Skincare" },
                      ].map((cat) => (
                        <button
                          key={cat.name}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTreatment(cat.name);
                            setSelectedCategory(cat.name);
                            setTreatmentDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm font-medium rounded-xl hover:bg-[#F3F3F6] flex items-center gap-2.5 transition-colors"
                        >
                          <span>{cat.icon}</span> <span>{cat.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden md:block w-px h-8 bg-[#EAEAEA] shrink-0 my-auto"></div>

              {/* Field 2: Location */}
              <div
                className="relative flex-1 flex items-center px-4 py-2.5 rounded-full hover:bg-[#F9F9FB] transition-colors cursor-pointer group"
                onClick={() => {
                  setLocationDropdownOpen(!locationDropdownOpen);
                  setTreatmentDropdownOpen(false);
                  setTimeDropdownOpen(false);
                }}
              >
                <svg className="w-5 h-5 text-[#8A8A8E] group-hover:text-[#0D0D0D] shrink-0 mr-3 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div className="text-left w-full">
                  <span className="block text-[11px] font-semibold text-[#8A8A8E] uppercase tracking-wider">Location</span>
                  <input
                    type="text"
                    placeholder="Current location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-[#0D0D0D] placeholder-[#0D0D0D] focus:outline-none cursor-pointer"
                  />
                </div>

                {/* Location Dropdown */}
                {locationDropdownOpen && (
                  <div className="absolute top-full left-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-[#EAEAEA] p-3 z-50 text-left animate-fadeIn">
                    <div className="text-xs font-bold text-gray-400 px-3 py-1.5 uppercase tracking-wider">Nearby Districts & Hubs</div>
                    <div className="space-y-0.5 mt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation("Current location (GPS)");
                          setLocationDropdownOpen(false);
                          showToast("Location set to: Current location (GPS)");
                        }}
                        className="w-full text-left px-3 py-2 text-sm font-semibold text-[#E8220A] rounded-xl hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                      >
                        <span>📍</span> <span>Use my current location</span>
                      </button>
                      {[
                        "All Bangladesh",
                        "Dhanmondi, Dhaka",
                        "Banani, Dhaka",
                        "Gulshan, Dhaka",
                        "Mirpur, Dhaka",
                        "Uttara, Dhaka",
                        "Chattogram Hub",
                        "Sylhet Hub",
                      ].map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocation(loc);
                            setLocationDropdownOpen(false);
                            showToast(`Location set to: ${loc}`);
                          }}
                          className="w-full text-left px-3 py-2 text-sm font-medium rounded-xl hover:bg-[#F3F3F6] transition-colors"
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="hidden md:block w-px h-8 bg-[#EAEAEA] shrink-0 my-auto"></div>

              {/* Field 3: Time */}
              <div
                className="relative flex-1 flex items-center px-4 py-2.5 rounded-full hover:bg-[#F9F9FB] transition-colors cursor-pointer group"
                onClick={() => {
                  setTimeDropdownOpen(!timeDropdownOpen);
                  setTreatmentDropdownOpen(false);
                  setLocationDropdownOpen(false);
                }}
              >
                <svg className="w-5 h-5 text-[#8A8A8E] group-hover:text-[#0D0D0D] shrink-0 mr-3 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="text-left w-full">
                  <span className="block text-[11px] font-semibold text-[#8A8A8E] uppercase tracking-wider">Date & Time</span>
                  <input
                    type="text"
                    placeholder="Any time"
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-[#0D0D0D] placeholder-[#0D0D0D] focus:outline-none cursor-pointer"
                  />
                </div>

                {/* Time Dropdown */}
                {timeDropdownOpen && (
                  <div className="absolute top-full left-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-[#EAEAEA] p-3 z-50 text-left animate-fadeIn">
                    <div className="text-xs font-bold text-gray-400 px-3 py-1.5 uppercase tracking-wider">Booking Slot</div>
                    <div className="space-y-0.5 mt-1">
                      {["Any time", "Today", "Tomorrow", "This weekend"].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTimeSlot(t);
                            setTimeDropdownOpen(false);
                            showToast(`Time preference: ${t}`);
                          }}
                          className="w-full text-left px-3 py-2 text-sm font-medium rounded-xl hover:bg-[#F3F3F6] transition-colors"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="bg-[#0D0D0D] hover:bg-black text-white px-8 py-3.5 rounded-full font-semibold text-sm transition-all flex items-center justify-center gap-2 shrink-0 shadow-sm active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Search</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 3. Category Quick Pills Bar */}
      <section id="services-pills" className="py-3 px-4 sm:px-8 border-y border-[#EAEAEA] bg-white sticky top-[72px] z-30">
        <div className="max-w-[1440px] mx-auto flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
          {[
            { icon: "✨", name: "All treatments" },
            { icon: "✂️", name: "Hair Salons" },
            { icon: "💈", name: "Barbershops" },
            { icon: "💅", name: "Nail Salons" },
            { icon: "👁️", name: "Eyebrows & Lashes" },
            { icon: "💆", name: "Massage" },
            { icon: "🕯️", name: "Waxing Salons" },
            { icon: "💉", name: "Medspas" },
            { icon: "🧖", name: "Spas & Saunas" },
            { icon: "🧴", name: "Facials & Skincare" },
            { icon: "🏋️", name: "Personal Training" },
          ].map((cat) => (
            <button
              key={cat.name}
              onClick={() => {
                setSelectedCategory(cat.name);
                setTreatment(cat.name === "All treatments" ? "" : cat.name);
                showToast(`Filtered by: ${cat.name}`);
              }}
              className={`category-pill ${selectedCategory === cat.name ? "active" : ""}`}
            >
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* 4. Recently Viewed Carousel */}
      <section className="py-10 px-4 sm:px-8 max-w-[1440px] mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-[28px] font-bold text-[#0D0D0D] tracking-tight">Recently viewed</h2>
            <p className="text-xs sm:text-sm text-[#5E5E5E] mt-0.5">Top-rated spots based on your recent activity</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => scrollCarousel(recentSliderRef, -1)} className="carousel-btn" aria-label="Previous">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button onClick={() => scrollCarousel(recentSliderRef, 1)} className="carousel-btn" aria-label="Next">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>

        <div ref={recentSliderRef} className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4">
          {[
            {
              name: "Trendy Trim Grooming Studio",
              rating: "4.9",
              reviews: "340 reviews",
              location: "Rakeen Tower, Section 15, Dhaka",
              cat: "Barbershop",
              price: "Haircut & Beard from ৳450",
              img: "/assets/studio-haven.jpg",
              badge: "Featured",
            },
            {
              name: "Vintage Crown Barbershop",
              rating: "5.0",
              reviews: "520 reviews",
              location: "Road 11, Block D, Banani, Dhaka",
              cat: "Barbershop",
              price: "Signature Fade & Shave from ৳600",
              img: "/assets/studio-barberia.jpg",
              badge: "Super Venue",
            },
            {
              name: "Aura Medspa & Skincare",
              rating: "4.9",
              reviews: "210 reviews",
              location: "Avenue 2, Circle 2, Gulshan, Dhaka",
              cat: "Medspas & Facials",
              price: "Hydrafacial & Detox from ৳1,500",
              img: "/assets/service-facial.jpg",
              badge: "Popular",
            },
            {
              name: "The Royal Blade Studio",
              rating: "4.8",
              reviews: "185 reviews",
              location: "Road 27, Dhanmondi, Dhaka",
              cat: "Barbershop",
              price: "Precision Scissor Cut from ৳500",
              img: "/assets/service-trim.jpg",
              badge: "Verified",
            },
          ].map((venue) => (
            <div
              key={venue.name}
              className="venue-card w-[290px] sm:w-[320px] shrink-0"
              onClick={() => openBookingFor(venue.name)}
            >
              <div className="card-img-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={venue.img} alt={venue.name} />
                <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-[#0D0D0D] shadow-sm">
                  {venue.badge}
                </span>
                <button
                  onClick={(e) => toggleFavorite(venue.name, e)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center text-gray-700 hover:text-red-500 transition-colors shadow-sm"
                >
                  <svg
                    className={`w-4 h-4 ${favorites[venue.name] ? "fill-red-500 text-red-500" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
              <div className="pt-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-[#0D0D0D] truncate">{venue.name}</h3>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#0D0D0D]">
                    <span className="text-amber-500">★</span> {venue.rating}
                  </div>
                </div>
                <p className="text-xs text-[#5E5E5E] truncate">{venue.location}</p>
                <div className="text-xs text-[#8A8A8E]">{venue.cat} • {venue.reviews}</div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold text-[#0D0D0D]">{venue.price}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openBookingFor(venue.name);
                    }}
                    className="px-4 py-1.5 rounded-full bg-[#0D0D0D] text-white text-xs font-semibold hover:bg-black transition-colors"
                  >
                    Book
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Recommended Carousel */}
      <section className="py-10 px-4 sm:px-8 max-w-[1440px] mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-[28px] font-bold text-[#0D0D0D] tracking-tight">Recommended</h2>
            <p className="text-xs sm:text-sm text-[#5E5E5E] mt-0.5">Premier destinations with stellar client ratings</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => scrollCarousel(recommendedSliderRef, -1)} className="carousel-btn" aria-label="Previous">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button onClick={() => scrollCarousel(recommendedSliderRef, 1)} className="carousel-btn" aria-label="Next">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>

        <div ref={recommendedSliderRef} className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4">
          {[
            {
              name: "LashXtend | Dear Skin",
              rating: "4.8",
              reviews: "98 reviews",
              location: "Gulshan Avenue, Dhaka",
              cat: "Eyebrows & Lashes",
              price: "Classic Lash Set from ৳1,800",
              img: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
              badge: "Featured",
            },
            {
              name: "Truefitt & Hill Heritage",
              rating: "5.0",
              reviews: "650 reviews",
              location: "Road 11, Banani, Dhaka",
              cat: "Barbershop & Spa",
              price: "Royal Shave & Cut from ৳1,200",
              img: "/assets/service-shave.jpg",
              badge: "Top Rated",
            },
            {
              name: "Mirpur Elite Cuts",
              rating: "4.8",
              reviews: "190 reviews",
              location: "Mirpur-10 Roundabout, Dhaka",
              cat: "Hair Salon",
              price: "Modern Fade from ৳350",
              img: "/assets/service-hair.jpg",
              badge: "Verified",
            },
            {
              name: "Sylhet Artisan Studio",
              rating: "4.9",
              reviews: "140 reviews",
              location: "Zindabazar, Sylhet Hub",
              cat: "Barbershop",
              price: "Executive Trim from ৳400",
              img: "/assets/service-style.jpg",
              badge: "Popular",
            },
          ].map((venue) => (
            <div
              key={venue.name}
              className="venue-card w-[290px] sm:w-[320px] shrink-0"
              onClick={() => openBookingFor(venue.name)}
            >
              <div className="card-img-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={venue.img} alt={venue.name} />
                <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-[#0D0D0D] shadow-sm">
                  {venue.badge}
                </span>
                <button
                  onClick={(e) => toggleFavorite(venue.name, e)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center text-gray-700 hover:text-red-500 transition-colors shadow-sm"
                >
                  <svg
                    className={`w-4 h-4 ${favorites[venue.name] ? "fill-red-500 text-red-500" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
              <div className="pt-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-[#0D0D0D] truncate">{venue.name}</h3>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#0D0D0D]">
                    <span className="text-amber-500">★</span> {venue.rating}
                  </div>
                </div>
                <p className="text-xs text-[#5E5E5E] truncate">{venue.location}</p>
                <div className="text-xs text-[#8A8A8E]">{venue.cat} • {venue.reviews}</div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold text-[#0D0D0D]">{venue.price}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openBookingFor(venue.name);
                    }}
                    className="px-4 py-1.5 rounded-full bg-[#0D0D0D] text-white text-xs font-semibold hover:bg-black transition-colors"
                  >
                    Book
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. New to Hair and Care bd Carousel */}
      <section className="py-10 px-4 sm:px-8 max-w-[1440px] mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl sm:text-[28px] font-bold text-[#0D0D0D] tracking-tight">New to Hair and Care bd</h2>
            <p className="text-xs sm:text-sm text-[#5E5E5E] mt-0.5">Newly onboarded verified studios with introductory perks</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => scrollCarousel(newSliderRef, -1)} className="carousel-btn" aria-label="Previous">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button onClick={() => scrollCarousel(newSliderRef, 1)} className="carousel-btn" aria-label="Next">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>

        <div ref={newSliderRef} className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4">
          {[
            {
              name: "Sora Beauty & Aesthetics",
              rating: "4.9",
              reviews: "42 reviews",
              location: "Gulshan-1 DOHS, Dhaka",
              cat: "Medspa & Nails",
              price: "Gel Manicure from ৳950",
              img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
            },
            {
              name: "Urban Polish & Lash Bar",
              rating: "4.8",
              reviews: "29 reviews",
              location: "Uttara Sector 7, Dhaka",
              cat: "Nail Salon",
              price: "Acrylic Full Set from ৳1,600",
              img: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=800&q=80",
            },
            {
              name: "Zen Thai Spa & Wellness",
              rating: "4.9",
              reviews: "35 reviews",
              location: "Dhanmondi Road 8, Dhaka",
              cat: "Massage & Spa",
              price: "60-Min Aromatherapy from ৳2,200",
              img: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=800&q=80",
            },
          ].map((venue) => (
            <div
              key={venue.name}
              className="venue-card w-[290px] sm:w-[320px] shrink-0"
              onClick={() => openBookingFor(venue.name)}
            >
              <div className="card-img-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={venue.img} alt={venue.name} />
                <span className="absolute top-3 left-3 bg-[#E8220A] text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                  New
                </span>
                <button
                  onClick={(e) => toggleFavorite(venue.name, e)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-md flex items-center justify-center text-gray-700 hover:text-red-500 transition-colors shadow-sm"
                >
                  <svg
                    className={`w-4 h-4 ${favorites[venue.name] ? "fill-red-500 text-red-500" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
              <div className="pt-3.5 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-[#0D0D0D] truncate">{venue.name}</h3>
                  <div className="flex items-center gap-1 text-xs font-bold text-[#0D0D0D]">
                    <span className="text-amber-500">★</span> {venue.rating}
                  </div>
                </div>
                <p className="text-xs text-[#5E5E5E] truncate">{venue.location}</p>
                <div className="text-xs text-[#8A8A8E]">{venue.cat} • {venue.reviews}</div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold text-[#0D0D0D]">{venue.price}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      openBookingFor(venue.name);
                    }}
                    className="px-4 py-1.5 rounded-full bg-[#0D0D0D] text-white text-xs font-semibold hover:bg-black transition-colors"
                  >
                    Book
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Instant Web Booking Benefit Strip (Zero Apps) */}
      <section className="py-14 px-4 sm:px-8 max-w-[1440px] mx-auto w-full">
        <div className="bg-[#F8F8FA] rounded-[32px] p-8 sm:p-12 border border-[#EAEAEA] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <span className="inline-block px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-bold uppercase tracking-wider text-[#0D0D0D]">
              Instant Web Access • No App Download Required
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0D0D0D]">
              Book directly from any browser in under 60 seconds
            </h2>
            <p className="text-sm text-[#5E5E5E] leading-relaxed">
              Enjoy zero installation hassle. Hair and Care bd gives you real-time chair queue tracking, automated SMS token updates, and verified booking receipts instantly on your phone or desktop browser.
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => setTrackModalOpen(true)}
              className="px-6 py-3.5 rounded-full bg-[#0D0D0D] hover:bg-black text-white text-xs font-bold transition-all shadow-sm"
            >
              Track Your Chair Radar
            </button>
            <Link
              href="/browse"
              className="px-6 py-3.5 rounded-full border border-gray-300 hover:border-black text-[#0D0D0D] text-xs font-semibold transition-all"
            >
              Explore Studios
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Reviews Carousel */}
      <section className="py-16 px-4 sm:px-8 max-w-[1440px] mx-auto w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-[32px] font-bold text-[#0D0D0D] tracking-tight">Reviews</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex text-amber-500 text-sm">★★★★★</div>
              <span className="text-sm font-semibold text-[#0D0D0D]">4.9 out of 5</span>
              <span className="text-sm text-gray-500">• Over 12,000+ verified customer reviews in Bangladesh</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => scrollCarousel(reviewsSliderRef, -1)} className="carousel-btn" aria-label="Previous">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <button onClick={() => scrollCarousel(reviewsSliderRef, 1)} className="carousel-btn" aria-label="Next">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>
        </div>

        <div ref={reviewsSliderRef} className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-4">
          {[
            {
              title: "The best booking system",
              text: "Great experience, easy to book online. Paying a small deposit via bKash means my chair is guaranteed without waiting in long queues.",
              author: "Tahmid Hasan",
              city: "Dhanmondi, Dhaka",
            },
            {
              title: "Easy to use & explore",
              text: "SMS reminders make life so much easier. I also found a few top-tier barbershops in Banani that I didn’t know existed.",
              author: "Farhan Ahmed",
              city: "Banani, Dhaka",
            },
            {
              title: "Great for finding barbers",
              text: "I’ve been using Hair and Care bd for months and it’s by far the best booking platform in Bangladesh. Zero waiting and top master barbers.",
              author: "Nafis Iqbal",
              city: "Uttara, Dhaka",
            },
            {
              title: "My go-to for self-care",
              text: "Hair and Care bd is my go-to website for massages and facials. Transparent pricing, verified feedback, and instant reservations.",
              author: "Sabrina Karim",
              city: "Gulshan, Dhaka",
            },
            {
              title: "Sleek look & effortless booking",
              text: "Everything I need in one place. Found my favourite salon in Sylhet and booked directly with live queue tracking. 10/10.",
              author: "Riyad Mahfuz",
              city: "Sylhet Hub",
            },
          ].map((rev) => (
            <div key={rev.author} className="review-card shrink-0">
              <div className="space-y-3">
                <div className="flex text-amber-500 text-xs">★★★★★</div>
                <h3 className="font-bold text-base text-[#0D0D0D]">{rev.title}</h3>
                <p className="text-sm text-[#5E5E5E] leading-relaxed">"{rev.text}"</p>
              </div>
              <div className="pt-6 border-t border-gray-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-[#0D0D0D] block">{rev.author}</span>
                  <span className="text-xs text-gray-500">{rev.city}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. Scale & Trust Platform Metrics */}
      <section className="py-20 px-4 sm:px-8 bg-[#F9F9FB] border-y border-[#EAEAEA] text-center w-full">
        <div className="max-w-[1440px] mx-auto space-y-12">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#0D0D0D] tracking-tight">
              The top-rated destination for selfcare
            </h2>
            <p className="text-base text-[#5E5E5E]">
              One solution, one software. Trusted by the best barbershops, salons, and medspas across Bangladesh.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto pt-4">
            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0D0D0D] tracking-tight">50k+</div>
              <p className="text-sm font-semibold text-[#5E5E5E]">appointments booked on Hair and Care bd</p>
            </div>
            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0D0D0D] tracking-tight">140+</div>
              <p className="text-sm font-semibold text-[#5E5E5E]">partner studios & salons</p>
            </div>
            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0D0D0D] tracking-tight">64</div>
              <p className="text-sm font-semibold text-[#5E5E5E]">districts covered nationwide</p>
            </div>
            <div className="space-y-1">
              <div className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0D0D0D] tracking-tight">1,200+</div>
              <p className="text-sm font-semibold text-[#5E5E5E]">master barbers and stylists</p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Hair and Care bd for Business Split Showcase */}
      <section id="for-business" className="py-20 px-4 sm:px-8 max-w-[1440px] mx-auto w-full">
        <div className="bg-[#F8F9FA] border border-[#EAEAEA] text-[#0D0D0D] rounded-[32px] p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden relative shadow-sm">
          <div className="max-w-xl space-y-6 z-10">
            <span className="inline-block px-3.5 py-1 rounded-full bg-red-50 text-[#E8220A] border border-red-100 text-xs font-bold uppercase tracking-wider">
              Hair and Care bd for business
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-[#0D0D0D]">
              Supercharge your salon or studio with Bangladesh’s top booking platform
            </h2>
            <p className="text-base sm:text-lg text-[#5E5E5E] leading-relaxed font-normal">
              Designed specifically for local studios. Smart chair scheduling, advance deposit protection via bKash & Nagad, SMS queue radar, and zero subscription traps.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setRegisterModalOpen(true)}
                className="px-8 py-4 rounded-full bg-[#E8220A] text-white font-bold text-sm hover:bg-[#B51B08] transition-all shadow-md active:scale-95"
              >
                List your business
              </button>
              <Link
                href="/portal"
                className="px-6 py-4 rounded-full border border-gray-300 hover:border-black text-[#0D0D0D] bg-white font-semibold text-sm transition-all shadow-sm"
              >
                Merchant Portal demo →
              </Link>
            </div>

            <div className="pt-4 flex items-center gap-4 text-xs text-[#5E5E5E]">
              <div className="flex text-amber-500">★★★★★</div>
              <span>Trusted by top studios in Dhanmondi, Banani, Gulshan, and Sylhet</span>
            </div>
          </div>

          <div className="relative w-full max-w-md z-10">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="text-sm font-bold text-[#0D0D0D]">Live Calendar & Chair Roster</span>
                <span className="text-xs text-emerald-700 font-mono font-semibold">● 4 Chairs Active</span>
              </div>
              <div className="space-y-2.5">
                <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#0D0D0D] block">Station #1 • Kabir Hossain</span>
                    <span className="text-[11px] text-gray-500">Executive Haircut • In Progress</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#0D0D0D]">৳650</span>
                </div>
                <div className="p-3.5 bg-gray-50 border border-gray-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-[#0D0D0D] block">Station #2 • Jewel Ahmed</span>
                    <span className="text-[11px] text-gray-500">Beard Sculpt & Spa • Next at 11:30</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-[#0D0D0D]">৳450</span>
                </div>
                <div className="p-3.5 bg-emerald-50/80 border border-emerald-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-emerald-950 block">Advance Deposit Secured</span>
                    <span className="text-[11px] text-emerald-700">bKash Merchant Instant Settlement</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-800">৳50 Secured</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. Browse by City & District Directory */}
      <section id="browse-cities" className="py-16 px-4 sm:px-8 max-w-[1440px] mx-auto border-t border-[#EAEAEA] w-full">
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl sm:text-[30px] font-bold text-[#0D0D0D] tracking-tight">Browse by City & District</h2>
            <p className="text-xs sm:text-sm text-[#5E5E5E] mt-1">Explore verified venues across top districts and regional salon hubs in Bangladesh</p>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
            {[
              { key: "bangladesh", label: "Bangladesh" },
              { key: "uk", label: "United Kingdom" },
              { key: "us", label: "United States" },
              { key: "uae", label: "United Arab Emirates" },
            ].map((country) => (
              <button
                key={country.key}
                onClick={() => setActiveCountry(country.key)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeCountry === country.key
                    ? "bg-[#0D0D0D] text-white"
                    : "bg-[#F3F3F6] text-[#0D0D0D] hover:bg-[#EAEAEA]"
                }`}
              >
                {country.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-2">
            {(CITIES_DATA[activeCountry] || CITIES_DATA.bangladesh).map((city) => (
              <div
                key={city.name}
                onClick={() => {
                  setLocation(city.name);
                  showToast(`Location set to: ${city.name}`);
                }}
                className="p-3.5 rounded-2xl bg-white border border-[#EAEAEA] hover:border-black cursor-pointer transition-all"
              >
                <span className="font-bold text-xs text-[#0D0D0D] block truncate">{city.name}</span>
                <span className="text-[11px] text-gray-400 mt-0.5 block">{city.count}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12. Footer */}
      <Footer />

      {/* 13. Interactive 4-Step Booking Modal */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        venueName={bookingVenue}
        onBookingSuccess={(token, venue, srv, slot) => {
          showToast(`✓ Chair reserved! Token ${token} issued for ${venue}.`);
        }}
      />

      {/* 14. Track Token Modal */}
      <TrackTokenModal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
      />

      {/* 15. Partner Registration Modal */}
      <RegisterSalonModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSuccess={() => {
          setRegisterModalOpen(false);
          showToast("🎉 Studio application submitted for Super Admin review!");
        }}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0D0D0D] text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-semibold animate-bounce border border-gray-700">
          {toastMessage}
        </div>
      )}
    </main>
  );
}
