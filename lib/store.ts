import { Salon, SalonApplication, AdminMember, AuditLog, MonetizationSettings, Booking } from "@/types";
import { SEED_DATA } from "./seed-data";

export const STORAGE_KEYS = {
  SALONS: "hairandcare_salons",
  APPLICATIONS: "hairandcare_applications",
  ADMINS: "hairandcare_admins",
  AUDIT: "hairandcare_audit",
  MONETIZATION: "hairandcare_monetization",
  BOOKINGS: "hairandcare_bookings",
};

/**
 * Returns the authoritative, distinct, brand-matched photo for each salon.
 * Ensures that under NO circumstances do different barbershops receive the same photo!
 */
export function getCanonicalSalonPhoto(name: string, slug?: string, fallbackIndex = 0): string {
  const query = `${name || ""} ${slug || ""}`.toLowerCase();
  if (query.includes("haven")) return "/assets/studio-haven.jpg";
  if (query.includes("barbarian") || query.includes("barberia")) return "/assets/studio-barberia.jpg";
  if (query.includes("crown")) return "/assets/hero-barber.jpg";
  if (query.includes("kingsman")) return "/assets/service-shave.jpg";
  if (query.includes("mirpur")) return "/assets/service-hair.jpg";
  if (query.includes("sylhet")) return "/assets/service-style.jpg";
  if (query.includes("blade") || query.includes("royal blade")) return "/assets/service-trim.jpg";
  if (query.includes("royal cut")) return "/assets/service-color.jpg";
  if (query.includes("gentlemen") || query.includes("uttara")) return "/assets/service-facial.jpg";

  const POOL = [
    "/assets/hero-barber.jpg",
    "/assets/studio-barberia.jpg",
    "/assets/service-hair.jpg",
    "/assets/service-style.jpg",
    "/assets/service-trim.jpg",
    "/assets/service-shave.jpg",
    "/assets/service-facial.jpg",
    "/assets/service-color.jpg",
    "/assets/hero-batman-barber.jpg",
    "/assets/studio-haven.jpg",
  ];
  return POOL[Math.abs(fallbackIndex) % POOL.length];
}

function getStoredItem<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn("Storage quota exceeded or unavailable", err);
  }
}

