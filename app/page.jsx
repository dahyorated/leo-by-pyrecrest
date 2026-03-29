"use client";
import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION — Update these values for your deployment
// ═══════════════════════════════════════════════════════════════
const CONFIG = {
  name: "Leo by Pyrecrest",
  tagline: "A stylish 1-bedroom apartment in the heart of Somolu, Lagos — perfect for short stays, business trips, and getaways.",
  location: "Somolu, Lagos",
  nightlyRate: 60000,
  vatRate: 0.075,
  cautionDeposit: 20000,
  maxGuests: 3,
  checkInTime: "2:00 PM",
  checkOutTime: "12:00 PM",
  // Replace with your actual Flutterwave public key
  flutterwaveKey: process.env.NEXT_PUBLIC_FLUTTERWAVE_KEY,
  // Replace with your owner email for notifications
  ownerEmail: "pyrecrestng@gmail.com",
  // Replace with your EmailJS credentials for email notifications
  // Sign up at https://www.emailjs.com (free tier: 200 emails/month)
  emailjs: {
    serviceId: "service_sm0402u",
    ownerTemplateId: "template_bpowk6x",
    customerTemplateId: "template_ri54zjb",
    publicKey: "spaPwEbKkXXRcHgvN",
  },
  whatsapp: "+2347034375774",
  paymentUrl: "https://leo.pyrecrest.com",
};

