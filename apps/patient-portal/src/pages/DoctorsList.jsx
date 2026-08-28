import { useEffect, useMemo, useState, Fragment } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "../components/Reveal";
import ImageWithSkeleton from "../components/ImageWithSkeleton";
import { DoctorRowSkeleton } from "../components/Skeleton";
import { withMinDuration } from "../utils/minDelay";
import API from "../services/api";
import API_BASE_URL from "../config";
const GRAD = [
  ["#16a34a","#059669"],["#2563eb","#0ea5e9"],["#7c3aed","#a855f7"],
  ["#dc2626","#f97316"],["#0891b2","#06b6d4"],["#d97706","#f59e0b"],
  ["#be185d","#f43f5e"],["#0f766e","#14b8a6"],
];
const API_BASE = API_BASE_URL;
const getImg   = (p) => p ? `${API_BASE}/${String(p).split("/").map(encodeURIComponent).join("/")}` : null;
const initials = (name="") => name.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();


function DoctorsList() {
  const [query,            setQuery]            = useState("");
  const [doctors,          setDoctors]          = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [selectedTime,     setSelectedTime]     = useState("");
  const [message,          setMessage]          = useState("");
  const [booking,          setBooking]          = useState(false);
  const [filterSpec,       setFilterSpec]       = useState("All");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true); setError("");
        const res = await withMinDuration(API.get("/patient/doctors"), 500);
        if (!cancelled) setDoctors(res.data || []);
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.detail || "Unable to load doctors.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const specializations = useMemo(() => {
    const s = [...new Set(doctors.map(d => d.specialization).filter(Boolean))];
    return ["All", ...s];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    const q = query.trim().toLowerCase();
    return doctors.filter(d => {
      const matchQ    = !q || `${d.name||""} ${d.specialization||""}`.toLowerCase().includes(q);
      const matchSpec = filterSpec === "All" || d.specialization === filterSpec;
      return matchQ && matchSpec;
    });
  }, [doctors, query, filterSpec]);

  const selectedDoctor = doctors.find(d => String(d.id) === String(selectedDoctorId)) || null;

  const handleBooking = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!selectedDoctorId) { setMessage("error:Please select a doctor first."); return; }
    if (!selectedTime)     { setMessage("error:Please choose an appointment time."); return; }
    try {
      setBooking(true);
      await API.post("/patient/appointments/book", {
        doctor_id: Number(selectedDoctorId),
        appointment_time: new Date(selectedTime).toISOString(),
      });
      setMessage("success:Appointment booked! We'll confirm by email shortly.");
      setSelectedTime("");
    } catch (err) {
      setMessage("error:" + (err?.response?.data?.detail ? JSON.stringify(err.response.data.detail) : "Booking failed. Please try again."));
    } finally {
      setBooking(false);
    }
  };

  const msgType = message.startsWith("success:") ? "success" : "error";
  const msgText = message.replace(/^(success:|error:)/, "");

  return (
    <div className="dl-shell">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        :root {
          --g:#16a34a;--g-d:#14532d;--g-m:#22c55e;--g-l:#f0fdf4;--g-xl:#dcfce7;
          --ink:#0c1a0e;--ink2:#374151;--ink3:#6b7280;--ink4:#9ca3af;
          --border:#e5e7eb;--white:#fff;--off:#f9fafb;
          --shadow-sm:0 1px 3px rgba(0,0,0,.07);
          --shadow-md:0 4px 18px rgba(0,0,0,.08);
          --shadow-green:0 6px 28px rgba(22,163,74,.18);
          --r:14px;--r-lg:20px;
        }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{font-family:'DM Sans',sans-serif;background:var(--off);color:var(--ink);}
        a{text-decoration:none;color:inherit;}
        .dl-shell{min-height:100vh;background:var(--off);}

        /* HERO */
        .page-hero{background:linear-gradient(135deg,#0c1a0e 0%,#14532d 60%,#052e16 100%);padding:72px 5% 80px;position:relative;overflow:hidden;}
        .page-hero::before{content:'';position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.04) 1px,transparent 1px);background-size:40px 40px;}
        .page-hero::after{content:'';position:absolute;width:500px;height:500px;border-radius:50%;top:-200px;right:-100px;background:radial-gradient(circle,rgba(34,197,94,.2) 0%,transparent 70%);pointer-events:none;}
        .hero-inner{max-width:1180px;margin:0 auto;position:relative;z-index:1;}
        .hero-eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:rgba(74,222,128,.8);margin-bottom:16px;}
        .hero-eyebrow::before{content:'';width:20px;height:2px;background:currentColor;border-radius:2px;}
        .hero-title{font-family:'Fraunces',serif;font-size:clamp(2rem,4vw,3.2rem);font-weight:900;color:#fff;letter-spacing:-.04em;line-height:1.05;margin-bottom:14px;}
        .hero-title em{font-style:italic;color:#4ade80;}
        .hero-sub{font-size:15px;color:rgba(255,255,255,.5);line-height:1.75;max-width:46ch;margin-bottom:36px;}

        .search-bar{display:flex;gap:12px;align-items:center;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:14px;padding:6px 6px 6px 18px;backdrop-filter:blur(12px);max-width:600px;transition:border-color .2s;}
        .search-bar:focus-within{border-color:rgba(74,222,128,.5);background:rgba(255,255,255,.12);}
        .search-bar input{flex:1;background:none;border:none;outline:none;font-size:14px;color:#fff;font-family:'DM Sans',sans-serif;}
        .search-bar input::placeholder{color:rgba(255,255,255,.35);}
        .search-bar-btn{background:var(--g);border:none;border-radius:10px;padding:10px 20px;color:#fff;font-size:13.5px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;white-space:nowrap;transition:background .18s;flex-shrink:0;}
        .search-bar-btn:hover{background:var(--g-d);}

        .hero-stats{display:flex;gap:32px;margin-top:32px;flex-wrap:wrap;}
        .hero-stat{display:flex;flex-direction:column;gap:3px;}
        .hero-stat-num{font-family:'Fraunces',serif;font-size:22px;font-weight:900;color:#fff;letter-spacing:-.04em;line-height:1;}
        .hero-stat-lbl{font-size:11px;color:rgba(255,255,255,.4);font-weight:500;letter-spacing:.03em;}
        .hero-stat-div{width:1px;background:rgba(255,255,255,.12);align-self:stretch;margin:2px 0;}

        /* MAIN */
        .main-body{max-width:1180px;margin:0 auto;padding:36px 5% 60px;}
        .filter-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px;align-items:center;}
        .filter-label{font-size:12px;font-weight:700;color:var(--ink3);letter-spacing:.05em;text-transform:uppercase;margin-right:4px;flex-shrink:0;}
        .filter-chip{padding:7px 15px;border-radius:999px;font-size:12.5px;font-weight:600;background:var(--white);border:1.5px solid var(--border);color:var(--ink3);cursor:pointer;transition:all .18s;font-family:'DM Sans',sans-serif;white-space:nowrap;}
        .filter-chip:hover{border-color:var(--g-m);color:var(--g);}
        .filter-chip.active{background:var(--g);border-color:var(--g);color:#fff;box-shadow:var(--shadow-green);}
        .result-meta{font-size:13px;color:var(--ink3);margin-bottom:20px;font-weight:500;}
        .result-meta strong{color:var(--ink);}
        .content-grid{display:grid;grid-template-columns:1fr 360px;gap:28px;align-items:start;}
        .doctor-list{display:flex;flex-direction:column;gap:16px;}

        /* DOCTOR CARD — New beautiful design */
        .doc-card{
          background:var(--white);border:1.5px solid var(--border);
          border-radius:20px;overflow:hidden;transition:all .25s;
          display:flex;gap:0;
          box-shadow:var(--shadow-sm);
          animation:fadeUp .35s ease both;
        }
        .doc-card:hover{border-color:rgba(22,163,74,.3);box-shadow:0 12px 36px rgba(22,163,74,.12);transform:translateY(-3px);}
        .doc-card.selected{border-color:var(--g);box-shadow:var(--shadow-green);background:var(--g-l);}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}

        /* left color strip */
        .doc-strip{width:6px;flex-shrink:0;border-radius:0;}

        /* avatar section */
        .doc-avatar-wrap{
          width:100px;flex-shrink:0;
          display:flex;align-items:center;justify-content:center;
          padding:20px 0 20px 20px;
        }
        .doc-avatar{
          width:72px;height:72px;border-radius:18px;
          display:flex;align-items:center;justify-content:center;
          font-family:'Fraunces',serif;font-size:24px;font-weight:900;color:#fff;
          box-shadow:0 4px 16px rgba(0,0,0,.15);
          position:relative;overflow:hidden;flex-shrink:0;
        }
        .doc-avatar img{width:100%;height:100%;object-fit:cover;object-position:center top;}
        .doc-avatar-init{
          width:100%;height:100%;display:flex;align-items:center;justify-content:center;
          font-family:'Fraunces',serif;font-size:24px;font-weight:900;color:#fff;
        }

        /* body */
        .doc-body{flex:1;padding:18px 18px 18px 16px;display:flex;flex-direction:column;gap:10px;min-width:0;}
        .doc-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;}
        .doc-name{font-size:16px;font-weight:700;color:var(--ink);line-height:1.25;margin-bottom:5px;}
        .doc-spec-pill{display:inline-flex;align-items:center;gap:5px;background:var(--g-xl);color:var(--g-d);font-size:11px;font-weight:700;padding:3px 11px;border-radius:999px;}
        .selected-check{width:26px;height:26px;border-radius:50%;background:var(--g);color:#fff;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;}
        .doc-meta{display:flex;gap:10px;flex-wrap:wrap;}
        .meta-tag{display:flex;align-items:center;gap:5px;background:var(--off);border:1px solid var(--border);border-radius:8px;padding:5px 11px;font-size:12px;color:var(--ink2);font-weight:500;}
        .doc-desc{font-size:13px;color:var(--ink3);line-height:1.65;background:var(--off);border-radius:10px;padding:10px 13px;border:1px solid var(--border);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;}
        .selected .doc-desc{-webkit-line-clamp:unset;}
        .doc-actions{display:flex;gap:10px;padding-top:4px;}
        .btn-select{flex:1;padding:10px 16px;border-radius:11px;font-size:13px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .18s;border:none;}
        .btn-select-idle{background:var(--off);color:var(--g);border:1.5px solid rgba(22,163,74,.3);}
        .btn-select-idle:hover{background:var(--g-l);border-color:var(--g);}
        .btn-select-active{background:var(--g);color:#fff;box-shadow:var(--shadow-green);}
        .btn-select-active:hover{background:var(--g-d);}
        .btn-profile{padding:10px 18px;border-radius:11px;font-size:13px;font-weight:700;background:var(--white);color:var(--ink2);border:1.5px solid var(--border);cursor:pointer;font-family:'DM Sans',sans-serif;transition:all .18s;text-decoration:none;display:inline-flex;align-items:center;gap:6px;white-space:nowrap;}
        .btn-profile:hover{background:var(--off);border-color:var(--ink2);}

        /* availability badge */
        .avail-badge{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:700;color:var(--g);padding:3px 10px;background:var(--g-xl);border-radius:999px;border:1px solid rgba(22,163,74,.2);}
        .avail-dot{width:6px;height:6px;border-radius:50%;background:var(--g);animation:pulse 2s infinite;}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}

        /* states */
        .state-box{padding:64px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:14px;}
        .spinner{width:40px;height:40px;border-radius:50%;border:3px solid var(--border);border-top-color:var(--g);animation:spin .8s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .state-title{font-size:15px;font-weight:700;color:var(--ink2);}
        .state-sub{font-size:13px;color:var(--ink3);}

        /* BOOKING PANEL */
        .booking-panel{position:sticky;top:24px;}
        .booking-card{background:var(--white);border:1.5px solid var(--border);border-radius:var(--r-lg);overflow:hidden;box-shadow:var(--shadow-md);}
        .booking-card-head{padding:22px 24px 18px;background:linear-gradient(135deg,#0c1a0e,#14532d);position:relative;overflow:hidden;}
        .booking-card-head::after{content:'';position:absolute;width:200px;height:200px;border-radius:50%;top:-80px;right:-60px;background:radial-gradient(circle,rgba(34,197,94,.2) 0%,transparent 70%);}
        .booking-head-title{font-family:'Fraunces',serif;font-size:19px;font-weight:900;color:#fff;margin-bottom:4px;position:relative;z-index:1;}
        .booking-head-sub{font-size:12.5px;color:rgba(255,255,255,.45);position:relative;z-index:1;}
        .booking-body{padding:22px 22px 24px;}
        .selected-preview{display:flex;align-items:center;gap:12px;padding:13px 14px;border-radius:12px;background:var(--g-l);border:1.5px solid rgba(22,163,74,.25);margin-bottom:18px;}
        .selected-preview-avatar{width:40px;height:40px;border-radius:11px;flex-shrink:0;color:#fff;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;font-family:'Fraunces',serif;}
        .selected-preview-name{font-size:13.5px;font-weight:700;color:var(--ink);line-height:1.2;}
        .selected-preview-spec{font-size:11.5px;color:var(--g);margin-top:2px;font-weight:500;}
        .no-selection{padding:13px 14px;border-radius:12px;background:var(--off);border:1.5px dashed var(--border);font-size:13px;color:var(--ink3);margin-bottom:18px;text-align:center;font-style:italic;}
        .form-field{margin-bottom:16px;}
        .form-label{display:block;font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--ink3);margin-bottom:7px;}
        .form-input{width:100%;padding:11px 14px;background:var(--off);border:1.5px solid var(--border);border-radius:11px;color:var(--ink);font-size:13.5px;font-family:'DM Sans',sans-serif;outline:none;transition:all .18s;}
        .form-input:focus{border-color:var(--g);background:var(--g-l);box-shadow:0 0 0 3px rgba(22,163,74,.1);}
        .notice{padding:12px 14px;border-radius:10px;font-size:13px;margin-bottom:14px;display:flex;align-items:flex-start;gap:9px;line-height:1.55;}
        .notice-success{background:rgba(22,163,74,.1);border:1px solid rgba(22,163,74,.25);color:#14532d;}
        .notice-error{background:rgba(220,38,38,.08);border:1px solid rgba(220,38,38,.2);color:#991b1b;}
        .btn-book{width:100%;padding:14px;border-radius:12px;border:none;background:var(--g);color:#fff;font-size:14.5px;font-weight:700;font-family:'DM Sans',sans-serif;cursor:pointer;transition:all .2s;box-shadow:var(--shadow-green);margin-bottom:20px;}
        .btn-book:hover:not(:disabled){background:var(--g-d);transform:translateY(-1px);box-shadow:0 10px 36px rgba(22,163,74,.28);}
        .btn-book:disabled{opacity:.55;cursor:not-allowed;transform:none;box-shadow:none;}
        .panel-divider{height:1px;background:var(--border);margin:4px 0 18px;}
        .info-row{display:flex;align-items:center;gap:12px;padding:11px 0;border-bottom:1px solid var(--off);}
        .info-row:last-child{border-bottom:none;}
        .info-icon{width:36px;height:36px;border-radius:10px;background:var(--g-xl);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
        .info-title{font-size:12.5px;font-weight:700;color:var(--ink);}
        .info-desc{font-size:12px;color:var(--ink3);margin-top:1px;}

        @media(max-width:1024px){.content-grid{grid-template-columns:1fr;}.booking-panel{position:static;}}
        @media(max-width:768px){.page-hero{padding:52px 5% 64px;}.main-body{padding:24px 5% 48px;}.doc-card{flex-direction:column;}.doc-strip{width:100%;height:5px;}.doc-avatar-wrap{padding:16px 16px 0;justify-content:flex-start;}.doc-body{padding:12px 16px 16px;}}
        @media(max-width:640px){.hero-stats{gap:20px;}.doc-actions{flex-direction:column;}.filter-row{gap:6px;}}
      `}</style>

      {/* HERO */}
      <div className="page-hero">
        <Reveal className="hero-inner">
          <div className="hero-eyebrow">Doctor Directory</div>
          <h1 className="hero-title">Find the <em>right specialist</em><br/>for your care</h1>
          <p className="hero-sub">Browse our team of expert physicians. Search by name or specialization, select your doctor, and book your appointment instantly.</p>
          <div className="search-bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input type="text" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search by name or specialization…"/>
            <button className="search-bar-btn">Search</button>
          </div>
          <div className="hero-stats">
            {[
              {num:`${doctors.length || "—"}`,lbl:"Doctors Available"},
              {num:"200+",lbl:"Specialists"},
              {num:"18+",lbl:"Years Excellence"},
              {num:"24/7",lbl:"Emergency Care"},
            ].map((s,i)=>(
              <Fragment key={s.lbl}>
                {i>0 && <div className="hero-stat-div"/>}
                <div className="hero-stat">
                  <div className="hero-stat-num">{s.num}</div>
                  <div className="hero-stat-lbl">{s.lbl}</div>
                </div>
              </Fragment>
            ))}
          </div>
        </Reveal>
      </div>

      {/* MAIN */}
      <div className="main-body">
        {!loading && !error && (
          <div className="filter-row">
            <span className="filter-label">Filter:</span>
            {specializations.map(s=>(
              <button key={s} className={`filter-chip ${filterSpec===s?"active":""}`} onClick={()=>setFilterSpec(s)}>{s}</button>
            ))}
          </div>
        )}
        {!loading && !error && (
          <div className="result-meta">
            Showing <strong>{filteredDoctors.length}</strong> of <strong>{doctors.length}</strong> doctors
            {query && <> matching "<strong>{query}</strong>"</>}
          </div>
        )}
        <div className="content-grid">
          <div className="doctor-list">
            {error && <div className="notice notice-error">⚠️ {error}</div>}
            {loading && Array.from({ length: 4 }).map((_, i) => <DoctorRowSkeleton key={i} />)}
            {!loading && !error && filteredDoctors.length===0 && (
              <div className="state-box">
                <div style={{fontSize:40}}>🔍</div>
                <div className="state-title">No doctors found</div>
                <div className="state-sub">Try a different name or specialization.</div>
              </div>
            )}
            <AnimatePresence mode="popLayout">
              {!loading && !error && filteredDoctors.map((doc,i)=>{
                const isSelected = selectedDoctorId===String(doc.id);
                const [c1,c2]    = GRAD[i%GRAD.length];
                return (
                  <motion.div
                    key={doc.id}
                    layout
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1], delay: i * 0.03 }}
                  >
                    <div className={`doc-card ${isSelected?"selected":""}`}>
                      {/* Color strip */}
                      <div className="doc-strip" style={{background:`linear-gradient(to bottom,${c1},${c2})`}}/>
                      {/* Avatar */}
                      <div className="doc-avatar-wrap">
                        <div className="doc-avatar" style={{background:`linear-gradient(135deg,${c1},${c2})`}}>
                          {doc.image
                            ? <ImageWithSkeleton src={getImg(doc.image)} alt={doc.name}/>
                            : <div className="doc-avatar-init">{initials(doc.name)}</div>
                          }
                        </div>
                      </div>
                      {/* Body */}
                      <div className="doc-body">
                        <div className="doc-header">
                          <div>
                            <div className="doc-name">{doc.name}</div>
                            <span className="doc-spec-pill">🔬 {doc.specialization||"Specialist"}</span>
                          </div>
                          <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
                            {isSelected && <div className="selected-check">✓</div>}
                            <div className="avail-badge"><span className="avail-dot"/>Available</div>
                          </div>
                        </div>
                        <div className="doc-meta">
                          <div className="meta-tag">🪪 ID #{doc.id}</div>
                          {doc.consultation_fee!=null && <div className="meta-tag">💳 ₹{doc.consultation_fee}</div>}
                          {doc.experience!=null && <div className="meta-tag">🏅 {doc.experience} yrs exp</div>}
                        </div>
                        {doc.description && <div className="doc-desc">{doc.description}</div>}
                        <div className="doc-actions">
                          <button type="button"
                            className={`btn-select ${isSelected?"btn-select-active":"btn-select-idle"}`}
                            onClick={()=>setSelectedDoctorId(String(doc.id))}
                          >
                            {isSelected ? "✓ Selected" : "Select Doctor"}
                          </button>
                          <Link to={`/dashboard/doctors/${doc.id}`} className="btn-profile">View Profile →</Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* BOOKING PANEL */}
          <Reveal className="booking-panel" y={16}>
            <div className="booking-card">
              <div className="booking-card-head">
                <div className="booking-head-title">Book Appointment</div>
                <div className="booking-head-sub">Select a doctor · Choose a time · Confirm</div>
              </div>
              <div className="booking-body">
                {selectedDoctor ? (
                  <div className="selected-preview">
                    <div className="selected-preview-avatar" style={{background:`linear-gradient(135deg,${GRAD[doctors.indexOf(selectedDoctor)%GRAD.length][0]},${GRAD[doctors.indexOf(selectedDoctor)%GRAD.length][1]})`}}>
                      {initials(selectedDoctor.name)}
                    </div>
                    <div>
                      <div className="selected-preview-name">{selectedDoctor.name}</div>
                      <div className="selected-preview-spec">{selectedDoctor.specialization}</div>
                    </div>
                  </div>
                ) : (
                  <div className="no-selection">No doctor selected — pick one from the list</div>
                )}
                <form onSubmit={handleBooking}>
                  <div className="form-field">
                    <label className="form-label">Date &amp; Time</label>
                    <input type="datetime-local" className="form-input" value={selectedTime} onChange={e=>setSelectedTime(e.target.value)} required/>
                  </div>
                  {message && (
                    <div className={`notice notice-${msgType}`}>
                      {msgType==="success"?"✅ ":"⚠️ "}{msgText}
                    </div>
                  )}
                  <button type="submit" className="btn-book" disabled={!selectedDoctorId||booking}>
                    {booking?"Booking…":"Confirm Appointment →"}
                  </button>
                </form>
                <div className="panel-divider"/>
                {[
                  {icon:"📞",title:"Need Help?",desc:"+91 1800 200 3000"},
                  {icon:"🕐",title:"OPD Hours",desc:"Mon–Sat  9 AM – 6 PM"},
                  {icon:"🚑",title:"Emergency",desc:"Available 24 / 7"},
                ].map(item=>(
                  <div className="info-row" key={item.title}>
                    <div className="info-icon">{item.icon}</div>
                    <div><div className="info-title">{item.title}</div><div className="info-desc">{item.desc}</div></div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}

export default DoctorsList;