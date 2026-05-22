import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import API from "../services/api";

const formatDate = (t) => {
  if (!t) return { date: "—", time: "" };
  const d = new Date(t);
  return {
    date: d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
    time: d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    day:  d.toLocaleDateString("en-IN", { weekday: "short" }).toUpperCase(),
    dd:   d.getDate(),
    mon:  d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase(),
  };
};

const STATUS = {
  booked:    { label:"Booked",    color:"#2563eb", bg:"rgba(37,99,235,.1)",  border:"rgba(37,99,235,.25)",  dot:"#2563eb"  },
  active:    { label:"Active",    color:"#2563eb", bg:"rgba(37,99,235,.1)",  border:"rgba(37,99,235,.25)",  dot:"#2563eb"  },
  completed: { label:"Completed", color:"#16a34a", bg:"rgba(22,163,74,.1)",  border:"rgba(22,163,74,.25)",  dot:"#16a34a"  },
  cancelled: { label:"Cancelled", color:"#dc2626", bg:"rgba(220,38,38,.08)", border:"rgba(220,38,38,.22)",  dot:"#dc2626"  },
};
const getStatus = (s) => STATUS[(s||"active").toLowerCase()] || STATUS.active;

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [refreshKey,   setRefreshKey]   = useState(0);
  const [cancelling,   setCancelling]   = useState(null);
  const [filter,       setFilter]       = useState("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError(""); setLoading(true);
        const res = await API.get("/patient/appointments");
        if (!cancelled) setAppointments(res.data || []);
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.detail || "Could not load appointments.");
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [refreshKey]);

  const cancel = async (id) => {
    try {
      setError(""); setCancelling(id);
      await API.put(`/patient/appointments/${id}/cancel`);
      setRefreshKey(k => k + 1);
    } catch (e) {
      setError(e?.response?.data?.detail || "Cancellation failed.");
    } finally { setCancelling(null); }
  };

  const counts = {
    all:       appointments.length,
    booked:    appointments.filter(a => ["booked","active"].includes((a.status||"active").toLowerCase())).length,
    completed: appointments.filter(a => (a.status||"").toLowerCase() === "completed").length,
    cancelled: appointments.filter(a => (a.status||"").toLowerCase() === "cancelled").length,
  };

  const visible = filter === "all"
    ? appointments
    : appointments.filter(a => {
        const s = (a.status||"active").toLowerCase();
        if (filter === "booked") return s === "booked" || s === "active";
        return s === filter;
      });

  return (
    <div className="ma-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,700;0,9..144,900;1,9..144,700&family=DM+Sans:wght@300;400;500;600;700&display=swap');

        :root {
          --g:#16a34a; --g-d:#14532d; --g-m:#22c55e; --g-l:#f0fdf4; --g-xl:#dcfce7;
          --ink:#0c1a0e; --ink2:#374151; --ink3:#6b7280;
          --border:#e5e7eb; --white:#fff; --off:#f9fafb;
          --shadow-md:0 4px 18px rgba(0,0,0,.08);
          --shadow-green:0 6px 28px rgba(22,163,74,.18);
          --r:14px; --r-lg:20px;
        }
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'DM Sans',sans-serif; background:var(--off); }
        .ma-root { min-height:100vh; background:var(--off); }

        /* ── HERO ── */
        .ma-hero {
          background:linear-gradient(135deg,#0c1a0e 0%,#14532d 55%,#052e16 100%);
          padding:60px 5% 56px; position:relative; overflow:hidden;
        }
        .ma-hero::before {
          content:''; position:absolute; inset:0; pointer-events:none;
          background-image:linear-gradient(rgba(255,255,255,.03) 1px,transparent 1px),
                           linear-gradient(90deg,rgba(255,255,255,.03) 1px,transparent 1px);
          background-size:40px 40px;
        }
        .hero-orb {
          position:absolute; border-radius:50%; pointer-events:none;
          background:radial-gradient(circle,rgba(34,197,94,.2) 0%,transparent 70%);
        }
        .hero-orb-1 { width:480px; height:480px; top:-200px; right:-100px; }
        .hero-orb-2 { width:280px; height:280px; bottom:-120px; left:3%; }

        .hero-inner { max-width:1180px; margin:0 auto; position:relative; z-index:1; }
        .hero-eyebrow {
          display:inline-flex; align-items:center; gap:8px;
          font-size:10.5px; font-weight:700; letter-spacing:.14em; text-transform:uppercase;
          color:rgba(74,222,128,.8); margin-bottom:14px;
        }
        .hero-eyebrow::before { content:''; width:18px; height:2px; background:currentColor; border-radius:2px; }
        .hero-title {
          font-family:'Fraunces',serif;
          font-size:clamp(2rem,4vw,3rem); font-weight:900;
          color:#fff; letter-spacing:-.04em; line-height:1.05; margin-bottom:10px;
        }
        .hero-title em { font-style:italic; color:#4ade80; }
        .hero-sub { font-size:14.5px; color:rgba(255,255,255,.45); line-height:1.75; max-width:48ch; margin-bottom:32px; }

        /* summary cards in hero */
        .summary-row { display:flex; gap:12px; flex-wrap:wrap; }
        .summary-card {
          display:flex; align-items:center; gap:12px;
          background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.12);
          border-radius:14px; padding:14px 20px;
          backdrop-filter:blur(8px); cursor:pointer;
          transition:all .2s;
        }
        .summary-card:hover  { background:rgba(255,255,255,.12); }
        .summary-card.active { background:rgba(255,255,255,.14); border-color:rgba(74,222,128,.4); }
        .summary-icon {
          width:38px; height:38px; border-radius:10px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center; font-size:17px;
          background:rgba(255,255,255,.08);
        }
        .summary-num  { font-family:'Fraunces',serif; font-size:22px; font-weight:900; color:#fff; line-height:1; }
        .summary-lbl  { font-size:11px; color:rgba(255,255,255,.4); font-weight:600; letter-spacing:.04em; margin-top:2px; }

        /* ── BODY ── */
        .ma-body { max-width:1180px; margin:0 auto; padding:32px 5% 64px; }

        /* error */
        .err-box { padding:14px 18px; border-radius:12px; font-size:13.5px; line-height:1.55; margin-bottom:20px;
                   background:rgba(220,38,38,.07); border:1px solid rgba(220,38,38,.2); color:#991b1b;
                   display:flex; align-items:flex-start; gap:10px; }

        /* list */
        .appt-list { display:flex; flex-direction:column; gap:14px; }

        /* appointment card */
        .appt-card {
          background:var(--white); border:1.5px solid var(--border);
          border-radius:var(--r-lg); overflow:hidden;
          box-shadow:var(--shadow-md); display:flex;
          transition:all .22s; animation:fadeUp .35s ease both;
        }
        .appt-card:hover { border-color:rgba(22,163,74,.25); box-shadow:0 8px 32px rgba(22,163,74,.1); transform:translateY(-2px); }
        .appt-card.is-cancelled { opacity:.72; }
        .appt-card.is-completed { }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

        /* date column */
        .appt-date-col {
          width:80px; flex-shrink:0; display:flex; flex-direction:column;
          align-items:center; justify-content:center; gap:2px;
          padding:20px 0; border-right:1.5px solid var(--border);
        }
        .date-day  { font-size:10px; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--ink3); }
        .date-num  { font-family:'Fraunces',serif; font-size:28px; font-weight:900; color:var(--ink); line-height:1; letter-spacing:-.04em; }
        .date-mon  { font-size:11px; font-weight:700; color:var(--g); letter-spacing:.05em; }

        /* main content */
        .appt-main { flex:1; padding:18px 22px; display:flex; flex-direction:column; justify-content:center; gap:10px; min-width:0; }
        .appt-top  { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
        .appt-num  { font-size:11px; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--ink3); }

        /* status pill */
        .status-pill {
          display:inline-flex; align-items:center; gap:6px;
          padding:4px 12px; border-radius:999px; font-size:11.5px; font-weight:700;
        }
        .status-dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }

        /* time & doctor row */
        .appt-meta { display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
        .meta-chip {
          display:flex; align-items:center; gap:7px;
          background:var(--off); border:1px solid var(--border);
          border-radius:8px; padding:6px 12px;
          font-size:12.5px; color:var(--ink2); font-weight:500;
        }
        .meta-chip span:first-child { font-size:14px; }

        /* doctor name */
        .appt-doc-name { font-size:16px; font-weight:700; color:var(--ink); line-height:1.2; }
        .appt-doc-spec { font-size:12.5px; color:var(--ink3); margin-top:2px; }

        /* action column */
        .appt-action-col {
          display:flex; align-items:center; justify-content:center;
          padding:18px 22px; border-left:1.5px solid var(--border);
          flex-shrink:0;
        }
        .btn-cancel {
          padding:10px 20px; border-radius:11px; border:1.5px solid rgba(220,38,38,.3);
          background:rgba(220,38,38,.06); color:#dc2626;
          font-size:13px; font-weight:700; font-family:'DM Sans',sans-serif;
          cursor:pointer; transition:all .18s; white-space:nowrap;
        }
        .btn-cancel:hover:not(:disabled) { background:rgba(220,38,38,.12); border-color:#dc2626; }
        .btn-cancel:disabled { opacity:.5; cursor:not-allowed; }
        .btn-status {
          padding:10px 18px; border-radius:11px; border:1px solid var(--border);
          background:var(--off); color:var(--ink3);
          font-size:13px; font-weight:600; font-family:'DM Sans',sans-serif;
          cursor:default; white-space:nowrap;
        }

        /* empty state */
        .empty-box {
          padding:80px 24px; text-align:center;
          display:flex; flex-direction:column; align-items:center; gap:16px;
          background:var(--white); border:1.5px dashed var(--border);
          border-radius:var(--r-lg);
        }
        .empty-icon  { font-size:48px; }
        .empty-title { font-family:'Fraunces',serif; font-size:22px; font-weight:900; color:var(--ink); letter-spacing:-.04em; }
        .empty-sub   { font-size:14px; color:var(--ink3); line-height:1.7; max-width:36ch; }
        .btn-primary {
          display:inline-flex; align-items:center; gap:8px;
          background:var(--g); color:#fff; padding:13px 26px; border-radius:12px;
          font-size:14px; font-weight:700; font-family:'DM Sans',sans-serif;
          text-decoration:none; border:none; cursor:pointer; transition:all .2s;
          box-shadow:var(--shadow-green); margin-top:6px;
        }
        .btn-primary:hover { background:var(--g-d); transform:translateY(-2px); }

        /* spinner */
        .spinner-box { padding:80px 20px; display:flex; flex-direction:column; align-items:center; gap:14px; }
        .spinner { width:42px; height:42px; border-radius:50%; border:3px solid var(--border); border-top-color:var(--g); animation:spin .8s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .spinner-txt { font-size:14px; color:var(--ink3); }

        /* section label */
        .section-meta { font-size:13px; color:var(--ink3); margin-bottom:16px; font-weight:500; }
        .section-meta strong { color:var(--ink); }

        @media (max-width:640px) {
          .summary-row { gap:8px; }
          .summary-card { padding:12px 14px; }
          .ma-body { padding:20px 4% 48px; }
          .appt-date-col { width:64px; }
          .appt-action-col { padding:14px 14px; }
          .appt-main { padding:14px 16px; }
          .btn-cancel, .btn-status { font-size:12px; padding:9px 14px; }
        }
      `}</style>

      <Navbar />

      {/* ── HERO ── */}
      <div className="ma-hero">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-inner">
          <div className="hero-eyebrow">My Schedule</div>
          <h1 className="hero-title">Your <em>Appointments</em></h1>
          <p className="hero-sub">
            All your upcoming and past visits in one place. Track status and cancel active bookings anytime.
          </p>

          {/* Summary filter cards */}
          {!loading && (
            <div className="summary-row">
              {[
                { key:"all",       icon:"📋", label:"Total",     num: counts.all       },
                { key:"booked",    icon:"📅", label:"Upcoming",  num: counts.booked    },
                { key:"completed", icon:"✅", label:"Completed", num: counts.completed },
                { key:"cancelled", icon:"❌", label:"Cancelled", num: counts.cancelled },
              ].map(s => (
                <div
                  key={s.key}
                  className={`summary-card ${filter === s.key ? "active" : ""}`}
                  onClick={() => setFilter(s.key)}
                >
                  <div className="summary-icon">{s.icon}</div>
                  <div>
                    <div className="summary-num">{s.num}</div>
                    <div className="summary-lbl">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="ma-body">

        {/* Error */}
        {error && (
          <div className="err-box">
            <span style={{ fontSize:18, flexShrink:0 }}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="spinner-box">
            <div className="spinner" />
            <div className="spinner-txt">Loading your appointments…</div>
          </div>
        )}

        {/* Empty state */}
        {!loading && appointments.length === 0 && (
          <div className="empty-box">
            <div className="empty-icon">📅</div>
            <div className="empty-title">No appointments yet</div>
            <p className="empty-sub">
              You haven't booked any visits. Find a doctor and schedule your first appointment.
            </p>
            <Link to="/dashboard/doctors" className="btn-primary">
              Browse Doctors →
            </Link>
          </div>
        )}

        {/* Filtered empty */}
        {!loading && appointments.length > 0 && visible.length === 0 && (
          <div className="empty-box">
            <div className="empty-icon">🔍</div>
            <div className="empty-title">No {filter} appointments</div>
            <p className="empty-sub">You don't have any {filter} appointments right now.</p>
          </div>
        )}

        {/* List */}
        {!loading && visible.length > 0 && (
          <>
            <div className="section-meta">
              Showing <strong>{visible.length}</strong> of <strong>{appointments.length}</strong> appointments
              {filter !== "all" && (
                <button
                  onClick={() => setFilter("all")}
                  style={{ background:"none", border:"none", color:"var(--g)", fontWeight:700, fontSize:13, cursor:"pointer", marginLeft:12, fontFamily:"DM Sans, sans-serif" }}
                >
                  Show all
                </button>
              )}
            </div>

            <div className="appt-list">
              {visible.map((a, idx) => {
                const status  = (a.status || "active").toLowerCase();
                const sc      = getStatus(a.status);
                const cancellable = status !== "cancelled" && status !== "completed";
                const dt      = formatDate(a.appointment_time);
                const isCancelling = cancelling === a.id;

                return (
                  <div
                    key={a.id ?? idx}
                    className={`appt-card ${status === "cancelled" ? "is-cancelled" : ""} ${status === "completed" ? "is-completed" : ""}`}
                    style={{ animationDelay:`${idx * 0.05}s` }}
                  >
                    {/* Date column */}
                    <div className="appt-date-col">
                      <div className="date-day">{dt.day || "—"}</div>
                      <div className="date-num">{dt.dd || "—"}</div>
                      <div className="date-mon">{dt.mon || "—"}</div>
                    </div>

                    {/* Main content */}
                    <div className="appt-main">
                      <div className="appt-top">
                        <span className="appt-num">#{a.id ?? idx + 1}</span>
                        <span
                          className="status-pill"
                          style={{ background:sc.bg, border:`1px solid ${sc.border}`, color:sc.color }}
                        >
                          <span className="status-dot" style={{ background:sc.dot }} />
                          {sc.label}
                        </span>
                      </div>

                      {/* Doctor info */}
                      {a.doctor_name ? (
                        <>
                          <div className="appt-doc-name">{a.doctor_name}</div>
                          {a.doctor_specialization && (
                            <div className="appt-doc-spec">{a.doctor_specialization}</div>
                          )}
                        </>
                      ) : (
                        <div className="appt-doc-name" style={{ color:"var(--ink3)", fontWeight:500 }}>
                          Doctor #{a.doctor_id || "N/A"}
                        </div>
                      )}

                      {/* Meta chips */}
                      <div className="appt-meta">
                        {dt.date && (
                          <div className="meta-chip">
                            <span>📅</span> {dt.date}
                          </div>
                        )}
                        {dt.time && (
                          <div className="meta-chip">
                            <span>🕐</span> {dt.time}
                          </div>
                        )}
                        {a.doctor_charge != null && (
                          <div className="meta-chip">
                            <span>💳</span> ₹ {a.doctor_charge}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action column */}
                    <div className="appt-action-col">
                      {cancellable ? (
                        <button
                          className="btn-cancel"
                          onClick={() => cancel(a.id)}
                          disabled={!!isCancelling}
                        >
                          {isCancelling ? "Cancelling…" : "Cancel Visit"}
                        </button>
                      ) : (
                        <button className="btn-status" disabled>
                          {status === "completed" ? "✅ Completed" : "❌ Cancelled"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MyAppointments;