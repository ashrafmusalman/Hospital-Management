import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar     from "../src/components/Navbar";
import HeroSlider from "../src/components/HeroSlider";
import "../styles/portal.css";

const HOSPITALS = [
  { name: "MediCare – Ahmedabad Main", img: "/image1.jpg", tag: "NABH Accredited" },
  { name: "MediCare – Gandhinagar",    img: "/image2.jpg", tag: "NABH Accredited" },
  { name: "MediCare – Surat",          img: "/image3.jpg", tag: "NABH Accredited" },
  { name: "MediCare – Vadodara",       img: "/image4.jpg", tag: "NABH Accredited" },
];

const BLOGS = [
  { title: "Early Signs of Heart Disease You Should Never Ignore",   img: "/image5.jpg", date: "May 10, 2025",  tag: "Cardiology"   },
  { title: "Joint Pain: When Is It Time to See a Doctor?",           img: "/image6.jpg", date: "Apr 28, 2025", tag: "Orthopaedics" },
  { title: "Chest Pain Causes: Is It Your Heart or Something Else?", img: "/image7.jpg", date: "Apr 15, 2025", tag: "Cardiology"   },
  { title: "Kidney Disease Warning Signs You Must Know Early",       img: "/image4.jpg", date: "Mar 30, 2025", tag: "Renal"        },
];

const SPECIALITIES = [
  { icon: "❤️",  name: "Cardiac Sciences",           desc: "Heart attack care, angioplasty & bypass surgery."   },
  { icon: "🍽️", name: "Gastro Sciences",             desc: "Digestive disorders, endoscopy & liver care."       },
  { icon: "🧠",  name: "Neuro Sciences",              desc: "Stroke, epilepsy, brain & spine treatment."         },
  { icon: "🎗️", name: "Onco Sciences",               desc: "Medical, surgical & radiation oncology."            },
  { icon: "🦴",  name: "Orthopaedics & Trauma",       desc: "Joint replacement, fractures & sports injuries."    },
  { icon: "🫘",  name: "Renal Sciences",              desc: "Kidney disease, dialysis & transplantation."        },
  { icon: "🤖",  name: "Robotic Surgery",             desc: "Minimally invasive precision robotic procedures."   },
  { icon: "🫀",  name: "Solid Organ Transplantation", desc: "Kidney, liver & heart transplant expertise."        },
];

const API_BASE = "http://localhost:8000";

const getImageUrl = (imagePath) => {
  if (!imagePath) return "/image1.jpg";
  const parts = imagePath.split("/");
  const encoded = parts.map(encodeURIComponent).join("/");
  return `${API_BASE}/${encoded}`;
};

const getInitials = (name = "") =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

const S = {
  section: (bg = "#fff") => ({ padding: "88px 0", background: bg }),
  inner: { maxWidth: 1160, margin: "0 auto", padding: "0 5%" },
  eyebrow: {
    display: "inline-flex", alignItems: "center", gap: 7,
    fontSize: 11, fontWeight: 700, letterSpacing: ".1em",
    textTransform: "uppercase", color: "var(--green)", marginBottom: 14,
  },
  eyebrowDot: {
    width: 6, height: 6, borderRadius: "50%",
    background: "var(--green)", display: "inline-block",
  },
  heading: {
    fontSize: "clamp(1.9rem, 3.5vw, 2.6rem)", fontWeight: 800,
    color: "#0f172a", letterSpacing: "-.03em", lineHeight: 1.1, marginBottom: 12,
  },
  headingAccent: { color: "var(--green)" },
  subtext: { fontSize: 15, color: "#64748b", lineHeight: 1.8, maxWidth: "50ch" },
  divider: {
    width: 40, height: 3, background: "var(--green)",
    borderRadius: 2, margin: "16px 0 20px",
  },
  splitHeader: {
    display: "flex", alignItems: "flex-end", justifyContent: "space-between",
    gap: 24, marginBottom: 40, flexWrap: "wrap",
  },
};

