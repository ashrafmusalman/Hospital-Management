import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listDoctors } from "../services/doctorService";
import { getAppointmentSummary } from "../services/appointmentService";

function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [kpiLoaded, setKpiLoaded]     = useState(false);

  const admin = useMemo(() => {
    for (const key of ["admin", "adminUser", "adminData"]) {
      try { const r = localStorage.getItem(key); if (r) return JSON.parse(r); } catch {}
    }
    return { name: localStorage.getItem("adminName") || "Admin" };
  }, []);

  const [totalDoctors,    setTotalDoctors]    = useState(0);
  const [kpiAppointments, setKpiAppointments] = useState(0);
  const [kpiCompleted,    setKpiCompleted]    = useState(0);
  const [kpiCancelled,    setKpiCancelled]    = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [docRes, sumRes] = await Promise.allSettled([listDoctors(), getAppointmentSummary()]);
        if (cancelled) return;
        if (docRes.status === "fulfilled") {
          const count = Array.isArray(docRes.value?.data) ? docRes.value.data.length : 0;
          setTotalDoctors(count);
        }
        if (sumRes.status === "fulfilled") {
          const d = sumRes.value?.data || {};
          setKpiAppointments(Number(d.appointments ?? 0));
          setKpiCompleted(Number(d.completed   ?? 0));
          setKpiCancelled(Number(d.cancelled   ?? 0));
        }
      } catch {}
      finally { if (!cancelled) setKpiLoaded(true); }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const total = kpiAppointments + kpiCompleted + kpiCancelled;
  const pct   = (v) => (total > 0 ? Math.round((v / total) * 100) : 0);

  const bookedPct    = pct(kpiAppointments);
  const completedPct = pct(kpiCompleted);
  const cancelledPct = pct(kpiCancelled);

  // Donut chart math
  const R   = 54;
  const C   = 2 * Math.PI * R; // ~339.3
  const segments = total > 0 ? [
    { value: kpiAppointments, color: "#60a5fa", label: "Booked"    },
    { value: kpiCompleted,    color: "#34d399", label: "Completed" },
    { value: kpiCancelled,    color: "#f87171", label: "Cancelled" },
  ] : [];
  let offset = 0;
  const arcs = segments.map((s) => {
    const dash = (s.value / total) * C;
    const gap  = C - dash;
    const arc  = { ...s, dash, gap, offset };
    offset += dash;
    return arc;
  });

  const navItems = [
    { path: "/dashboard",    label: "Dashboard",     icon: "⊞" },
    { path: "/appointments", label: "Appointments",  icon: "📅" },
    { path: "/doctors",      label: "Doctors",       icon: "🩺" },
    { path: "/create-doctor",label: "Add Doctor",    icon: "➕" },
  ];

  const greetHour = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const today = new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Sora', sans-serif; background: #060b18; }

        .db-root {
          display: flex; min-height: 100vh;
          font-family: 'Sora', sans-serif;
          background: #060b18;
          position: relative; overflow-x: hidden;
        }

        /* orbs */
        .orb { position: fixed; border-radius: 50%; filter: blur(90px); pointer-events: none; z-index: 0; }
        .orb-1 {
          width: 600px; height: 600px; top: -180px; left: -160px;
          background: radial-gradient(circle, rgba(56,89,200,0.22) 0%, transparent 70%);
          animation: drift1 14s ease-in-out infinite alternate;
        }
        .orb-2 {
          width: 440px; height: 440px; bottom: -100px; right: -120px;
          background: radial-gradient(circle, rgba(14,165,233,0.18) 0%, transparent 70%);
          animation: drift2 18s ease-in-out infinite alternate;
        }
        .orb-3 {
          width: 300px; height: 300px; top: 40%; left: 50%;
          background: radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%);
          animation: drift1 20s ease-in-out infinite alternate-reverse;
        }
        @keyframes drift1 { from{transform:translate(0,0)} to{transform:translate(50px,35px)} }
        @keyframes drift2 { from{transform:translate(0,0)} to{transform:translate(-35px,25px)} }

        .grid-bg {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px);
          background-size: 44px 44px;
        }

        /* ── SIDEBAR ── */
        .sidebar {
          position: fixed; top: 0; left: 0; bottom: 0; z-index: 300;
          width: 240px;
          background: rgba(8,13,28,0.92);
          border-right: 1px solid rgba(255,255,255,0.07);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          display: flex; flex-direction: column;
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .sidebar-logo {
          padding: 28px 24px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .sidebar-logo-icon {
          width: 40px; height: 40px; border-radius: 12px;
          background: linear-gradient(135deg, rgba(56,89,200,0.8), rgba(14,165,233,0.8));
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; margin-bottom: 12px;
          box-shadow: 0 4px 16px rgba(56,89,200,0.3);
        }
        .sidebar-logo h2 { font-size: 15px; font-weight: 700; color: #fff; letter-spacing: -0.2px; }
        .sidebar-logo p  { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 2px; }

        .sidebar-nav { padding: 16px 12px; flex: 1; display: flex; flex-direction: column; gap: 4px; }
        .nav-label {
          font-size: 9.5px; font-weight: 700; letter-spacing: 1.4px;
          text-transform: uppercase; color: rgba(255,255,255,0.2);
          padding: 10px 12px 6px;
        }
        .nav-btn {
          display: flex; align-items: center; gap: 11px;
          padding: 10px 14px; border-radius: 10px; width: 100%;
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.45); font-size: 13.5px; font-weight: 500;
          font-family: 'Sora', sans-serif;
          transition: background 0.16s, color 0.16s;
          text-align: left;
        }
        .nav-btn:hover { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.8); }
        .nav-btn.active { background: rgba(96,165,250,0.12); color: #60a5fa; border: 1px solid rgba(96,165,250,0.2); }
        .nav-btn .n-icon { font-size: 15px; width: 20px; text-align: center; flex-shrink: 0; }

        .sidebar-footer {
          padding: 16px 16px 24px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }
        .admin-chip {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
        }
        .admin-avatar {
          width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
          background: linear-gradient(135deg, rgba(56,89,200,0.7), rgba(14,165,233,0.7));
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: #fff;
        }
        .admin-name  { font-size: 12.5px; font-weight: 600; color: rgba(255,255,255,0.8); }
        .admin-role  { font-size: 11px; color: rgba(255,255,255,0.3); margin-top: 1px; }

        /* ── MOBILE TOPBAR ── */
        .mobile-bar {
          display: none; position: fixed; top: 0; left: 0; right: 0; z-index: 250;
          height: 56px; padding: 0 16px;
          align-items: center; justify-content: space-between;
          background: rgba(6,11,24,0.85);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .ham-btn {
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; padding: 7px 10px; cursor: pointer; color: #fff;
          display: flex; align-items: center; gap: 3px;
        }
        .ham-line { width: 16px; height: 2px; background: currentColor; display: block; border-radius: 2px; }

        /* ── MAIN ── */
        .db-main {
          margin-left: 240px; flex: 1; position: relative; z-index: 10;
          padding: 36px 32px 60px;
          min-height: 100vh;
        }

        /* greeting */
        .greeting { margin-bottom: 32px; }
        .greeting-eyebrow {
          font-size: 11px; font-weight: 600; letter-spacing: 1.4px;
          text-transform: uppercase; color: rgba(96,165,250,0.7); margin-bottom: 8px;
        }
        .greeting-title {
          font-size: 24px; font-weight: 700; color: #fff; letter-spacing: -0.4px; margin-bottom: 4px;
        }
        .greeting-date { font-size: 12.5px; color: rgba(255,255,255,0.3); }

        /* ── KPI CARDS ── */
        .kpi-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;
          margin-bottom: 28px;
        }
        .kpi-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 22px 22px 18px;
          cursor: pointer; position: relative; overflow: hidden;
          transition: border-color 0.2s, background 0.2s, transform 0.18s;
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
        }
        .kpi-card:hover { border-color: rgba(255,255,255,0.16); background: rgba(255,255,255,0.07); transform: translateY(-2px); }
        .kpi-card.no-click { cursor: default; }
        .kpi-card.no-click:hover { transform: none; }
        .kpi-glow {
          position: absolute; width: 80px; height: 80px; border-radius: 50%;
          top: -20px; right: -20px; filter: blur(24px); pointer-events: none;
        }
        .kpi-icon-wrap {
          width: 38px; height: 38px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          font-size: 17px; margin-bottom: 14px;
        }
        .kpi-label { font-size: 11px; font-weight: 600; letter-spacing: 0.8px; text-transform: uppercase; color: rgba(255,255,255,0.35); margin-bottom: 8px; }
        .kpi-value { font-size: 30px; font-weight: 800; color: #fff; letter-spacing: -1px; line-height: 1; margin-bottom: 6px; }
        .kpi-sub   { font-size: 11px; color: rgba(255,255,255,0.25); }
        .kpi-arrow {
          position: absolute; bottom: 18px; right: 18px;
          color: rgba(255,255,255,0.15); transition: color 0.18s, transform 0.18s;
        }
        .kpi-card:hover .kpi-arrow { color: rgba(255,255,255,0.45); transform: translate(2px,-2px); }

        /* ── BOTTOM GRID ── */
        .bottom-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
        }

        /* panel */
        .panel {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px; overflow: hidden;
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
        }
        .panel-head {
          padding: 20px 24px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          display: flex; align-items: center; justify-content: space-between;
        }
        .panel-title { font-size: 14px; font-weight: 700; color: #fff; letter-spacing: -0.2px; }
        .panel-sub   { font-size: 12px; color: rgba(255,255,255,0.3); margin-top: 2px; }
        .panel-body  { padding: 24px; }

        /* ── DONUT CHART ── */
        .donut-wrap {
          display: flex; flex-direction: column; align-items: center; gap: 24px;
        }
        .donut-svg-wrap { position: relative; width: 160px; height: 160px; }
        .donut-svg { transform: rotate(-90deg); }
        .donut-center {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .donut-total-num  { font-size: 26px; font-weight: 800; color: #fff; letter-spacing: -1px; line-height: 1; }
        .donut-total-label{ font-size: 10.5px; color: rgba(255,255,255,0.3); font-weight: 500; margin-top: 3px; }

        .legend { display: flex; flex-direction: column; gap: 11px; width: 100%; }
        .legend-row {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 14px; border-radius: 10px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
        }
        .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .legend-label { font-size: 12.5px; font-weight: 500; color: rgba(255,255,255,0.6); flex: 1; }
        .legend-right  { text-align: right; }
        .legend-count  { font-size: 15px; font-weight: 700; color: #fff; }
        .legend-pct    { font-size: 11px; color: rgba(255,255,255,0.3); }

        /* bar chart */
        .bar-chart { display: flex; flex-direction: column; gap: 16px; }
        .bar-row   { display: flex; flex-direction: column; gap: 6px; }
        .bar-meta  { display: flex; justify-content: space-between; align-items: baseline; }
        .bar-name  { font-size: 12.5px; font-weight: 500; color: rgba(255,255,255,0.6); }
        .bar-nums  { font-size: 12px; color: rgba(255,255,255,0.35); }
        .bar-track {
          height: 8px; border-radius: 20px;
          background: rgba(255,255,255,0.06); overflow: hidden;
        }
        .bar-fill  { height: 100%; border-radius: 20px; transition: width 1s cubic-bezier(0.4,0,0.2,1); }

        /* quick actions */
        .qa-grid { display: flex; flex-direction: column; gap: 10px; }
        .qa-btn {
          display: flex; align-items: center; gap: 13px;
          padding: 14px 16px; border-radius: 12px; width: 100%;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer; font-family: 'Sora', sans-serif;
          transition: background 0.18s, border-color 0.18s, transform 0.16s;
          text-align: left;
        }
        .qa-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.16); transform: translateX(3px); }
        .qa-icon {
          width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 16px;
        }
        .qa-label { font-size: 13.5px; font-weight: 600; color: rgba(255,255,255,0.8); }
        .qa-desc  { font-size: 11.5px; color: rgba(255,255,255,0.3); margin-top: 2px; }
        .qa-arrow { margin-left: auto; color: rgba(255,255,255,0.2); transition: color 0.18s, transform 0.18s; flex-shrink: 0; }
        .qa-btn:hover .qa-arrow { color: rgba(255,255,255,0.6); transform: translateX(3px); }

        /* overlay */
        .sidebar-overlay {
          display: none; position: fixed; inset: 0; z-index: 280;
          background: rgba(0,0,0,0.55); backdrop-filter: blur(3px);
        }

        /* responsive */
        @media (max-width: 1024px) {
          .kpi-grid { grid-template-columns: repeat(2, 1fr); }
          .bottom-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .sidebar-overlay { display: block; }
          .mobile-bar { display: flex; }
          .db-main { margin-left: 0; padding: 80px 16px 60px; }
          .kpi-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
        }
        @media (max-width: 480px) {
          .kpi-grid { grid-template-columns: 1fr 1fr; }
        }

        @keyframes countUp {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .kpi-value { animation: countUp 0.5s ease both; }
      `}</style>

      <div className="db-root">
        <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />
        <div className="grid-bg" />

        {/* ── Sidebar ── */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">🏥</div>
            <h2>HospitalAdmin</h2>
            <p>Management Console</p>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-label">Menu</div>
            {navItems.map((n) => (
              <button
                key={n.path}
                className={`nav-btn ${location?.pathname === n.path || (n.path === "/dashboard" && window.location.pathname === "/dashboard") ? "active" : ""}`}
                onClick={() => { navigate(n.path); setSidebarOpen(false); }}
              >
                <span className="n-icon">{n.icon}</span>
                {n.label}
              </button>
            ))}
          </nav>

          <div className="sidebar-footer">
            <div className="admin-chip">
              <div className="admin-avatar">
                {(admin?.name || "A")[0].toUpperCase()}
              </div>
              <div>
                <div className="admin-name">{admin?.name || "Admin"}</div>
                <div className="admin-role">Administrator</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

        {/* Mobile topbar */}
        <div className="mobile-bar">
          <button className="ham-btn" onClick={() => setSidebarOpen(true)}>
            <span className="ham-line" /><span className="ham-line" style={{marginTop:4}} /><span className="ham-line" style={{marginTop:4}} />
          </button>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>HospitalAdmin</span>
          <div style={{ width: 36 }} />
        </div>

        {/* ── Main ── */}
        <main className="db-main">

          {/* Greeting */}
          <div className="greeting">
            <div className="greeting-eyebrow">Admin Panel</div>
            <div className="greeting-title">{greetHour()}, {admin?.name || "Admin"} 👋</div>
            <div className="greeting-date">{today}</div>
          </div>

          {/* KPI cards */}
          <div className="kpi-grid">
            {/* Doctors */}
            <div className="kpi-card" onClick={() => navigate("/doctors")}>
              <div className="kpi-glow" style={{ background: "rgba(96,165,250,0.4)" }} />
              <div className="kpi-icon-wrap" style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.2)" }}>👨‍⚕️</div>
              <div className="kpi-label">Total Doctors</div>
              <div className="kpi-value" key={totalDoctors}>{totalDoctors}</div>
              <div className="kpi-sub">Registered professionals</div>
              <svg className="kpi-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10"/></svg>
            </div>

            {/* Booked */}
            <div className="kpi-card" onClick={() => navigate("/appointments")}>
              <div className="kpi-glow" style={{ background: "rgba(96,165,250,0.35)" }} />
              <div className="kpi-icon-wrap" style={{ background: "rgba(96,165,250,0.12)", border: "1px solid rgba(96,165,250,0.2)" }}>📅</div>
              <div className="kpi-label">Booked</div>
              <div className="kpi-value" key={kpiAppointments}>{kpiAppointments}</div>
              <div className="kpi-sub">Active appointments</div>
              <svg className="kpi-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M7 7h10v10"/></svg>
            </div>

            {/* Completed */}
            <div className="kpi-card no-click">
              <div className="kpi-glow" style={{ background: "rgba(52,211,153,0.35)" }} />
              <div className="kpi-icon-wrap" style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.2)" }}>✅</div>
              <div className="kpi-label">Completed</div>
              <div className="kpi-value" key={kpiCompleted}>{kpiCompleted}</div>
              <div className="kpi-sub">Successfully finished</div>
            </div>

            {/* Cancelled */}
            <div className="kpi-card no-click">
              <div className="kpi-glow" style={{ background: "rgba(248,113,113,0.35)" }} />
              <div className="kpi-icon-wrap" style={{ background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.2)" }}>❌</div>
              <div className="kpi-label">Cancelled</div>
              <div className="kpi-value" key={kpiCancelled}>{kpiCancelled}</div>
              <div className="kpi-sub">Cancelled appointments</div>
            </div>
          </div>

          {/* Bottom grid */}
          <div className="bottom-grid">

            {/* Donut chart panel */}
            <div className="panel">
              <div className="panel-head">
                <div>
                  <div className="panel-title">Appointment Overview</div>
                  <div className="panel-sub">Status distribution</div>
                </div>
              </div>
              <div className="panel-body">
                <div className="donut-wrap">
                  {/* SVG Donut */}
                  <div className="donut-svg-wrap">
                    <svg className="donut-svg" width="160" height="160" viewBox="0 0 160 160">
                      {/* background ring */}
                      <circle cx="80" cy="80" r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="18" />
                      {total === 0 ? (
                        <circle cx="80" cy="80" r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="18"
                          strokeDasharray={`${C * 0.98} ${C * 0.02}`} strokeLinecap="round" />
                      ) : (
                        arcs.map((arc, i) => (
                          <circle key={i} cx="80" cy="80" r={R} fill="none"
                            stroke={arc.color} strokeWidth="18"
                            strokeDasharray={`${arc.dash - 3} ${arc.gap + 3}`}
                            strokeDashoffset={-arc.offset}
                            strokeLinecap="round"
                            style={{ filter: `drop-shadow(0 0 6px ${arc.color}55)` }}
                          />
                        ))
                      )}
                    </svg>
                    <div className="donut-center">
                      <div className="donut-total-num">{total}</div>
                      <div className="donut-total-label">Total</div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="legend">
                    {[
                      { label: "Booked",    value: kpiAppointments, color: "#60a5fa", pct: bookedPct },
                      { label: "Completed", value: kpiCompleted,    color: "#34d399", pct: completedPct },
                      { label: "Cancelled", value: kpiCancelled,    color: "#f87171", pct: cancelledPct },
                    ].map((l) => (
                      <div className="legend-row" key={l.label}>
                        <div className="legend-dot" style={{ background: l.color, boxShadow: `0 0 6px ${l.color}88` }} />
                        <div className="legend-label">{l.label}</div>
                        <div className="legend-right">
                          <div className="legend-count">{l.value}</div>
                          <div className="legend-pct">{l.pct}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Horizontal bar chart */}
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <div className="panel-title">Status Breakdown</div>
                    <div className="panel-sub">Proportional view</div>
                  </div>
                </div>
                <div className="panel-body">
                  <div className="bar-chart">
                    {[
                      { label: "Booked",    value: kpiAppointments, color: "#60a5fa", pct: bookedPct },
                      { label: "Completed", value: kpiCompleted,    color: "#34d399", pct: completedPct },
                      { label: "Cancelled", value: kpiCancelled,    color: "#f87171", pct: cancelledPct },
                    ].map((b) => (
                      <div className="bar-row" key={b.label}>
                        <div className="bar-meta">
                          <span className="bar-name">{b.label}</span>
                          <span className="bar-nums">{b.value} &nbsp;·&nbsp; {b.pct}%</span>
                        </div>
                        <div className="bar-track">
                          <div className="bar-fill" style={{
                            width: kpiLoaded ? `${b.pct}%` : "0%",
                            background: `linear-gradient(90deg, ${b.color}99, ${b.color})`,
                            boxShadow: `0 0 8px ${b.color}55`,
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <div className="panel-title">Quick Actions</div>
                    <div className="panel-sub">Common tasks</div>
                  </div>
                </div>
                <div className="panel-body">
                  <div className="qa-grid">
                    {[
                      { icon: "➕", bg: "rgba(96,165,250,0.12)", path: "/create-doctor", label: "Add New Doctor",    desc: "Register a medical professional" },
                      { icon: "📋", bg: "rgba(52,211,153,0.12)", path: "/appointments",  label: "View Appointments", desc: "Browse all appointment records" },
                      { icon: "🩺", bg: "rgba(251,191,36,0.12)", path: "/doctors",        label: "Doctors List",     desc: "Manage registered doctors" },
                    ].map((a) => (
                      <button key={a.path} className="qa-btn" onClick={() => navigate(a.path)}>
                        <div className="qa-icon" style={{ background: a.bg }}>{a.icon}</div>
                        <div>
                          <div className="qa-label">{a.label}</div>
                          <div className="qa-desc">{a.desc}</div>
                        </div>
                        <svg className="qa-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default AdminDashboard;