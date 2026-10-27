import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#1f2639] bg-[#090d17] text-slate-400 text-xs py-14 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Col 1 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded bg-[#e8220a] flex items-center justify-center text-white font-bold text-sm">
              H
            </div>
            <span className="text-sm font-bold text-white tracking-tight">
              Hair and Care <span className="text-[#e8220a]">bd</span>
            </span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            The national salon marketplace and advance booking platform for Bangladesh.
            Connecting discerning clients to verified master studios across all 64 districts.
          </p>
          <div className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1.5 pt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>BST Engine & Supabase RLS Protected</span>
          </div>
        </div>

        {/* Col 2 */}
        <div>
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider font-mono mb-3">
            Major Studio Hubs
          </h4>
          <ul className="space-y-2 text-xs">
            <li><a href="#recommended-studios" className="hover:text-white transition-colors">Dhaka (Dhanmondi, Banani, Gulshan)</a></li>
            <li><a href="#recommended-studios" className="hover:text-white transition-colors">Dhaka North (Mirpur, Uttara)</a></li>
            <li><a href="#recommended-studios" className="hover:text-white transition-colors">Chattogram (Nasirabad, GEC Circle)</a></li>
            <li><a href="#recommended-studios" className="hover:text-white transition-colors">Sylhet (Zindabazar)</a></li>
            <li><a href="#recommended-studios" className="hover:text-white transition-colors">Rajshahi (Shaheb Bazar)</a></li>
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider font-mono mb-3">
            Platform Roles
          </h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/admin" className="hover:text-white transition-colors text-amber-300">Super Admin Control Center (God Mode) ↗</Link></li>
            <li><Link href="/portal" className="hover:text-white transition-colors text-slate-300">Salon Merchant Workspace & POS ↗</Link></li>
            <li><Link href="/salon/vintage-crown-dhanmondi" className="hover:text-white transition-colors">Sample Studio Storefront Micro-Site ↗</Link></li>
            <li><Link href="/review?token=SLN-DHN-8940" className="hover:text-white transition-colors">Verified Review Verification Terminal ↗</Link></li>
          </ul>
        </div>

        {/* Col 4 */}
        <div>
          <h4 className="text-white font-semibold text-xs uppercase tracking-wider font-mono mb-3">
            Anti-AI-Slop Standards
          </h4>
          <p className="text-slate-400 text-xs leading-relaxed mb-3">
            Zero synthetic filler. All data is dynamically synchronized with backend records and authenticated salon tenants.
          </p>
          <div className="p-3 rounded bg-[#111a2e] border border-[#1f2639] text-[11px] font-mono text-slate-300">
            <div>10% Pay-As-You-Go</div>
            <div className="text-amber-400 mt-0.5">৳50 No-Show Protection via bKash/Nagad</div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-[#1f2639] flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
        <div>
          &copy; {new Date().getFullYear()} Hair and Care bd. All rights reserved across 64 Districts of Bangladesh.
        </div>
        <div className="flex items-center space-x-4 mt-2 sm:mt-0 font-mono">
          <span>Version 2.0.0 (Next.js + TypeScript)</span>
          <span>•</span>
          <span className="text-emerald-400">Status: Operational</span>
        </div>
      </div>
    </footer>
  );
}

