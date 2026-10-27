import { NextResponse } from "next/server";
import { platformStore } from "@/lib/store";
import { SEED_DATA } from "@/lib/seed-data";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.toLowerCase();
  const district = searchParams.get("district")?.toLowerCase();
  const slug = searchParams.get("slug");

  let salons = platformStore.getSalons();

  if (slug) {
    const single = salons.find((s) => s.slug.toLowerCase() === slug.toLowerCase() || s.id === slug);
    if (!single) return NextResponse.json({ error: "Salon not found" }, { status: 404 });
    return NextResponse.json(single);
  }

  if (district && district !== "all") {
    salons = salons.filter(
      (s) =>
        s.district.toLowerCase().includes(district) ||
        s.area.toLowerCase().includes(district) ||
        (s.division && s.division.toLowerCase().includes(district))
    );
  }

  if (query) {
    salons = salons.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.area.toLowerCase().includes(query) ||
        s.district.toLowerCase().includes(query) ||
        s.services.some((srv) => srv.name.toLowerCase().includes(query))
    );
  }

  return NextResponse.json(salons);
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: "Missing salon id" }, { status: 400 });
    }

    const result = platformStore.deleteSalon(id);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (err) {
    return NextResponse.json({ error: "Invalid request" }, { status: 500 });
  }
}