export default function Dashboard() {
  const [doctors, setDoctors]               = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(true);
  const [doctorsError, setDoctorsError]     = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/admin/doctors/list_doctors`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((d) => { setDoctors(d); setDoctorsLoading(false); })
      .catch(() => { setDoctorsError("Unable to load doctors."); setDoctorsLoading(false); });
  }, []);

  return (
    <div className="page-shell" style={{ background: "#f8fafc" }}>
      <Navbar />
      <HeroSlider />

      {/* ── STATS STRIP ── */}
      <div style={{
        background: "#0f172a",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        padding: "0 5%",
      }}>
        {[
          { num: "25,000+", lbl: "Patients Treated",   icon: "🧑‍⚕️" },
          { num: "200+",    lbl: "Specialists",         icon: "👨‍⚕️" },
          { num: "18+",     lbl: "Years of Excellence", icon: "🏆"  },
          { num: "12",      lbl: "Operation Theatres",  icon: "🏥"  },
        ].map((s, i) => (
          <div key={s.lbl} style={{
            padding: "28px 20px", textAlign: "center",
            borderRight: i < 3 ? "1px solid rgba(255,255,255,.08)" : "none",
          }}>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: "clamp(1.6rem,3vw,2rem)", fontWeight: 800, color: "#fff", lineHeight: 1 }}>{s.num}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".07em", marginTop: 7 }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* ── ABOUT ── */}
      <section style={S.section("#fff")}>
        <div style={S.inner}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "start" }}>

            {/* Left */}
            <div>
              <div style={S.eyebrow}><span style={S.eyebrowDot} />About Us</div>
              <h2 style={S.heading}>Why Choose<br /><span style={S.headingAccent}>MediCare?</span></h2>
              <div style={S.divider} />
              <p style={S.subtext}>
                Gujarat's first NABH-accredited private hospital with over 18 years of excellence
                in patient care. Managed by compassionate professionals ensuring accessible,
                world-class healthcare.
              </p>
              <div style={{ display: "grid", gap: 14, marginTop: 32 }}>
                {[
                  { icon: "🏆", title: "NABH Accredited",      desc: "Nationally accredited for quality and patient safety standards."              },
                  { icon: "🤝", title: "Transparent & Ethical", desc: "Honest communication, transparent billing, and a patient-first approach."     },
                  { icon: "⚙️", title: "Modern Infrastructure", desc: "Equipped with state-of-the-art facilities and cutting-edge technology."       },
                ].map((f) => (
                  <div key={f.title} style={{
                    display: "flex", alignItems: "flex-start", gap: 16,
                    padding: "18px 20px", background: "#f8fafc",
                    border: "1px solid #e2e8f0", borderRadius: 14,
                    transition: "border-color .2s, box-shadow .2s",
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--green)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(22,163,74,.08)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#e2e8f0"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{
                      width: 42, height: 42, borderRadius: 11,
                      background: "var(--green-light)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18, flexShrink: 0,
                    }}>{f.icon}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{f.title}</div>
                      <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.65 }}>{f.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Specialities */}
            <div>
              <div style={S.eyebrow}><span style={S.eyebrowDot} />Departments</div>
              <h3 style={{ ...S.heading, fontSize: "clamp(1.5rem,2.5vw,1.9rem)" }}>
                Our <span style={S.headingAccent}>Specialities</span>
              </h3>
              <div style={S.divider} />
              <p style={{ ...S.subtext, marginBottom: 28 }}>
                From routine check-ups to specialised treatments — personalised care for every need.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {SPECIALITIES.map((s) => (
                  <div key={s.name} style={{
                    background: "#fff", border: "1px solid #e2e8f0",
                    borderRadius: 14, padding: "18px 16px",
                    transition: "all .22s", cursor: "default",
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--green-mid)";
                      e.currentTarget.style.boxShadow = "0 6px 24px rgba(22,163,74,.10)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.background = "#f0fdf4";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.background = "#fff";
                    }}
                  >
                    <div style={{ fontSize: 24, marginBottom: 10 }}>{s.icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 5 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.6 }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── OUR DOCTORS ── */}
      <section style={S.section("#f8fafc")}>
        <div style={S.inner}>
          <div style={S.splitHeader}>
            <div>
              <div style={S.eyebrow}><span style={S.eyebrowDot} />Meet Our Team</div>
              <h2 style={S.heading}>Our <span style={S.headingAccent}>Doctors</span></h2>
              <div style={S.divider} />
              <p style={S.subtext}>
                Our physicians are committed to delivering personalised care — from routine check-ups to complex procedures.
              </p>
            </div>
            <Link to="/dashboard/doctors" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "var(--green)", color: "#fff",
              padding: "12px 24px", borderRadius: 10,
              fontSize: 14, fontWeight: 700, textDecoration: "none", flexShrink: 0,
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--green-dark)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "var(--green)"; e.currentTarget.style.transform = "none"; }}
            >
              Find a Doctor →
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 18 }}>

            {doctorsLoading && (
              <p style={{ color: "#94a3b8", fontSize: 13, gridColumn: "span 5" }}>Loading doctors…</p>
            )}
            {doctorsError && (
              <p style={{ color: "#ef4444", fontSize: 13, gridColumn: "span 5" }}>{doctorsError}</p>
            )}

            {!doctorsLoading && !doctorsError && doctors.slice(0, 4).map((d) => (
              <Link key={d.id} to={`/dashboard/doctors/${d.id}`} style={{ textDecoration: "none" }}>
                <div style={{
                  background: "#fff", border: "1px solid #e2e8f0",
                  borderRadius: 18, overflow: "hidden",
                  transition: "all .25s", height: "100%",
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-6px)";
                    e.currentTarget.style.boxShadow = "0 20px 40px rgba(22,163,74,.13)";
                    e.currentTarget.style.borderColor = "var(--green-mid)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "none";
                    e.currentTarget.style.borderColor = "#e2e8f0";
                  }}
                >
                  {/* Photo */}
                  <div style={{ height: 190, position: "relative", overflow: "hidden", background: "var(--green-light)" }}>
                    {d.image ? (
                      <img
                        src={getImageUrl(d.image)}
                        alt={d.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    ) : (
                      <div style={{
                        width: "100%", height: "100%",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <div style={{
                          width: 64, height: 64, borderRadius: "50%",
                          background: "var(--green)", color: "#fff",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 20, fontWeight: 800,
                        }}>
                          {getInitials(d.name)}
                        </div>
                      </div>
                    )}
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(to top, rgba(15,23,42,.45) 0%, transparent 55%)",
                      pointerEvents: "none",
                    }} />
                  </div>

                  {/* Info */}
                  <div style={{ padding: "16px 16px 18px" }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>{d.name}</div>
                    <span style={{
                      display: "inline-block",
                      background: "var(--green-light)", color: "var(--green-dark)",
                      fontSize: 11, fontWeight: 700,
                      padding: "3px 10px", borderRadius: 999, marginBottom: 14,
                    }}>
                      {d.specialization}
                    </span>
                    <div style={{
                      textAlign: "center", background: "#f8fafc",
                      border: "1px solid #e2e8f0", borderRadius: 8, padding: "8px",
                      fontSize: 12, fontWeight: 700, color: "var(--green)",
                    }}>
                      View Profile →
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* View All card */}
            <Link to="/dashboard/doctors" style={{ textDecoration: "none" }}>
              <div style={{
                height: "100%", minHeight: 280,
                background: "var(--green-light)",
                border: "1.5px dashed var(--green-mid)",
                borderRadius: 18,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column", gap: 10, textAlign: "center", padding: 24,
                transition: "all .22s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#dcfce7"; e.currentTarget.style.borderStyle = "solid"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--green-light)"; e.currentTarget.style.borderStyle = "dashed"; }}
              >
                <div style={{ fontSize: 32 }}>👨‍⚕️</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "var(--green-dark)" }}>View All Doctors</div>
                <div style={{ fontSize: 12, color: "var(--green-dark)", opacity: .7 }}>200+ specialists available</div>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ── OUR HOSPITALS ── */}
      <section style={S.section("#fff")}>
        <div style={S.inner}>
          <div style={S.splitHeader}>
            <div>
              <div style={S.eyebrow}><span style={S.eyebrowDot} />Our Locations</div>
              <h2 style={S.heading}>Our <span style={S.headingAccent}>Hospitals</span></h2>
              <div style={S.divider} />
              <p style={S.subtext}>
                Choose a MediCare hospital near you for world-class care by our best professionals.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
            {HOSPITALS.map((h) => (
              <div key={h.name} style={{
                background: "#fff", border: "1px solid #e2e8f0",
                borderRadius: 16, overflow: "hidden", transition: "all .22s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 36px rgba(22,163,74,.10)"; e.currentTarget.style.borderColor = "var(--green-mid)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
              >
                {/* Image */}
                <div style={{ height: 160, position: "relative", overflow: "hidden", background: "#e2e8f0" }}>
                  <img
                    src={h.img}
                    alt={h.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                  <span style={{
                    position: "absolute", top: 12, left: 12,
                    background: "var(--green)", color: "#fff",
                    fontSize: 10, fontWeight: 700,
                    padding: "4px 10px", borderRadius: 4,
                    textTransform: "uppercase", letterSpacing: ".06em",
                  }}>{h.tag}</span>
                </div>
                <div style={{ padding: "14px 16px 18px" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 10 }}>{h.name}</div>
                  <div style={{ display: "flex", gap: 14, fontSize: 12, fontWeight: 600, color: "var(--green)" }}>
                    <span style={{ cursor: "pointer" }}>📞 View Details</span>
                    <span style={{ cursor: "pointer" }}>📍 Directions</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICE BANNER ── */}
      <section style={{ padding: "72px 0", background: "#f8fafc" }}>
        <div style={S.inner}>
          <div style={{ background: "#0f172a", borderRadius: 24, padding: "52px 48px", textAlign: "center" }}>
            <span style={{
              display: "inline-block",
              background: "rgba(22,163,74,.2)", color: "#4ade80",
              fontSize: 11, fontWeight: 700, letterSpacing: ".1em",
              textTransform: "uppercase", padding: "5px 16px",
              borderRadius: 999, marginBottom: 18,
            }}>
              Patient Success & Services
            </span>
            <h2 style={{
              fontSize: "clamp(1.7rem,3vw,2.4rem)", fontWeight: 800,
              color: "#fff", letterSpacing: "-.03em", marginBottom: 12,
            }}>
              Transforming Lives with <span style={{ color: "#4ade80" }}>Expert Care</span>
            </h2>
            <p style={{ fontSize: 15, color: "#94a3b8", lineHeight: 1.8, maxWidth: "52ch", margin: "0 auto 40px" }}>
              Explore our comprehensive healthcare services and the stories of patients whose lives we've helped transform.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, textAlign: "left" }}>
              {[
                { bg: "var(--green)", ico: "🏥", title: "Our Procedures",        desc: "Comprehensive surgical procedures and progressive treatment options.", link: "View All Procedures →" },
                { bg: "#1d4ed8",      ico: "✈️", title: "International Patients", desc: "Comprehensive support for patients travelling from abroad.",          link: "Learn More →"          },
                { bg: "#1e293b",      ico: "📞", title: "Need Assistance?",       desc: "Our team is available 24/7 to help you with any query.",              link: "Contact Us →"           },
              ].map((c) => (
                <div key={c.title} style={{
                  background: c.bg, borderRadius: 16, padding: "26px 22px",
                  display: "flex", flexDirection: "column", gap: 10,
                  border: c.bg === "#1e293b" ? "1px solid rgba(255,255,255,.07)" : "none",
                }}>
                  <div style={{ fontSize: 28 }}>{c.ico}</div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>{c.title}</div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,.78)", lineHeight: 1.65, flex: 1 }}>{c.desc}</div>
                  <a href="#" style={{ color: "rgba(255,255,255,.9)", fontSize: 13, fontWeight: 700, textDecoration: "none", marginTop: 6 }}>{c.link}</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HEALTH BLOGS ── */}
      <section style={S.section("#fff")}>
        <div style={S.inner}>
          <div style={S.splitHeader}>
            <div>
              <div style={S.eyebrow}><span style={S.eyebrowDot} />Knowledge Hub</div>
              <h2 style={S.heading}>Health <span style={S.headingAccent}>Blogs</span></h2>
              <div style={S.divider} />
              <p style={S.subtext}>Dive into our latest articles — stay updated on healthcare and wellness.</p>
              <a href="#" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "var(--green)", color: "#fff",
                padding: "11px 22px", borderRadius: 10,
                fontSize: 13, fontWeight: 700, textDecoration: "none", marginTop: 22,
              }}>
                View All Articles →
              </a>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, flex: 1, maxWidth: 680 }}>
              {BLOGS.map((b) => (
                <div key={b.title} style={{
                  background: "#fff", border: "1px solid #e2e8f0",
                  borderRadius: 14, overflow: "hidden", transition: "all .22s",
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 10px 28px rgba(22,163,74,.10)"; e.currentTarget.style.borderColor = "var(--green-mid)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#e2e8f0"; }}
                >
                  {/* Image */}
                  <div style={{ height: 130, position: "relative", overflow: "hidden", background: "#e2e8f0" }}>
                    <img
                      src={b.img}
                      alt={b.title}
                      style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                    <span style={{
                      position: "absolute", top: 10, left: 10,
                      background: "rgba(15,23,42,.75)", color: "#fff",
                      fontSize: 10, fontWeight: 700, padding: "3px 9px", borderRadius: 4,
                    }}>{b.tag}</span>
                  </div>
                  <div style={{ padding: "14px 16px 16px" }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 6, fontWeight: 600 }}>{b.date}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", lineHeight: 1.5, marginBottom: 10 }}>{b.title}</div>
                    <a href="#" style={{ fontSize: 12, color: "var(--green)", fontWeight: 700, textDecoration: "none" }}>Read More →</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0f172a", color: "#94a3b8" }}>
        <div style={{
          maxWidth: 1160, margin: "0 auto",
          padding: "56px 5% 40px",
          display: "grid",
          gridTemplateColumns: "2.2fr 1fr 1fr 1.3fr",
          gap: 44,
        }}>

          {/* Brand */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "var(--green)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 20, fontWeight: 900,
              }}>+</div>
              <div style={{ lineHeight: 1.2 }}>
                <strong style={{ display: "block", fontSize: 16, fontWeight: 800, color: "#fff" }}>MediCare</strong>
                <span style={{ fontSize: 10, fontWeight: 600, color: "var(--green)", textTransform: "uppercase", letterSpacing: ".08em" }}>Hospitals</span>
              </div>
            </div>
            <p style={{ fontSize: 13, color: "#64748b", lineHeight: 1.8, maxWidth: "32ch" }}>
              Providing compassionate, world-class healthcare since 2005. Your health is our highest priority.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
              <span>📞 +91 1800 200 3000</span>
              <span>✉️ info@medicare.in</span>
            </div>
          </div>

          {/* Patient Portal */}
          <div>
            <h4 style={{ color: "#fff", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 18, paddingBottom: 10, borderBottom: "1px solid #1e293b" }}>
              Patient Portal
            </h4>
            {[
              { to: "/dashboard",              label: "Home"             },
              { to: "/dashboard/doctors",      label: "Find Doctors"     },
              { to: "/dashboard/appointments", label: "My Appointments"  },
            ].map((l) => (
              <Link key={l.to} to={l.to} style={{ display: "block", fontSize: 13, color: "#64748b", textDecoration: "none", marginBottom: 10 }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--green)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#64748b"}
              >{l.label}</Link>
            ))}
          </div>

          {/* Departments */}
          <div>
            <h4 style={{ color: "#fff", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 18, paddingBottom: 10, borderBottom: "1px solid #1e293b" }}>
              Departments
            </h4>
            {["Cardiology", "Neurology", "Orthopaedics", "Oncology", "Paediatrics"].map((d) => (
              <a key={d} href="#" style={{ display: "block", fontSize: 13, color: "#64748b", textDecoration: "none", marginBottom: 10 }}
                onMouseEnter={(e) => e.currentTarget.style.color = "var(--green)"}
                onMouseLeave={(e) => e.currentTarget.style.color = "#64748b"}
              >{d}</a>
            ))}
          </div>

          {/* OPD Hours */}
          <div>
            <h4 style={{ color: "#fff", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 18, paddingBottom: 10, borderBottom: "1px solid #1e293b" }}>
              OPD Hours
            </h4>
            {[
              { day: "Mon – Fri", hrs: "9 AM – 6 PM"    },
              { day: "Saturday",  hrs: "9 AM – 2 PM"    },
              { day: "Sunday",    hrs: "Emergency Only"  },
              { day: "Emergency", hrs: "24 / 7", accent: true },
            ].map((r) => (
              <div key={r.day} style={{
                display: "flex", justifyContent: "space-between",
                fontSize: 13, padding: "8px 0", borderBottom: "1px solid #1e293b",
              }}>
                <span style={{ color: "#64748b" }}>{r.day}</span>
                <span style={{ fontWeight: 700, color: r.accent ? "var(--green)" : "#e2e8f0" }}>{r.hrs}</span>
              </div>
            ))}
          </div>

        </div>

        {/* Bottom bar */}
        <div style={{
          maxWidth: 1160, margin: "0 auto",
          padding: "20px 5%",
          borderTop: "1px solid #1e293b",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: 8,
          fontSize: 12, color: "#475569",
        }}>
          <span>© 2025 MediCare Hospital. All rights reserved.</span>
          <span>Made with ❤️ for better health</span>
        </div>
      </footer>

    </div>
  );
}