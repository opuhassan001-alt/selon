import { NextResponse } from "next/server";
import { platformStore } from "@/lib/store";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const status = (searchParams.get("status") || "all") as "all" | "pending" | "approved" | "rejected";

  const apps = platformStore.getApplications(status);
  return NextResponse.json(apps);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { salon_name, owner_name, owner_phone, owner_email, district, area, full_address, trade_license_number, chairs_count, opening_time, closing_time, notes } = body;

    if (!salon_name || !owner_phone) {
      return NextResponse.json({ error: "Salon name and phone number are required." }, { status: 400 });
    }

    const newApp = platformStore.submitApplication({
      salon_name,
      owner_name: owner_name || "Applicant",
      owner_phone,
      owner_email: owner_email || "contact@salon.bd",
      district: district || "Dhaka",
      area: area || "Main Area",
      full_address: full_address || `${area || "Main Area"}, ${district || "Dhaka"}`,
      trade_license_number: trade_license_number || "TRAD/DNCC/PENDING",
      chairs_count: Number(chairs_count) || 4,
      opening_time: opening_time || "10:00",
      closing_time: closing_time || "22:00",
      notes: notes || "Submitted via List Your Business portal.",
    });

    return NextResponse.json({ success: true, application: newApp }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to submit application." }, { status: 500 });
  }
}

