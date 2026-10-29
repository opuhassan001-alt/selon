import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#F9F9FB] border-t border-[#EAEAEA] pt-16 pb-12 px-4 sm:px-8 text-sm text-[#5E5E5E]">
      <div className="max-w-[1440px] mx-auto space-y-12">
        
        {/* Top Services Directory */}
        <div className="pb-10 border-b border-[#EAEAEA]">
          <span className="font-bold text-[#0D0D0D] block mb-3 text-xs uppercase tracking-wider">Top Treatments Directory</span>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
            <Link href="/browse?category=beauty" className="hover:text-[#0D0D0D]">Beauty Salons</Link>
            <Link href="/browse?category=nails" className="hover:text-[#0D0D0D]">Nail Salons</Link>
            <Link href="/browse?category=lashes" className="hover:text-[#0D0D0D]">Eyebrows & Lashes</Link>
            <Link href="/browse?category=hair" className="hover:text-[#0D0D0D]">Hair Salons</Link>
            <Link href="/browse?category=massage" className="hover:text-[#0D0D0D]">Massages</Link>
            <Link href="/browse?category=waxing" className="hover:text-[#0D0D0D]">Waxing Salons</Link>
            <Link href="/browse?category=medspa" className="hover:text-[#0D0D0D]">Medspas</Link>
            <Link href="/browse?category=barber" className="hover:text-[#0D0D0D]">Barbers</Link>
            <Link href="/browse?category=spa" className="hover:text-[#0D0D0D]">Spas & Saunas</Link>
          </div>
        </div>

        {/* 4 Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm text-[#0D0D0D] uppercase font-sans">Hair and Care</span>
              <span className="text-[10px] font-bold px-1 rounded bg-[#E8220A] text-white">bd</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              The national salon marketplace and advance booking platform for Bangladesh.
            </p>
            <ul className="space-y-2 text-xs pt-1">
              <li><Link href="/browse" className="hover:text-[#0D0D0D]">Browse All Studios</Link></li>
              <li><a href="#" className="hover:text-[#0D0D0D]">Careers</a></li>
              <li><a href="#" className="hover:text-[#0D0D0D]">Help and support</a></li>
              <li><a href="#" className="hover:text-[#0D0D0D]">Blog & Guides</a></li>
            </ul>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#0D0D0D]">For business</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/portal" className="hover:text-[#0D0D0D]">Merchant Portal & POS ↗</Link></li>
              <li><Link href="/admin" className="hover:text-[#0D0D0D] font-semibold text-[#E8220A]">Super Admin Control Center ↗</Link></li>
              <li><a href="#" className="hover:text-[#0D0D0D]">List your business</a></li>
              <li><a href="#" className="hover:text-[#0D0D0D]">Partner Terms</a></li>
              <li><a href="#" className="hover:text-[#0D0D0D]">System Status</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#0D0D0D]">Legal & Trust</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-[#0D0D0D]">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-[#0D0D0D]">Terms of Service</a></li>
              <li><a href="#" className="hover:text-[#0D0D0D]">No-Show Refund Policy</a></li>
              <li><a href="#" className="hover:text-[#0D0D0D]">Security & Verification</a></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#0D0D0D]">Customer Support</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              Helpline: +880 1711-904421<br />
              Email: support@hairandcare.com.bd
            </p>
            <div className="pt-2 flex gap-3 text-xs">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-[#0D0D0D]">Facebook</a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-[#0D0D0D]">Instagram</a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-[#0D0D0D]">LinkedIn</a>
            </div>
          </div>

        </div>

        {/* Bottom Strip */}
        <div className="pt-8 border-t border-[#EAEAEA] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-[#0D0D0D]">Bangladesh • BDT (৳)</span>
            <span className="text-gray-400">• English (BST Timezone)</span>
          </div>

          <p className="text-gray-500 text-center sm:text-right">
            © 2026 Hair and Care bd • All Rights Reserved.
          </p>
        </div>

      </div>
    </footer>
  );
}
