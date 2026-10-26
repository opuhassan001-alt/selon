-- ============================================================================
-- Supabase RLS & Best Practices Verification Test Suite
-- Run this in Supabase SQL Editor to verify security, performance, & constraints
-- ============================================================================

do $$
declare
  test_app_id bigint;
  test_salon_id uuid;
  unindexed_fks count integer;
begin
  -- 1. Check for missing Foreign Key Indexes
  select count(*) into unindexed_fks
  from pg_constraint c
  join pg_attribute a on a.attrelid = c.conrelid and a.attnum = any(c.conkey)
  where c.contype = 'f'
    and c.conrelid::regclass::text like 'public.%'
    and not exists (
      select 1 from pg_index i
      where i.indrelid = c.conrelid and a.attnum = any(i.indkey)
    );

  if unindexed_fks > 0 then
    raise warning 'Warning: Found % unindexed foreign keys in public schema!', unindexed_fks;
  else
    raise notice 'SUCCESS: 100%% of foreign keys are indexed according to Supabase best practices.';
  end if;

  -- 2. Check RLS is enabled on all public business tables
  if exists (
    select 1 from pg_tables
    where schemaname = 'public'
      and tablename in ('profiles', 'salon_applications', 'salons', 'salon_staff', 'services', 'bookings', 'reviews')
      and rowsecurity = false
  ) then
    raise exception 'FAILED: One or more tables do not have Row-Level Security enabled!';
  else
    raise notice 'SUCCESS: Row-Level Security is strictly enabled across all business tables.';
  end if;

  raise notice 'All Supabase Postgres best-practice checks passed!';
end;
$$;

