import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "bookings.json");

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf-8");
}

function readBookings() {
  ensureDataDir();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    const bookings = JSON.parse(raw);
    // Auto-expire pending bookings older than 20 minutes
    const now = Date.now();
    const TIMEOUT = 20 * 60 * 1000;
    const active = bookings.filter(
      (b) => !b.pending || now - b.createdAt < TIMEOUT
    );
    // Write back if any were removed
    if (active.length !== bookings.length) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(active, null, 2), "utf-8");
    }
    return active;
  } catch {
    return [];
  }
}

function writeBookings(bookings) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(bookings, null, 2), "utf-8");
}

// GET - fetch all active bookings
export async function GET() {
  const bookings = readBookings();
  // Only return fields needed by the calendar (don't expose guest details)
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

  const bookings = readBookings();

  // Check for overlap with existing bookings
  const overlaps = bookings.some((b) => b.start <= end && b.end >= start);
  if (overlaps) {
    return NextResponse.json(
      { error: "Dates already booked" },
      { status: 409 }
    );
  }

  bookings.push({ start, end, ref, pending: true, createdAt: Date.now() });
  writeBookings(bookings);

  return NextResponse.json({ ok: true });
}

// PATCH - update booking (e.g. mark as paid)
export async function PATCH(request) {
  const body = await request.json();
  const { ref, pending } = body;

  if (!ref) {
    return NextResponse.json({ error: "Missing ref" }, { status: 400 });
  }

  const bookings = readBookings();
  const idx = bookings.findIndex((b) => b.ref === ref);
  if (idx === -1) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (typeof pending === "boolean") bookings[idx].pending = pending;
  writeBookings(bookings);

  return NextResponse.json({ ok: true });
}

// DELETE - cancel a booking
export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const ref = searchParams.get("ref");

  if (!ref) {
    return NextResponse.json({ error: "Missing ref" }, { status: 400 });
  }

  const bookings = readBookings();
  const filtered = bookings.filter((b) => b.ref !== ref);
  writeBookings(filtered);

  return NextResponse.json({ ok: true });
}
