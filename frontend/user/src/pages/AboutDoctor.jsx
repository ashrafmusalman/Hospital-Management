import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../services/api";
import Navbar from "../components/Navbar";

const API_BASE = "http://127.0.0.1:8000";
const getImageUrl = (p) => {
  if (!p) return null;
  return `${API_BASE}/${String(p).split("/").map(encodeURIComponent).join("/")}`;
};
const getInitials = (name = "") =>
  name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();

export default function AboutDoctor() {
  const { doctorId } = useParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [imgErr,  setImgErr]  = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await API.get("/patient/doctors");
        if (!cancelled) setDoctors(res.data || []);
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.detail || "Unable to load doctor details.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const doctor = useMemo(
    () => doctors.find(d => String(d.id) === String(doctorId)) || null,
    [doctors, doctorId]
  );

  const imgUrl = doctor ? getImageUrl(doctor.image) : null;
  const hasImg = imgUrl && !imgErr;

  // Gradient based on doctor id
  const GRADS = [
    ["#16a34a","#059669"],["#2563eb","#0ea5e9"],["#7c3aed","#a855f7"],
    ["#dc2626","#f97316"],["#0891b2","#06b6d4"],["#d97706","#f59e0b"],
  ];
  const [c1, c2] = GRADS[(Number(doctorId) || 0) % GRADS.length];

  return (
    <div className="ad-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        :root {
          --g:#16a34a; --g-d:#14532d; --g-m:#22c55e; --g-l:#f0fdf4; --g-xl:#dcfce7;
          --ink:#0c1a0e; --ink2:#374151; --ink3:#6b7280;
          --border:#e5e7eb; --white:#fff; --off:#f9fafb;
          --shadow-md:0 4px 18px rgba(0,0,0,.08);
          --shadow-lg:0 20px 48px rgba(0,0,0,.10);
          --shadow-green:0 8px 32px rgba(22,163,74,.2);
          --r:16px; --r-lg:22px;
        }
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'DM Sans',sans-serif; background:var(--off); }

        .ad-root { min-height:100vh; background:var(--off); }

        /* ── HERO BAND ── */
        .hero-band {
          background: linear-gradient(135deg,#0c1a0e 0%,#14532d 55%,#052e16 100%);
          padding:0; position:relative; overflow:hidden;
        }
        .hero-band::before {
          content:''; position:absolute; inset:0; pointer-events:none;
          background-image:linear-gradient(rgba(255,255,255,.032) 1px,transparent 1px),
                           linear-gradient(90deg,rgba(255,255,255,.032) 1px,transparent 1px);
          background-size:40px 40px;
        }
        .hero-orb-1 {
          position:absolute; width:500px; height:500px; border-radius:50%;
          top:-200px; right:-100px; pointer-events:none;
          background:radial-gradient(circle,rgba(34,197,94,.2) 0%,transparent 70%);
        }
        .hero-orb-2 {
          position:absolute; width:300px; height:300px; border-radius:50%;
          bottom:-100px; left:5%; pointer-events:none;
          background:radial-gradient(circle,rgba(74,222,128,.1) 0%,transparent 70%);
        }
        .hero-inner {
          max-width:1180px; margin:0 auto; padding:40px 5% 0;
          position:relative; z-index:1;
        }

        /* back btn */
        .back-btn {
          display:inline-flex; align-items:center; gap:8px;
          background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.16);
          border-radius:10px; padding:8px 18px;
          color:rgba(255,255,255,.8); font-size:13px; font-weight:600;
          font-family:'DM Sans',sans-serif; cursor:pointer;
          text-decoration:none; transition:all .18s; margin-bottom:32px;
        }
        .back-btn:hover { background:rgba(255,255,255,.14); color:#fff; }

        /* hero profile row */
        .hero-profile {
          display:grid; grid-template-columns:auto 1fr; gap:36px;
          align-items:flex-end; padding-bottom:0;
        }

        /* photo frame */
        .photo-frame {
          width:180px; height:200px; border-radius:20px 20px 0 0;
          overflow:hidden; flex-shrink:0; position:relative;
          border:3px solid rgba(255,255,255,.15); border-bottom:none;
          box-shadow:0 16px 48px rgba(0,0,0,.4);
        }
        .photo-frame img { width:100%; height:100%; object-fit:cover; object-position:center top; }
        .photo-placeholder {
          width:100%; height:100%; display:flex; align-items:center; justify-content:center;
        }
        .photo-initials {
          width:80px; height:80px; border-radius:50%;
          display:flex; align-items:center; justify-content:center;
          font-family:'Fraunces',serif; font-size:28px; font-weight:900; color:#fff;
          border:3px solid rgba(255,255,255,.2);
        }

        /* hero text */
        .hero-text { padding-bottom:32px; }
        .hero-eyebrow {
          display:inline-flex; align-items:center; gap:8px;
          font-size:10.5px; font-weight:700; letter-spacing:.14em; text-transform:uppercase;
          color:rgba(74,222,128,.8); margin-bottom:12px;
        }
        .hero-eyebrow::before { content:''; width:18px; height:2px; background:currentColor; border-radius:2px; }
        .hero-name {
          font-family:'Fraunces',serif;
          font-size:clamp(2rem,4vw,3rem); font-weight:900;
          color:#fff; letter-spacing:-.04em; line-height:1.05; margin-bottom:10px;
        }
        .hero-sub {
          display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:22px;
        }
        .spec-pill-hero {
          display:inline-flex; align-items:center; gap:6px;
          background:rgba(34,197,94,.15); border:1px solid rgba(74,222,128,.3);
          color:#4ade80; font-size:12px; font-weight:700;
          padding:5px 14px; border-radius:999px;
        }
        .spec-dot { width:6px; height:6px; border-radius:50%; background:#4ade80; box-shadow:0 0 6px #4ade8088; }
        .hero-id { font-size:13px; color:rgba(255,255,255,.35); }

        /* hero stat pills */
        .hero-stats { display:flex; gap:10px; flex-wrap:wrap; }
        .h-stat {
          display:flex; align-items:center; gap:9px;
          background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12);
          border-radius:11px; padding:10px 16px;
          backdrop-filter:blur(8px);
        }
        .h-stat-icon {
          width:32px; height:32px; border-radius:9px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center; font-size:15px;
          background:rgba(255,255,255,.08);
        }
        .h-stat-val { font-size:15px; font-weight:800; color:#fff; line-height:1; }
        .h-stat-lbl { font-size:10.5px; color:rgba(255,255,255,.4); font-weight:500; letter-spacing:.03em; margin-top:2px; }

        /* ── BODY ── */
        .body-wrap { max-width:1180px; margin:0 auto; padding:32px 5% 64px; }

        /* action bar */
        .action-bar {
          display:flex; gap:12px; flex-wrap:wrap;
          margin-bottom:28px;
        }
        .btn-primary {
          display:inline-flex; align-items:center; gap:8px;
          background:var(--g); color:#fff;
          padding:13px 26px; border-radius:12px;
          font-size:14px; font-weight:700; font-family:'DM Sans',sans-serif;
          text-decoration:none; border:none; cursor:pointer;
          transition:all .2s; box-shadow:var(--shadow-green);
        }
        .btn-primary:hover { background:var(--g-d); transform:translateY(-2px); box-shadow:0 12px 36px rgba(22,163,74,.3); }
        .btn-secondary {
          display:inline-flex; align-items:center; gap:8px;
          background:var(--white); color:var(--ink2);
          padding:13px 24px; border-radius:12px; border:1.5px solid var(--border);
          font-size:14px; font-weight:700; font-family:'DM Sans',sans-serif;
          text-decoration:none; cursor:pointer; transition:all .18s;
        }
        .btn-secondary:hover { background:var(--off); border-color:var(--ink3); }

        /* grid */
        .profile-grid { display:grid; grid-template-columns:1fr 340px; gap:22px; align-items:start; }

        /* panel base */
        .panel {
          background:var(--white); border:1px solid var(--border);
          border-radius:var(--r-lg); overflow:hidden;
          box-shadow:var(--shadow-md);
        }
        .panel-head {
          padding:18px 24px; border-bottom:1px solid var(--border);
          display:flex; align-items:center; gap:12px;
        }
        .panel-head-icon {
          width:38px; height:38px; border-radius:10px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center; font-size:17px;
        }
        .panel-head-title { font-size:14px; font-weight:700; color:var(--ink); }
        .panel-head-sub   { font-size:12px; color:var(--ink3); margin-top:2px; }
        .panel-body { padding:22px 24px; }

        /* about section */
        .about-text {
          font-size:14.5px; line-height:1.85; color:var(--ink2);
          font-weight:400;
        }
        .about-empty {
          font-size:14px; color:var(--ink3); font-style:italic; line-height:1.8;
          background:var(--off); border:1.5px dashed var(--border);
          border-radius:12px; padding:20px 22px;
        }

        /* expertise chips */
        .expertise-chips { display:flex; flex-wrap:wrap; gap:9px; margin-top:18px; }
        .exp-chip {
          display:inline-flex; align-items:center; gap:6px;
          background:var(--g-l); border:1px solid rgba(22,163,74,.2);
          color:var(--g-d); font-size:12px; font-weight:700;
          padding:6px 14px; border-radius:999px;
        }

        /* info rows */
        .info-table { display:flex; flex-direction:column; gap:0; }
        .info-row {
          display:flex; align-items:center; justify-content:space-between;
          padding:13px 0; border-bottom:1px solid var(--off); gap:12px;
        }
        .info-row:last-child { border-bottom:none; }
        .info-row-left { display:flex; align-items:center; gap:10px; }
        .info-row-icon {
          width:32px; height:32px; border-radius:9px; flex-shrink:0;
          background:var(--g-l); display:flex; align-items:center; justify-content:center;
          font-size:14px;
        }
        .info-row-label { font-size:13px; color:var(--ink3); font-weight:500; }
        .info-row-value { font-size:13.5px; color:var(--ink); font-weight:700; text-align:right; }

        /* availability card */
        .avail-card {
          background:linear-gradient(135deg,#0c1a0e,#14532d);
          border-radius:var(--r-lg); padding:24px; overflow:hidden;
          position:relative;
        }
        .avail-card::after {
          content:''; position:absolute; width:200px; height:200px; border-radius:50%;
          top:-80px; right:-60px;
          background:radial-gradient(circle,rgba(34,197,94,.2) 0%,transparent 70%);
          pointer-events:none;
        }
        .avail-title { font-family:'Fraunces',serif; font-size:17px; font-weight:900; color:#fff; margin-bottom:5px; position:relative; z-index:1; }
        .avail-sub   { font-size:12.5px; color:rgba(255,255,255,.45); margin-bottom:20px; position:relative; z-index:1; }
        .avail-rows  { display:flex; flex-direction:column; gap:0; position:relative; z-index:1; }
        .avail-row {
          display:flex; justify-content:space-between; align-items:center;
          padding:10px 0; border-bottom:1px solid rgba(255,255,255,.07); font-size:13px;
        }
        .avail-row:last-child { border-bottom:none; }
        .avail-day { color:rgba(255,255,255,.45); }
        .avail-hrs { font-weight:700; color:rgba(255,255,255,.9); }
        .avail-book {
          margin-top:18px; width:100%; padding:13px; border-radius:12px; border:none;
          background:var(--g); color:#fff; font-size:14px; font-weight:700;
          font-family:'DM Sans',sans-serif; cursor:pointer; transition:all .2s;
          box-shadow:var(--shadow-green); display:flex; align-items:center; justify-content:center; gap:8px;
          text-decoration:none;
        }
        .avail-book:hover { background:var(--g-m); transform:translateY(-1px); }

        /* contact card */
        .contact-rows { display:flex; flex-direction:column; gap:10px; }
        .contact-row {
          display:flex; align-items:center; gap:12px;
          padding:12px 14px; border-radius:12px;
          background:var(--off); border:1px solid var(--border);
          transition:all .18s;
        }
        .contact-row:hover { border-color:rgba(22,163,74,.3); background:var(--g-l); }
        .contact-icon { font-size:18px; width:36px; text-align:center; flex-shrink:0; }
        .contact-label { font-size:12px; color:var(--ink3); font-weight:500; }
        .contact-val   { font-size:13.5px; color:var(--ink); font-weight:700; }

        /* states */
        .state-box { display:flex; flex-direction:column; align-items:center; gap:14px; padding:100px 20px; text-align:center; }
        .spinner { width:42px; height:42px; border-radius:50%; border:3px solid var(--border); border-top-color:var(--g); animation:spin .8s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .state-title { font-size:16px; font-weight:700; color:var(--ink2); }
        .state-sub   { font-size:13.5px; color:var(--ink3); }
        .error-box { border-radius:14px; padding:18px 22px; background:rgba(220,38,38,.07); border:1px solid rgba(220,38,38,.2); color:#991b1b; font-size:14px; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp .4s ease both; }

        /* responsive */
        @media (max-width:900px) {
          .profile-grid { grid-template-columns:1fr; }
          .hero-profile { grid-template-columns:1fr; gap:24px; align-items:flex-start; }
          .photo-frame  { width:140px; height:160px; border-radius:16px; }
        }
        @media (max-width:600px) {
          .hero-stats { gap:8px; }
          .h-stat     { padding:8px 12px; }
          .body-wrap  { padding:24px 5% 48px; }
          .action-bar { flex-direction:column; }
        }
      `}</style>

      <Navbar />

      {/* ── HERO BAND ── */}
      <div className="hero-band">
        <div className="hero-orb-1" /><div className="hero-orb-2" />
        <div className="hero-inner">
          <Link to="/dashboard/doctors" className="back-btn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back to Doctors
          </Link>

          {!loading && !error && doctor && (
            <div className="hero-profile">

              {/* Photo */}
              <div className="photo-frame" style={{ background: `linear-gradient(135deg,${c1}33,${c2}33)` }}>
                {hasImg ? (
                  <img src={imgUrl} alt={doctor.name} onError={() => setImgErr(true)} />
                ) : (
                  <div className="photo-placeholder">
                    <div className="photo-initials" style={{ background:`linear-gradient(135deg,${c1},${c2})` }}>
                      {getInitials(doctor.name)}
                    </div>
                  </div>
                )}
              </div>

              {/* Text */}
              <div className="hero-text">
                <div className="hero-eyebrow">Doctor Profile</div>
                <h1 className="hero-name">{doctor.name}</h1>
                <div className="hero-sub">
                  <span className="spec-pill-hero">
                    <span className="spec-dot" />
                    {doctor.specialization || "Specialist"}
                  </span>
                  <span className="hero-id">ID #{doctor.id}</span>
                </div>
                <div className="hero-stats">
                  {[
                    { icon:"🏅", val: doctor.experience != null ? `${doctor.experience} yrs` : "—", lbl:"Experience" },
                    { icon:"💳", val: doctor.consultation_fee != null ? `₹${doctor.consultation_fee}` : "—", lbl:"Consult Fee" },
                    { icon:"🏥", val: doctor.hospital_id != null ? `#${doctor.hospital_id}` : "N/A", lbl:"Hospital" },
                  ].map(s => (
                    <div key={s.lbl} className="h-stat">
                      <div className="h-stat-icon">{s.icon}</div>
                      <div>
                        <div className="h-stat-val">{s.val}</div>
                        <div className="h-stat-lbl">{s.lbl}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* spacer so photo bleeds up */}
          {!loading && !error && doctor && <div style={{ height: 32 }} />}
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="body-wrap">

        {/* Loading */}
        {loading && (
          <div className="state-box">
            <div className="spinner" />
            <div className="state-title">Loading profile…</div>
            <div className="state-sub">Fetching doctor details</div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="error-box">⚠️ {error}</div>
        )}

        {/* Not found */}
        {!loading && !error && !doctor && (
          <div className="state-box">
            <div style={{ fontSize:44 }}>🔎</div>
            <div className="state-title">Doctor not found</div>
            <div className="state-sub">This profile doesn't exist or is unavailable.</div>
            <Link to="/dashboard/doctors" className="btn-primary" style={{ marginTop:6 }}>Browse All Doctors</Link>
          </div>
        )}

        {/* ── PROFILE ── */}
        {!loading && !error && doctor && (
          <>
            {/* Action buttons */}
            <div className="action-bar fade-up">
              <Link
                to="/dashboard/doctors"
                state={{ preselectDoctorId: doctor.id }}
                className="btn-primary"
              >
                📅 Book Appointment
              </Link>
              <Link to="/dashboard/doctors" className="btn-secondary">
                👨‍⚕️ All Doctors
              </Link>
            </div>

            <div className="profile-grid fade-up">

              {/* ── LEFT COLUMN ── */}
              <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

                {/* About */}
                <div className="panel">
                  <div className="panel-head">
                    <div className="panel-head-icon" style={{ background:'#f0fdf4' }}>📋</div>
                    <div>
                      <div className="panel-head-title">About</div>
                      <div className="panel-head-sub">Professional summary</div>
                    </div>
                  </div>
                  <div className="panel-body">
                    {doctor.description ? (
                      <p className="about-text">{doctor.description}</p>
                    ) : (
                      <div className="about-empty">
                        No professional description has been added for this doctor yet.
                      </div>
                    )}

                    {/* Expertise chips — derived from specialization */}
                    {doctor.specialization && (
                      <div className="expertise-chips">
                        {[doctor.specialization, "Patient Care", "Clinical Excellence", "Diagnostics"]
                          .map(tag => (
                            <span key={tag} className="exp-chip">✦ {tag}</span>
                          ))
                        }
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick details */}
                <div className="panel">
                  <div className="panel-head">
                    <div className="panel-head-icon" style={{ background:"#eff6ff" }}>🪪</div>
                    <div>
                      <div className="panel-head-title">Doctor Details</div>
                      <div className="panel-head-sub">Profile information</div>
                    </div>
                  </div>
                  <div className="panel-body">
                    <div className="info-table">
                      {[
                        { icon:"🆔", label:"Doctor ID",         value:`#${doctor.id}` },
                        { icon:"🔬", label:"Specialization",    value:doctor.specialization || "—" },
                        { icon:"🏅", label:"Experience",        value:doctor.experience != null ? `${doctor.experience} years` : "Not specified" },
                        { icon:"💳", label:"Consultation Fee",  value:doctor.consultation_fee != null ? `₹ ${doctor.consultation_fee}` : "Not specified" },
                        { icon:"🏥", label:"Hospital",          value:doctor.hospital_id != null ? `Hospital #${doctor.hospital_id}` : "Not assigned" },
                      ].map(row => (
                        <div key={row.label} className="info-row">
                          <div className="info-row-left">
                            <div className="info-row-icon">{row.icon}</div>
                            <span className="info-row-label">{row.label}</span>
                          </div>
                          <span className="info-row-value">{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* ── RIGHT COLUMN ── */}
              <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

                {/* Availability card */}
                <div className="avail-card">
                  <div className="avail-title">Availability</div>
                  <div className="avail-sub">OPD schedule & hours</div>
                  <div className="avail-rows">
                    {[
                      { day:"Monday – Friday", hrs:"9:00 AM – 6:00 PM" },
                      { day:"Saturday",        hrs:"9:00 AM – 2:00 PM" },
                      { day:"Sunday",          hrs:"Emergency Only" },
                      { day:"Emergency",       hrs:"24 / 7", accent:true },
                    ].map(r => (
                      <div key={r.day} className="avail-row">
                        <span className="avail-day">{r.day}</span>
                        <span className="avail-hrs" style={r.accent ? { color:"#4ade80" } : {}}>{r.hrs}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    to="/dashboard/doctors"
                    state={{ preselectDoctorId: doctor.id }}
                    className="avail-book"
                  >
                    📅 Book an Appointment
                  </Link>
                </div>

                {/* Contact */}
                <div className="panel">
                  <div className="panel-head">
                    <div className="panel-head-icon" style={{ background:"#fff7ed" }}>📞</div>
                    <div>
                      <div className="panel-head-title">Contact & Support</div>
                      <div className="panel-head-sub">Reach our team anytime</div>
                    </div>
                  </div>
                  <div className="panel-body">
                    <div className="contact-rows">
                      {[
                        { icon:"📞", label:"Helpline",   val:"+91 1800 200 3000" },
                        { icon:"✉️", label:"Email",       val:"info@medicare.in" },
                        { icon:"🚑", label:"Emergency",  val:"Available 24 / 7" },
                        { icon:"📍", label:"Location",   val:"Ahmedabad, Gujarat" },
                      ].map(c => (
                        <div key={c.label} className="contact-row">
                          <span className="contact-icon">{c.icon}</span>
                          <div>
                            <div className="contact-label">{c.label}</div>
                            <div className="contact-val">{c.val}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}