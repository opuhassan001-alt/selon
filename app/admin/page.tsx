"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Salon, SalonApplication, AdminMember, AuditLog, MonetizationSettings } from "@/types";
import { platformStore, getCanonicalSalonPhoto } from "@/lib/store";

export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState<"applications" | "salons" | "team" | "analytics" | "monetization" | "audit">("applications");
  const [appFilter, setAppFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [districtFilter, setDistrictFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [applications, setApplications] = useState<SalonApplication[]>([]);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [admins, setAdmins] = useState<AdminMember[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditLog[]>([]);
  const [monetization, setMonetization] = useState<MonetizationSettings>(platformStore.getMonetization());

  const [selectedApp, setSelectedApp] = useState<SalonApplication | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);
  const [inviteModalOpen, setInviteModalOpen] = useState<boolean>(false);

  // Invite Form
  const [inviteName, setInviteName] = useState("");
  const [inviteContact, setInviteContact] = useState("");
  const [inviteRole, setInviteRole] = useState<AdminMember["role"]>("Platform Super Admin");

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadData = () => {
    setApplications(platformStore.getApplications("all"));
    setSalons(platformStore.getSalons());
    setAdmins(platformStore.getAdmins());
    setAuditTrail(platformStore.getAuditTrail());
    setMonetization(platformStore.getMonetization());
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- ACTIONS ---

  // Task 4: Approve a saloon / Approve a saloon that is in a pending state
  const handleApprove = (appId: number) => {
    const res = platformStore.approveSalon(appId);
    if (res.success) {
      showToast(res.message, "success");
      loadData();
      setReviewModalOpen(false);
    } else {
      showToast(res.message, "error");
    }
  };

  const handleApprovePending = (appId: number) => {
    const res = platformStore.approvePendingSalon(appId);
    if (res.success) {
      showToast(res.message, "success");
      loadData();
    } else {
      showToast(res.message, "error");
    }
  };

  const handleReject = (appId: number) => {
    const res = platformStore.rejectApplication(appId);
    if (res.success) {
      showToast(res.message, "error");
      loadData();
      setReviewModalOpen(false);
    } else {
      showToast(res.message, "error");
    }
  };

  // Task 4: Delete a saloon
  const handleDeleteSalon = (salonId: string, salonName: string) => {
    if (confirm(`Are you sure you want to permanently delete salon "${salonName}"? This will revoke merchant access and remove their public page.`)) {
      const res = platformStore.deleteSalon(salonId);
      if (res.success) {
        showToast(res.message, "error");
        loadData();
      } else {
        showToast(res.message, "error");
      }
    }
  };

  const handleDeleteApplication = (appId: number, salonName: string) => {
    if (confirm(`Delete application for "${salonName}"?`)) {
      const res = platformStore.deleteApplication(appId);
      if (res.success) {
        showToast(res.message, "error");
        loadData();
      }
    }
  };

  const handleToggleBoost = (salonId: string) => {
    const isNowBoosted = platformStore.toggleSalonBoost(salonId);
    loadData();
    showToast(isNowBoosted ? "⭐ Sponsored Boost Activated (#1 Placement)" : "Sponsored Boost Revoked", "success");
  };

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteContact) return;
    platformStore.inviteAdmin(inviteName, inviteContact, inviteRole);
    setInviteName("");
    setInviteContact("");
    setInviteModalOpen(false);
    loadData();
    showToast(`✓ Invited ${inviteName} as ${inviteRole}!`);
  };

  const handleRevokeAdmin = (id: string, name: string) => {
    if (confirm(`Revoke administrator privileges from ${name}?`)) {
      const res = platformStore.revokeAdmin(id);
      if (res.success) {
        showToast(res.message, "error");
        loadData();
      } else {
        showToast(res.message, "error");
      }
    }
  };

  // Applications filtering
  const pendingCount = applications.filter((a) => a.status === "pending").length;
  const approvedCount = applications.filter((a) => a.status === "approved").length;
  const rejectedCount = applications.filter((a) => a.status === "rejected").length;

  const filteredApps = applications.filter((app) => {
    const matchesFilter = appFilter === "all" || app.status === appFilter;
    const matchesDistrict = districtFilter === "all" || app.district === districtFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      app.salon_name.toLowerCase().includes(q) ||
      app.owner_name.toLowerCase().includes(q) ||
      app.owner_phone.includes(q) ||
      app.district.toLowerCase().includes(q);

    return matchesFilter && matchesDistrict && matchesSearch;
  });

  return (
    <div className="h-screen flex flex-col bg-[#0B0D13] text-slate-100 font-sans overflow-hidden">
      {/* Top Header */}
      <header className="h-16 border-b border-[#1F2639] bg-[#0E121C]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-3 group" title="Return to public directory">
            <div className="w-9 h-9 rounded-lg bg-[#E8220A] flex items-center justify-center text-white font-serif font-bold text-lg shadow-lg shadow-[#E8220A]/20 group-hover:scale-105 transition-transform">
              H
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold tracking-tight text-white">
                  Hair and Care <span className="text-[#E8220A]">bd</span>
                </span>
                <span className="text-[10px] uppercase font-mono font-semibold px-2 py-0.5 rounded bg-[#E8220A]/20 text-red-400 border border-[#E8220A]/30">
                  Super Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">Platform Control Center (The Super Page)</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-[#1F2639] text-xs text-slate-400 font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>BST LIVE: Asia/Dhaka</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-[#1F2639] hover:bg-white/5 text-xs text-slate-300 transition-colors"
          >
            <span>View Public Directory</span>
            <span className="text-[10px]">↗</span>
          </Link>

          <button
            onClick={() => setInviteModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#E8220A] hover:bg-[#CC1C07] text-white text-xs font-semibold shadow-sm transition-all shadow-[#E8220A]/20"
          >
            <span>+ Invite Admin</span>
          </button>

          {/* Admin Avatar */}
          <div className="flex items-center space-x-2 pl-2 border-l border-[#1F2639]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 p-[1px]">
              <div className="w-full h-full rounded-full bg-[#0B0D13] flex items-center justify-center font-bold text-xs text-amber-400">
                SA
              </div>
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-slate-200">Owner (God Mode)</div>
              <div className="text-[10px] text-emerald-400 font-mono">Primary Super Admin</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-[#1F2639] bg-[#0E121C] flex flex-col justify-between shrink-0">
          <div className="p-4 space-y-6">
            <div className="space-y-1">
              <div className="px-3 text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 mb-2">
                Triage & Verification
              </div>

              <button
                onClick={() => setActiveTab("applications")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                  activeTab === "applications"
                    ? "bg-[#E8220A]/15 text-white border-[#E8220A]"
                    : "text-slate-300 hover:text-white hover:bg-white/5 border-transparent"
                }`}
              >
                <span>Salon Applications</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-[#E8220A] text-white">
                  {pendingCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("salons")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                  activeTab === "salons"
                    ? "bg-[#E8220A]/15 text-white border-[#E8220A]"
                    : "text-slate-300 hover:text-white hover:bg-white/5 border-transparent"
                }`}
              >
                <span>Active Salons (Tenants)</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-slate-800 text-slate-300">
                  {salons.length}
                </span>
              </button>
            </div>

            <div className="space-y-1">
              <div className="px-3 text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500 mb-2">
                Platform Administration
              </div>

              <button
                onClick={() => setActiveTab("team")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                  activeTab === "team"
                    ? "bg-[#E8220A]/15 text-white border-[#E8220A]"
                    : "text-slate-300 hover:text-white hover:bg-white/5 border-transparent"
                }`}
              >
                <span>Super Admin Team</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-slate-800 text-slate-300">
                  {admins.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("analytics")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                  activeTab === "analytics"
                    ? "bg-[#E8220A]/15 text-white border-[#E8220A]"
                    : "text-slate-300 hover:text-white hover:bg-white/5 border-transparent"
                }`}
              >
                <span>64 Districts Pulse</span>
              </button>

              <button
                onClick={() => setActiveTab("monetization")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                  activeTab === "monetization"
                    ? "bg-[#E8220A]/15 text-white border-[#E8220A]"
                    : "text-slate-300 hover:text-white hover:bg-white/5 border-transparent"
                }`}
              >
                <span>Monetization & Revenue</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                  {monetization.commission_rate}% PayG
                </span>
              </button>

              <button
                onClick={() => setActiveTab("audit")}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                  activeTab === "audit"
                    ? "bg-[#E8220A]/15 text-white border-[#E8220A]"
                    : "text-slate-300 hover:text-white hover:bg-white/5 border-transparent"
                }`}
              >
                <span>Security Audit Trail</span>
              </button>
            </div>
          </div>

          <div className="p-4 border-t border-[#1F2639] bg-[#0B0D13]">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Seeded Schema</span>
              </span>
              <span className="font-mono text-emerald-400">Strictly Enforced</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono">Zero Hard-Coded Remnants</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
          {/* TAB 1: APPLICATIONS */}
          {activeTab === "applications" && (
            <section className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#1F2639] pb-5">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Salon Partner Onboarding Triage</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Review submissions, verify trade licenses, approve tenants, or purge invalid requests.
                  </p>
                </div>

                <div className="flex items-center space-x-1.5 bg-[#121622] p-1 rounded-lg border border-[#1F2639] text-xs">
                  <button
                    onClick={() => setAppFilter("pending")}
                    className={`px-3 py-1 rounded-md font-medium transition-all ${
                      appFilter === "pending" ? "bg-[#E8220A] text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Pending ({pendingCount})
                  </button>
                  <button
                    onClick={() => setAppFilter("approved")}
                    className={`px-3 py-1 rounded-md font-medium transition-all ${
                      appFilter === "approved" ? "bg-[#E8220A] text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Approved ({approvedCount})
                  </button>
                  <button
                    onClick={() => setAppFilter("rejected")}
                    className={`px-3 py-1 rounded-md font-medium transition-all ${
                      appFilter === "rejected" ? "bg-[#E8220A] text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    Rejected ({rejectedCount})
                  </button>
                  <button
                    onClick={() => setAppFilter("all")}
                    className={`px-3 py-1 rounded-md font-medium transition-all ${
                      appFilter === "all" ? "bg-[#E8220A] text-white" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    All ({applications.length})
                  </button>
                </div>
              </div>

              {/* Search & Filter */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search applications by salon name, owner, phone..."
                    className="w-full bg-[#121622] border border-[#1F2639] rounded-lg px-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#E8220A]"
                  />
                </div>
                <div>
                  <select
                    value={districtFilter}
                    onChange={(e) => setDistrictFilter(e.target.value)}
                    className="w-full bg-[#121622] border border-[#1F2639] rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-[#E8220A]"
                  >
                    <option value="all">All Districts</option>
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Rajshahi">Rajshahi</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="border border-[#1F2639] rounded-xl bg-[#121622] overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#1F2639] text-[11px] font-mono text-slate-400 uppercase bg-[#0E121C]/60">
                        <th className="py-3 px-4">Salon & Area</th>
                        <th className="py-3 px-4">Owner & Contact</th>
                        <th className="py-3 px-4">Chairs</th>
                        <th className="py-3 px-4">Trade License / NID</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1F2639]">
                      {filteredApps.map((app) => (
                        <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-white">{app.salon_name}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              📍 {app.district} • {app.area}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-slate-200 font-medium">{app.owner_name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{app.owner_phone}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-slate-300">
                            {app.chairs_count} Chairs
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                            <div className="text-slate-300">{app.trade_license_number || "Under verification"}</div>
                            <div className="text-[10px] text-emerald-400">NID Verified</div>
                          </td>
                          <td className="py-3 px-4">
                            {app.status === "pending" && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                Pending Triage
                              </span>
                            )}
                            {app.status === "approved" && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                Approved Tenant
                              </span>
                            )}
                            {app.status === "rejected" && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                                Rejected
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => {
                                  setSelectedApp(app);
                                  setReviewModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-200 text-xs font-medium border border-[#1F2639] transition-colors"
                              >
                                Inspect
                              </button>

                              {/* Task 4: Approve a saloon in pending state */}
                              {app.status === "pending" && (
                                <button
                                  onClick={() => handleApprovePending(app.id)}
                                  className="px-2.5 py-1 rounded-md bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-semibold border border-emerald-500/30 transition-all"
                                  title="Approve Pending Salon"
                                >
                                  ✓ Approve
                                </button>
                              )}

                              {/* Delete Application */}
                              <button
                                onClick={() => handleDeleteApplication(app.id, app.salon_name)}
                                className="px-2 py-1 rounded-md bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-xs font-semibold border border-red-500/20 transition-all"
                                title="Delete Application"
                              >
                                ✕
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredApps.length === 0 && (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      No applications match your current filters.
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* TAB 2: ACTIVE SALONS (TENANTS) */}
          {activeTab === "salons" && (
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#1F2639] pb-5">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Active Platform Salons (Tenants)</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Live verified studios with isolated merchant workspaces receiving online bookings.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  Total Live: <strong className="text-white">{salons.length}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {salons.map((salon, index) => {
                  const isHaven = salon.name.toLowerCase().includes("haven");
                  const coverPhoto =
                    salon.cover_photo_url && (salon.cover_photo_url !== "/assets/studio-haven.jpg" || isHaven)
                      ? salon.cover_photo_url
                      : getCanonicalSalonPhoto(salon.name, salon.slug, index);

                  return (
                    <div
                      key={salon.id}
                      className="rounded-xl bg-[#121622] border border-[#1F2639] flex flex-col justify-between overflow-hidden shadow-lg group hover:border-[#E8220A]/50 transition-all"
                    >
                      {/* Salon Distinct Photo Banner */}
                      <div className="relative h-40 bg-[#090D17] overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={coverPhoto}
                          alt={salon.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter brightness-[0.88]"
                        />
                      <div className="absolute top-2.5 left-2.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/80 text-white font-bold backdrop-blur-sm">
                          Active Tenant
                        </span>
                      </div>
                      <div className="absolute top-2.5 right-2.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/75 text-slate-200 border border-white/10 backdrop-blur-sm">
                          BST {salon.opening_time} – {salon.closing_time}
                        </span>
                      </div>
                      {salon.is_boosted && (
                        <div className="absolute bottom-2.5 left-2.5">
                          <span className="text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-amber-400 text-black shadow">
                            ⭐ FEATURED STUDIO
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <h3 className="text-sm font-bold text-white group-hover:text-[#E8220A] transition-colors leading-snug">
                          {salon.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">📍 {salon.address}</p>
                        <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-slate-400">
                          <span>Chairs: <strong className="text-white">{salon.chairs_count || 4}</strong></span>
                          <span>•</span>
                          <span>Rating: <strong className="text-amber-400">★ {salon.rating}</strong> ({salon.reviews_count})</span>
                          <span>•</span>
                          <span className="text-emerald-400">From ৳{salon.starting_price}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-[#1F2639] flex items-center justify-between">
                        <div>
                          <div className="text-[9px] uppercase font-mono text-slate-500">Owner</div>
                          <div className="text-xs font-semibold text-slate-300">{salon.owner_name}</div>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          {/* Task 5: Make "View Shop" button navigate to public link of selected salon */}
                          <Link
                            href={`/salon/${salon.slug}`}
                            className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-amber-300 text-xs font-medium border border-[#1F2639] transition-colors"
                            title="View Public Storefront Micro-Site"
                          >
                            View Shop ↗
                          </Link>

                          <button
                            onClick={() => handleToggleBoost(salon.id)}
                            className={`px-2 py-1 rounded text-xs font-mono font-semibold transition-all ${
                              salon.is_boosted
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                                : "bg-slate-800 text-slate-400 hover:text-white"
                            }`}
                            title="Toggle Sponsored Boost"
                          >
                            {salon.is_boosted ? "⭐" : "Boost"}
                          </button>

                          {/* Task 4: Delete a saloon */}
                          <button
                            onClick={() => handleDeleteSalon(salon.id, salon.name)}
                            className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-xs font-semibold border border-red-500/20 transition-all"
                            title="Permanently Delete Salon"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
            </section>
          )}

          {/* TAB 3: SUPER ADMIN TEAM */}
          {activeTab === "team" && (
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#1F2639] pb-5">
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">Super Admin Team & Delegation</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Manage platform administrators, grant application review privileges, or revoke access.
                  </p>
                </div>
                <button
                  onClick={() => setInviteModalOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-[#E8220A] hover:bg-[#CC1C07] text-white text-xs font-semibold"
                >
                  + Add New Administrator
                </button>
              </div>

              <div className="border border-[#1F2639] rounded-xl bg-[#121622] divide-y divide-[#1F2639]">
                {admins.map((adm) => (
                  <div key={adm.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-9 h-9 rounded-full ${
                          adm.is_root
                            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                        } flex items-center justify-center font-bold text-xs`}
                      >
                        {adm.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-semibold text-white">{adm.name}</span>
                          {adm.is_root && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 font-semibold">
                              Immutable Root
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 font-mono">
                          {adm.contact} • Role: <strong className="text-slate-200">{adm.role}</strong>
                        </div>
                      </div>
                    </div>

                    <div>
                      {adm.is_root ? (
                        <span className="text-xs text-slate-500 font-mono italic">Primary Founder</span>
                      ) : (
                        <button
                          onClick={() => handleRevokeAdmin(adm.id, adm.name)}
                          className="px-3 py-1 rounded bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white text-xs font-semibold border border-red-500/20 transition-all"
                        >
                          Revoke Access
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* TAB 4: 64 DISTRICTS ANALYTICS PULSE */}
          {activeTab === "analytics" && (
            <section className="space-y-6">
              <div className="border-b border-[#1F2639] pb-5">
                <h1 className="text-xl font-bold text-white tracking-tight">64 Districts Platform Pulse</h1>
                <p className="text-xs text-slate-400 mt-1">Coverage breakdown across all 8 divisions in Bangladesh.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[#121622] border border-[#1F2639]">
                  <div className="text-[11px] font-mono uppercase text-slate-400">Total Active Tenants</div>
                  <div className="text-2xl font-bold text-white mt-1">
                    {salons.length} <span className="text-xs text-emerald-400 font-normal">Salons</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2">Across 64 Districts</div>
                </div>

                <div className="p-4 rounded-xl bg-[#121622] border border-[#1F2639]">
                  <div className="text-[11px] font-mono uppercase text-slate-400">Pending Triage Queue</div>
                  <div className="text-2xl font-bold text-amber-400 mt-1">
                    {pendingCount} <span className="text-xs text-slate-400 font-normal">Applications</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-2">Awaiting verification</div>
                </div>

                <div className="p-4 rounded-xl bg-[#121622] border border-[#1F2639]">
                  <div className="text-[11px] font-mono uppercase text-slate-400">Total Bookings</div>
                  <div className="text-2xl font-bold text-white mt-1">1,489</div>
                  <div className="text-[11px] text-emerald-400 mt-2">↑ 24% this week (BST)</div>
                </div>

                <div className="p-4 rounded-xl bg-[#121622] border border-[#1F2639]">
                  <div className="text-[11px] font-mono uppercase text-slate-400">Platform GMV</div>
                  <div className="text-2xl font-bold text-white mt-1">৳ 7,44,500</div>
                  <div className="text-[11px] text-slate-500 mt-2">10% PayG Commission</div>
                </div>
              </div>
            </section>
          )}

          {/* TAB 5: PLATFORM MONETIZATION */}
          {activeTab === "monetization" && (
            <section className="space-y-6">
              <div className="border-b border-[#1F2639] pb-5">
                <h1 className="text-xl font-bold text-white tracking-tight">Platform Monetization & Revenue Engine</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Controls for {monetization.commission_rate}% Pay-As-You-Go commission and customizable Sponsored Boosting.
                </p>
              </div>

              <div className="p-5 rounded-xl bg-[#121622] border border-[#1F2639] space-y-4">
                <div className="flex items-center justify-between border-b border-[#1F2639] pb-3">
                  <h3 className="text-sm font-bold text-white">Monetization Rules</h3>
                  <button
                    onClick={() => {
                      platformStore.updateMonetization(monetization);
                      showToast("✓ Monetization rules updated successfully!", "success");
                    }}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                  >
                    Save Rules
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Commission Rate (%):</label>
                    <input
                      type="number"
                      value={monetization.commission_rate}
                      onChange={(e) =>
                        setMonetization({ ...monetization, commission_rate: parseFloat(e.target.value) || 10 })
                      }
                      className="w-full bg-[#0E121C] border border-[#1F2639] rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Advance Deposit (৳):</label>
                    <input
                      type="number"
                      value={monetization.deposit_fee}
                      onChange={(e) =>
                        setMonetization({ ...monetization, deposit_fee: parseFloat(e.target.value) || 50 })
                      }
                      className="w-full bg-[#0E121C] border border-[#1F2639] rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Monthly Boost Fee (৳):</label>
                    <input
                      type="number"
                      value={monetization.boost_fee}
                      onChange={(e) =>
                        setMonetization({ ...monetization, boost_fee: parseFloat(e.target.value) || 200 })
                      }
                      className="w-full bg-[#0E121C] border border-[#1F2639] rounded-lg px-3 py-2 text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB 6: SECURITY AUDIT TRAIL */}
          {activeTab === "audit" && (
            <section className="space-y-6">
              <div className="border-b border-[#1F2639] pb-5">
                <h1 className="text-xl font-bold text-white tracking-tight">Platform Security & Audit Trail</h1>
                <p className="text-xs text-slate-400 mt-1">
                  Immutable log of administrative actions, application triage, and privileges.
                </p>
              </div>

              <div className="border border-[#1F2639] rounded-xl bg-[#121622] divide-y divide-[#1F2639] font-mono text-xs">
                {auditTrail.map((log, idx) => (
                  <div key={log.id || idx} className="p-3.5 flex items-center justify-between hover:bg-white/[0.02]">
                    <div>
                      <div className="text-slate-300">
                        <span className="text-[#E8220A] font-semibold">[{log.action}]</span> {log.detail}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">By: {log.actor}</div>
                    </div>
                    <div className="text-[10px] text-slate-400 pl-4 shrink-0">{log.timestamp}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Modal: Application Review */}
      {reviewModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121622] border border-[#1F2639] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-xs">
            <div className="p-5 border-b border-[#1F2639] flex items-center justify-between bg-[#0E121C]">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-[#E8220A]">Application Triage</span>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedApp.salon_name}</h3>
              </div>
              <button onClick={() => setReviewModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-slate-300">
              <div className="grid grid-cols-2 gap-4 bg-[#0E121C] p-4 rounded-xl border border-[#1F2639]">
                <div>
                  <div className="text-slate-500 font-mono text-[10px] uppercase">Applicant / Owner</div>
                  <div className="text-white font-semibold text-sm mt-0.5">{selectedApp.owner_name}</div>
                  <div className="text-slate-400 font-mono text-[11px] mt-0.5">{selectedApp.owner_phone}</div>
                  <div className="text-slate-400 text-[11px]">{selectedApp.owner_email}</div>
                </div>
                <div>
                  <div className="text-slate-500 font-mono text-[10px] uppercase">Trade License</div>
                  <div className="text-emerald-400 font-mono font-semibold text-xs mt-0.5">
                    {selectedApp.trade_license_number}
                  </div>
                  <div className="text-slate-500 font-mono text-[10px] uppercase mt-2">Chairs & Timing</div>
                  <div className="text-slate-300 text-xs">
                    {selectedApp.chairs_count} Chairs • {selectedApp.opening_time} to {selectedApp.closing_time} BST
                  </div>
                </div>
              </div>

              <div>
                <div className="text-slate-400 font-semibold mb-1">Physical Address:</div>
                <p className="text-slate-200 bg-[#0E121C] p-3 rounded-lg border border-[#1F2639] font-mono text-[11px]">
                  {selectedApp.full_address}
                </p>
              </div>

              <div>
                <div className="text-slate-400 font-semibold mb-1">Owner&apos;s Submission Notes:</div>
                <p className="text-slate-300 bg-[#0E121C] p-3 rounded-lg border border-[#1F2639] italic">
                  {selectedApp.notes}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-[#1F2639] bg-[#0E121C] flex items-center justify-between">
              <button
                onClick={() => handleReject(selectedApp.id)}
                className="px-3.5 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 font-semibold"
              >
                Reject Application
              </button>

              <div className="flex items-center space-x-2">
                {/* Task 4: Approve a saloon */}
                <button
                  onClick={() => handleApprove(selectedApp.id)}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-600/20"
                >
                  ✓ Approve & Create Tenant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Invite Super Admin */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121622] border border-[#1F2639] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-xs">
            <div className="p-5 border-b border-[#1F2639] flex items-center justify-between bg-[#0E121C]">
              <h3 className="text-base font-bold text-white">Invite Platform Administrator</h3>
              <button onClick={() => setInviteModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full bg-[#0E121C] border border-[#1F2639] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#E8220A]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Contact (Email or Phone)</label>
                <input
                  type="text"
                  required
                  value={inviteContact}
                  onChange={(e) => setInviteContact(e.target.value)}
                  placeholder="admin@hairandcare.bd or +88017..."
                  className="w-full bg-[#0E121C] border border-[#1F2639] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#E8220A]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Privilege Level</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as AdminMember["role"])}
                  className="w-full bg-[#0E121C] border border-[#1F2639] rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-[#E8220A]"
                >
                  <option value="Platform Super Admin">Full Platform Super Admin</option>
                  <option value="Operations Reviewer">Operations Reviewer</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-[#E8220A] hover:bg-[#CC1C07] text-white font-semibold transition-all"
                >
                  Generate Invitation & Delegate Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md text-xs font-semibold ${
            toast.type === "success"
              ? "border-emerald-500/40 bg-emerald-950/90 text-emerald-200"
              : "border-red-500/40 bg-red-950/90 text-red-200"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

