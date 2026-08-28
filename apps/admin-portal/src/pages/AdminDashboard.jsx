import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { listDoctors } from "../services/doctorService";
import { getAppointmentSummary, getWeeklyAppointments } from "../services/appointmentService";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  RadialBarChart, RadialBar, Legend,
} from "recharts";

const STATUS = {
  booked:    { color: "#38bdf8", glow: "rgba(56,189,248,0.35)",  bg: "rgba(56,189,248,0.08)",  border: "rgba(56,189,248,0.2)",  label: "Booked",    icon: "📅" },
  completed: { color: "#4ade80", glow: "rgba(74,222,128,0.35)",  bg: "rgba(74,222,128,0.08)",  border: "rgba(74,222,128,0.2)",  label: "Completed", icon: "✅" },
  cancelled: { color: "#fb7185", glow: "rgba(251,113,133,0.35)", bg: "rgba(251,113,133,0.08)", border: "rgba(251,113,133,0.2)", label: "Cancelled", icon: "✕"  },
  doctors:   { color: "#a78bfa", glow: "rgba(167,139,250,0.35)", bg: "rgba(167,139,250,0.08)", border: "rgba(167,139,250,0.2)", label: "Doctors",   icon: "🩺" },
};

const PieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{ background: "rgba(8,14,30,0.95)", border: `1px solid ${d.payload.color}44`, borderRadius: 10, padding: "10px 16px", backdropFilter: "blur(12px)" }}>
      <div style={{ color: d.payload.color, fontWeight: 700, fontSize: 13 }}>{d.name}</div>
      <div style={{ color: "#fff", fontSize: 20, fontWeight: 800, marginTop: 2 }}>{d.value}</div>
      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 2 }}>
        {d.payload.total > 0 ? Math.round((d.value / d.payload.total) * 100) : 0}% of total
      </div>
    </div>
  );
};

const AreaTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "rgba(8,14,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 16px", backdropFilter: "blur(12px)" }}>
      <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginBottom: 6 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: p.color }} />
          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{p.name}</span>
          <span style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginLeft: "auto" }}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

