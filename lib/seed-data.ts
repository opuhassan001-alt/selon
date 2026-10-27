import { SuperPageSeedData, Salon, SalonApplication, AdminMember, AuditLog, MonetizationSettings } from "@/types";
import seedDataRaw from "@/data/super-page-seed.json";

export const SEED_DATA: SuperPageSeedData = seedDataRaw as SuperPageSeedData;

export function getInitialSalons(): Salon[] {
  return [...SEED_DATA.salons];
}

export function getInitialApplications(): SalonApplication[] {
  return [...SEED_DATA.applications];
}

export function getInitialAdmins(): AdminMember[] {
  return [...SEED_DATA.admins];
}

export function getInitialAudit(): AuditLog[] {
  return [...SEED_DATA.audit_trail];
}

export function getInitialMonetization(): MonetizationSettings {
  return { ...SEED_DATA.monetization };
}

