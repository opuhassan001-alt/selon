# SalonBD Multi-Tenant Backend & Role-Based Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a production-grade multi-tenant backend on Supabase (PostgreSQL) and interactive role-based admin dashboards (Super Admin & Salon Merchant) for the SalonBD platform.

**Architecture:** Multi-Tenant SaaS & Directory Marketplace where the platform owner acts as Super Admin with delegation capabilities and application triage controls. Approved salons receive isolated merchant workspaces via Row-Level Security (RLS), with role-based dashboards for Owners, Managers, Receptionists, Stylists, and Customers.

**Tech Stack:** Supabase (PostgreSQL 15+, Auth, Row-Level Security, Storage, Edge Functions), Tailwind CSS, Vanilla JS / Modular ES6 client, FontAwesome / Lucide SVG icons.

**Spec:** [Architecture.md](file:///e:/work%20station/selon/Architecture.md), [Prd.md](file:///e:/work%20station/selon/Prd.md), [supabase/migrations/20261025000000_init_salon_marketplace.sql](file:///e:/work%20station/selon/supabase/migrations/20261025000000_init_salon_marketplace.sql)

---

## Global Constraints

- **Strict RLS Performance Pattern:** Every RLS policy with `auth.uid()` MUST use `(select auth.uid())` subquery wrapping to ensure single evaluation and caching per query plan.
- **Index Integrity:** 100% of foreign keys must have dedicated b-tree indexes to prevent table-scan locks during joins and cascade deletes.
- **Data Isolation:** No salon owner or staff member may ever query or mutate another salon's data; strict tenant boundaries enforced at database level.
- **Double-Booking Prevention:** Concurrency-safe unique indexes on `(staff_id, booking_date, time_slot)` for active bookings.
- **Clean Identifiers:** All table names, column names, and constraint names must be lowercase snake_case.

---

## Review Focus

1. **Tenant Leakage:** Ensure no query or edge case allows a Salon Owner to inspect another salon's bookings or revenue.
2. **Super Admin Privilege Escalation:** Verify that only Primary or designated Super Admins can invoke `approve_salon_application()` or promote users.
3. **Double-Booking Edge Cases:** Concurrent booking requests for the exact same staff member and time slot must reliably fail with HTTP 409 / constraint violation.
4. **Verified Reviews Integrity:** Unverified users or users with uncompleted bookings must be blocked by RLS from creating review records.
5. **No Broken Links or Silent Errors:** Every admin action (Approve, Reject, Add Staff, Cancel Booking) must provide visual feedback.

---

## Task Breakdown

### Task 1: Supabase Database Migration & RLS Security Layer

- [ ] **Step 1:** Review and verify `supabase/migrations/20261025000000_init_salon_marketplace.sql` against `supabase-postgres-best-practices`.
- [ ] **Step 2:** Ensure all foreign key columns have corresponding indexes (`profiles_role_idx`, `salon_applications_applicant_user_id_idx`, `salons_owner_id_idx`, `bookings_salon_id_idx`, etc.).
- [ ] **Step 3:** Validate that `private.is_super_admin()` and `private.has_salon_role()` use `security definer`, `set search_path = ''`, and have privileges revoked from public/anon.
- [ ] **Step 4:** Provide a local validation script / query test suite (`supabase/tests/rls_security_test.sql`) proving that non-admin users cannot approve applications.

### Task 2: Supabase Client Configuration & Mock Adapter

- [ ] **Step 1:** Create `js/supabase-client.js` configuring the Supabase JS SDK client with fallback to local mock state when offline.
- [ ] **Step 2:** Implement auth helper functions (`signIn`, `signUp`, `signOut`, `getCurrentProfile`, `getUserRole`).
- [ ] **Step 3:** Implement API client layer for bookings, salon applications, services, and staff.

### Task 3: Super Admin Control Center UI

- [ ] **Step 1:** Create `admin/index.html` featuring the luxury clean window layout with sidebar navigation.
- [ ] **Step 2:** Build the **"Pending Salon Applications"** module with status chips (`Pending`, `Approved`, `Rejected`), detailed modal view, and one-click "Approve" button wired to `approve_salon_application`.
- [ ] **Step 3:** Build the **"Super Admin Team Management"** tab to view all administrators, invite new admins via email/phone, and revoke access.
- [ ] **Step 4:** Build the **"Global District Analytics"** dashboard showing verified salon count across 64 districts, live BST open statuses, and total platform bookings.

### Task 4: Salon Partner Merchant Dashboard UI (Shopify-Style)

- [ ] **Step 1:** Create `portal/index.html` for approved salon merchants (`salon_owner`, `manager`, `receptionist`, `stylist`).
- [ ] **Step 2:** Build the **"Live Booking Calendar & Chair Queue"** with real-time slot statuses and check-in / complete buttons.
- [ ] **Step 3:** Build the **"Services & Pricing Builder"** allowing owners to add, edit, and toggle services and durations.
- [ ] **Step 4:** Build the **"Staff & Barbers Management"** section allowing role assignments and schedule controls.
- [ ] **Step 5:** Build the **"Digital Token Scanner / Desk POS"** where receptionists can quickly verify customer token slips.

### Task 5: Frontend Integration ("List Your Business" Submission)

- [ ] **Step 1:** Connect the "List Your Business" modal in `index.html` to insert rows into `public.salon_applications`.
- [ ] **Step 2:** Add client-side validation for Bangladesh phone numbers (`+880` / `01X`), district selector, and required address fields.
- [ ] **Step 3:** Show instant feedback toast: "Application submitted! Super Admin will review within 24 hours."

### Task 6: End-to-End Verification & Backlog Synchronization

- [ ] **Step 1:** Execute full user flow: Customer submits application -> Super Admin approves -> Salon Tenant created -> Salon Owner manages slots -> Customer books slot.
- [ ] **Step 2:** Synchronize `docs/TODO.md` with completed tasks and archive records.