// Replace with your actual apartment photos
const IMAGES = [
  { src: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=500&fit=crop", alt: "Living area" },
  { src: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=500&fit=crop", alt: "Bedroom" },
  { src: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop", alt: "Kitchen" },
  { src: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=500&fit=crop", alt: "Bathroom" },
  { src: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=500&fit=crop", alt: "View" },
];

const AMENITIES = [
  { icon: "wifi", label: "Fast WiFi", desc: "High-speed internet for work & streaming" },
  { icon: "zap", label: "24/7 Power", desc: "Uninterrupted electricity supply" },
  { icon: "chef-hat", label: "Full Kitchen", desc: "Fully equipped with cookware & utensils" },
  { icon: "shield", label: "24/7 Security", desc: "Gated compound with security" },
  { icon: "snowflake", label: "Air Conditioning", desc: "Cooling in bedroom & living room" },
  { icon: "battery", label: "Inverter Backup", desc: "Seamless power switchover" },
  { icon: "droplet", label: "Water Heater", desc: "Hot water available on demand" },
];

const HOUSE_RULES = [
  `Check-in from ${CONFIG.checkInTime}`,
  `Check-out by ${CONFIG.checkOutTime}`,
  `Maximum ${CONFIG.maxGuests} guests`,
  "No smoking inside the apartment",
  "No parties or loud music after 10 PM",
  "Pets not allowed",
  "Please treat the space with care",
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint}px)`);
    setMobile(mql.matches);
    const handler = (e) => setMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [breakpoint]);
  return mobile;
}

const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const fmtDisplay = (d) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const fmtNaira = (n) => "\u20A6" + n.toLocaleString("en-NG");
const diffDays = (a, b) => Math.round((b - a) / 864e5);
const sameDay = (a, b) => a && b && fmt(a) === fmt(b);
const today = () => { const d = new Date(); d.setHours(0,0,0,0); return d; };

function inRange(date, start, end) {
  if (!start || !end) return false;
  const d = fmt(date);
  return d >= fmt(start) && d <= fmt(end);
}

function rangeOverlaps(start, end, bookings) {
  const s = fmt(start), e = fmt(end);
  return bookings.some(b => b.start <= e && b.end >= s);
}

// ═══════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════
function Icon({ name, size = 20 }) {
  const d = {
    wifi: <><circle cx="12" cy="18" r="1.5" fill="currentColor"/><path d="M5 10c3.9-3.9 10.1-3.9 14 0M8 13c2.2-2.2 5.8-2.2 8 0" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></>,
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/>,
    "chef-hat": <><path d="M6 13V19M18 13V19M6 19H18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M6 13C6 10 4 8 4 6C4 3.8 5.8 2 8 2C9.1 2 10.1 2.5 10.8 3.2C11.2 2.5 12.1 2 13 2C14.5 2 15.8 3 16.2 4.3C16.5 4.1 16.9 4 17.3 4C19.4 4 21 5.8 21 8C21 10 18 13 18 13H6Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></>,
    shield: <><path d="M12 2L3 7V12C3 17.5 7 21.5 12 22.5C17 21.5 21 17.5 21 12V7L12 2Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M9 12L11 14L15 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></>,
    snowflake: <><path d="M12 2V22M12 2L9 5M12 2L15 5M12 22L9 19M12 22L15 19" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 12H22M2 12L5 9M2 12L5 15M22 12L19 9M22 12L19 15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></>,
    battery: <><rect x="2" y="7" width="16" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M22 11V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><rect x="5" y="10" width="8" height="4" rx="1" fill="currentColor"/></>,
    droplet: <><path d="M12 2C12 2 5 10 5 14.5C5 18.64 8.13 22 12 22C15.87 22 19 18.64 19 14.5C19 10 12 2 12 2Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M12 18C14.21 18 16 16.21 16 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></>,
    "map-pin": <><path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22S19 14.25 19 9C19 5.13 15.87 2 12 2Z" fill="none" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="9" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.8"/></>,
    bed: <><path d="M2 17V10M22 17V10M2 14H22M2 17H22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M4 14V10C4 9 5 8 6 8H10C11 8 12 9 12 10V14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></>,
    chevron: <path d="M9 18L15 12L9 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    star: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="currentColor" stroke="currentColor" strokeWidth="1"/>,
    check: <path d="M5 12L10 17L20 7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>,
    phone: <><path d="M22 16.92V19.92C22 20.48 21.56 20.93 21 20.97C20.5 21 20.01 21 19.5 21C10.4 21 3 13.6 3 4.5C3 3.99 3 3.5 3.03 3C3.07 2.44 3.52 2 4.08 2H7.08C7.56 2 7.97 2.34 8.05 2.81C8.14 3.4 8.3 3.97 8.52 4.51L7.02 6.01C8.27 8.43 10.57 10.73 12.99 11.98L14.49 10.48C15.03 10.7 15.6 10.86 16.19 10.95C16.66 11.03 17 11.44 17 11.92V16.92" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></>,
    mail: <><rect x="2" y="4" width="20" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M22 6L12 13L2 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></>,
    users: <><circle cx="9" cy="7" r="3" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M3 21V18C3 16.34 4.34 15 6 15H12C13.66 15 15 16.34 15 18V21" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="18" cy="8" r="2.5" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M21 21V19C21 17.69 20.04 16.58 18.76 16.17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></>,
    x: <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>,
    confetti: <><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M9 12L11 14L15 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>,
    whatsapp: <><path d="M12 2C6.48 2 2 6.48 2 12C2 14.17 2.74 16.17 4 17.77L2.5 22L6.84 20.54C8.35 21.48 10.11 22 12 22C17.52 22 22 17.52 22 12S17.52 2 12 2Z" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M8.5 10.5C8.5 10.5 9 12 10.5 13.5S13.5 15.5 13.5 15.5L15 14L17.5 16L16 18C14 18.5 10 17 7.5 14.5S5.5 10 6 8L8 6.5L10 9L8.5 10.5Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>{d[name]}</svg>;
}

// ═══════════════════════════════════════════════════════════════
// EMAIL SERVICE (using EmailJS)
// ═══════════════════════════════════════════════════════════════
async function sendPaymentConfirmationEmail(booking) {
  try {
    const params = {
      guest_name: booking.name, guest_email: booking.email, guest_phone: booking.phone,
      check_in: booking.checkIn, check_out: booking.checkOut, nights: booking.nights,
      total: booking.totalAmount, reference: booking.reference, to_email: CONFIG.ownerEmail,
      transaction_id: booking.transactionId,
    };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST", headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        service_id: CONFIG.emailjs.serviceId, template_id: CONFIG.emailjs.ownerTemplateId,
        user_id: CONFIG.emailjs.publicKey, template_params: params,
      }),
    });
    clearTimeout(timeout);
    return res.ok;
  } catch (e) { console.error("Payment confirmation email failed:", e); return false; }
}

async function sendCustomerPaymentEmail(booking) {
  try {
    const params = {
      guest_name: booking.name, guest_email: booking.email, guest_phone: booking.phone,
      check_in: booking.checkIn, check_out: booking.checkOut, nights: booking.nights,
      total: booking.totalAmount, reference: booking.reference, to_email: booking.email,
      transaction_id: booking.transactionId,
    };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST", headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        service_id: CONFIG.emailjs.serviceId, template_id: CONFIG.emailjs.customerTemplateId,
        user_id: CONFIG.emailjs.publicKey, template_params: params,
      }),
    });
    clearTimeout(timeout);
    return res.ok;
  } catch (e) { console.error("Customer payment email failed:", e); return false; }
}

// ═══════════════════════════════════════════════════════════════
// GALLERY
// ═══════════════════════════════════════════════════════════════
function Gallery() {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const [lightbox, setLightbox] = useState(false);
  const timer = useRef(null);

  const goTo = useCallback((i) => { setFade(false); setTimeout(() => { setIdx(i); setFade(true); }, 200); }, []);
  const next = useCallback(() => goTo((idx + 1) % IMAGES.length), [idx, goTo]);
  const prev = useCallback(() => goTo((idx - 1 + IMAGES.length) % IMAGES.length), [idx, goTo]);

  useEffect(() => {
    if (lightbox) return;
    timer.current = setInterval(next, 5000);
    return () => clearInterval(timer.current);
  }, [idx, lightbox, next]);

  const nb = (side) => ({
    position: "absolute", top: "50%", transform: "translateY(-50%)", [side]: 14,
    width: 42, height: 42, borderRadius: "50%", border: "none",
    background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)",
    color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
  });

  return (
    <>
      <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: 18, overflow: "hidden", background: "#111", cursor: "pointer" }}
        onClick={() => setLightbox(true)}>
        <img src={IMAGES[idx].src} alt={IMAGES[idx].alt}
          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "opacity 0.35s", opacity: fade ? 1 : 0 }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top,rgba(0,0,0,0.45) 0%,transparent 35%)" }} />
        <button onClick={e => { e.stopPropagation(); prev(); }} style={nb("left")}>
          <span style={{ transform: "rotate(180deg)", display: "flex" }}><Icon name="chevron" size={18}/></span>
        </button>
        <button onClick={e => { e.stopPropagation(); next(); }} style={nb("right")}><Icon name="chevron" size={18}/></button>
        <div style={{ position: "absolute", bottom: 18, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
          {IMAGES.map((_, i) => (
            <button key={i} onClick={e => { e.stopPropagation(); goTo(i); }}
              style={{ width: i === idx ? 28 : 8, height: 8, borderRadius: 4, border: "none", cursor: "pointer",
                background: i === idx ? "#fff" : "rgba(255,255,255,0.45)", transition: "all 0.3s" }} />
          ))}
        </div>
        <div style={{ position: "absolute", bottom: 18, right: 18, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
          borderRadius: 8, padding: "5px 12px", fontSize: 12, color: "#fff", fontWeight: 500 }}>
          {IMAGES[idx].alt} · {idx + 1}/{IMAGES.length}
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10, overflowX: "auto" }}>
        {IMAGES.map((img, i) => (
          <button key={i} onClick={() => goTo(i)}
            style={{ width: 72, height: 48, borderRadius: 10, overflow: "hidden",
              border: i === idx ? "2px solid #C8553D" : "2px solid transparent",
              cursor: "pointer", flexShrink: 0, padding: 0, background: "none", opacity: i === idx ? 1 : 0.6 }}>
            <img src={img.src} alt={img.alt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </button>
        ))}
      </div>
      {lightbox && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}
          onClick={() => setLightbox(false)}>
          <button onClick={() => setLightbox(false)}
            style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
            <Icon name="x" size={28}/></button>
          <img src={IMAGES[idx].src} alt={IMAGES[idx].alt}
            style={{ maxWidth: "90%", maxHeight: "80vh", objectFit: "contain", borderRadius: 12 }}
            onClick={e => e.stopPropagation()} />
          <div style={{ color: "#aaa", marginTop: 12, fontSize: 14 }}>{IMAGES[idx].alt} · {idx+1} of {IMAGES.length}</div>
          <button onClick={e => { e.stopPropagation(); prev(); }}
            style={{ ...nb("left"), left: 24, position: "fixed", top: "50%" }}>
            <span style={{ transform: "rotate(180deg)", display: "flex" }}><Icon name="chevron" size={22}/></span>
          </button>
          <button onClick={e => { e.stopPropagation(); next(); }}
            style={{ ...nb("right"), right: 24, position: "fixed", top: "50%" }}><Icon name="chevron" size={22}/></button>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
// CALENDAR
// ═══════════════════════════════════════════════════════════════
function Calendar({ checkIn, checkOut, onSelect, bookings }) {
  const [viewDate, setViewDate] = useState(() => new Date(today().getFullYear(), today().getMonth(), 1));
  const year = viewDate.getFullYear(), month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthLabel = viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const isBooked = (date) => { const ds = fmt(date); return bookings.some(b => ds >= b.start && ds <= b.end); };
  const canGoBack = () => new Date(year, month-1, 1) >= new Date(today().getFullYear(), today().getMonth(), 1);

  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <button onClick={() => canGoBack() && setViewDate(new Date(year,month-1,1))}
          style={{ ...calBtn, opacity: canGoBack() ? 1 : 0.3 }}>
          <span style={{ transform: "rotate(180deg)", display: "flex" }}><Icon name="chevron" size={15}/></span>
        </button>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>{monthLabel}</span>
        <button onClick={() => setViewDate(new Date(year,month+1,1))} style={calBtn}><Icon name="chevron" size={15}/></button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, textAlign: "center" }}>
        {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d =>
          <div key={d} style={{ fontSize: 10, fontWeight: 700, color: "#aaa", padding: "6px 0", textTransform: "uppercase", letterSpacing: "0.08em" }}>{d}</div>
        )}
        {days.map((date, i) => {
          if (!date) return <div key={`e${i}`}/>;
          const past = date < today();
          const booked = isBooked(date);
          const disabled = past || booked;
          const isStart = sameDay(date, checkIn);
          const isEnd = sameDay(date, checkOut);
          const selected = isStart || isEnd;
          const range = inRange(date, checkIn, checkOut);
          return (
            <button key={i} disabled={disabled} onClick={() => !disabled && onSelect(date)}
              style={{
                width: "100%", aspectRatio: "1", border: "none", borderRadius: 10, fontSize: 13,
                fontWeight: selected ? 700 : 400, cursor: disabled ? "default" : "pointer",
                background: selected ? "#C8553D" : range ? "rgba(200,85,61,0.08)" : "transparent",
                color: selected ? "#fff" : disabled ? "#d0d0d0" : range ? "#C8553D" : "#333",
                position: "relative", transition: "all 0.12s",
                textDecoration: booked && !past ? "line-through" : "none",
              }}>
              {date.getDate()}
              {booked && !past && <span style={{ position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)",
                width: 4, height: 4, borderRadius: "50%", background: "#e74c3c" }}/>}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 14, marginTop: 10, fontSize: 10, color: "#999" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "#C8553D" }}/> Selected</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "#e74c3c" }}/> Booked</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: "#d0d0d0" }}/> Past</span>
      </div>
    </div>
  );
}

const calBtn = { width: 30, height: 30, borderRadius: 8, border: "1px solid #eaeaea", background: "#fff",
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#555" };

// ═══════════════════════════════════════════════════════════════
// CONFIRMATION MODAL
// ═══════════════════════════════════════════════════════════════
function ConfirmationModal({ booking, onClose }) {
  if (!booking) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
      zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 24, padding: "40px 36px", maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(34,139,84,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#228B54" }}>
          <Icon name="confetti" size={32}/></div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Playfair Display',serif", marginBottom: 8 }}>Booking confirmed!</h2>
        <p style={{ fontSize: 14, color: "#888", marginBottom: 24, lineHeight: 1.6 }}>
          Payment received! A confirmation has been sent to <strong style={{ color: "#555" }}>{booking.email}</strong>
        </p>
        <div style={{ background: "#FAFAF8", borderRadius: 14, padding: "18px 20px", textAlign: "left", marginBottom: 24 }}>
          {[["Reference", booking.reference], ["Guest", booking.name], ["Check-in", booking.checkIn],
            ["Check-out", booking.checkOut], ["Duration", `${booking.nights} night${booking.nights>1?"s":""}`],
            ["Total paid", fmtNaira(booking.totalAmount)]].map(([l,v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 13, borderBottom: "1px solid #f0eeeb" }}>
              <span style={{ color: "#888" }}>{l}</span><span style={{ color: "#1a1a1a", fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
        <a href={`https://wa.me/${CONFIG.whatsapp.replace("+","")}?text=${encodeURIComponent(`Hi, I just booked ${CONFIG.name}. Reference: ${booking.reference}`)}`}
          target="_blank" rel="noopener noreferrer"
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", borderRadius: 12,
            background: "#25D366", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", marginBottom: 12 }}>
          <Icon name="whatsapp" size={18}/> Chat on WhatsApp
        </a><br/>
        <button onClick={onClose} style={{ marginTop: 8, padding: "10px 24px", borderRadius: 10, border: "1px solid #e0e0e0",
          background: "#fff", fontSize: 13, color: "#555", cursor: "pointer", fontWeight: 500 }}>Close</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BOOKING PANEL
// ═══════════════════════════════════════════════════════════════
function BookingPanel({ bookings, onBookingComplete, onBookingConfirmed, onBookingCancelled }) {
  const [checkIn, setCheckIn] = useState(null);
  const [checkOut, setCheckOut] = useState(null);
  const [selecting, setSelecting] = useState("checkin");
  const [guest, setGuest] = useState({ name: "", email: "", phone: "", guests: 1 });
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const [bookingRef, setBookingRef] = useState("");
  const [countdown, setCountdown] = useState(0);
  const cancelTimerRef = useRef(null);
  const countdownRef = useRef(null);

  function handleSelect(date) {
    setError("");
    if (selecting === "checkin") { setCheckIn(date); setCheckOut(null); setSelecting("checkout"); }
    else {
      if (date <= checkIn) { setError("Check-out must be after check-in"); return; }
      if (diffDays(checkIn, date) < 2) { setError("Minimum stay is 2 nights"); return; }
      if (rangeOverlaps(checkIn, date, bookings)) { setError("Selected range includes booked dates."); return; }
      setCheckOut(date); setSelecting("checkin");
    }
  }

  const nights = checkIn && checkOut ? diffDays(checkIn, checkOut) : 0;
  const subtotal = nights * CONFIG.nightlyRate;
  const vatPerNight = Math.round(CONFIG.nightlyRate - CONFIG.nightlyRate / (1 + CONFIG.vatRate));
  const basePerNight = CONFIG.nightlyRate - vatPerNight;
  const baseTotal = nights * basePerNight;
  const vatTotal = nights * vatPerNight;
  const total = subtotal + CONFIG.cautionDeposit;

  function goToDetails() {
    if (!checkIn || !checkOut) { setError("Please select check-in and check-out dates"); return; }
    setError(""); setStep(2);
  }
  function goToReview() {
    if (!guest.name.trim()) { setError("Please enter your full name"); return; }
    if (!guest.email.trim() || !guest.email.includes("@")) { setError("Please enter a valid email"); return; }
    if (!guest.phone.trim() || guest.phone.length < 10) { setError("Please enter a valid phone number"); return; }
    setError(""); setStep(3);
  }

  function clearTimers() {
    if (cancelTimerRef.current) { clearTimeout(cancelTimerRef.current); cancelTimerRef.current = null; }
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    setCountdown(0);
  }

  function startCancelTimer(ref) {
    const TIMEOUT_MS = 20 * 60 * 1000;
    setCountdown(20 * 60);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(countdownRef.current); countdownRef.current = null; return 0; }
        return prev - 1;
      });
    }, 1000);
    cancelTimerRef.current = setTimeout(() => {
      clearTimers();
      onBookingCancelled(ref);
      setCheckIn(null); setCheckOut(null); setGuest({ name: "", email: "", phone: "", guests: 1 });
      setStep(1); setBookingRef("");
      setError("Your booking was automatically cancelled because payment was not received within 20 minutes.");
    }, TIMEOUT_MS);
  }

  useEffect(() => {
    return () => clearTimers();
  }, []);

  async function handleConfirm() {
    setError(""); setProcessing(true);
    const ref = `LEO-${Date.now().toString(36).toUpperCase()}`;
    setBookingRef(ref);
    const data = {
      reference: ref, name: guest.name, email: guest.email, phone: guest.phone,
      checkIn: fmtDisplay(checkIn), checkOut: fmtDisplay(checkOut),
      checkInDate: fmt(checkIn), checkOutDate: fmt(checkOut),
      nights, totalAmount: total,
    };
    try {
      const result = await onBookingConfirmed(fmt(checkIn), fmt(checkOut), ref);
      if (result && result.error) {
        setError(result.error);
        setProcessing(false);
        setStep(1); setCheckIn(null); setCheckOut(null);
        return;
      }
    } catch (e) {
      console.error("Booking save failed:", e);
      setError("Failed to save booking. Please try again.");
      setProcessing(false);
      return;
    }
    setProcessing(false);
    setStep(4);
    startCancelTimer(ref);
  }

  function handlePay() {
    setError(""); setProcessing(true);
    const complete = (txId) => {
      clearTimers();
      const data = {
        reference: bookingRef, name: guest.name, email: guest.email, phone: guest.phone,
        checkIn: fmtDisplay(checkIn), checkOut: fmtDisplay(checkOut),
        checkInDate: fmt(checkIn), checkOutDate: fmt(checkOut),
        nights, totalAmount: total, transactionId: txId,
      };
      onBookingComplete(data);
      setCheckIn(null); setCheckOut(null); setGuest({ name: "", email: "", phone: "", guests: 1 }); setStep(1);
      setBookingRef("");
      setProcessing(false);
    };

    if (typeof window !== "undefined" && window.FlutterwaveCheckout) {
      window.FlutterwaveCheckout({
        public_key: CONFIG.flutterwaveKey, tx_ref: bookingRef, amount: total, currency: "NGN",
        payment_options: "card,banktransfer,ussd",
        customer: { email: guest.email, phone_number: guest.phone, name: guest.name },
        customizations: { title: CONFIG.name, description: `${nights} night${nights>1?"s":""} — ${fmtDisplay(checkIn)} to ${fmtDisplay(checkOut)}` },
        callback: (r) => { if (r.status === "successful" || r.status === "completed") complete(r.transaction_id); else setProcessing(false); },
        onclose: () => setProcessing(false),
      });
    } else {
      setError("Payment system is not available. Please refresh the page and try again.");
      setProcessing(false);
    }
  }

  return (
    <div style={{ background: "#fff", borderRadius: 22, border: "1px solid #eee", padding: 28, boxShadow: "0 8px 40px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
        <span style={{ fontSize: 28, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Playfair Display',serif" }}>{fmtNaira(CONFIG.nightlyRate)}</span>
        <span style={{ fontSize: 14, color: "#999" }}>/ night</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 6, fontSize: 13, color: "#C8553D" }}>
        {[...Array(5)].map((_,i) => <Icon key={i} name="star" size={13}/>)} <span style={{ color: "#888", marginLeft: 4 }}>5.0</span>
      </div>
      <div style={{ fontSize: 12, color: "#999", marginBottom: 22 }}>Minimum stay: 2 nights</div>

      {/* Step bar */}
      <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
        {["Dates","Details","Confirm","Payment"].map((l,i) => (
          <div key={l} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ height: 3, borderRadius: 2, background: step > i ? "#C8553D" : "#eee", transition: "background 0.3s", marginBottom: 6 }}/>
            <span style={{ fontSize: 10, fontWeight: 600, color: step > i ? "#C8553D" : "#bbb", textTransform: "uppercase", letterSpacing: "0.08em" }}>{l}</span>
          </div>
        ))}
      </div>

      {step === 1 && <>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", border: "1px solid #e4e4e4", borderRadius: 12, overflow: "hidden", marginBottom: 14 }}>
          {[["checkin","Check-in",checkIn],["checkout","Check-out",checkOut]].map(([k,l,v],i) => (
            <button key={k} onClick={() => setSelecting(k)}
              style={{ padding: "12px 14px", border: "none", borderRight: i===0?"1px solid #e4e4e4":"none",
                background: selecting===k?"rgba(200,85,61,0.04)":"#fff", cursor: "pointer", textAlign: "left" }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.1em" }}>{l}</div>
              <div style={{ fontSize: 14, fontWeight: 500, color: v?"#1a1a1a":"#ccc", marginTop: 3 }}>{v?fmtDisplay(v):"Select date"}</div>
            </button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "#C8553D", fontWeight: 500, marginBottom: 10, textAlign: "center" }}>
          {selecting==="checkin"?"Select your check-in date":"Now select your check-out date"}
        </div>
        <Calendar checkIn={checkIn} checkOut={checkOut} onSelect={handleSelect} bookings={bookings}/>
        {nights > 0 && (
          <div style={{ marginTop: 16, padding: "14px 16px", background: "#FAFAF8", borderRadius: 12, fontSize: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#666", marginBottom: 4 }}>
              <span>{fmtNaira(basePerNight)} x {nights} night{nights>1?"s":""}</span><span>{fmtNaira(baseTotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#666", marginBottom: 4 }}>
              <span>VAT (7.5% incl.)</span><span>{fmtNaira(vatTotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", color: "#666", marginBottom: 8 }}>
              <span>Caution deposit (refundable)</span><span>{fmtNaira(CONFIG.cautionDeposit)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "#1a1a1a",
              paddingTop: 8, borderTop: "1px solid #eee", fontSize: 15 }}>
              <span>Total</span><span>{fmtNaira(total)}</span>
            </div>
          </div>
        )}
        <button onClick={goToDetails} style={{ ...primaryBtn, marginTop: 16, opacity: nights>0?1:0.5 }}>Continue</button>
      </>}

      {step === 2 && <>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", marginBottom: 14 }}>Guest details</div>
        {[{k:"name",t:"text",p:"Full name",ic:"users"},{k:"email",t:"email",p:"Email address",ic:"mail"},{k:"phone",t:"tel",p:"Phone number (e.g. +234...)",ic:"phone"}].map(f => (
          <div key={f.k} style={{ position: "relative", marginBottom: 10 }}>
            <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#bbb" }}><Icon name={f.ic} size={16}/></div>
            <input type={f.t} placeholder={f.p} value={guest[f.k]}
              onChange={e => setGuest({...guest,[f.k]:e.target.value})} style={{ ...inputStyle, paddingLeft: 40 }}/>
          </div>
        ))}
        <div style={{ marginBottom: 10 }}>
          <label style={{ fontSize: 12, color: "#888", marginBottom: 4, display: "block" }}>Number of guests</label>
          <select value={guest.guests} onChange={e => setGuest({...guest,guests:+e.target.value})} style={{ ...inputStyle, cursor: "pointer" }}>
            {[...Array(CONFIG.maxGuests)].map((_,i) => <option key={i+1} value={i+1}>{i+1} guest{i>0?"s":""}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <button onClick={() => { setError(""); setStep(1); }} style={secondaryBtn}>Back</button>
          <button onClick={goToReview} style={{ ...primaryBtn, flex: 1 }}>Continue</button>
        </div>
      </>}

      {step === 3 && <>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a", marginBottom: 14 }}>Review & confirm your booking</div>
        <div style={{ background: "#FAFAF8", borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
          {[["Guest",guest.name],["Email",guest.email],["Phone",guest.phone],["Guests",`${guest.guests}`],
            ["Check-in",`${fmtDisplay(checkIn)} at ${CONFIG.checkInTime}`],["Check-out",`${fmtDisplay(checkOut)} at ${CONFIG.checkOutTime}`],
            ["Duration",`${nights} night${nights>1?"s":""}`]].map(([l,v]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13, borderBottom: "1px solid #f0eeeb" }}>
              <span style={{ color: "#999" }}>{l}</span>
              <span style={{ color: "#1a1a1a", fontWeight: 500, textAlign: "right", maxWidth: "60%", wordBreak: "break-word" }}>{v}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, marginTop: 6, fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>
            <span>Total</span><span>{fmtNaira(total)}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => { setError(""); setStep(2); }} style={secondaryBtn}>Back</button>
          <button onClick={handleConfirm} disabled={processing}
            style={{ ...primaryBtn, flex: 1, opacity: processing?0.6:1 }}>
            {processing ? "Confirming booking..." : "Confirm Booking"}
          </button>
        </div>
        <p style={{ fontSize: 10, color: "#bbb", textAlign: "center", marginTop: 10 }}>Confirmation emails will be sent to you and the host</p>
      </>}

      {step === 4 && <>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(34,139,84,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", color: "#228B54" }}>
            <Icon name="check" size={24}/></div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Playfair Display',serif" }}>Booking confirmed!</div>
          <div style={{ fontSize: 13, color: "#888", marginTop: 4 }}>Reference: <strong style={{ color: "#1a1a1a" }}>{bookingRef}</strong></div>
        </div>
        {countdown > 0 && (
          <div style={{ textAlign: "center", marginBottom: 14, padding: "10px 14px", background: countdown <= 120 ? "#FFF5F5" : "#FFFBF0",
            border: `1px solid ${countdown <= 120 ? "#FED7D7" : "#FEEBC8"}`, borderRadius: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: countdown <= 120 ? "#C53030" : "#C05621", marginBottom: 2 }}>Time remaining to pay</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: countdown <= 120 ? "#C53030" : "#C05621", fontVariantNumeric: "tabular-nums" }}>
              {String(Math.floor(countdown / 60)).padStart(2, "0")}:{String(countdown % 60).padStart(2, "0")}
            </div>
            <div style={{ fontSize: 10, color: countdown <= 120 ? "#E53E3E" : "#DD6B20", marginTop: 2 }}>
              Booking will be automatically cancelled if payment is not received in time
            </div>
          </div>
        )}
        <div style={{ background: "#FAFAF8", borderRadius: 14, padding: "16px 18px", marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13, borderBottom: "1px solid #f0eeeb" }}>
            <span style={{ color: "#999" }}>Check-in</span>
            <span style={{ color: "#1a1a1a", fontWeight: 500 }}>{fmtDisplay(checkIn)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 13, borderBottom: "1px solid #f0eeeb" }}>
            <span style={{ color: "#999" }}>Check-out</span>
            <span style={{ color: "#1a1a1a", fontWeight: 500 }}>{fmtDisplay(checkOut)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 10, marginTop: 6, fontSize: 16, fontWeight: 700, color: "#1a1a1a" }}>
            <span>Amount due</span><span>{fmtNaira(total)}</span>
          </div>
        </div>
        <button onClick={handlePay} disabled={processing}
          style={{ ...primaryBtn, marginTop: 4, opacity: processing?0.6:1 }}>
          {processing ? "Processing..." : `Pay ${fmtNaira(total)}`}
        </button>
        <p style={{ fontSize: 10, color: "#bbb", textAlign: "center", marginTop: 10 }}>Secured by Flutterwave · Your payment details are encrypted</p>
      </>}

      {error && <div style={{ marginTop: 12, padding: "10px 14px", background: "#FFF5F5", border: "1px solid #FED7D7",
        borderRadius: 10, fontSize: 13, color: "#C53030" }}>{error}</div>}
    </div>
  );
}

const primaryBtn = { width: "100%", padding: "15px 24px", border: "none", borderRadius: 12,
  background: "linear-gradient(135deg,#C8553D 0%,#A33B28 100%)", color: "#fff", fontSize: 15, fontWeight: 600,
  cursor: "pointer", boxShadow: "0 4px 20px rgba(200,85,61,0.25)", fontFamily: "inherit" };
const secondaryBtn = { padding: "15px 20px", borderRadius: 12, border: "1px solid #e0e0e0", background: "#fff",
  fontSize: 14, color: "#555", cursor: "pointer", fontWeight: 500, fontFamily: "inherit" };
const inputStyle = { width: "100%", padding: "12px 14px", border: "1px solid #eaeaea", borderRadius: 10,
  fontSize: 14, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "#333", background: "#FAFAFA" };

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function App() {
  const mobile = useIsMobile();
  const [bookings, setBookings] = useState([]);
  const [confirmation, setConfirmation] = useState(null);

  // Fetch bookings from server on mount and poll every 30s to stay in sync
  useEffect(() => {
    function fetchBookings() {
      fetch("/api/bookings").then(r => r.json()).then(setBookings).catch(() => {});
    }
    fetchBookings();
    const interval = setInterval(fetchBookings, 30000);
    return () => clearInterval(interval);
  }, []);

  async function handleBookingConfirmed(checkInDate, checkOutDate, ref) {
    // Save to server first, then update local state
    const res = await fetch("/api/bookings", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ start: checkInDate, end: checkOutDate, ref }),
    });
    if (!res.ok) {
      // Dates were taken by another user — refresh bookings
      const fresh = await fetch("/api/bookings").then(r => r.json());
      setBookings(fresh);
      return { error: "These dates were just booked by someone else. Please choose different dates." };
    }
    setBookings(prev => [...prev, { start: checkInDate, end: checkOutDate, ref, pending: true }]);
    return { ok: true };
  }

  async function handleBookingCancelled(ref) {
    await fetch(`/api/bookings?ref=${ref}`, { method: "DELETE" }).catch(() => {});
    setBookings(prev => prev.filter(b => b.ref !== ref));
  }

  async function handleBookingComplete(booking) {
    await fetch("/api/bookings", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ref: booking.reference, pending: false }),
    }).catch(() => {});
    setBookings(prev => prev.map(b => b.ref === booking.reference ? { ...b, pending: false } : b));
    setConfirmation(booking);
    // Send payment confirmation emails to customer and owner
    sendPaymentConfirmationEmail(booking).catch((e) => console.error("Owner payment email failed:", e));
    sendCustomerPaymentEmail(booking).catch((e) => console.error("Customer payment email failed:", e));
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAF8", fontFamily: "'DM Sans',sans-serif" }}>

      <ConfirmationModal booking={confirmation} onClose={() => setConfirmation(null)}/>

      <header style={{ padding: mobile ? "12px 16px" : "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid #f0eeeb", background: "rgba(250,250,248,0.92)", backdropFilter: "blur(16px)",
        position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src="/logo.png" alt="Pyrecrest logo" style={{ width: 38, height: 38, borderRadius: 10, objectFit: "cover" }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", letterSpacing: "-0.03em", lineHeight: 1.2 }}>Leo</div>
            <div style={{ fontSize: 9, fontWeight: 600, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.14em" }}>by Pyrecrest</div>
          </div>
        </div>
        <a href={`https://wa.me/${CONFIG.whatsapp.replace("+","")}`} target="_blank" rel="noopener noreferrer"
          style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#25D366",
            textDecoration: "none", fontWeight: 500, padding: "8px 14px", borderRadius: 10, border: "1px solid #e0e0e0" }}>
          <Icon name="whatsapp" size={16}/> Contact us
        </a>
      </header>

      <main style={{ maxWidth: 1120, margin: "0 auto", padding: mobile ? "20px 14px 60px" : "32px 24px 80px" }}>
        <div style={{ marginBottom: mobile ? 20 : 28, animation: "fadeUp 0.5s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            {[[`map-pin`, CONFIG.location], ["bed", "1 Bedroom"]].map(([ic,l]) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(200,85,61,0.08)",
                padding: "5px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, color: "#C8553D" }}>
                <Icon name={ic} size={13}/> {l}
              </div>
            ))}
          </div>
          <h1 style={{ fontSize: mobile ? 28 : 44, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Playfair Display',serif",
            letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 10 }}>
            Leo <span style={{ color: "#C8553D" }}>by Pyrecrest</span>
          </h1>
          <p style={{ fontSize: mobile ? 14 : 16, color: "#888", lineHeight: 1.65, maxWidth: 600 }}>{CONFIG.tagline}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "minmax(0,1fr) 400px", gap: mobile ? 20 : 32, alignItems: "start" }}>
          {mobile && (
            <div style={{ animation: "fadeUp 0.5s ease 0.1s both" }}>
              <BookingPanel bookings={bookings} onBookingComplete={handleBookingComplete}
                onBookingConfirmed={handleBookingConfirmed} onBookingCancelled={handleBookingCancelled}/>
            </div>
          )}
          <div style={{ animation: "fadeUp 0.5s ease 0.1s both" }}>
            <Gallery/>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: mobile ? 8 : 10, marginTop: mobile ? 14 : 18 }}>
              {[{ic:"bed",l:"1 Bedroom",s:"Queen-size bed"},{ic:"users",l:`Up to ${CONFIG.maxGuests}`,s:"Guests"},{ic:"star",l:"5.0 Rating",s:"Superhost"}].map(i => (
                <div key={i.l} style={{ background: "#fff", borderRadius: 14, padding: "16px 18px", border: "1px solid #f0eeeb" }}>
                  <div style={{ color: "#C8553D", marginBottom: 8 }}><Icon name={i.ic} size={18}/></div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>{i.l}</div>
                  <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{i.s}</div>
                </div>
              ))}
            </div>

            <section style={{ marginTop: mobile ? 16 : 24, background: "#fff", borderRadius: 18, border: "1px solid #f0eeeb", padding: mobile ? 20 : 28 }}>
              <h2 style={{ fontSize: mobile ? 18 : 20, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Playfair Display',serif", marginBottom: 14 }}>About this space</h2>
              <p style={{ fontSize: 14, color: "#666", lineHeight: 1.85 }}>
                Welcome to Leo by Pyrecrest — a thoughtfully designed 1-bedroom apartment in Somolu, Lagos.
                Whether you're visiting for business or leisure, this space offers everything you need for a comfortable stay.
                Enjoy fast WiFi for remote work, 24/7 uninterrupted power supply with inverter backup, air conditioning throughout,
                a fully equipped kitchen, hot water on demand, and round-the-clock security.
              </p>
            </section>

            <section style={{ marginTop: 16, background: "#fff", borderRadius: 18, border: "1px solid #f0eeeb", padding: mobile ? 20 : 28 }}>
              <h2 style={{ fontSize: mobile ? 18 : 20, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Playfair Display',serif", marginBottom: 16 }}>What this place offers</h2>
              <div style={{ display: "grid", gridTemplateColumns: mobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                {AMENITIES.map(a => (
                  <div key={a.label} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "#FAFAF8", borderRadius: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(200,85,61,0.07)",
                      display: "flex", alignItems: "center", justifyContent: "center", color: "#C8553D", flexShrink: 0 }}>
                      <Icon name={a.icon} size={18}/></div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{a.label}</div>
                      <div style={{ fontSize: 11, color: "#aaa" }}>{a.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section style={{ marginTop: 16, background: "#fff", borderRadius: 18, border: "1px solid #f0eeeb", padding: mobile ? 20 : 28 }}>
              <h2 style={{ fontSize: mobile ? 18 : 20, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Playfair Display',serif", marginBottom: 16 }}>House rules</h2>
              <div style={{ display: "grid", gap: 8 }}>
                {HOUSE_RULES.map(r => (
                  <div key={r} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#555" }}>
                    <span style={{ color: "#C8553D", flexShrink: 0 }}><Icon name="check" size={15}/></span> {r}
                  </div>
                ))}
              </div>
            </section>

            <section style={{ marginTop: 16, background: "#fff", borderRadius: 18, border: "1px solid #f0eeeb", padding: mobile ? 20 : 28 }}>
              <h2 style={{ fontSize: mobile ? 18 : 20, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Playfair Display',serif", marginBottom: 14 }}>Location</h2>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: "#666" }}>
                <Icon name="map-pin" size={16}/> Somolu, Lagos, Nigeria
              </div>
              <p style={{ fontSize: 13, color: "#999", marginTop: 8, lineHeight: 1.7 }}>
                Centrally located in Somolu with easy access to Yaba, Gbagada, and the Lagos mainland. Close to restaurants, supermarkets, and public transport.
              </p>
            </section>

            <section style={{ marginTop: 16, background: "#fff", borderRadius: 18, border: "1px solid #f0eeeb", padding: mobile ? 20 : 28, marginBottom: 20 }}>
              <h2 style={{ fontSize: mobile ? 18 : 20, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Playfair Display',serif", marginBottom: 14 }}>Cancellation policy</h2>
              <p style={{ fontSize: 13, color: "#666", lineHeight: 1.7 }}>
                Free cancellation up to 48 hours before check-in for a full refund. Cancellations within 48 hours are eligible for a 50% refund.
                No refund for no-shows. The caution deposit of {fmtNaira(CONFIG.cautionDeposit)} is fully refundable upon checkout if no damages are found.
              </p>
            </section>
          </div>

          {!mobile && (
            <div style={{ position: "sticky", top: 72, animation: "fadeUp 0.5s ease 0.2s both" }}>
              <BookingPanel bookings={bookings} onBookingComplete={handleBookingComplete}
                onBookingConfirmed={handleBookingConfirmed} onBookingCancelled={handleBookingCancelled}/>
            </div>
          )}
        </div>
      </main>

      <footer style={{ borderTop: "1px solid #f0eeeb", padding: mobile ? "20px 16px" : "28px 32px", background: "#fff" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
          ...(mobile ? { flexDirection: "column", textAlign: "center" } : {}) }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a1a", fontFamily: "'Playfair Display',serif" }}>
              Leo <span style={{ color: "#C8553D" }}>by Pyrecrest</span></div>
            <div style={{ fontSize: 12, color: "#bbb", marginTop: 4 }}>{CONFIG.location}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <a href={`mailto:${CONFIG.ownerEmail}`} style={{ color: "#888", textDecoration: "none", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
              <Icon name="mail" size={14}/> Email</a>
            <a href={`https://wa.me/${CONFIG.whatsapp.replace("+","")}`} target="_blank" rel="noopener noreferrer"
              style={{ color: "#25D366", textDecoration: "none", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
              <Icon name="whatsapp" size={14}/> WhatsApp</a>
          </div>
          <div style={{ fontSize: 11, color: "#ccc", width: "100%", textAlign: "center", marginTop: 8 }}>
            © 2026 Leo by Pyrecrest · Payments secured by Flutterwave</div>
        </div>
      </footer>
    </div>
  );
}
