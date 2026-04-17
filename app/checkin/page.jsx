"use client";
import { useState, useEffect, useRef } from "react";

const PRIMARY = "#C8553D";
const DARK = "#1a1a1a";
const LIGHT_BG = "#faf9f7";
const BORDER = "#e8e2da";

const POLICY = [
  { icon: "🚭", title: "No Smoking", body: "Smoking is strictly prohibited inside the apartment and on the balcony. A ₦50,000 cleaning fee applies for violations." },
  { icon: "🔇", title: "No Parties or Loud Gatherings", body: "Parties, loud music, and disruptive gatherings are not allowed at any time. Quiet hours are 10 PM – 7 AM." },
  { icon: "💰", title: "Caution / Security Deposit", body: "A caution deposit of ₦20,000 is charged with your booking. It is fully refundable after checkout, provided the apartment is in good condition." },
  { icon: "👥", title: "Maximum 3 Guests", body: "Only the number of guests stated at booking are allowed. Unregistered guests are not permitted on the premises." },
  { icon: "🕑", title: "Check-In & Check-Out Times", body: "Check-in is from 2:00 PM. Check-out is by 12:00 PM. Early check-in or late checkout must be arranged in advance and is subject to availability." },
  { icon: "🐾", title: "No Pets Allowed", body: "Pets of any kind are not permitted in the apartment." },
  { icon: "🏠", title: "Respect the Property", body: "Guests are responsible for any damage caused during their stay. Costs exceeding the caution deposit will be charged separately." },
  { icon: "🧹", title: "Keep It Clean", body: "Please maintain basic cleanliness. Dishes should be washed, rubbish disposed of properly, and the apartment left in a tidy state." },
];

function useIsMobile() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 768px)");
    setMobile(mql.matches);
    const h = (e) => setMobile(e.matches);
    mql.addEventListener("change", h);
    return () => mql.removeEventListener("change", h);
  }, []);
  return mobile;
}

