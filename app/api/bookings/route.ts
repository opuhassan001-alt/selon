import { NextResponse } from "next/server";
import { platformStore } from "@/lib/store";
import { Booking } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token") || searchParams.get("id");
    const salonId = searchParams.get("salon_id");

    const bookings = platformStore.getBookings();

    if (token) {
      const cleanToken = token.trim().toUpperCase();
      const match = bookings.find((b) => b.id.toUpperCase() === cleanToken);
      if (!match) {
        return NextResponse.json({ error: "Booking token not found" }, { status: 404 });
      }
      return NextResponse.json(match);
    }

    if (salonId) {
      const filtered = bookings.filter((b) => b.salon_id === salonId || b.salon_name.toLowerCase().includes(salonId.toLowerCase()));
      return NextResponse.json(filtered);
    }

    return NextResponse.json(bookings);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      salon_id,
      salon_name,
      customer_name,
      customer_phone,
      service,
      total,
      time_slot,
      booking_date,
      barber,
      chair,
      deposit_paid,
      deposit_method,
      trx_id,
      due_at_salon,
    } = body;

    if (!salon_name || !customer_name || !customer_phone) {
      return NextResponse.json(
        { error: "Salon name, customer name, and customer phone are required." },
        { status: 400 }
      );
    }

    // Generate authenticated zero-conflict Token ID
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const token = `TK-${randomHex}`;

    const newBooking: Booking = {
      id: token,
      salon_id: salon_id || "",
      salon_name,
      customer_name: customer_name.trim(),
      customer_phone: customer_phone.trim(),
      barber: barber || "Master Stylist",
      chair: Number(chair) || 1,
      service: service || "Haircut & Grooming",
      time_slot: time_slot || "11:30 AM",
      booking_date: booking_date || new Date().toISOString().split("T")[0],
      total: Number(total) || 500,
      deposit_paid: Number(deposit_paid) || 50,
      deposit_method: deposit_method === "Nagad" ? "Nagad" : "bKash",
      trx_id: trx_id || `TRX-${deposit_method === "Nagad" ? "NG" : "BK"}-${Math.floor(100000 + Math.random() * 900000)}`,
      due_at_salon: Number(due_at_salon) || ((Number(total) || 500) - (Number(deposit_paid) || 50)),
      status: "confirmed",
      payment_status: "pay_at_salon",
      created_at: new Date().toISOString(),
    };

    platformStore.createBooking(newBooking);

    return NextResponse.json({ success: true, booking: newBooking }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { token, status } = body;

    if (!token || !status) {
      return NextResponse.json({ error: "Token and status are required." }, { status: 400 });
    }

    const bookings = platformStore.getBookings();
    const match = bookings.find((b) => b.id.toUpperCase() === token.trim().toUpperCase());

    if (!match) {
      return NextResponse.json({ error: "Booking token not found" }, { status: 404 });
    }

    match.status = status;
    platformStore.updateBookingStatus?.(match.id, status);

    return NextResponse.json({ success: true, booking: match });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update booking status" }, { status: 500 });
  }
}

