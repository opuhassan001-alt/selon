"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Star, Heart, MapPin, Sparkles, X } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BookingModal } from "@/components/BookingModal";
import { RegisterSalonModal } from "@/components/RegisterSalonModal";
import { TrackTokenModal } from "@/components/TrackTokenModal";
import { Salon } from "@/types";
import { platformStore, getCanonicalSalonPhoto } from "@/lib/store";

const CATEGORY_MAP: Record<string, string> = {
  all: "All Treatments",
  hair: "Hair Salons",
  barber: "Barbershops",
  nails: "Nails & Manicure",
  massage: "Massage & Body",
  spa: "Spas & Wellness",
  medspa: "Medspas & Skincare",
  facial: "Facial & Grooming",
};

function BrowseContent() {
  const searchParams = useSearchParams();
  const initialCategoryParam = searchParams.get("category")?.toLowerCase() || "all";
  const initialSearchParam = searchParams.get("q") || "";
  const initialDistrictParam = searchParams.get("district") || "all";

  // Data states
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<string>("");
  const [livePulse, setLivePulse] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Favorites
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  // Modals
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedBookingSalon, setSelectedBookingSalon] = useState<{
    id: string;
    name: string;
    area: string;
    district: string;
    starting_price: number;
  } | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState(initialSearchParam);
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryParam);
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrictParam);
  const [maxPrice, setMaxPrice] = useState<number>(3500);
  const [onlyOpenNow, setOnlyOpenNow] = useState(false);
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [sortBy, setSortBy] = useState<"featured" | "price_asc" | "price_desc" | "rating" | "reviews">("featured");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleFavorite = (id: string, name: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextState = !favorites[id];
    setFavorites((prev) => ({ ...prev, [id]: nextState }));
    showToast(nextState ? `Saved "${name}" to your favourites!` : `Removed "${name}" from favourites.`);
  };

  // Load latest data directly from the platform store / database
  const loadSalons = useCallback(() => {
    try {
      const data = platformStore.getSalons();
      setSalons(data);
      const now = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Dhaka",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(new Date());
      setLastSyncTime(`${now} BST`);
    } catch (err) {
      console.error("Error loading salons from store:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadSalons();
  }, [loadSalons]);

  // Synchronize category if query param changes
  useEffect(() => {
    if (initialCategoryParam && initialCategoryParam !== "all") {
      setSelectedCategory(initialCategoryParam);
    }
  }, [initialCategoryParam]);

  // Real-time listener for updates made from Admin Panel
  useEffect(() => {
    const handleStoreUpdate = () => {
      setLivePulse(true);
      loadSalons();
      setTimeout(() => setLivePulse(false), 1800);
    };

    window.addEventListener("hairandcare_store_updated", handleStoreUpdate);
    window.addEventListener("storage", handleStoreUpdate);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("hairandcare_realtime");
      bc.onmessage = (msg) => {
        if (msg.data?.type === "STORE_UPDATED") {
          handleStoreUpdate();
        }
      };
    } catch (_) {}

    return () => {
      window.removeEventListener("hairandcare_store_updated", handleStoreUpdate);
      window.removeEventListener("storage", handleStoreUpdate);
      if (bc) bc.close();
    };
  }, [loadSalons]);

  // BST Opening hours calculation
  const getShopStatus = (openStr: string, closeStr: string) => {
    try {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const bst = new Date(utc + 6 * 3600000);
      const curM = bst.getHours() * 60 + bst.getMinutes();

      const [oh, om] = (openStr || "10:00").split(":").map(Number);
      const [ch, cm] = (closeStr || "22:00").split(":").map(Number);
      const openM = oh * 60 + om;
      const closeM = ch * 60 + cm;

      const isOpen = curM >= openM && curM < closeM;
      return {
        isOpen,
        badgeText: isOpen ? "Open now" : "Closed",
        timeRange: `${openStr} – ${closeStr}`,
      };
    } catch {
      return { isOpen: true, badgeText: "Open today", timeRange: "10:00 – 22:00" };
    }
  };

  // Filter & Sort logic
  const filteredSalons = useMemo(() => {
    return salons
      .filter((salon) => {
        // District / Hub filter
        if (selectedDistrict !== "all") {
          const locStr = `${salon.district} ${salon.area} ${salon.division || ""}`.toLowerCase();
          if (!locStr.includes(selectedDistrict.toLowerCase())) return false;
        }

        // Category filter
        if (selectedCategory !== "all") {
          const catKey = selectedCategory.toLowerCase();
          const matchesCategory =
            salon.services?.some((srv) => {
              const nameLower = (srv.name || "").toLowerCase();
              const catLower = (srv.category || "").toLowerCase();
              if (catKey === "hair") return nameLower.includes("hair") || catLower.includes("hair") || catLower.includes("cut");
              if (catKey === "barber") return nameLower.includes("fade") || nameLower.includes("shave") || nameLower.includes("beard") || catLower.includes("barber");
              if (catKey === "nails") return nameLower.includes("nail") || catLower.includes("nail") || catLower.includes("manicure");
              if (catKey === "massage") return nameLower.includes("massage") || catLower.includes("massage") || catLower.includes("body");
              if (catKey === "spa") return nameLower.includes("spa") || catLower.includes("spa") || nameLower.includes("detox");
              if (catKey === "medspa") return nameLower.includes("skin") || nameLower.includes("facial") || catLower.includes("medspa");
              return catLower.includes(catKey) || nameLower.includes(catKey);
            }) ||
            salon.name.toLowerCase().includes(catKey);

          if (!matchesCategory) return false;
        }

        // Price Filter
        if (salon.starting_price > maxPrice) return false;

        // Open now filter
        if (onlyOpenNow) {
          const status = getShopStatus(salon.opening_time, salon.closing_time);
          if (!status.isOpen) return false;
        }

        // Featured only
        if (onlyFeatured) {
          if (!salon.is_featured && !salon.is_boosted) return false;
        }

        // Search Query (name, area, district, service names, barber names)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchesName = salon.name.toLowerCase().includes(q);
          const matchesLocation = `${salon.area} ${salon.district} ${salon.address}`.toLowerCase().includes(q);
          const matchesService = salon.services?.some((s) => s.name.toLowerCase().includes(q));
          const matchesBarber = salon.barbers?.some((b) => b.name.toLowerCase().includes(q));
          if (!matchesName && !matchesLocation && !matchesService && !matchesBarber) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.starting_price - b.starting_price;
        if (sortBy === "price_desc") return b.starting_price - a.starting_price;
        if (sortBy === "rating") return Number(b.rating) - Number(a.rating);
        if (sortBy === "reviews") return b.reviews_count - a.reviews_count;

        // Default "featured"
        const aScore = (a.is_boosted ? 2 : 0) + (a.is_featured ? 1 : 0);
        const bScore = (b.is_boosted ? 2 : 0) + (b.is_featured ? 1 : 0);
        if (bScore !== aScore) return bScore - aScore;
        return Number(b.rating) - Number(a.rating);
      });
  }, [salons, selectedDistrict, selectedCategory, maxPrice, onlyOpenNow, onlyFeatured, searchQuery, sortBy]);

  const activeFiltersCount =
    (selectedCategory !== "all" ? 1 : 0) +
    (selectedDistrict !== "all" ? 1 : 0) +
    (maxPrice < 3500 ? 1 : 0) +
    (onlyOpenNow ? 1 : 0) +
    (onlyFeatured ? 1 : 0) +
    (searchQuery ? 1 : 0);

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedDistrict("all");
    setMaxPrice(3500);
    setOnlyOpenNow(false);
    setOnlyFeatured(false);
    setSortBy("featured");
  };

  const openBookingForSalon = (salon: Salon) => {
    setSelectedBookingSalon({
      id: salon.id,
      name: salon.name,
      area: salon.area,
      district: salon.district,
      starting_price: salon.starting_price,
    });
    setBookingModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#0D0D0D] flex flex-col font-sans selection:bg-[#0D0D0D] selection:text-white">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0D0D0D] text-white px-5 py-3 rounded-full text-sm font-medium shadow-2xl flex items-center gap-3 border border-gray-700 animate-slideUp">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-gray-400 hover:text-white p-0.5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        onOpenRegister={() => setRegisterModalOpen(true)}
        onOpenTrack={() => setTrackModalOpen(true)}
      />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-8 space-y-6">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#EAEAEA]">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`w-2 h-2 rounded-full transition-transform ${
                  livePulse ? "bg-[#E8220A] scale-150 animate-ping" : "bg-emerald-600"
                }`}
              />
              <span className="text-[12px] font-semibold text-[#5E5E5E] tracking-tight">
                {livePulse ? "Updating in real time..." : `Connected to live database • Synced at ${lastSyncTime || "now"}`}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0D0D0D] tracking-tight">
              Browse Salons & Services
            </h1>
            <p className="text-sm text-[#5E5E5E] mt-1 max-w-2xl font-normal">
              Find top-rated barbershops, beauty studios, and wellness spas across Bangladesh with verified pricing and instant chair booking.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#5E5E5E] bg-white px-3.5 py-2 rounded-full border border-[#EAEAEA] shadow-sm">
              Showing <strong className="text-[#0D0D0D]">{filteredSalons.length}</strong> of {salons.length} venues
            </span>
            {activeFiltersCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="text-xs font-semibold text-[#E8220A] hover:underline transition-all"
              >
                Reset filters ({activeFiltersCount})
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {Object.entries(CATEGORY_MAP).map(([key, label]) => {
            const isActive = selectedCategory === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all shadow-sm ${
                  isActive
                    ? "bg-[#0D0D0D] text-white border border-[#0D0D0D]"
                    : "bg-white text-[#5E5E5E] hover:text-[#0D0D0D] hover:bg-[#F3F3F6] border border-[#EAEAEA]"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-[#EAEAEA] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Keyword Search */}
            <div>
              <label className="block text-[11px] font-bold text-[#8A8A8E] uppercase tracking-wider mb-1.5">
                Search Venue or Service
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Trendy Trim, Skin Fade, Dhanmondi..."
                  className="w-full bg-[#F9F9FB] border border-[#EAEAEA] rounded-xl px-3.5 py-2.5 text-xs text-[#0D0D0D] placeholder-[#8A8A8E] focus:bg-white focus:border-[#0D0D0D] focus:outline-none transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-black p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 2. District / Hub */}
            <div>
              <label className="block text-[11px] font-bold text-[#8A8A8E] uppercase tracking-wider mb-1.5">
                Location & Hub
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full bg-[#F9F9FB] border border-[#EAEAEA] rounded-xl px-3 py-2.5 text-xs text-[#0D0D0D] focus:bg-white focus:border-[#0D0D0D] focus:outline-none transition-all font-medium cursor-pointer"
              >
                <option value="all">All 64 Districts</option>
                <option value="Dhanmondi">Dhaka — Dhanmondi</option>
                <option value="Gulshan">Dhaka — Gulshan</option>
                <option value="Banani">Dhaka — Banani</option>
                <option value="Mirpur">Dhaka — Mirpur</option>
                <option value="Uttara">Dhaka — Uttara</option>
                <option value="Chattogram">Chattogram Hub</option>
                <option value="Sylhet">Sylhet Hub</option>
                <option value="Rajshahi">Rajshahi Hub</option>
              </select>
            </div>

            {/* 3. Sort By */}
            <div>
              <label className="block text-[11px] font-bold text-[#8A8A8E] uppercase tracking-wider mb-1.5">
                Sort Results
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full bg-[#F9F9FB] border border-[#EAEAEA] rounded-xl px-3 py-2.5 text-xs text-[#0D0D0D] focus:bg-white focus:border-[#0D0D0D] focus:outline-none transition-all font-medium cursor-pointer"
              >
                <option value="featured">Featured & Recommended</option>
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Verified Reviews</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {/* 4. Max Price Slider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-bold text-[#8A8A8E] uppercase tracking-wider">
                  Max Starting Budget
                </label>
                <span className="text-xs font-bold text-[#0D0D0D] font-sans">
                  ৳{maxPrice.toLocaleString()}
                </span>
              </div>
              <div className="pt-2">
                <input
                  type="range"
                  min="200"
                  max="3500"
                  step="50"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#0D0D0D] h-1.5 bg-[#EAEAEA] rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#8A8A8E] font-medium mt-1">
                  <span>৳200</span>
                  <span>৳3,500+</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Select Hub Pills & Checkboxes */}
          <div className="pt-3 border-t border-[#EAEAEA] flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[#8A8A8E] text-[11px] font-semibold uppercase mr-1">Popular Hubs:</span>
              {["all", "Dhanmondi", "Gulshan", "Banani", "Mirpur", "Uttara", "Chattogram", "Sylhet"].map((hub) => (
                <button
                  key={hub}
                  onClick={() => setSelectedDistrict(hub)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedDistrict === hub
                      ? "bg-[#0D0D0D] text-white"
                      : "bg-[#F3F3F6] hover:bg-[#EAEAEA] text-[#5E5E5E] hover:text-[#0D0D0D]"
                  }`}
                >
                  {hub === "all" ? "All Bangladesh" : hub}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#0D0D0D] bg-[#F9F9FB] px-3.5 py-1.5 rounded-full border border-[#EAEAEA] hover:border-[#0D0D0D] transition-colors">
                <input
                  type="checkbox"
                  checked={onlyOpenNow}
                  onChange={(e) => setOnlyOpenNow(e.target.checked)}
                  className="accent-[#0D0D0D] rounded"
                />
                <span>Open now</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#0D0D0D] bg-[#F9F9FB] px-3.5 py-1.5 rounded-full border border-[#EAEAEA] hover:border-[#0D0D0D] transition-colors">
                <input
                  type="checkbox"
                  checked={onlyFeatured}
                  onChange={(e) => setOnlyFeatured(e.target.checked)}
                  className="accent-[#E8220A] rounded"
                />
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Featured only
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="py-24 text-center font-sans text-xs text-[#5E5E5E] space-y-3">
            <div className="w-8 h-8 border-2 border-[#0D0D0D] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p>Loading verified venues from database...</p>
          </div>
        ) : filteredSalons.length === 0 ? (
          <div className="py-24 text-center bg-white rounded-2xl border border-dashed border-[#D1D1D6] p-8 space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#F3F3F6] flex items-center justify-center mx-auto text-[#8A8A8E]">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-[#0D0D0D]">No venues found</h3>
            <p className="text-xs text-[#5E5E5E] max-w-md mx-auto">
              We couldn&apos;t find any salons matching your exact filter combination. Try clearing filters or expanding your price range.
            </p>
            <button
              onClick={handleResetFilters}
              className="mt-2 px-5 py-2 rounded-full bg-[#0D0D0D] hover:bg-black text-white text-xs font-semibold transition-all shadow-sm"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSalons.map((salon, index) => {
              const status = getShopStatus(salon.opening_time, salon.closing_time);
              const isBoosted = salon.is_boosted !== false && salon.is_featured;
              const isHaven = salon.name.toLowerCase().includes("haven");
              const coverPhoto =
                salon.cover_photo_url && (salon.cover_photo_url !== "/assets/studio-haven.jpg" || isHaven)
                  ? salon.cover_photo_url
                  : getCanonicalSalonPhoto(salon.name, salon.slug, index);
              const isFav = favorites[salon.id];

              return (
                <div
                  key={salon.id}
                  className="bg-white border border-[#EAEAEA] rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#D1D1D6] transition-all flex flex-col justify-between group"
                >
                  {/* Photo & Badges */}
                  <div className="relative aspect-[16/10] bg-[#F3F3F6] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={coverPhoto}
                      alt={salon.name}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.src.includes("/assets/hero-barber.jpg")) {
                          target.src = "/assets/hero-barber.jpg";
                        }
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Top Left Tag */}
                    <div className="absolute top-3 left-3">
                      {isBoosted ? (
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[#0D0D0D] text-white shadow flex items-center gap-1.5">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>FEATURED</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-white/95 text-[#0D0D0D] shadow-sm backdrop-blur-sm border border-[#EAEAEA]">
                          Verified
                        </span>
                      )}
                    </div>

                    {/* Top Right: Favorite Button */}
                    <button
                      onClick={(e) => toggleFavorite(salon.id, salon.name, e)}
                      aria-label="Save to favourites"
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#0D0D0D] flex items-center justify-center shadow-md backdrop-blur-sm transition-transform active:scale-90"
                    >
                      <Heart
                        className={`w-4 h-4 transition-colors ${
                          isFav ? "text-[#E8220A] fill-[#E8220A]" : "text-[#5E5E5E]"
                        }`}
                      />
                    </button>

                    {/* Rating Pill overlay at bottom-right */}
                    <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-white/95 text-xs font-bold text-[#0D0D0D] shadow-sm backdrop-blur-sm flex items-center gap-1.5 border border-[#EAEAEA]">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{salon.rating}</span>
                      <span className="text-[#8A8A8E] text-[11px] font-medium">({salon.reviews_count})</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <Link href={`/salon/${salon.slug}`} className="hover:underline">
                        <h3 className="text-lg font-bold text-[#0D0D0D] group-hover:text-[#E8220A] transition-colors leading-tight">
                          {salon.name}
                        </h3>
                      </Link>
                      
                      <p className="text-xs text-[#5E5E5E] mt-1.5 line-clamp-1 font-normal flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#8A8A8E] shrink-0" />
                        <span>{salon.area}, {salon.district} • {salon.address}</span>
                      </p>

                      {/* Status indicator */}
                      <div className="flex items-center gap-2 mt-2.5 text-xs">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            status.isOpen ? "bg-emerald-500" : "bg-gray-400"
                          }`}
                        />
                        <span className={`font-semibold ${status.isOpen ? "text-emerald-700" : "text-[#5E5E5E]"}`}>
                          {status.badgeText}
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-[#8A8A8E] text-[11px]">{status.timeRange}</span>
                      </div>

                      {/* Service Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {salon.services?.slice(0, 3).map((srv) => (
                          <span
                            key={srv.id}
                            className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#F3F3F6] text-[#5E5E5E] border border-transparent"
                          >
                            {srv.name}
                          </span>
                        ))}
                        {salon.services && salon.services.length > 3 && (
                          <span className="text-[10px] font-medium px-1.5 py-0.5 text-[#8A8A8E]">
                            +{salon.services.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="pt-4 border-t border-[#EAEAEA] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#8A8A8E] font-semibold uppercase block tracking-wider">
                          From
                        </span>
                        <span className="text-base font-extrabold text-[#0D0D0D] font-sans">
                          ৳{salon.starting_price.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/salon/${salon.slug}`}
                          className="px-3.5 py-2 rounded-full border border-[#D1D1D6] hover:border-[#0D0D0D] text-xs font-semibold text-[#0D0D0D] transition-all"
                        >
                          View shop ↗
                        </Link>

                        <button
                          onClick={() => openBookingForSalon(salon)}
                          className="px-4 py-2 rounded-full bg-[#0D0D0D] hover:bg-black text-white text-xs font-semibold transition-all shadow-sm active:scale-95"
                        >
                          Book chair
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />

      {/* Modals */}
      <BookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        venueName={selectedBookingSalon?.name || "Trendy Trim"}
        defaultVenue={selectedBookingSalon}
        onBookingSuccess={(token, venue) => {
          showToast(`Chair reserved at ${venue}! Token ID: ${token}`);
          loadSalons();
        }}
      />

      <RegisterSalonModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onSuccess={() => {
          setRegisterModalOpen(false);
          showToast("Salon application submitted for review!");
          loadSalons();
        }}
      />

      <TrackTokenModal
        isOpen={trackModalOpen}
        onClose={() => setTrackModalOpen(false)}
      />
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center font-sans text-xs text-[#5E5E5E]">
        Loading browse directory...
      </div>
    }>
      <BrowseContent />
    </Suspense>
  );
}