export default function CheckInPage() {
  const isMobile = useIsMobile();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    name: "", email: "", phone: "", guests: "1",
    bookingRef: "", checkIn: "", checkInTime: "14:00",
    checkOut: "", checkOutTime: "12:00", idType: "",
    specialRequests: "", agreed: false,
  });
  const [idFile, setIdFile] = useState(null);
  const [idPreview, setIdPreview] = useState(null);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      alert("File too large. Please upload an image under 10 MB.");
      e.target.value = "";
      return;
    }
    setIdFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => setIdPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setIdPreview(null);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.agreed) { setErrorMsg("Please read and accept the house rules before submitting."); return; }
    if (!idFile) { setErrorMsg("Please upload a valid government-issued ID."); return; }
    setErrorMsg("");
    setStatus("submitting");

    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, String(v)));
      data.append("idFile", idFile, idFile.name);

      const res = await fetch("/api/checkin", { method: "POST", body: data });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || "Submission failed. Please try again.");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message);
    }
  }

  const inputStyle = {
    width: "100%", padding: "12px 14px", border: `1.5px solid ${BORDER}`,
    borderRadius: 8, fontSize: 15, fontFamily: "DM Sans, sans-serif",
    color: DARK, background: "#fff", outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s",
  };
  const labelStyle = { display: "block", fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 6, letterSpacing: "0.02em" };
  const fieldWrap = { marginBottom: 18 };

  if (status === "success") {
    return (
      <div style={{ minHeight: "100vh", background: LIGHT_BG, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ background: "#fff", borderRadius: 16, padding: isMobile ? "40px 24px" : "56px 48px", maxWidth: 480, width: "100%", textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 28, color: DARK, margin: "0 0 12px" }}>You're Checked In!</h2>
          <p style={{ fontSize: 15, color: "#666", lineHeight: 1.7, margin: "0 0 8px" }}>
            Your check-in details have been received. Our team will review your information and reach out if anything is needed.
          </p>
          <p style={{ fontSize: 14, color: "#888", margin: "0 0 32px" }}>
            Welcome to <strong style={{ color: DARK }}>Leo by Pyrecrest</strong>. We hope you enjoy your stay!
          </p>
          <a href="/" style={{ display: "inline-block", background: PRIMARY, color: "#fff", padding: "13px 28px", borderRadius: 8, textDecoration: "none", fontWeight: 600, fontSize: 15 }}>
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: LIGHT_BG, fontFamily: "DM Sans, sans-serif", color: DARK }}>
      <header style={{ background: "#fff", borderBottom: `1px solid ${BORDER}`, padding: isMobile ? "14px 20px" : "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo.png" alt="Leo by Pyrecrest" style={{ height: 32, objectFit: "contain" }} />
          {!isMobile && <span style={{ fontFamily: "Playfair Display, serif", fontSize: 18, color: DARK, fontWeight: 600 }}>Leo by Pyrecrest</span>}
        </a>
        <a href="/" style={{ fontSize: 14, color: PRIMARY, textDecoration: "none", fontWeight: 600 }}>← Back to site</a>
      </header>

      <main style={{ maxWidth: 720, margin: "0 auto", padding: isMobile ? "24px 16px 48px" : "40px 24px 64px" }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ display: "inline-block", background: `${PRIMARY}18`, color: PRIMARY, fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", padding: "6px 14px", borderRadius: 20, marginBottom: 14, textTransform: "uppercase" }}>Guest Check-In</div>
          <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: isMobile ? 30 : 40, margin: "0 0 12px", lineHeight: 1.2 }}>Welcome to Leo</h1>
          <p style={{ fontSize: 16, color: "#666", maxWidth: 480, margin: "0 auto", lineHeight: 1.7 }}>
            Please read our shortlet policy below, then complete your check-in details to confirm your arrival.
          </p>
        </div>

        <section style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: isMobile ? "24px 20px" : "32px 36px", marginBottom: 28 }}>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 22, margin: "0 0 4px" }}>House Rules & Shortlet Policy</h2>
          <p style={{ fontSize: 14, color: "#888", margin: "0 0 24px" }}>By completing check-in, you agree to these terms.</p>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16 }}>
            {POLICY.map((rule) => (
              <div key={rule.title} style={{ background: LIGHT_BG, borderRadius: 10, padding: "16px 18px", display: "flex", gap: 12 }}>
                <span style={{ fontSize: 22, flexShrink: 0, marginTop: 1 }}>{rule.icon}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: DARK, marginBottom: 4 }}>{rule.title}</div>
                  <div style={{ fontSize: 13, color: "#666", lineHeight: 1.6 }}>{rule.body}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 16, padding: isMobile ? "24px 20px" : "32px 36px" }}>
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 22, margin: "0 0 4px" }}>Your Details</h2>
          <p style={{ fontSize: 14, color: "#888", margin: "0 0 28px" }}>All fields are required unless marked optional.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "0 16px" }}>
              <div style={fieldWrap}>
                <label style={labelStyle}>Full Name</label>
                <input required style={inputStyle} placeholder="e.g. Chidera Okafor" value={form.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Email Address</label>
                <input required type="email" style={inputStyle} placeholder="you@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "0 16px" }}>
              <div style={fieldWrap}>
                <label style={labelStyle}>Phone Number</label>
                <input required type="tel" style={inputStyle} placeholder="+234 800 000 0000" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Number of Guests</label>
                <select required style={{ ...inputStyle, cursor: "pointer" }} value={form.guests} onChange={(e) => set("guests", e.target.value)}>
                  <option value="1">1 guest</option>
                  <option value="2">2 guests</option>
                  <option value="3">3 guests</option>
                </select>
              </div>
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>Booking Reference <span style={{ fontWeight: 400, color: "#aaa" }}>(Optional)</span></label>
              <input style={inputStyle} placeholder="e.g. LEO-20240417" value={form.bookingRef} onChange={(e) => set("bookingRef", e.target.value)} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "0 16px" }}>
              <div style={fieldWrap}>
                <label style={labelStyle}>Check-In Date</label>
                <input required type="date" style={inputStyle} value={form.checkIn} onChange={(e) => set("checkIn", e.target.value)} />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Expected Arrival Time</label>
                <input required type="time" style={inputStyle} value={form.checkInTime} onChange={(e) => set("checkInTime", e.target.value)} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "0 16px" }}>
              <div style={fieldWrap}>
                <label style={labelStyle}>Check-Out Date</label>
                <input required type="date" style={inputStyle} value={form.checkOut} onChange={(e) => set("checkOut", e.target.value)} />
              </div>
              <div style={fieldWrap}>
                <label style={labelStyle}>Expected Departure Time</label>
                <input required type="time" style={inputStyle} value={form.checkOutTime} onChange={(e) => set("checkOutTime", e.target.value)} />
              </div>
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>ID Type</label>
              <select required style={{ ...inputStyle, cursor: "pointer" }} value={form.idType} onChange={(e) => set("idType", e.target.value)}>
                <option value="">Select ID type</option>
                <option value="passport">International Passport</option>
                <option value="national_id">National Identity Card (NIN)</option>
                <option value="drivers_license">Driver's License</option>
                <option value="voters_card">Voter's Card</option>
              </select>
            </div>

            <div style={{ ...fieldWrap, marginBottom: 24 }}>
              <label style={labelStyle}>Upload Government-Issued ID</label>
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${idFile ? PRIMARY : BORDER}`, borderRadius: 10,
                  padding: "24px 20px", textAlign: "center", cursor: "pointer",
                  background: idFile ? `${PRIMARY}08` : "#fafafa", transition: "all 0.2s",
                }}
              >
                {idFile ? (
                  <div>
                    {idPreview && <img src={idPreview} alt="ID preview" style={{ maxHeight: 160, maxWidth: "100%", borderRadius: 6, marginBottom: 10, objectFit: "contain" }} />}
                    <div style={{ fontSize: 13, color: PRIMARY, fontWeight: 600 }}>{idFile.name}</div>
                    <div style={{ fontSize: 12, color: "#999", marginTop: 4 }}>Click to change</div>
                  </div>
                ) : (
                  <div>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>📎</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: DARK, marginBottom: 4 }}>Click to upload your ID</div>
                    <div style={{ fontSize: 13, color: "#999" }}>JPG, PNG or PDF · Max 10 MB</div>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*,application/pdf" style={{ display: "none" }} onChange={handleFile} />
            </div>

            <div style={fieldWrap}>
              <label style={labelStyle}>Special Requests <span style={{ fontWeight: 400, color: "#aaa" }}>(Optional)</span></label>
              <textarea
                style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                placeholder="Anything we should know? e.g. late arrival, allergies…"
                value={form.specialRequests}
                onChange={(e) => set("specialRequests", e.target.value)}
              />
            </div>

            <label style={{ display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", marginBottom: 24, padding: "16px 18px", background: `${PRIMARY}08`, borderRadius: 10, border: `1px solid ${form.agreed ? PRIMARY : BORDER}`, transition: "border-color 0.2s" }}>
              <input
                type="checkbox" checked={form.agreed} onChange={(e) => set("agreed", e.target.checked)}
                style={{ width: 18, height: 18, marginTop: 2, accentColor: PRIMARY, flexShrink: 0 }}
              />
              <span style={{ fontSize: 14, color: DARK, lineHeight: 1.6 }}>
                I have read and agree to the <strong>house rules and shortlet policy</strong> above. I understand that violations may result in additional charges or eviction without refund.
              </span>
            </label>

            {(status === "error" || errorMsg) && (
              <div style={{ background: "#fff0ee", border: "1px solid #f5c5c0", color: "#b94040", borderRadius: 8, padding: "12px 16px", fontSize: 14, marginBottom: 20 }}>
                {errorMsg || "Something went wrong. Please try again."}
              </div>
            )}

            <button
              type="submit" disabled={status === "submitting"}
              style={{
                width: "100%", background: status === "submitting" ? "#b07060" : PRIMARY,
                color: "#fff", border: "none", borderRadius: 10, padding: "15px 24px",
                fontSize: 16, fontWeight: 700, cursor: status === "submitting" ? "not-allowed" : "pointer",
                fontFamily: "DM Sans, sans-serif", letterSpacing: "0.02em", transition: "background 0.2s",
              }}
            >
              {status === "submitting" ? "Submitting…" : "Complete Check-In →"}
            </button>

            <p style={{ textAlign: "center", fontSize: 13, color: "#aaa", marginTop: 14 }}>
              Your ID is securely transmitted and used only for identity verification.
            </p>
          </form>
        </section>

        <p style={{ textAlign: "center", fontSize: 13, color: "#aaa", marginTop: 24 }}>
          Questions? Reach us on{" "}
          <a href="https://wa.me/2348026813305" style={{ color: PRIMARY, textDecoration: "none", fontWeight: 600 }}>WhatsApp</a>
          {" "}or{" "}
          <a href="mailto:pyrecrestng@gmail.com" style={{ color: PRIMARY, textDecoration: "none", fontWeight: 600 }}>email</a>.
        </p>
      </main>
    </div>
  );
}
