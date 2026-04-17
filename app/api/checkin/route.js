import { NextResponse } from "next/server";

const OWNER_EMAIL = "pyrecrestng@gmail.com";

const ID_LABELS = {
  passport: "International Passport",
  national_id: "National Identity Card (NIN)",
  drivers_license: "Driver's License",
  voters_card: "Voter's Card",
};

export async function POST(request) {
  try {
    const data = await request.formData();

    const name = data.get("name");
    const email = data.get("email");
    const phone = data.get("phone");
    const guests = data.get("guests");
    const bookingRef = data.get("bookingRef");
    const checkIn = data.get("checkIn");
    const checkInTime = data.get("checkInTime");
    const checkOut = data.get("checkOut");
    const checkOutTime = data.get("checkOutTime");
    const idType = data.get("idType");
    const specialRequests = data.get("specialRequests");
    const idFile = data.get("idFile");

    if (!name || !email || !phone || !checkIn || !checkOut || !idType || !idFile) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const fileBytes = await idFile.arrayBuffer();
    const fileBase64 = Buffer.from(fileBytes).toString("base64");
    const fileName = idFile.name || `id-${Date.now()}.jpg`;

    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1a1a1a">
        <div style="background:#C8553D;padding:24px 32px;border-radius:12px 12px 0 0">
          <h1 style="color:#fff;margin:0;font-size:22px">New Guest Check-In</h1>
          <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px">Leo by Pyrecrest</p>
        </div>
        <div style="background:#fff;padding:32px;border:1px solid #e8e2da;border-top:none;border-radius:0 0 12px 12px">
          <table style="width:100%;border-collapse:collapse;font-size:15px">
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0ebe4;color:#888;width:40%">Full Name</td><td style="padding:10px 0;border-bottom:1px solid #f0ebe4;font-weight:600">${name}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0ebe4;color:#888">Email</td><td style="padding:10px 0;border-bottom:1px solid #f0ebe4">${email}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0ebe4;color:#888">Phone</td><td style="padding:10px 0;border-bottom:1px solid #f0ebe4">${phone}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0ebe4;color:#888">Guests</td><td style="padding:10px 0;border-bottom:1px solid #f0ebe4">${guests}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0ebe4;color:#888">Booking Ref</td><td style="padding:10px 0;border-bottom:1px solid #f0ebe4">${bookingRef || "—"}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0ebe4;color:#888">Check-In</td><td style="padding:10px 0;border-bottom:1px solid #f0ebe4">${checkIn} at ${checkInTime}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0ebe4;color:#888">Check-Out</td><td style="padding:10px 0;border-bottom:1px solid #f0ebe4">${checkOut} at ${checkOutTime}</td></tr>
            <tr><td style="padding:10px 0;border-bottom:1px solid #f0ebe4;color:#888">ID Type</td><td style="padding:10px 0;border-bottom:1px solid #f0ebe4">${ID_LABELS[idType] || idType}</td></tr>
            <tr><td style="padding:10px 0;color:#888">Special Requests</td><td style="padding:10px 0">${specialRequests || "None"}</td></tr>
          </table>
          <p style="margin:24px 0 0;font-size:13px;color:#aaa">The guest's ID document is attached to this email.</p>
        </div>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Leo Check-In <checkin@leo.pyrecrest.com>",
        to: [OWNER_EMAIL],
        subject: `New Check-In: ${name} — ${checkIn}`,
        html,
        attachments: [{ filename: fileName, content: fileBase64 }],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Resend error:", err);
      return NextResponse.json({ error: "Failed to send email." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Check-in error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