export const platformStore = {
  // --- SALONS ---
  getSalons(): Salon[] {
    let salons = getStoredItem<Salon[]>(STORAGE_KEYS.SALONS, SEED_DATA.salons);
    let updated = false;

    // Auto-heal photos so that each salon tenant carries its own distinct photo
    // and eliminates any duplicate /assets/studio-haven.jpg assignments on non-Haven salons
    salons = salons.map((salon, index) => {
      const canonical = getCanonicalSalonPhoto(salon.name, salon.slug, index);
      const isHaven = salon.name.toLowerCase().includes("haven");
      if (!salon.cover_photo_url || (salon.cover_photo_url === "/assets/studio-haven.jpg" && !isHaven)) {
        salon.cover_photo_url = canonical;
        updated = true;
      }
      return salon;
    });

    if (updated) {
      setStoredItem(STORAGE_KEYS.SALONS, salons);
    }
    return salons;
  },

  getSalonBySlug(slugOrId: string): Salon | undefined {
    const salons = this.getSalons();
    return salons.find(
      (s) =>
        s.slug.toLowerCase() === slugOrId.toLowerCase() ||
        s.id.toLowerCase() === slugOrId.toLowerCase()
    );
  },

  deleteSalon(salonId: string): { success: boolean; message: string } {
    const salons = this.getSalons();
    const target = salons.find((s) => s.id === salonId);
    if (!target) {
      return { success: false, message: `Salon with ID ${salonId} not found.` };
    }

    const updated = salons.filter((s) => s.id !== salonId);
    setStoredItem(STORAGE_KEYS.SALONS, updated);

    this.addAuditLog(
      "Primary Super Admin",
      "SALON_DELETED",
      `Deleted salon tenant "${target.name}" (Slug: ${target.slug}, Area: ${target.area}).`
    );

    return { success: true, message: `Salon "${target.name}" has been permanently removed.` };
  },

  toggleSalonBoost(salonId: string): boolean {
    const salons = this.getSalons();
    const salon = salons.find((s) => s.id === salonId);
    if (!salon) return false;

    salon.is_boosted = !salon.is_boosted;
    salon.is_featured = salon.is_boosted;
    setStoredItem(STORAGE_KEYS.SALONS, salons);

    this.addAuditLog(
      "Primary Super Admin",
      salon.is_boosted ? "SPONSORED_BOOST_ACTIVATED" : "SPONSORED_BOOST_REVOKED",
      `${salon.name} ${salon.is_boosted ? "boosted to #1 Top Placement" : "returned to Standard listing"}.`
    );

    return salon.is_boosted;
  },

  // --- APPLICATIONS ---
  getApplications(filter: "all" | "pending" | "approved" | "rejected" = "all"): SalonApplication[] {
    const apps = getStoredItem<SalonApplication[]>(STORAGE_KEYS.APPLICATIONS, SEED_DATA.applications);
    if (filter === "all") return apps;
    return apps.filter((a) => a.status === filter);
  },

  getApplicationById(id: number): SalonApplication | undefined {
    const apps = this.getApplications("all");
    return apps.find((a) => a.id === id);
  },

  submitApplication(data: Omit<SalonApplication, "id" | "status" | "submitted_at">): SalonApplication {
    const apps = this.getApplications("all");
    const newApp: SalonApplication = {
      ...data,
      id: Date.now(),
      status: "pending",
      submitted_at: new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Dhaka",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(new Date()) + " BST",
    };

    const updated = [newApp, ...apps];
    setStoredItem(STORAGE_KEYS.APPLICATIONS, updated);

    this.addAuditLog(
      newApp.owner_name,
      "NEW_APPLICATION_SUBMITTED",
      `${newApp.salon_name} (${newApp.district}) submitted onboarding request.`
    );

    return newApp;
  },

  approveSalon(applicationId: number, customSlug?: string): { success: boolean; salon?: Salon; message: string } {
    const apps = this.getApplications("all");
    const appIndex = apps.findIndex((a) => a.id === applicationId);

    if (appIndex === -1) {
      return { success: false, message: `Application #${applicationId} not found.` };
    }

    const app = apps[appIndex];
    if (app.status === "approved") {
      return { success: false, message: `Application #${applicationId} is already approved.` };
    }

    // 1. Update Application status
    app.status = "approved";
    app.reviewed_at = new Date().toISOString();
    app.reviewed_by = "usr_root_001";
    apps[appIndex] = app;
    setStoredItem(STORAGE_KEYS.APPLICATIONS, apps);

    // 2. Generate unique slug
    const cleanSlug = customSlug ||
      app.salon_name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "") + `-${Math.floor(1000 + Math.random() * 9000)}`;

    // 3. Create active tenant Salon record
    const salons = this.getSalons();
    const assignedCover =
      app.cover_photo_url ||
      getCanonicalSalonPhoto(app.salon_name, cleanSlug, salons.length);

    const newSalon: Salon = {
      id: `sln-${Math.random().toString(36).substring(2, 8)}`,
      application_id: app.id,
      name: app.salon_name,
      slug: cleanSlug,
      owner_name: app.owner_name,
      owner_phone: app.owner_phone,
      owner_email: app.owner_email,
      phone: app.owner_phone,
      email: app.owner_email,
      division: app.district,
      district: app.district,
      area: app.area,
      address: app.full_address,
      cover_photo_url: assignedCover,
      opening_time: app.opening_time || "10:00",
      closing_time: app.closing_time || "22:00",
      chairs_count: app.chairs_count,
      trade_license_number: app.trade_license_number,
      is_active: true,
      is_featured: true,
      is_boosted: false,
      rating: "5.00",
      reviews_count: 1,
      starting_price: 350,
      services: [
        { id: 1, name: "Signature Haircut", duration_minutes: 30, price_bdt: 350, category: "Haircut", is_active: true, description: "Classic cut and styling." },
        { id: 2, name: "Beard Sculpt & Shave", duration_minutes: 25, price_bdt: 250, category: "Beard", is_active: true, description: "Hot-towel contour and clean line." }
      ],
      barbers: [
        { id: 1, name: app.owner_name, title: "Master Partner", chair: 1, exp: "Founder", avatar: "/assets/barber-1.jpg", is_active: true }
      ],
      created_at: new Date().toISOString(),
    };

    const updatedSalons = [newSalon, ...salons];
    setStoredItem(STORAGE_KEYS.SALONS, updatedSalons);

    // 4. Record Audit log
    this.addAuditLog(
      "Primary Super Admin",
      "APPLICATION_APPROVED",
      `Approved application #${app.id} for "${app.salon_name}". Provisioned tenant workspace (Slug: ${cleanSlug}).`
    );

    return {
      success: true,
      salon: newSalon,
      message: `Successfully approved "${app.salon_name}"! Merchant tenant created with slug "${cleanSlug}".`,
    };
  },

  approvePendingSalon(applicationId: number): { success: boolean; salon?: Salon; message: string } {
    const app = this.getApplicationById(applicationId);
    if (!app) {
      return { success: false, message: `Application #${applicationId} not found.` };
    }
    if (app.status !== "pending") {
      return { success: false, message: `Application #${applicationId} is not in pending state (Current status: ${app.status}).` };
    }
    return this.approveSalon(applicationId);
  },

  rejectApplication(applicationId: number, adminNotes?: string): { success: boolean; message: string } {
    const apps = this.getApplications("all");
    const app = apps.find((a) => a.id === applicationId);
    if (!app) {
      return { success: false, message: `Application #${applicationId} not found.` };
    }

    app.status = "rejected";
    app.admin_notes = adminNotes || "Does not meet current verification requirements.";
    setStoredItem(STORAGE_KEYS.APPLICATIONS, apps);

    this.addAuditLog(
      "Primary Super Admin",
      "APPLICATION_REJECTED",
      `Rejected onboarding application #${app.id} for "${app.salon_name}".`
    );

    return { success: true, message: `Application for "${app.salon_name}" has been marked as rejected.` };
  },

  deleteApplication(applicationId: number): { success: boolean; message: string } {
    const apps = this.getApplications("all");
    const app = apps.find((a) => a.id === applicationId);
    if (!app) {
      return { success: false, message: `Application #${applicationId} not found.` };
    }

    const updated = apps.filter((a) => a.id !== applicationId);
    setStoredItem(STORAGE_KEYS.APPLICATIONS, updated);

    this.addAuditLog(
      "Primary Super Admin",
      "APPLICATION_DELETED",
      `Purged application #${app.id} ("${app.salon_name}") from triage queue.`
    );

    return { success: true, message: `Application #${app.id} purged from records.` };
  },

  // --- ADMIN TEAM ---
  getAdmins(): AdminMember[] {
    return getStoredItem<AdminMember[]>(STORAGE_KEYS.ADMINS, SEED_DATA.admins);
  },

  inviteAdmin(name: string, contact: string, role: AdminMember["role"]): AdminMember {
    const admins = this.getAdmins();
    const newAdmin: AdminMember = {
      id: `usr_adm_${Math.floor(100 + Math.random() * 900)}`,
      name,
      contact,
      role,
      is_root: false,
      since: new Date().toLocaleDateString("en-GB"),
    };

    const updated = [...admins, newAdmin];
    setStoredItem(STORAGE_KEYS.ADMINS, updated);

    this.addAuditLog(
      "Primary Super Admin",
      "ADMIN_INVITED",
      `Delegated ${role} privileges to ${name} (${contact}).`
    );

    return newAdmin;
  },

  revokeAdmin(id: string): { success: boolean; message: string } {
    const admins = this.getAdmins();
    const target = admins.find((a) => a.id === id);
    if (!target) return { success: false, message: "Admin not found." };
    if (target.is_root) return { success: false, message: "Cannot revoke immutable Primary Founder." };

    const updated = admins.filter((a) => a.id !== id);
    setStoredItem(STORAGE_KEYS.ADMINS, updated);

    this.addAuditLog(
      "Primary Super Admin",
      "ADMIN_REVOKED",
      `Revoked administrator privileges from ${target.name} (${target.contact}).`
    );

    return { success: true, message: `Revoked privileges from ${target.name}.` };
  },

  // --- MONETIZATION ---
  getMonetization(): MonetizationSettings {
    return getStoredItem<MonetizationSettings>(STORAGE_KEYS.MONETIZATION, SEED_DATA.monetization);
  },

  updateMonetization(settings: MonetizationSettings): void {
    setStoredItem(STORAGE_KEYS.MONETIZATION, settings);
    this.addAuditLog(
      "Primary Super Admin",
      "MONETIZATION_RULES_UPDATED",
      `Commission set to ${settings.commission_rate}%, Deposit fee set to ৳${settings.deposit_fee}, Boost fee set to ৳${settings.boost_fee}/mo.`
    );
  },

  // --- AUDIT TRAIL ---
  getAuditTrail(): AuditLog[] {
    return getStoredItem<AuditLog[]>(STORAGE_KEYS.AUDIT, SEED_DATA.audit_trail);
  },

  addAuditLog(actor: string, action: string, detail: string): void {
    const logs = this.getAuditTrail();
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      timestamp: new Intl.DateTimeFormat("en-GB", {
        timeZone: "Asia/Dhaka",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(new Date()) + " BST",
      actor,
      action,
      detail,
    };
    setStoredItem(STORAGE_KEYS.AUDIT, [newLog, ...logs]);
  },

  // --- BOOKINGS ---
  getBookings(): Booking[] {
    return getStoredItem<Booking[]>(STORAGE_KEYS.BOOKINGS, []);
  },

  createBooking(booking: Booking): void {
    const bookings = this.getBookings();
    setStoredItem(STORAGE_KEYS.BOOKINGS, [booking, ...bookings]);

    this.addAuditLog(
      booking.customer_name,
      "ADVANCE_BOOKING_CREATED",
      `Token ${booking.id} issued for ${booking.salon_name} (Service: ${booking.service}, Chair #${booking.chair}, ৳${booking.deposit_paid} deposit via ${booking.deposit_method}).`
    );
  },
};