function Counter({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * ease));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);
  return <>{display}</>;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loaded, setLoaded]           = useState(false);
  const [totalDoctors,    setTotalDoctors]    = useState(0);
  const [kpiAppointments, setKpiAppointments] = useState(0);
  const [kpiCompleted,    setKpiCompleted]    = useState(0);
  const [kpiCancelled,    setKpiCancelled]    = useState(0);
  const [weeklyData,      setWeeklyData]      = useState([]);

  const admin = useMemo(() => {
    for (const key of ["admin", "adminUser", "adminData"]) {
      try { const r = localStorage.getItem(key); if (r) return JSON.parse(r); } catch {}
    }
    return { name: localStorage.getItem("adminName") || "Admin" };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [docRes, sumRes, weekRes] = await Promise.allSettled([
        listDoctors(),
        getAppointmentSummary(),
        getWeeklyAppointments(),
      ]);
      if (!alive) return;
      if (docRes.status === "fulfilled")
        setTotalDoctors(Array.isArray(docRes.value?.data) ? docRes.value.data.length : 0);
      if (sumRes.status === "fulfilled") {
        const d = sumRes.value?.data || {};
        setKpiAppointments(Number(d.appointments ?? 0));
        setKpiCompleted(Number(d.completed ?? 0));
        setKpiCancelled(Number(d.cancelled ?? 0));
      }
      if (weekRes.status === "fulfilled" && Array.isArray(weekRes.value?.data)) {
        setWeeklyData(weekRes.value.data);
      }
      setLoaded(true);
    })();
    return () => { alive = false; };
  }, []);

  const total = kpiAppointments + kpiCompleted + kpiCancelled;

  const pieData = [
    { name: "Booked",    value: kpiAppointments, color: STATUS.booked.color,    total },
    { name: "Completed", value: kpiCompleted,    color: STATUS.completed.color, total },
    { name: "Cancelled", value: kpiCancelled,    color: STATUS.cancelled.color, total },
  ].filter(d => d.value > 0);

  const radialData = [
    { name: "Booked",    value: total > 0 ? Math.round((kpiAppointments / total) * 100) : 0, fill: STATUS.booked.color },
    { name: "Completed", value: total > 0 ? Math.round((kpiCompleted    / total) * 100) : 0, fill: STATUS.completed.color },
    { name: "Cancelled", value: total > 0 ? Math.round((kpiCancelled    / total) * 100) : 0, fill: STATUS.cancelled.color },
  ];

  const kpis = [
    { key: "doctors",   value: totalDoctors,    label: "Doctors",   sub: "Registered professionals", onClick: () => navigate("/doctors") },
    { key: "booked",    value: kpiAppointments, label: "Booked",    sub: "Pending appointments",     onClick: () => navigate("/appointments") },
    { key: "completed", value: kpiCompleted,    label: "Completed", sub: "Successfully finished",    onClick: null },
    { key: "cancelled", value: kpiCancelled,    label: "Cancelled", sub: "Cancelled bookings",       onClick: null },
  ];

  const navItems = [
    { path: "/dashboard",     label: "Dashboard",    icon: "⊞" },
    { path: "/appointments",  label: "Appointments", icon: "📅" },
    { path: "/doctors",       label: "Doctors",      icon: "🩺" },
    { path: "/create-doctor", label: "Add Doctor",   icon: "➕" },
    { path: "/site-content",  label: "Site Content", icon: "🖋️" },
  ];

  const greet = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #03070f; }
        .root { display: flex; min-height: 100vh; background: #03070f; position: relative; overflow-x: hidden; }
        .bg-noise {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E");
          opacity: 0.4;
        }
        .bg-grad {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 80% 50% at 10% 0%, rgba(56,189,248,0.07) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 90% 100%, rgba(167,139,250,0.06) 0%, transparent 60%),
            radial-gradient(ellipse 50% 60% at 50% 50%, rgba(74,222,128,0.03) 0%, transparent 70%);
        }
        .grid-lines {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
          background-size: 48px 48px;
        }
        .sidebar {
          position: fixed; top: 0; left: 0; bottom: 0; width: 232px; z-index: 300;
          background: rgba(5,10,20,0.9); border-right: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
          display: flex; flex-direction: column;
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        .s-logo { padding: 26px 20px 18px; border-bottom: 1px solid rgba(255,255,255,0.06); }
        .s-logo-icon {
          width: 38px; height: 38px; border-radius: 11px;
          background: linear-gradient(135deg, #38bdf8, #818cf8);
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; margin-bottom: 10px;
          box-shadow: 0 4px 20px rgba(56,189,248,0.25);
        }
        .s-logo h2 { font-size: 14px; font-weight: 800; color: #fff; letter-spacing: -0.2px; }
        .s-logo p  { font-size: 10.5px; color: rgba(255,255,255,0.28); margin-top: 2px; }
        .s-nav { padding: 14px 10px; flex: 1; display: flex; flex-direction: column; gap: 2px; }
        .s-sec { font-size: 9px; font-weight: 700; letter-spacing: 1.8px; text-transform: uppercase; color: rgba(255,255,255,0.18); padding: 10px 12px 6px; }
        .s-btn {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 13px; border-radius: 9px; width: 100%;
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.4); font-size: 13px; font-weight: 500;
          font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.15s; text-align: left;
        }
        .s-btn:hover { background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.75); }
        .s-btn.active { background: rgba(56,189,248,0.1); color: #38bdf8; border: 1px solid rgba(56,189,248,0.18); }
        .s-icon { font-size: 14px; width: 18px; text-align: center; flex-shrink: 0; }
        .s-footer { padding: 14px 14px 20px; border-top: 1px solid rgba(255,255,255,0.06); }
        .s-user {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 10px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
        }
        .s-avatar {
          width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
          background: linear-gradient(135deg, rgba(56,189,248,0.6), rgba(129,140,248,0.6));
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 800; color: #fff;
        }
        .s-uname { font-size: 12px; font-weight: 700; color: rgba(255,255,255,0.8); }
        .s-urole { font-size: 10.5px; color: rgba(255,255,255,0.28); margin-top: 1px; }
        .topbar {
          display: none; position: fixed; top: 0; left: 0; right: 0; z-index: 250;
          height: 54px; padding: 0 16px;
          align-items: center; justify-content: space-between;
          background: rgba(3,7,15,0.88);
          backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .ham { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 7px 10px; cursor: pointer; color: #fff; }
        .main { margin-left: 232px; flex: 1; position: relative; z-index: 10; padding: 36px 28px 60px; min-height: 100vh; }
        .ph { margin-bottom: 30px; }
        .ph-eye { font-size: 10.5px; font-weight: 700; letter-spacing: 1.6px; text-transform: uppercase; color: rgba(56,189,248,0.6); margin-bottom: 6px; }
        .ph-title { font-size: 22px; font-weight: 800; color: #fff; letter-spacing: -0.5px; margin-bottom: 4px; }
        .ph-date { font-size: 12px; color: rgba(255,255,255,0.25); }
        .kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 22px; }
        .kpi {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px; padding: 20px 20px 16px;
          position: relative; overflow: hidden; transition: all 0.2s; cursor: pointer;
          backdrop-filter: blur(10px);
        }
        .kpi.nc { cursor: default; }
        .kpi:not(.nc):hover { transform: translateY(-3px); background: rgba(255,255,255,0.05); }
        .kpi-glow { position: absolute; width: 100px; height: 100px; top: -30px; right: -30px; border-radius: 50%; filter: blur(28px); pointer-events: none; }
        .kpi-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
        .kpi-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
        .kpi-badge { font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 20px; font-family: 'JetBrains Mono', monospace; }
        .kpi-num { font-size: 34px; font-weight: 800; color: #fff; letter-spacing: -1.5px; line-height: 1; margin-bottom: 6px; font-family: 'JetBrains Mono', monospace; }
        .kpi-label { font-size: 12.5px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 2px; }
        .kpi-sub   { font-size: 10.5px; color: rgba(255,255,255,0.22); }
        .kpi-bar-t { height: 3px; background: rgba(255,255,255,0.06); border-radius: 10px; margin-top: 14px; overflow: hidden; }
        .kpi-bar-f { height: 100%; border-radius: 10px; transition: width 1.4s cubic-bezier(0.4,0,0.2,1); }
        .row1 { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 16px; margin-bottom: 16px; }
        .row2 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
        .panel {
          background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 18px; overflow: hidden;
          backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
          animation: fadeUp 0.5s ease both; animation-delay: 0.25s;
        }
        .ph2 { padding: 18px 22px 14px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: flex-start; justify-content: space-between; }
        .pt { font-size: 13.5px; font-weight: 700; color: #fff; letter-spacing: -0.2px; }
        .ps { font-size: 11px; color: rgba(255,255,255,0.28); margin-top: 3px; }
        .pbadge { font-size: 10px; font-weight: 700; padding: 3px 9px; border-radius: 20px; background: rgba(56,189,248,0.1); color: #38bdf8; border: 1px solid rgba(56,189,248,0.2); white-space: nowrap; font-family: 'JetBrains Mono', monospace; }
        .pb { padding: 20px 22px; }
        .donut-layout { display: flex; align-items: center; gap: 28px; }
        .d-legend { display: flex; flex-direction: column; gap: 10px; flex: 1; }
        .li {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 13px; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.05); transition: background 0.15s;
        }
        .li:hover { background: rgba(255,255,255,0.04); }
        .li-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
        .li-name { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.55); flex: 1; }
        .li-val  { font-size: 15px; font-weight: 800; color: #fff; font-family: 'JetBrains Mono', monospace; }
        .li-pct  { font-size: 10px; color: rgba(255,255,255,0.28); margin-top: 1px; font-family: 'JetBrains Mono', monospace; }
        .rs { display: flex; flex-direction: column; gap: 12px; }
        .rr { display: flex; align-items: center; gap: 12px; }
        .ri { width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .rin { flex: 1; }
        .rl { font-size: 11.5px; font-weight: 600; color: rgba(255,255,255,0.5); margin-bottom: 5px; }
        .rt { height: 6px; background: rgba(255,255,255,0.06); border-radius: 20px; overflow: hidden; }
        .rf { height: 100%; border-radius: 20px; transition: width 1.4s cubic-bezier(0.4,0,0.2,1); }
        .rp { font-size: 12px; font-weight: 800; color: #fff; font-family: 'JetBrains Mono', monospace; flex-shrink: 0; width: 38px; text-align: right; }
        .qa-list { display: flex; flex-direction: column; gap: 8px; }
        .qa {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; border-radius: 11px; width: 100%;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.16s; text-align: left;
        }
        .qa:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.12); transform: translateX(3px); }
        .qi { width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 15px; }
        .qt { font-size: 12.5px; font-weight: 700; color: rgba(255,255,255,0.8); }
        .qd { font-size: 11px; color: rgba(255,255,255,0.28); margin-top: 1px; }
        .qa-arr { margin-left: auto; color: rgba(255,255,255,0.2); font-size: 14px; transition: all 0.15s; flex-shrink: 0; }
        .qa:hover .qa-arr { color: rgba(255,255,255,0.6); transform: translateX(3px); }
        .overlay { display: none; position: fixed; inset: 0; z-index: 280; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); }
        .chart-legend { display: flex; gap: 20px; margin-top: 12px; justify-content: center; }
        .cl-item { display: flex; align-items: center; gap: 6px; }
        .cl-line { width: 24px; height: 3px; border-radius: 2px; }
        .cl-label { font-size: 11px; color: rgba(255,255,255,0.4); font-weight: 600; }
        .empty-chart { display: flex; align-items: center; justify-content: center; height: 220px; color: rgba(255,255,255,0.2); font-size: 13px; }
        @media (max-width: 1200px) {
          .kpi-grid { grid-template-columns: repeat(2,1fr); }
          .row1 { grid-template-columns: 1fr; }
          .row2 { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .overlay { display: block; }
          .topbar { display: flex; }
          .main { margin-left: 0; padding: 72px 14px 50px; }
          .kpi-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
          .row2 { grid-template-columns: 1fr; }
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .kpi { animation: fadeUp 0.4s ease both; }
        .kpi:nth-child(1) { animation-delay: 0.05s; }
        .kpi:nth-child(2) { animation-delay: 0.10s; }
        .kpi:nth-child(3) { animation-delay: 0.15s; }
        .kpi:nth-child(4) { animation-delay: 0.20s; }
      `}</style>

      <div className="root">
        <div className="bg-noise" />
        <div className="bg-grad" />
        <div className="grid-lines" />

        {/* SIDEBAR */}
        <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div className="s-logo">
            <div className="s-logo-icon">🏥</div>
            <h2>HospitalAdmin</h2>
            <p>Management Console</p>
          </div>
          <nav className="s-nav">
            <div className="s-sec">Navigation</div>
            {navItems.map(n => (
              <button key={n.path}
                className={`s-btn ${window.location.pathname === n.path ? "active" : ""}`}
                onClick={() => { navigate(n.path); setSidebarOpen(false); }}
              >
                <span className="s-icon">{n.icon}</span>{n.label}
              </button>
            ))}
          </nav>
          <div className="s-footer">
            <div className="s-user">
              <div className="s-avatar">{(admin?.name || "A")[0].toUpperCase()}</div>
              <div>
                <div className="s-uname">{admin?.name || "Admin"}</div>
                <div className="s-urole">Administrator</div>
              </div>
            </div>
          </div>
        </aside>

        {sidebarOpen && <div className="overlay" onClick={() => setSidebarOpen(false)} />}

        <div className="topbar">
          <button className="ham" onClick={() => setSidebarOpen(true)}>☰</button>
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>HospitalAdmin</span>
          <div style={{ width: 36 }} />
        </div>

        {/* MAIN */}
        <main className="main">
          <div className="ph">
            <div className="ph-eye">Admin Panel · Overview</div>
            <div className="ph-title">{greet()}, {admin?.name || "Admin"} 👋</div>
            <div className="ph-date">{today}</div>
          </div>

          {/* KPI CARDS */}
          <div className="kpi-grid">
            {kpis.map(k => {
              const s = STATUS[k.key];
              const pct = k.key === "doctors" ? 100 : total > 0 ? Math.round((k.value / total) * 100) : 0;
              return (
                <div key={k.key} className={`kpi ${!k.onClick ? "nc" : ""}`}
                  onClick={k.onClick || undefined}
                  style={{ borderColor: loaded ? s.border : "rgba(255,255,255,0.07)" }}
                >
                  <div className="kpi-glow" style={{ background: s.glow }} />
                  <div className="kpi-top">
                    <div className="kpi-icon" style={{ background: s.bg, border: `1px solid ${s.border}` }}>{s.icon}</div>
                    <div className="kpi-badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{pct}%</div>
                  </div>
                  <div className="kpi-num" style={{ color: loaded ? s.color : "#fff" }}>
                    {loaded ? <Counter value={k.value} /> : "—"}
                  </div>
                  <div className="kpi-label">{k.label}</div>
                  <div className="kpi-sub">{k.sub}</div>
                  <div className="kpi-bar-t">
                    <div className="kpi-bar-f" style={{ width: loaded ? `${pct}%` : "0%", background: s.color, boxShadow: `0 0 8px ${s.color}55` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* ROW 1: Area chart + Donut */}
          <div className="row1">
            {/* Area Chart — REAL weekly data */}
            <div className="panel">
              <div className="ph2">
                <div><div className="pt">Weekly Appointment Trend</div><div className="ps">Last 7 days — real data from database</div></div>
                <div className="pbadge">Live</div>
              </div>
              <div className="pb">
                {weeklyData.length === 0 ? (
                  <div className="empty-chart">No appointment data for the last 7 days</div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={weeklyData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                        <defs>
                          {[
                            { id: "gb", color: STATUS.booked.color },
                            { id: "gc", color: STATUS.completed.color },
                            { id: "gx", color: STATUS.cancelled.color },
                          ].map(g => (
                            <linearGradient key={g.id} id={g.id} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor={g.color} stopOpacity={0.28} />
                              <stop offset="95%" stopColor={g.color} stopOpacity={0.02} />
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="day" stroke="rgba(255,255,255,0.15)" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis stroke="rgba(255,255,255,0.15)" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <Tooltip content={<AreaTooltip />} />
                        <Area type="monotone" dataKey="booked"    name="Booked"    stroke={STATUS.booked.color}    strokeWidth={2} fill="url(#gb)" dot={false} activeDot={{ r: 4, fill: STATUS.booked.color,    strokeWidth: 0 }} />
                        <Area type="monotone" dataKey="completed" name="Completed" stroke={STATUS.completed.color} strokeWidth={2} fill="url(#gc)" dot={false} activeDot={{ r: 4, fill: STATUS.completed.color, strokeWidth: 0 }} />
                        <Area type="monotone" dataKey="cancelled" name="Cancelled" stroke={STATUS.cancelled.color} strokeWidth={2} fill="url(#gx)" dot={false} activeDot={{ r: 4, fill: STATUS.cancelled.color, strokeWidth: 0 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                    <div className="chart-legend">
                      {[
                        { key: "booked",    label: "Booked" },
                        { key: "completed", label: "Completed" },
                        { key: "cancelled", label: "Cancelled" },
                      ].map(l => (
                        <div key={l.key} className="cl-item">
                          <div className="cl-line" style={{ background: STATUS[l.key].color, boxShadow: `0 0 6px ${STATUS[l.key].color}88` }} />
                          <span className="cl-label">{l.label}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Donut */}
            <div className="panel">
              <div className="ph2">
                <div><div className="pt">Status Distribution</div><div className="ps">Appointment breakdown</div></div>
                <div className="pbadge">{total} Total</div>
              </div>
              <div className="pb">
                <div className="donut-layout">
                  <div style={{ width: 160, height: 160, flexShrink: 0, position: "relative" }}>
                    <ResponsiveContainer width={160} height={160}>
                      <PieChart>
                        <Pie
                          data={pieData.length ? pieData : [{ name: "No data", value: 1, color: "rgba(255,255,255,0.06)", total: 0 }]}
                          cx={75} cy={75} innerRadius={48} outerRadius={72}
                          paddingAngle={pieData.length > 1 ? 3 : 0}
                          dataKey="value" startAngle={90} endAngle={-270} stroke="none"
                        >
                          {(pieData.length ? pieData : [{ color: "rgba(255,255,255,0.06)" }]).map((d, i) => (
                            <Cell key={i} fill={d.color} style={{ filter: pieData.length ? `drop-shadow(0 0 8px ${d.color}66)` : "none" }} />
                          ))}
                        </Pie>
                        {pieData.length > 0 && <Tooltip content={<PieTooltip />} />}
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                      <div style={{ fontSize: 24, fontWeight: 800, color: "#fff", fontFamily: "'JetBrains Mono',monospace", lineHeight: 1 }}>{total}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 3, fontWeight: 600 }}>TOTAL</div>
                    </div>
                  </div>
                  <div className="d-legend">
                    {[
                      { key: "booked",    value: kpiAppointments },
                      { key: "completed", value: kpiCompleted    },
                      { key: "cancelled", value: kpiCancelled    },
                    ].map(l => {
                      const s = STATUS[l.key];
                      const pct = total > 0 ? Math.round((l.value / total) * 100) : 0;
                      return (
                        <div key={l.key} className="li" style={{ borderColor: `${s.color}18` }}>
                          <div className="li-dot" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}88` }} />
                          <div className="li-name">{s.label}</div>
                          <div style={{ textAlign: "right" }}>
                            <div className="li-val" style={{ color: s.color }}>{l.value}</div>
                            <div className="li-pct">{pct}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 2: Progress + Radial + Quick Actions */}
          <div className="row2">
            {/* Status Progress */}
            <div className="panel">
              <div className="ph2"><div><div className="pt">Status Progress</div><div className="ps">Percentage of total</div></div></div>
              <div className="pb">
                <div className="rs">
                  {[
                    { key: "booked",    value: kpiAppointments },
                    { key: "completed", value: kpiCompleted    },
                    { key: "cancelled", value: kpiCancelled    },
                  ].map(r => {
                    const s = STATUS[r.key];
                    const pct = total > 0 ? Math.round((r.value / total) * 100) : 0;
                    return (
                      <div key={r.key} className="rr">
                        <div className="ri" style={{ background: s.bg, border: `1px solid ${s.border}` }}>{s.icon}</div>
                        <div className="rin">
                          <div className="rl">{s.label} <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>({r.value})</span></div>
                          <div className="rt">
                            <div className="rf" style={{ width: loaded ? `${pct}%` : "0%", background: `linear-gradient(90deg, ${s.color}88, ${s.color})`, boxShadow: `0 0 8px ${s.color}44` }} />
                          </div>
                        </div>
                        <div className="rp" style={{ color: s.color }}>{pct}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Radial Chart */}
            <div className="panel">
              <div className="ph2"><div><div className="pt">Radial Overview</div><div className="ps">Visual status rings</div></div></div>
              <div className="pb" style={{ display: "flex", justifyContent: "center" }}>
                <ResponsiveContainer width="100%" height={180}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="25%" outerRadius="90%" data={radialData} startAngle={90} endAngle={-270}>
                    <RadialBar minAngle={5} background={{ fill: "rgba(255,255,255,0.04)" }} clockWise dataKey="value" cornerRadius={6} />
                    <Tooltip
                      formatter={(v, n) => [`${v}%`, n]}
                      contentStyle={{ background: "rgba(8,14,30,0.95)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, fontSize: 12, fontFamily: "'Plus Jakarta Sans',sans-serif" }}
                    />
                    <Legend iconType="circle" iconSize={8} formatter={(v) => <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{v}</span>} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="panel">
              <div className="ph2"><div><div className="pt">Quick Actions</div><div className="ps">Common tasks</div></div></div>
              <div className="pb">
                <div className="qa-list">
                  {[
                    { icon: "➕", bg: STATUS.booked.bg,    border: STATUS.booked.border,    path: "/create-doctor", label: "Add New Doctor",     desc: "Register a medical professional" },
                    { icon: "📋", bg: STATUS.completed.bg, border: STATUS.completed.border, path: "/appointments",  label: "View Appointments",  desc: "Browse all appointment records"  },
                    { icon: "🩺", bg: STATUS.doctors.bg,   border: STATUS.doctors.border,   path: "/doctors",       label: "Manage Doctors",     desc: "View registered doctors list"    },
                    { icon: "📊", bg: STATUS.cancelled.bg, border: STATUS.cancelled.border, path: "/appointments",  label: "Cancelled Bookings", desc: `${kpiCancelled} need attention`  },
                    { icon: "🖋️", bg: STATUS.doctors.bg,   border: STATUS.doctors.border,   path: "/site-content",  label: "Edit Homepage",      desc: "Update stats, about & specialities" },
                  ].map((a, i) => (
                    <button key={i} className="qa" onClick={() => navigate(a.path)}>
                      <div className="qi" style={{ background: a.bg, border: `1px solid ${a.border}` }}>{a.icon}</div>
                      <div><div className="qt">{a.label}</div><div className="qd">{a.desc}</div></div>
                      <span className="qa-arr">→</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}