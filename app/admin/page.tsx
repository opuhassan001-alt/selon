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

  // Custom Confirmation Modal State (Bespoke replacement for browser native confirm)
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: "application" | "salon" | "admin";
    title: string;
    badge: string;
    itemName: string;
    itemSubtitle?: string;
    details?: { label: string; value: string }[];
    warningMessage: string;
    confirmLabel: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: "application",
    title: "",
    badge: "IRREVERSIBLE ACTION",
    itemName: "",
    warningMessage: "",
    confirmLabel: "Permanently Delete",
    onConfirm: () => {},
  });

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

  // Task 4: Delete a salon (Custom Bespoke Confirmation)
  const handleDeleteSalon = (salonId: string, salonName: string) => {
    const salon = salons.find((s) => s.id === salonId);
    setConfirmModal({
      isOpen: true,
      type: "salon",
      title: "Permanently Delete Salon Studio?",
      badge: "CRITICAL ACTION",
      itemName: salonName,
      itemSubtitle: salon ? `${salon.district} • ${salon.chairs_count} Chairs` : undefined,
      details: salon
        ? [
            { label: "Studio Slug", value: `/salon/${salon.slug}` },
            { label: "Physical Address", value: `${salon.address}, ${salon.district}` },
            { label: "Capacity", value: `${salon.chairs_count} Active Barber Stations` },
            { label: "Merchant Access", value: "Will be immediately terminated" },
          ]
        : undefined,
      warningMessage:
        "Deleting this studio will instantly revoke all merchant access, unpublish their public storefront page, and remove them from search results. This action is permanent and cannot be undone.",
      confirmLabel: "Permanently Delete Studio",
      onConfirm: () => {
        const res = platformStore.deleteSalon(salonId);
        if (res.success) {
          showToast(res.message, "error");
          loadData();
        } else {
          showToast(res.message, "error");
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleDeleteApplication = (appId: number, salonName: string) => {
    const app = applications.find((a) => a.id === appId);
    setConfirmModal({
      isOpen: true,
      type: "application",
      title: "Delete Partner Application?",
      badge: "IRREVERSIBLE ACTION",
      itemName: salonName,
      itemSubtitle: app ? `${app.district} • Owner: ${app.owner_name}` : undefined,
      details: app
        ? [
            { label: "Applicant / Owner", value: `${app.owner_name} (${app.owner_phone})` },
            { label: "Location", value: `${app.district}, ${app.area || app.full_address}` },
            { label: "Trade License", value: app.trade_license_number || "Not provided" },
            { label: "Status in Queue", value: app.status.toUpperCase() },
          ]
        : undefined,
      warningMessage:
        "This application will be permanently purged from the onboarding triage queue. All applicant notes and trade credentials will be discarded. This cannot be undone.",
      confirmLabel: "Permanently Delete Application",
      onConfirm: () => {
        const res = platformStore.deleteApplication(appId);
        if (res.success) {
          showToast(res.message, "error");
          loadData();
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
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
    const adm = admins.find((a) => a.id === id);
    setConfirmModal({
      isOpen: true,
      type: "admin",
      title: "Revoke Administrator Privileges?",
      badge: "SECURITY REVOCATION",
      itemName: name,
      itemSubtitle: adm ? `${adm.role} • ${adm.contact}` : undefined,
      details: adm
        ? [
            { label: "Assigned Privilege Level", value: adm.role },
            { label: "Account Contact", value: adm.contact },
            { label: "Platform Access", value: "Immediate Session Termination" },
          ]
        : undefined,
      warningMessage:
        "This user will immediately lose all Super Admin capabilities, triage permissions, and access to this control center. Are you sure you wish to proceed?",
      confirmLabel: "Revoke Super Admin Access",
      onConfirm: () => {
        const res = platformStore.revokeAdmin(id);
        if (res.success) {
          showToast(res.message, "error");
          loadData();
        } else {
          showToast(res.message, "error");
        }
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
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
    <div className="h-screen flex flex-col bg-[#F8F9FA] text-[#0D0D0D] font-sans overflow-hidden selection:bg-[#0D0D0D] selection:text-white">
      {/* Top Super Luxury White Header */}
      <header className="h-16 border-b border-[#EAEAEA] bg-white/95 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-3 group" title="Return to public directory">
            <div className="w-9 h-9 rounded-xl bg-[#E8220A] flex items-center justify-center text-white font-serif font-bold text-lg shadow-md shadow-[#E8220A]/20 group-hover:scale-105 transition-transform">
              H
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-extrabold tracking-tight text-[#0D0D0D]">
                  Hair and Care <span className="text-[#E8220A]">bd</span>
                </span>
                <span className="text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-red-50 text-[#E8220A] border border-red-200">
                  Super Admin
                </span>
              </div>
              <p className="text-[11px] text-[#5E5E5E] font-sans font-medium">Platform Control Center (The Super Page)</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-2 pl-4 border-l border-[#EAEAEA] text-xs text-[#5E5E5E] font-mono">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>BST LIVE: Asia/Dhaka</span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-[#EAEAEA] bg-white hover:bg-[#F4F4F6] text-xs text-[#0D0D0D] font-semibold transition-all shadow-sm"
          >
            <span>View Public Directory</span>
            <span className="text-[10px]">↗</span>
          </Link>

          <button
            onClick={() => setInviteModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-[#0D0D0D] hover:bg-black text-white text-xs font-bold shadow-sm transition-all"
          >
            <span>+ Invite Admin</span>
          </button>

          {/* Admin Avatar */}
          <div className="flex items-center space-x-2 pl-2 border-l border-[#EAEAEA]">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-[1.5px] shadow-sm">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-bold text-xs text-amber-900 font-mono">
                SA
              </div>
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-bold text-[#0D0D0D]">Owner (God Mode)</div>
              <div className="text-[10px] text-emerald-700 font-mono font-semibold">Primary Super Admin</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r border-[#EAEAEA] bg-white flex flex-col justify-between shrink-0 shadow-sm">
          <div className="p-4 space-y-6">
            <div className="space-y-1">
              <div className="px-3 text-[10px] uppercase font-mono font-bold tracking-wider text-[#8A8A8E] mb-2">
                Triage & Verification
              </div>

              <button
                onClick={() => setActiveTab("applications")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "applications"
                    ? "bg-[#0D0D0D] text-white shadow-sm"
                    : "text-[#5E5E5E] hover:text-[#0D0D0D] hover:bg-[#F4F4F6]"
                }`}
              >
                <span>Salon Applications</span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                    activeTab === "applications"
                      ? "bg-[#E8220A] text-white"
                      : "bg-[#F0F0F2] text-[#0D0D0D]"
                  }`}
                >
                  {pendingCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("salons")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "salons"
                    ? "bg-[#0D0D0D] text-white shadow-sm"
                    : "text-[#5E5E5E] hover:text-[#0D0D0D] hover:bg-[#F4F4F6]"
                }`}
              >
                <span>Active Salons (Tenants)</span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                    activeTab === "salons"
                      ? "bg-white/20 text-white"
                      : "bg-[#F0F0F2] text-[#5E5E5E]"
                  }`}
                >
                  {salons.length}
                </span>
              </button>
            </div>

            <div className="space-y-1">
              <div className="px-3 text-[10px] uppercase font-mono font-bold tracking-wider text-[#8A8A8E] mb-2">
                Platform Administration
              </div>

              <button
                onClick={() => setActiveTab("team")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "team"
                    ? "bg-[#0D0D0D] text-white shadow-sm"
                    : "text-[#5E5E5E] hover:text-[#0D0D0D] hover:bg-[#F4F4F6]"
                }`}
              >
                <span>Super Admin Team</span>
                <span
                  className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full ${
                    activeTab === "team"
                      ? "bg-white/20 text-white"
                      : "bg-[#F0F0F2] text-[#5E5E5E]"
                  }`}
                >
                  {admins.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("analytics")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "analytics"
                    ? "bg-[#0D0D0D] text-white shadow-sm"
                    : "text-[#5E5E5E] hover:text-[#0D0D0D] hover:bg-[#F4F4F6]"
                }`}
              >
                <span>64 Districts Pulse</span>
              </button>

              <button
                onClick={() => setActiveTab("monetization")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "monetization"
                    ? "bg-[#0D0D0D] text-white shadow-sm"
                    : "text-[#5E5E5E] hover:text-[#0D0D0D] hover:bg-[#F4F4F6]"
                }`}
              >
                <span>Monetization & Revenue</span>
                <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {monetization.commission_rate}% PayG
                </span>
              </button>

              <button
                onClick={() => setActiveTab("audit")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === "audit"
                    ? "bg-[#0D0D0D] text-white shadow-sm"
                    : "text-[#5E5E5E] hover:text-[#0D0D0D] hover:bg-[#F4F4F6]"
                }`}
              >
                <span>Security Audit Trail</span>
              </button>
            </div>
          </div>

          <div className="p-4 border-t border-[#EAEAEA] bg-[#FAFAFC]">
            <div className="flex items-center justify-between text-[11px] text-[#5E5E5E] mb-1 font-medium">
              <span className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Seeded Schema</span>
              </span>
              <span className="font-mono text-emerald-700 font-semibold">Strictly Enforced</span>
            </div>
            <p className="text-[10px] text-[#8A8A8E] font-mono">Zero Hard-Coded Remnants</p>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6 bg-[#F8F9FA]">
          {/* TAB 1: APPLICATIONS */}
          {activeTab === "applications" && (
            <section className="space-y-6 max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#EAEAEA] pb-5">
                <div>
                  <h1 className="text-2xl font-extrabold text-[#0D0D0D] tracking-tight">Salon Partner Onboarding Triage</h1>
                  <p className="text-xs sm:text-sm text-[#5E5E5E] mt-1 leading-relaxed">
                    Review submissions, verify trade licenses, approve tenants, or purge invalid requests.
                  </p>
                </div>

                <div className="flex items-center space-x-1 bg-[#EAEAEA]/70 p-1 rounded-xl text-xs">
                  <button
                    onClick={() => setAppFilter("pending")}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      appFilter === "pending" ? "bg-white text-[#0D0D0D] shadow-sm" : "text-[#5E5E5E] hover:text-[#0D0D0D]"
                    }`}
                  >
                    Pending ({pendingCount})
                  </button>
                  <button
                    onClick={() => setAppFilter("approved")}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      appFilter === "approved" ? "bg-white text-[#0D0D0D] shadow-sm" : "text-[#5E5E5E] hover:text-[#0D0D0D]"
                    }`}
                  >
                    Approved ({approvedCount})
                  </button>
                  <button
                    onClick={() => setAppFilter("rejected")}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      appFilter === "rejected" ? "bg-white text-[#0D0D0D] shadow-sm" : "text-[#5E5E5E] hover:text-[#0D0D0D]"
                    }`}
                  >
                    Rejected ({rejectedCount})
                  </button>
                  <button
                    onClick={() => setAppFilter("all")}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                      appFilter === "all" ? "bg-white text-[#0D0D0D] shadow-sm" : "text-[#5E5E5E] hover:text-[#0D0D0D]"
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
                    className="w-full bg-white border border-[#E0E0E6] rounded-xl px-4 py-2.5 text-xs text-[#0D0D0D] placeholder-[#8A8A8E] focus:outline-none focus:border-[#E8220A] focus:ring-1 focus:ring-[#E8220A] shadow-sm transition-all"
                  />
                </div>
                <div>
                  <select
                    value={districtFilter}
                    onChange={(e) => setDistrictFilter(e.target.value)}
                    className="w-full bg-white border border-[#E0E0E6] rounded-xl px-3 py-2.5 text-xs text-[#0D0D0D] font-medium focus:outline-none focus:border-[#E8220A] focus:ring-1 focus:ring-[#E8220A] shadow-sm transition-all"
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
              <div className="border border-[#EAEAEA] rounded-2xl bg-white shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#EAEAEA] text-[11px] font-mono text-[#71717A] uppercase bg-[#F8F9FA]">
                        <th className="py-3.5 px-4 font-semibold">Salon & Area</th>
                        <th className="py-3.5 px-4 font-semibold">Owner & Contact</th>
                        <th className="py-3.5 px-4 font-semibold">Chairs</th>
                        <th className="py-3.5 px-4 font-semibold">Trade License / NID</th>
                        <th className="py-3.5 px-4 font-semibold">Status</th>
                        <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EAEAEA]">
                      {filteredApps.map((app) => (
                        <tr key={app.id} className="hover:bg-[#FAFAFC] transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#0D0D0D] text-sm">{app.salon_name}</div>
                            <div className="text-[11px] text-[#5E5E5E] mt-0.5">
                              📍 {app.district} • {app.area}
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="text-[#0D0D0D] font-semibold">{app.owner_name}</div>
                            <div className="text-[11px] text-[#5E5E5E] font-mono">{app.owner_phone}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-[#0D0D0D]">
                            {app.chairs_count} Chairs
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-[#5E5E5E]">
                            <div className="text-[#0D0D0D] font-medium">{app.trade_license_number || "Under verification"}</div>
                            <div className="text-[10px] text-emerald-700 font-semibold">NID Verified</div>
                          </td>
                          <td className="py-3.5 px-4">
                            {app.status === "pending" && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                                Pending Triage
                              </span>
                            )}
                            {app.status === "approved" && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                Approved Tenant
                              </span>
                            )}
                            {app.status === "rejected" && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-red-50 text-red-800 border border-red-200">
                                Rejected
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => {
                                  setSelectedApp(app);
                                  setReviewModalOpen(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-[#0D0D0D] text-xs font-semibold border border-[#DCDCE2] shadow-sm transition-all"
                              >
                                Inspect
                              </button>

                              {/* Task 4: Approve a saloon in pending state */}
                              {app.status === "pending" && (
                                <button
                                  onClick={() => handleApprovePending(app.id)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all"
                                  title="Approve Pending Salon"
                                >
                                  ✓ Approve
                                </button>
                              )}

                              {/* Delete Application */}
                              <button
                                onClick={() => handleDeleteApplication(app.id, app.salon_name)}
                                className="px-2 py-1 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-xs font-semibold border border-red-200 transition-all"
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
                    <div className="p-8 text-center text-[#8A8A8E] text-xs font-medium">
                      No applications match your current filters.
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* TAB 2: ACTIVE SALONS (TENANTS) */}
          {activeTab === "salons" && (
            <section className="space-y-6 max-w-7xl mx-auto">
              <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-5">
                <div>
                  <h1 className="text-2xl font-extrabold text-[#0D0D0D] tracking-tight">Active Platform Salons (Tenants)</h1>
                  <p className="text-xs sm:text-sm text-[#5E5E5E] mt-1 leading-relaxed">
                    Live verified studios with isolated merchant workspaces receiving online bookings.
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold text-[#5E5E5E] bg-white px-3 py-1.5 rounded-xl border border-[#EAEAEA] shadow-sm">
                  Total Live: <strong className="text-[#0D0D0D]">{salons.length}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {salons.map((salon, index) => {
                  const isHaven = salon.name.toLowerCase().includes("haven");
                  const coverPhoto =
                    salon.cover_photo_url && (salon.cover_photo_url !== "/assets/studio-haven.jpg" || isHaven)
                      ? salon.cover_photo_url
                      : getCanonicalSalonPhoto(salon.name, salon.slug, index);

                  return (
                    <div
                      key={salon.id}
                      className="rounded-2xl bg-white border border-[#EAEAEA] flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md hover:border-[#D0D0D8] group transition-all duration-300"
                    >
                      {/* Salon Distinct Photo Banner */}
                      <div className="relative h-44 bg-slate-100 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={coverPhoto}
                          alt={salon.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-white/90 text-emerald-700 font-bold border border-emerald-200 backdrop-blur-md shadow-sm">
                            Active Tenant
                          </span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-black/75 text-white border border-white/20 backdrop-blur-md font-medium">
                            BST {salon.opening_time} – {salon.closing_time}
                          </span>
                        </div>
                        {salon.is_boosted && (
                          <div className="absolute bottom-3 left-3">
                            <span className="text-[9px] font-mono uppercase font-extrabold px-2.5 py-0.5 rounded-md bg-amber-400 text-black shadow-sm">
                              ⭐ FEATURED STUDIO
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <h3 className="text-base font-bold text-[#0D0D0D] group-hover:text-[#E8220A] transition-colors leading-snug">
                            {salon.name}
                          </h3>
                          <p className="text-xs text-[#5E5E5E] mt-1 line-clamp-1 leading-relaxed">📍 {salon.address}</p>
                          <div className="flex items-center gap-2 mt-3 p-2.5 rounded-xl bg-[#F8F9FA] border border-[#EAEAEA] text-[11px] font-mono text-[#5E5E5E]">
                            <span>Chairs: <strong className="text-[#0D0D0D]">{salon.chairs_count || 4}</strong></span>
                            <span>•</span>
                            <span>Rating: <strong className="text-amber-500 font-bold">★ {salon.rating}</strong> ({salon.reviews_count})</span>
                            <span>•</span>
                            <span className="text-[#E8220A] font-bold">From ৳{salon.starting_price}</span>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#EAEAEA] flex items-center justify-between">
                          <div>
                            <div className="text-[9px] uppercase font-mono font-bold text-[#8A8A8E]">Owner</div>
                            <div className="text-xs font-bold text-[#0D0D0D]">{salon.owner_name}</div>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            {/* Task 5: Make "View Shop" button navigate to public link of selected salon */}
                            <Link
                              href={`/salon/${salon.slug}`}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-1"
                              title="View Public Storefront Micro-Site"
                            >
                              <span>View Shop</span>
                              <span className="text-[10px]">↗</span>
                            </Link>

                            <button
                              onClick={() => handleToggleBoost(salon.id)}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all border ${
                                salon.is_boosted
                                  ? "bg-amber-100 text-amber-900 border-amber-300 font-bold"
                                  : "bg-[#F4F4F6] text-[#5E5E5E] hover:text-[#0D0D0D] border-[#E0E0E6]"
                              }`}
                              title="Toggle Sponsored Boost"
                            >
                              {salon.is_boosted ? "⭐" : "Boost"}
                            </button>

                            {/* Task 4: Delete a saloon */}
                            <button
                              onClick={() => handleDeleteSalon(salon.id, salon.name)}
                              className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-xs font-semibold border border-red-200 transition-all"
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
            <section className="space-y-6 max-w-7xl mx-auto">
              <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-5">
                <div>
                  <h1 className="text-2xl font-extrabold text-[#0D0D0D] tracking-tight">Super Admin Team & Delegation</h1>
                  <p className="text-xs sm:text-sm text-[#5E5E5E] mt-1 leading-relaxed">
                    Manage platform administrators, grant application review privileges, or revoke access.
                  </p>
                </div>
                <button
                  onClick={() => setInviteModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#0D0D0D] hover:bg-black text-white text-xs font-bold shadow-sm transition-all"
                >
                  + Add New Administrator
                </button>
              </div>

              <div className="border border-[#EAEAEA] rounded-2xl bg-white divide-y divide-[#EAEAEA] shadow-sm overflow-hidden">
                {admins.map((adm) => (
                  <div key={adm.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-[#FAFAFC] transition-colors">
                    <div className="flex items-center space-x-3.5">
                      <div
                        className={`w-10 h-10 rounded-full ${
                          adm.is_root
                            ? "bg-amber-100 text-amber-900 border border-amber-300 font-extrabold"
                            : "bg-[#F0F0F2] text-[#0D0D0D] border border-[#E0E0E6] font-bold"
                        } flex items-center justify-center text-xs font-mono`}
                      >
                        {adm.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-bold text-[#0D0D0D]">{adm.name}</span>
                          {adm.is_root && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                              Immutable Root
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-[#5E5E5E] font-mono mt-0.5">
                          {adm.contact} • Role: <strong className="text-[#0D0D0D]">{adm.role}</strong>
                        </div>
                      </div>
                    </div>

                    <div>
                      {adm.is_root ? (
                        <span className="text-xs text-[#8A8A8E] font-mono italic">Primary Founder</span>
                      ) : (
                        <button
                          onClick={() => handleRevokeAdmin(adm.id, adm.name)}
                          className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-xs font-semibold border border-red-200 transition-all"
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
            <section className="space-y-6 max-w-7xl mx-auto">
              <div className="border-b border-[#EAEAEA] pb-5">
                <h1 className="text-2xl font-extrabold text-[#0D0D0D] tracking-tight">64 Districts Platform Pulse</h1>
                <p className="text-xs sm:text-sm text-[#5E5E5E] mt-1 leading-relaxed">Coverage breakdown across all 8 divisions in Bangladesh.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <div className="p-5 rounded-2xl bg-white border border-[#EAEAEA] shadow-sm">
                  <div className="text-[11px] font-mono uppercase font-bold text-[#8A8A8E]">Total Active Tenants</div>
                  <div className="text-3xl font-extrabold text-[#0D0D0D] mt-2">
                    {salons.length} <span className="text-xs text-emerald-700 font-semibold">Salons</span>
                  </div>
                  <div className="text-[11px] text-[#5E5E5E] mt-2">Across 64 Districts</div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#EAEAEA] shadow-sm">
                  <div className="text-[11px] font-mono uppercase font-bold text-[#8A8A8E]">Pending Triage Queue</div>
                  <div className="text-3xl font-extrabold text-amber-600 mt-2">
                    {pendingCount} <span className="text-xs text-[#5E5E5E] font-semibold">Applications</span>
                  </div>
                  <div className="text-[11px] text-[#5E5E5E] mt-2">Awaiting verification</div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#EAEAEA] shadow-sm">
                  <div className="text-[11px] font-mono uppercase font-bold text-[#8A8A8E]">Total Bookings</div>
                  <div className="text-3xl font-extrabold text-[#0D0D0D] mt-2">1,489</div>
                  <div className="text-[11px] text-emerald-700 font-semibold mt-2">↑ 24% this week (BST)</div>
                </div>

                <div className="p-5 rounded-2xl bg-white border border-[#EAEAEA] shadow-sm">
                  <div className="text-[11px] font-mono uppercase font-bold text-[#8A8A8E]">Platform GMV</div>
                  <div className="text-3xl font-extrabold text-[#0D0D0D] mt-2">৳ 7,44,500</div>
                  <div className="text-[11px] text-[#5E5E5E] mt-2">10% PayG Commission</div>
                </div>
              </div>
            </section>
          )}

          {/* TAB 5: PLATFORM MONETIZATION */}
          {activeTab === "monetization" && (
            <section className="space-y-6 max-w-7xl mx-auto">
              <div className="border-b border-[#EAEAEA] pb-5">
                <h1 className="text-2xl font-extrabold text-[#0D0D0D] tracking-tight">Platform Monetization & Revenue Engine</h1>
                <p className="text-xs sm:text-sm text-[#5E5E5E] mt-1 leading-relaxed">
                  Controls for {monetization.commission_rate}% Pay-As-You-Go commission and customizable Sponsored Boosting.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#EAEAEA] shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-4">
                  <div>
                    <h3 className="text-sm font-bold text-[#0D0D0D]">Monetization Rules & Fee Structures</h3>
                    <p className="text-xs text-[#5E5E5E]">Configure commission percentages and no-show deposit limits.</p>
                  </div>
                  <button
                    onClick={() => {
                      platformStore.updateMonetization(monetization);
                      showToast("✓ Monetization rules updated successfully!", "success");
                    }}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all"
                  >
                    Save Rules
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-xs">
                  <div>
                    <label className="block text-[#0D0D0D] font-bold mb-1.5">Commission Rate (%):</label>
                    <input
                      type="number"
                      value={monetization.commission_rate}
                      onChange={(e) =>
                        setMonetization({ ...monetization, commission_rate: parseFloat(e.target.value) || 10 })
                      }
                      className="w-full bg-[#F8F9FA] border border-[#E0E0E6] rounded-xl px-3.5 py-2.5 text-[#0D0D0D] font-mono font-bold focus:outline-none focus:border-[#E8220A] focus:ring-1 focus:ring-[#E8220A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#0D0D0D] font-bold mb-1.5">Advance Deposit (৳):</label>
                    <input
                      type="number"
                      value={monetization.deposit_fee}
                      onChange={(e) =>
                        setMonetization({ ...monetization, deposit_fee: parseFloat(e.target.value) || 50 })
                      }
                      className="w-full bg-[#F8F9FA] border border-[#E0E0E6] rounded-xl px-3.5 py-2.5 text-[#0D0D0D] font-mono font-bold focus:outline-none focus:border-[#E8220A] focus:ring-1 focus:ring-[#E8220A]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#0D0D0D] font-bold mb-1.5">Monthly Boost Fee (৳):</label>
                    <input
                      type="number"
                      value={monetization.boost_fee}
                      onChange={(e) =>
                        setMonetization({ ...monetization, boost_fee: parseFloat(e.target.value) || 200 })
                      }
                      className="w-full bg-[#F8F9FA] border border-[#E0E0E6] rounded-xl px-3.5 py-2.5 text-[#0D0D0D] font-mono font-bold focus:outline-none focus:border-[#E8220A] focus:ring-1 focus:ring-[#E8220A]"
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* TAB 6: SECURITY AUDIT TRAIL */}
          {activeTab === "audit" && (
            <section className="space-y-6 max-w-7xl mx-auto">
              <div className="border-b border-[#EAEAEA] pb-5">
                <h1 className="text-2xl font-extrabold text-[#0D0D0D] tracking-tight">Platform Security & Audit Trail</h1>
                <p className="text-xs sm:text-sm text-[#5E5E5E] mt-1 leading-relaxed">
                  Immutable log of administrative actions, application triage, and privileges.
                </p>
              </div>

              <div className="border border-[#EAEAEA] rounded-2xl bg-white divide-y divide-[#EAEAEA] shadow-sm overflow-hidden font-mono text-xs">
                {auditTrail.map((log, idx) => (
                  <div key={log.id || idx} className="p-4 flex items-center justify-between hover:bg-[#FAFAFC] transition-colors">
                    <div>
                      <div className="text-[#0D0D0D] font-medium">
                        <span className="text-[#E8220A] font-bold">[{log.action}]</span> {log.detail}
                      </div>
                      <div className="text-[11px] text-[#8A8A8E] mt-0.5">By: {log.actor}</div>
                    </div>
                    <div className="text-[11px] text-[#5E5E5E] pl-4 shrink-0 font-medium">{log.timestamp}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* Modal: Application Review */}
      {reviewModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EAEAEA] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-xs">
            <div className="p-5 border-b border-[#EAEAEA] flex items-center justify-between bg-[#F8F9FA]">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-[#E8220A] tracking-wider">Application Triage</span>
                <h3 className="text-lg font-bold text-[#0D0D0D] mt-0.5">{selectedApp.salon_name}</h3>
              </div>
              <button onClick={() => setReviewModalOpen(false)} className="w-8 h-8 rounded-full bg-[#EAEAEA] hover:bg-slate-300 flex items-center justify-center text-[#0D0D0D] font-bold">✕</button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-[#0D0D0D]">
              <div className="grid grid-cols-2 gap-4 bg-[#F8F9FA] p-4 rounded-2xl border border-[#EAEAEA]">
                <div>
                  <div className="text-[#8A8A8E] font-mono text-[10px] uppercase font-bold">Applicant / Owner</div>
                  <div className="text-[#0D0D0D] font-bold text-sm mt-0.5">{selectedApp.owner_name}</div>
                  <div className="text-[#5E5E5E] font-mono text-[11px] mt-0.5">{selectedApp.owner_phone}</div>
                  <div className="text-[#5E5E5E] text-[11px]">{selectedApp.owner_email}</div>
                </div>
                <div>
                  <div className="text-[#8A8A8E] font-mono text-[10px] uppercase font-bold">Trade License</div>
                  <div className="text-emerald-700 font-mono font-bold text-xs mt-0.5">
                    {selectedApp.trade_license_number}
                  </div>
                  <div className="text-[#8A8A8E] font-mono text-[10px] uppercase font-bold mt-2">Chairs & Timing</div>
                  <div className="text-[#5E5E5E] text-xs font-medium">
                    {selectedApp.chairs_count} Chairs • {selectedApp.opening_time} to {selectedApp.closing_time} BST
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[#0D0D0D] font-bold mb-1">Physical Address:</div>
                <p className="text-[#5E5E5E] bg-[#F8F9FA] p-3 rounded-xl border border-[#EAEAEA] font-mono text-[11px]">
                  {selectedApp.full_address}
                </p>
              </div>

              <div>
                <div className="text-[#0D0D0D] font-bold mb-1">Owner&apos;s Submission Notes:</div>
                <p className="text-[#5E5E5E] bg-[#F8F9FA] p-3 rounded-xl border border-[#EAEAEA] italic">
                  {selectedApp.notes}
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-[#EAEAEA] bg-[#F8F9FA] flex items-center justify-between">
              <button
                onClick={() => handleReject(selectedApp.id)}
                className="px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-semibold text-xs transition-all"
              >
                Reject Application
              </button>

              <div className="flex items-center space-x-2">
                {/* Task 4: Approve a saloon */}
                <button
                  onClick={() => handleApprove(selectedApp.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all"
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
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-[#EAEAEA] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden text-xs">
            <div className="p-5 border-b border-[#EAEAEA] flex items-center justify-between bg-[#F8F9FA]">
              <h3 className="text-base font-bold text-[#0D0D0D]">Invite Platform Administrator</h3>
              <button onClick={() => setInviteModalOpen(false)} className="w-8 h-8 rounded-full bg-[#EAEAEA] hover:bg-slate-300 flex items-center justify-center text-[#0D0D0D] font-bold">✕</button>
            </div>

            <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[#0D0D0D] font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full bg-[#F8F9FA] border border-[#E0E0E6] rounded-xl px-3.5 py-2.5 text-[#0D0D0D] focus:outline-none focus:border-[#E8220A] focus:ring-1 focus:ring-[#E8220A]"
                />
              </div>

              <div>
                <label className="block text-[#0D0D0D] font-bold mb-1">Contact (Email or Phone)</label>
                <input
                  type="text"
                  required
                  value={inviteContact}
                  onChange={(e) => setInviteContact(e.target.value)}
                  placeholder="admin@hairandcare.bd or +88017..."
                  className="w-full bg-[#F8F9FA] border border-[#E0E0E6] rounded-xl px-3.5 py-2.5 text-[#0D0D0D] focus:outline-none focus:border-[#E8220A] focus:ring-1 focus:ring-[#E8220A]"
                />
              </div>

              <div>
                <label className="block text-[#0D0D0D] font-bold mb-1">Privilege Level</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as AdminMember["role"])}
                  className="w-full bg-[#F8F9FA] border border-[#E0E0E6] rounded-xl px-3.5 py-2.5 text-[#0D0D0D] font-medium focus:outline-none focus:border-[#E8220A] focus:ring-1 focus:ring-[#E8220A]"
                >
                  <option value="Platform Super Admin">Full Platform Super Admin</option>
                  <option value="Operations Reviewer">Operations Reviewer</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#0D0D0D] hover:bg-black text-white font-bold transition-all shadow-sm"
                >
                  Generate Invitation & Delegate Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal (Bespoke Replacement for Native Browser Dialogs) */}
      {confirmModal.isOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        >
          <div 
            className="bg-white border border-[#EAEAEA] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-xs transform transition-all animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-[#EAEAEA] bg-[#F8F9FA] flex items-start justify-between">
              <div className="flex items-start space-x-3.5">
                <div className="w-11 h-11 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-[#E8220A] shrink-0 shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100/70 text-[#E8220A] font-mono text-[10px] font-bold tracking-wider mb-1">
                    <span>⚠</span>
                    <span>{confirmModal.badge}</span>
                  </div>
                  <h3 className="text-lg font-bold text-[#0D0D0D] tracking-tight">{confirmModal.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="w-8 h-8 rounded-full bg-[#EAEAEA] hover:bg-slate-300 flex items-center justify-center text-[#0D0D0D] font-bold transition-colors"
                title="Cancel & Close"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-[#0D0D0D]">
              {/* Target Spotlight Card */}
              <div className="bg-[#F8F9FA] p-4 rounded-2xl border border-[#EAEAEA] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold text-[#8A8A8E] tracking-wider">
                      Selected {confirmModal.type}
                    </span>
                    <h4 className="text-base font-extrabold text-[#0D0D0D] mt-0.5">
                      {confirmModal.itemName}
                    </h4>
                  </div>
                  {confirmModal.itemSubtitle && (
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-[#EAEAEA] text-[#5E5E5E] text-[11px] font-medium shadow-2xs">
                      {confirmModal.itemSubtitle}
                    </span>
                  )}
                </div>

                {/* Key-Value Details */}
                {confirmModal.details && confirmModal.details.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#EAEAEA]">
                    {confirmModal.details.map((d, i) => (
                      <div key={i} className="bg-white px-3 py-2 rounded-xl border border-[#EAEAEA]">
                        <div className="text-[10px] font-mono text-[#8A8A8E] uppercase font-semibold">{d.label}</div>
                        <div className="text-xs font-semibold text-[#0D0D0D] truncate mt-0.5">{d.value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Warning Notice */}
              <div className="p-3.5 rounded-xl bg-red-50/70 border border-red-200/80 text-[#991B1B] text-xs leading-relaxed flex items-start space-x-2.5">
                <svg className="w-4 h-4 shrink-0 mt-0.5 text-[#E8220A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="font-medium">
                  {confirmModal.warningMessage}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 border-t border-[#EAEAEA] bg-[#F8F9FA] flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2.5 rounded-xl border border-[#E0E0E6] bg-white hover:bg-slate-100 text-[#0D0D0D] font-bold text-xs transition-all shadow-2xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="px-5 py-2.5 rounded-xl bg-[#E8220A] hover:bg-[#C91A06] text-white font-bold text-xs shadow-md shadow-red-500/20 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>{confirmModal.confirmLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl border shadow-xl backdrop-blur-md text-xs font-bold flex items-center gap-2 ${
            toast.type === "success"
              ? "border-emerald-200 bg-white text-emerald-800 shadow-emerald-500/10"
              : "border-red-200 bg-white text-red-800 shadow-red-500/10"
          }`}
        >
          <span>{toast.type === "success" ? "✓" : "⚠"}</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
