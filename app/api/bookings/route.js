import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const BOOKINGS_KEY = "bookings";
const TIMEOUT = 20 * 60 * 1000; // 20 minutes

async function readBookings() {
  const bookings = (await redis.get(BOOKINGS_KEY)) || [];
  // Auto-expire pending bookings older than 20 minutes
  const now = Date.now();
  const active = bookings.filter(
    (b) => !b.pending || now - b.createdAt < TIMEOUT
  );
  if (active.length !== bookings.length) {
    await redis.set(BOOKINGS_KEY, active);
  }
  return active;
}

async function writeBookings(bookings) {
  await redis.set(BOOKINGS_KEY, bookings);
}

// GET - fetch all active bookings
export async function GET() {
  const bookings = await readBookings();
  const safe = bookings.map((b) => ({
    start: b.start,
    end: b.end,
    ref: b.ref,
    pending: b.pending,
  }));
  return NextResponse.json(safe);
}

// POST - create a new pending booking
export async function POST(request) {
  const body = await request.json();
  const { start, end, ref } = body;

  if (!start || !end || !ref) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const bookings = await readBookings();

  // Check for overlap with existing bookings
  const overlaps = bookings.some((b) => b.start <= end && b.end >= start);
  if (overlaps) {
    return NextResponse.json(
      { error: "Dates already booked" },
      { status: 409 }
    );
  }

  bookings.push({ start, end, ref, pending: true, createdAt: Date.now() });
  await writeBookings(bookings);

  return NextResponse.json({ ok: true });
}

// PATCH - update booking (e.g. mark as paid)
export async function PATCH(request) {
  const body = await request.json();
  const { ref, pending } = body;

  if (!ref) {
    return NextResponse.json({ error: "Missing ref" }, { status: 400 });
  }

  const bookings = await readBookings();
  const idx = bookings.findIndex((b) => b.ref === ref);
  if (idx === -1) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (typeof pending === "boolean") bookings[idx].pending = pending;
  await writeBookings(bookings);

  return NextResponse.json({ ok: true });
}

// DELETE - cancel a booking
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get("ref");

  if (!ref) {
    return NextResponse.json({ error: "Missing ref" }, { status: 400 });
  }

  const bookings = await readBookings();
  const filtered = bookings.filter((b) => b.ref !== ref);
  await writeBookings(filtered);

  return NextResponse.json({ ok: true });
}
