export type Role = 'super_admin' | 'salon_owner' | 'manager' | 'receptionist' | 'stylist' | 'customer';

export type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'changes_requested';

export type BookingStatus = 'confirmed' | 'checked_in' | 'completed' | 'cancelled' | 'no_show';

export interface Service {
  id: number | string;
  salon_id?: string;
  name: string;
  description?: string;
  duration_minutes: number;
  price_bdt: number;
  category: string;
  is_active: boolean;
}

export interface Barber {
  id?: number | string;
  name: string;
  title: string;
  role?: string;
  chair: number;
  exp: string;
  avatar: string;
  is_active?: boolean;
}

export interface Salon {
  id: string;
  application_id?: number | string;
  name: string;
  slug: string;
  owner_id?: string;
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  phone: string;
  email?: string;
  division?: string;
  district: string;
  area: string;
  address: string;
  cover_photo_url: string;
  logo_url?: string;
  opening_time: string;
  closing_time: string;
  chairs_count?: number;
  trade_license_number?: string;
  is_active: boolean;
  is_featured: boolean;
  is_boosted?: boolean;
  rating: string | number;
  reviews_count: number;
  starting_price: number;
  services: Service[];
  barbers: Barber[];
  created_at?: string;
}

export interface SalonApplication {
  id: number;
  applicant_user_id?: string;
  salon_name: string;
  owner_name: string;
  owner_phone: string;
  owner_email: string;
  district: string;
  area: string;
  full_address: string;
  trade_license_number: string;
  chairs_count: number;
  status: ApplicationStatus;
  cover_photo_url?: string;
  opening_time: string;
  closing_time: string;
  submitted_at: string;
  notes?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  admin_notes?: string;
}

export interface Booking {
  id: string; // Token ID e.g. SLN-DHN-8940
  salon_id?: string;
  salon_name: string;
  customer_name: string;
  customer_phone: string;
  barber: string;
  chair: number;
  service: string;
  time_slot: string;
  booking_date: string;
  total: number;
  deposit_paid: number;
  deposit_method: 'bKash' | 'Nagad';
  trx_id: string;
  due_at_salon: number;
  status: BookingStatus;
  payment_status?: 'pay_at_salon' | 'paid' | 'refunded';
  notes?: string;
  created_at?: string;
}

export interface AdminMember {
  id: string;
  name: string;
  contact: string;
  role: 'Primary Super Admin' | 'Platform Super Admin' | 'Operations Reviewer';
  is_root: boolean;
  since: string;
}

export interface AuditLog {
  id?: string;
  timestamp: string;
  actor: string;
  action: string;
  detail: string;
}

export interface MonetizationSettings {
  commission_rate: number;
  boost_fee: number;
  deposit_fee: number;
  boost_duration: number;
}

export interface SuperPageSeedData {
  applications: SalonApplication[];
  salons: Salon[];
  admins: AdminMember[];
  audit_trail: AuditLog[];
  monetization: MonetizationSettings;
}

