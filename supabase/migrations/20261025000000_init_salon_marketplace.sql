-- ============================================================================
-- Migration: 20261025000000_init_salon_marketplace.sql
-- Description: Multi-tenant Salon Marketplace & Role-Based Access Control (RBAC)
-- Standards: Following Supabase Postgres Best Practices:
--   1. Subquery-wrapped auth.uid() in RLS: ((select auth.uid()) = user_id)
--   2. Explicit Foreign Key Indexes on 100% of foreign keys
--   3. Partial Indexes on high-frequency query filters
--   4. Private schema helper functions with security definer & empty search_path
--   5. Strict Check Constraints & snake_case identifiers
--   6. Double-booking prevention via unique slot constraints
-- ============================================================================

-- 0. EXTENSIONS & SCHEMAS
create extension if not exists "uuid-ossp";

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- ============================================================================
-- 1. PROFILES & RBAC IDENTITIES
-- ============================================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text unique,
  role text not null default 'customer' check (
    role in ('super_admin', 'salon_owner', 'manager', 'receptionist', 'stylist', 'customer')
  ),
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for profiles
create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_phone_idx on public.profiles (phone) where phone is not null;

-- ============================================================================
-- 2. "LIST YOUR BUSINESS" APPLICATIONS
-- ============================================================================
create table if not exists public.salon_applications (
  id bigint generated always as identity primary key,
  applicant_user_id uuid references auth.users(id) on delete set null,
  salon_name text not null,
  owner_name text not null,
  owner_phone text not null,
  owner_email text not null,
  district text not null,
  area text not null,
  full_address text not null,
  trade_license_number text,
  chairs_count integer default 1 check (chairs_count > 0),
  photo_urls text[] default array[]::text[],
  status text not null default 'pending' check (
    status in ('pending', 'approved', 'rejected', 'changes_requested')
  ),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Foreign Key Indexes for salon_applications
create index if not exists salon_applications_applicant_user_id_idx on public.salon_applications (applicant_user_id);
create index if not exists salon_applications_reviewed_by_idx on public.salon_applications (reviewed_by);

-- Partial Index for Super Admin pending triage queue
create index if not exists salon_applications_pending_idx 
  on public.salon_applications (created_at desc) 
  where status = 'pending';

-- ============================================================================
-- 3. SALONS (TENANTS)
-- ============================================================================
create table if not exists public.salons (
  id uuid primary key default gen_random_uuid(),
  application_id bigint references public.salon_applications(id) on delete set null,
  name text not null,
  slug text not null unique,
  owner_id uuid not null references auth.users(id) on delete restrict,
  phone text not null,
  email text,
  district text not null,
  area text not null,
  address text not null,
  cover_photo_url text,
  logo_url text,
  opening_time time not null default '09:00:00',
  closing_time time not null default '22:00:00',
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Foreign Key & Filter Indexes for salons
create index if not exists salons_owner_id_idx on public.salons (owner_id);
create index if not exists salons_application_id_idx on public.salons (application_id);
create index if not exists salons_district_area_idx on public.salons (district, area);
create index if not exists salons_active_featured_idx on public.salons (is_featured desc, created_at desc) where is_active = true;

-- ============================================================================
-- 4. SALON STAFF & IN-SALON ROLES
-- ============================================================================
create table if not exists public.salon_staff (
  id bigint generated always as identity primary key,
  salon_id uuid not null references public.salons(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'stylist' check (
    role in ('owner', 'manager', 'receptionist', 'stylist')
  ),
  display_name text not null,
  title text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint salon_staff_salon_user_unique unique (salon_id, user_id)
);

-- Foreign Key Indexes for salon_staff
create index if not exists salon_staff_salon_id_idx on public.salon_staff (salon_id);
create index if not exists salon_staff_user_id_idx on public.salon_staff (user_id);
create index if not exists salon_staff_role_idx on public.salon_staff (role);

-- ============================================================================
-- 5. SERVICES & RATE CARDS
-- ============================================================================
create table if not exists public.services (
  id bigint generated always as identity primary key,
  salon_id uuid not null references public.salons(id) on delete cascade,
  name text not null,
  description text,
  duration_minutes integer not null check (duration_minutes > 0),
  price_bdt numeric(10,2) not null check (price_bdt >= 0),
  category text not null default 'Haircut',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Foreign Key Index for services
create index if not exists services_salon_id_idx on public.services (salon_id);
create index if not exists services_active_salon_idx on public.services (salon_id, is_active);

-- ============================================================================
-- 6. BOOKINGS & CONCURRENCY-SAFE RESERVATIONS
-- ============================================================================
create table if not exists public.bookings (
  id bigint generated always as identity primary key,
  token_id text not null unique,
  salon_id uuid not null references public.salons(id) on delete restrict,
  staff_id bigint references public.salon_staff(id) on delete set null,
  service_id bigint references public.services(id) on delete set null,
  customer_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  booking_date date not null,
  time_slot time not null,
  total_bdt numeric(10,2) not null default 0 check (total_bdt >= 0),
  status text not null default 'confirmed' check (
    status in ('confirmed', 'checked_in', 'completed', 'cancelled', 'no_show')
  ),
  payment_status text not null default 'pay_at_salon' check (
    payment_status in ('pay_at_salon', 'paid', 'refunded')
  ),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Foreign Key Indexes for bookings
create index if not exists bookings_salon_id_idx on public.bookings (salon_id);
create index if not exists bookings_staff_id_idx on public.bookings (staff_id);
create index if not exists bookings_service_id_idx on public.bookings (service_id);
create index if not exists bookings_customer_id_idx on public.bookings (customer_id);
create index if not exists bookings_date_salon_idx on public.bookings (salon_id, booking_date, time_slot);

-- Concurrency protection: prevent double-booking same staff on same date & time slot for active appointments
create unique index if not exists bookings_no_double_book_idx 
  on public.bookings (staff_id, booking_date, time_slot) 
  where status in ('confirmed', 'checked_in');

-- ============================================================================
-- 7. VERIFIED REVIEWS
-- ============================================================================
create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  booking_id bigint not null unique references public.bookings(id) on delete cascade,
  salon_id uuid not null references public.salons(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  rating integer not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);

-- Foreign Key Indexes for reviews
create index if not exists reviews_salon_id_idx on public.reviews (salon_id);
create index if not exists reviews_customer_id_idx on public.reviews (customer_id);

-- ============================================================================
-- 8. PRIVATE SECURITY DEFINER FUNCTIONS (RLS Optimization)
-- ============================================================================

-- Check if current authenticated user is Super Admin
create or replace function private.is_super_admin()
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role = 'super_admin'
      and is_active = true
  );
$$;

-- Check if user has management access to a specific salon (Owner, Manager, Receptionist, or Super Admin)
create or replace function private.has_salon_role(target_salon_id uuid, allowed_roles text[])
returns boolean
language sql
security definer
set search_path = ''
stable
as $$
  select exists (
    -- Case 1: Super admin has access to all salons
    select 1 from public.profiles
    where id = (select auth.uid())
      and role = 'super_admin'
      and is_active = true
    
    union all
    
    -- Case 2: Direct salon owner
    select 1 from public.salons
    where id = target_salon_id
      and owner_id = (select auth.uid())
      and is_active = true
    
    union all
    
    -- Case 3: Assigned staff member with matching role
    select 1 from public.salon_staff
    where salon_id = target_salon_id
      and user_id = (select auth.uid())
      and is_active = true
      and role = any(allowed_roles)
  );
$$;

-- Revoke execute from public/anon on private functions
revoke execute on function private.is_super_admin() from public, anon;
revoke execute on function private.has_salon_role(uuid, text[]) from public, anon;
grant execute on function private.is_super_admin() to authenticated;
grant execute on function private.has_salon_role(uuid, text[]) to authenticated;

-- ============================================================================
-- 9. ROW-LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.salon_applications enable row level security;
alter table public.salons enable row level security;
alter table public.salon_staff enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;

-- ----------------------------------------------------------------------------
-- PROFILES POLICIES
-- ----------------------------------------------------------------------------
-- Public read of active profiles
create policy "profiles_select_public" on public.profiles
  for select using (is_active = true or (select auth.uid()) = id or (select private.is_super_admin()));

-- User can update their own profile
create policy "profiles_update_own" on public.profiles
  for update using ((select auth.uid()) = id);

-- Super Admin can manage all profiles (grant super admin, change roles)
create policy "profiles_super_admin_all" on public.profiles
  for all using ((select private.is_super_admin()));

-- ----------------------------------------------------------------------------
-- SALON APPLICATIONS POLICIES
-- ----------------------------------------------------------------------------
-- Anyone authenticated can submit an application
create policy "applications_insert_auth" on public.salon_applications
  for insert with check ((select auth.uid()) = applicant_user_id);

-- Applicant can view their own application
create policy "applications_select_own" on public.salon_applications
  for select using (
    (select auth.uid()) = applicant_user_id
    or (select private.is_super_admin())
  );

-- Only Super Admin can update status (Approve, Reject, Request Changes)
create policy "applications_update_super_admin" on public.salon_applications
  for update using ((select private.is_super_admin()));

-- ----------------------------------------------------------------------------
-- SALONS POLICIES
-- ----------------------------------------------------------------------------
-- Anyone can view active salons on website directory
create policy "salons_select_active" on public.salons
  for select using (is_active = true or (select private.has_salon_role(id, array['owner', 'manager'])));

-- Only Super Admin can insert newly approved salons
create policy "salons_insert_super_admin" on public.salons
  for insert with check ((select private.is_super_admin()));

-- Salon Owner & Super Admin can update salon profile
create policy "salons_update_owner_or_admin" on public.salons
  for update using ((select private.has_salon_role(id, array['owner'])));

-- ----------------------------------------------------------------------------
-- SALON STAFF POLICIES
-- ----------------------------------------------------------------------------
-- Anyone can view active staff of active salons
create policy "staff_select_public" on public.salon_staff
  for select using (is_active = true or (select private.has_salon_role(salon_id, array['owner', 'manager'])));

-- Salon Owner & Manager can manage staff members
create policy "staff_modify_management" on public.salon_staff
  for all using ((select private.has_salon_role(salon_id, array['owner', 'manager'])));

-- ----------------------------------------------------------------------------
-- SERVICES POLICIES
-- ----------------------------------------------------------------------------
-- Anyone can view active services
create policy "services_select_public" on public.services
  for select using (is_active = true or (select private.has_salon_role(salon_id, array['owner', 'manager'])));

-- Salon Owner & Manager can manage services & pricing
create policy "services_modify_management" on public.services
  for all using ((select private.has_salon_role(salon_id, array['owner', 'manager'])));

-- ----------------------------------------------------------------------------
-- BOOKINGS POLICIES
-- ----------------------------------------------------------------------------
-- Anyone authenticated or guest with valid session can insert a booking
create policy "bookings_insert_customer" on public.bookings
  for insert with check (
    (select auth.uid()) is null 
    or (select auth.uid()) = customer_id
  );

-- Salon staff (Owner, Manager, Receptionist, Stylist) can view salon bookings
create policy "bookings_select_salon_staff" on public.bookings
  for select using (
    (select auth.uid()) = customer_id
    or (select private.has_salon_role(salon_id, array['owner', 'manager', 'receptionist', 'stylist']))
  );

-- Front Desk / Manager / Owner can update booking status (Check-in, Complete, Cancel)
create policy "bookings_update_staff" on public.bookings
  for update using (
    (select private.has_salon_role(salon_id, array['owner', 'manager', 'receptionist']))
  );

-- ----------------------------------------------------------------------------
-- REVIEWS POLICIES
-- ----------------------------------------------------------------------------
-- Public can read all reviews
create policy "reviews_select_public" on public.reviews
  for select using (true);

-- Only customer who completed the booking can write a review
create policy "reviews_insert_verified" on public.reviews
  for insert with check (
    (select auth.uid()) = customer_id
    and exists (
      select 1 from public.bookings b
      where b.id = booking_id
        and b.customer_id = (select auth.uid())
        and b.status = 'completed'
    )
  );

-- ============================================================================
-- 10. AUTOMATED WORKFLOW: APPLICATION APPROVAL FUNCTION
-- ============================================================================
create or replace function public.approve_salon_application(
  target_application_id bigint,
  custom_slug text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  app_record public.salon_applications%rowtype;
  new_salon_id uuid;
  final_slug text;
begin
  -- 1. Verify caller is Super Admin
  if not (select private.is_super_admin()) then
    raise exception 'Unauthorized: Only Super Admin can approve applications.';
  end if;

  -- 2. Fetch and lock application
  select * into app_record
  from public.salon_applications
  where id = target_application_id
  for update;

  if not found then
    raise exception 'Application #% not found.', target_application_id;
  end if;

  if app_record.status = 'approved' then
    raise exception 'Application #% is already approved.', target_application_id;
  end if;

  -- Generate slug if not provided
  final_slug := coalesce(
    custom_slug, 
    lower(regexp_replace(app_record.salon_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || floor(random() * 8999 + 1000)::text
  );

  -- 3. Create Salon Tenant
  insert into public.salons (
    application_id,
    name,
    slug,
    owner_id,
    phone,
    email,
    district,
    area,
    address,
    is_active
  ) values (
    app_record.id,
    app_record.salon_name,
    final_slug,
    app_record.applicant_user_id,
    app_record.owner_phone,
    app_record.owner_email,
    app_record.district,
    app_record.area,
    app_record.full_address,
    true
  ) returning id into new_salon_id;

  -- 4. Promote applicant profile to 'salon_owner'
  update public.profiles
  set role = 'salon_owner'
  where id = app_record.applicant_user_id;

  -- 5. Add owner into salon_staff as 'owner'
  insert into public.salon_staff (
    salon_id,
    user_id,
    role,
    display_name,
    title
  ) values (
    new_salon_id,
    app_record.applicant_user_id,
    'owner',
    app_record.owner_name,
    'Salon Owner / Master Partner'
  );

  -- 6. Mark application as approved
  update public.salon_applications
  set status = 'approved',
      reviewed_by = (select auth.uid()),
      reviewed_at = now()
  where id = target_application_id;

  return new_salon_id;
end;
$$;

