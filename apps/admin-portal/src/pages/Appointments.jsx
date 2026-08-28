import { useEffect, useState } from "react";
import { listAppointments } from "../services/appointmentService";
import { useNavigate } from "react-router-dom";

function Appointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [search, setSearch]             = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true); setError("");
        const res = await listAppointments();
        if (!cancelled) setAppointments(res?.data || []);
      } catch {
        if (!cancelled) setError("Unable to load appointments.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const statusConfig = {
    booked:    { color: "#60a5fa", bg: "rgba(96,165,250,0.12)",  border: "rgba(96,165,250,0.3)",  dot: "#60a5fa",  label: "Booked"    },
    completed: { color: "#34d399", bg: "rgba(52,211,153,0.12)",  border: "rgba(52,211,153,0.3)",  dot: "#34d399",  label: "Completed" },
    cancelled: { color: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)", dot: "#f87171",  label: "Cancelled" },
  };
  const getStatus = (s) => statusConfig[s?.toLowerCase()] || statusConfig.booked;

  const fmtDate = (v) => {
    if (!v) return "—";
    const d = new Date(v);
    if (isNaN(d.getTime())) return v;
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
      + " · " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  const filtered = appointments.filter((a) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      a.patient_name?.toLowerCase().includes(q) ||
      a.doctor_name?.toLowerCase().includes(q) ||
      a.doctor_specialization?.toLowerCase().includes(q) ||
      String(a.id).includes(q);
    const matchStatus = filterStatus === "all" || a.status?.toLowerCase() === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    all:       appointments.length,
    booked:    appointments.filter(a => a.status?.toLowerCase() === "booked").length,
    completed: appointments.filter(a => a.status?.toLowerCase() === "completed").length,
    cancelled: appointments.filter(a => a.status?.toLowerCase() === "cancelled").length,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ap-page {
          min-height: 100vh;
          background: #060b18;
          font-family: 'Plus Jakarta Sans', sans-serif;
          position: relative; overflow-x: hidden;
        }
        .orb { position: fixed; border-radius: 50%; filter: blur(90px); pointer-events: none; z-index: 0; }
        .orb-1 {
          width: 520px; height: 520px; top: -140px; left: -120px;
          background: radial-gradient(circle, rgba(56,89,200,0.25) 0%, transparent 70%);
          animation: drift1 14s ease-in-out infinite alternate;
        }
        .orb-2 {
          width: 400px; height: 400px; bottom: -80px; right: -100px;
          background: radial-gradient(circle, rgba(14,165,233,0.2) 0%, transparent 70%);
          animation: drift2 17s ease-in-out infinite alternate;
        }
        @keyframes drift1 { from { transform: translate(0,0); } to { transform: translate(50px,35px); } }
        @keyframes drift2 { from { transform: translate(0,0); } to { transform: translate(-35px,25px); } }
        .grid-bg {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 44px 44px;
        }

        /* topbar */
        .topbar {
          position: fixed; top: 0; left: 0; right: 0; z-index: 200;
          height: 58px; display: flex; align-items: center; gap: 12px; padding: 0 32px;
          background: rgba(6,11,24,0.72);
          backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .back-btn {
          display: flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
          border-radius: 9px; padding: 7px 16px;
          color: rgba(255,255,255,0.8); font-size: 13px; font-weight: 500;
          cursor: pointer; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: background 0.18s, border-color 0.18s, color 0.18s;
        }
        .back-btn:hover { background: rgba(255,255,255,0.11); border-color: rgba(255,255,255,0.22); color: #fff; }
        .topbar-title { font-size: 13px; color: rgba(255,255,255,0.55); font-weight: 500; }

        /* page body */
        .page-body {
          position: relative; z-index: 10;
          max-width: 1000px; margin: 0 auto;
          padding: 90px 24px 60px;
        }

        /* page header */
        .page-header { margin-bottom: 28px; }
        .page-eyebrow {
          font-size: 10.5px; font-weight: 700; letter-spacing: 1.6px;
          text-transform: uppercase; color: rgba(96,165,250,0.7);
          margin-bottom: 8px;
        }
        .page-title {
          font-size: 26px; font-weight: 700; color: #fff;
          letter-spacing: -0.5px; margin-bottom: 6px;
        }
        .page-sub { font-size: 13px; color: rgba(255,255,255,0.35); }

        /* stat pills */
        .stat-row { display: flex; gap: 10px; margin-bottom: 22px; flex-wrap: wrap; }
        .stat-pill {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 16px; border-radius: 10px; cursor: pointer;
          font-size: 12.5px; font-weight: 600; font-family: 'Plus Jakarta Sans', sans-serif;
          transition: all 0.18s; border: 1px solid transparent;
          background: rgba(255,255,255,0.04); color: rgba(255,255,255,0.45);
          border-color: rgba(255,255,255,0.08);
        }
        .stat-pill:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); }
        .stat-pill.active { background: rgba(255,255,255,0.09); color: #fff; border-color: rgba(255,255,255,0.18); }
        .stat-pill .count {
          font-size: 11px; padding: 1px 7px; border-radius: 20px;
          background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.6);
          font-weight: 700;
        }
        .stat-pill.active .count { background: rgba(255,255,255,0.14); color: #fff; }

        /* search */
        .search-wrap { position: relative; margin-bottom: 18px; }
        .search-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          color: rgba(255,255,255,0.28); pointer-events: none;
        }
        .search-input {
          width: 100%; padding: 11px 16px 11px 42px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
          border-radius: 11px; color: #fff; font-size: 13.5px;
          font-family: 'Plus Jakarta Sans', sans-serif; outline: none;
          transition: border-color 0.18s, background 0.18s;
        }
        .search-input::placeholder { color: rgba(255,255,255,0.25); }
        .search-input:focus {
          border-color: rgba(96,165,250,0.45); background: rgba(255,255,255,0.06);
          box-shadow: 0 0 0 3px rgba(96,165,250,0.08);
        }

        /* table card */
        .table-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 18px; overflow: hidden;
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 24px 60px rgba(0,0,0,0.4);
          animation: fadeUp 0.4s ease both;
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* table */
        .ap-table { width: 100%; border-collapse: collapse; }
        .ap-table thead tr {
          background: rgba(255,255,255,0.035);
          border-bottom: 1px solid rgba(255,255,255,0.07);
        }
        .ap-table th {
          padding: 13px 18px; text-align: left;
          font-size: 10.5px; font-weight: 700; letter-spacing: 1px;
          text-transform: uppercase; color: rgba(255,255,255,0.3);
          white-space: nowrap;
        }
        .ap-table td {
          padding: 15px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.045);
          font-size: 13.5px; color: rgba(255,255,255,0.82); vertical-align: middle;
        }
        .ap-table tbody tr {
          cursor: pointer; transition: background 0.15s;
        }
        .ap-table tbody tr:hover td { background: rgba(255,255,255,0.04); }
        .ap-table tbody tr:last-child td { border-bottom: none; }

        /* avatar */
        .avatar {
          width: 34px; height: 34px; border-radius: 10px;
          background: linear-gradient(135deg, rgba(56,89,200,0.5), rgba(14,165,233,0.5));
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.85);
          flex-shrink: 0; border: 1px solid rgba(255,255,255,0.1);
        }
        .name-cell { display: flex; align-items: center; gap: 11px; }
        .name-text { font-weight: 600; color: #fff; font-size: 13.5px; }

        /* status pill */
        .s-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 11px; border-radius: 20px;
          font-size: 11.5px; font-weight: 600; white-space: nowrap;
        }
        .s-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }

        /* ID badge */
        .id-badge {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 28px; height: 22px; padding: 0 8px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 6px; font-size: 11px; font-weight: 700;
          color: rgba(255,255,255,0.45); letter-spacing: 0.3px;
        }

        /* arrow */
        .row-arrow { color: rgba(255,255,255,0.2); transition: color 0.15s, transform 0.15s; }
        .ap-table tbody tr:hover .row-arrow { color: rgba(255,255,255,0.55); transform: translateX(3px); }

        /* empty / loading / error */
        .state-box {
          padding: 64px 20px; text-align: center;
          display: flex; flex-direction: column; align-items: center; gap: 14px;
        }
        .spinner {
          width: 40px; height: 40px; border-radius: 50%;
          border: 3px solid rgba(255,255,255,0.07);
          border-top-color: rgba(96,165,250,0.65);
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .state-title { font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.45); }
        .state-sub   { font-size: 12.5px; color: rgba(255,255,255,0.25); }

        .error-box {
          margin: 24px; border-radius: 12px; padding: 18px 22px;
          background: rgba(248,113,113,0.08); border: 1px solid rgba(248,113,113,0.22);
          display: flex; gap: 12px; align-items: flex-start;
        }
        .error-box-title { font-size: 13px; font-weight: 600; color: #fca5a5; margin-bottom: 3px; }
        .error-box-msg   { font-size: 12.5px; color: rgba(252,165,165,0.65); }

        /* table footer */
        .table-footer {
          padding: 13px 20px;
          border-top: 1px solid rgba(255,255,255,0.06);
          font-size: 12px; color: rgba(255,255,255,0.25);
          display: flex; justify-content: space-between; align-items: center;
        }
      `}</style>

      <div className="ap-page">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="grid-bg" />

        {/* Topbar */}
        <div className="topbar">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Dashboard
          </button>
          <span className="topbar-title">/ Appointments</span>
        </div>

        {/* Body */}
        <div className="page-body">

          {/* Header */}
          <div className="page-header">
            <div className="page-eyebrow">Admin · Records</div>
            <div className="page-title">Appointments</div>
            <div className="page-sub">Click any row to view full appointment details.</div>
          </div>

          {/* Stat filter pills */}
          {!loading && !error && (
            <div className="stat-row">
              {[
                { key: "all",       label: "All" },
                { key: "booked",    label: "Booked" },
                { key: "completed", label: "Completed" },
                { key: "cancelled", label: "Cancelled" },
              ].map((f) => (
                <button
                  key={f.key}
                  className={`stat-pill ${filterStatus === f.key ? "active" : ""}`}
                  onClick={() => setFilterStatus(f.key)}
                >
                  {f.label}
                  <span className="count">{counts[f.key]}</span>
                </button>
              ))}
            </div>
          )}

          {/* Search */}
          {!loading && !error && (
            <div className="search-wrap">
              <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                className="search-input"
                type="text"
                placeholder="Search by patient, doctor, speciality or ID…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          )}

          {/* Table card */}
          <div className="table-card">

            {loading && (
              <div className="state-box">
                <div className="spinner" />
                <div className="state-title">Loading appointments…</div>
              </div>
            )}

            {!loading && error && (
              <div className="error-box">
                <span style={{ fontSize: 18 }}>⚠️</span>
                <div>
                  <div className="error-box-title">Could not load appointments</div>
                  <div className="error-box-msg">{error}</div>
                </div>
              </div>
            )}

            {!loading && !error && (
              <>
                <table className="ap-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Speciality</th>
                      <th>Date &amp; Time</th>
                      <th>Status</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length ? (
                      filtered.map((a) => {
                        const sc = getStatus(a.status);
                        const initials = (a.patient_name || "?")
                          .split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
                        return (
                          <tr key={a.id} onClick={() => navigate(`/appointments/${a.id}`)}>
                            <td><span className="id-badge">{a.id}</span></td>
                            <td>
                              <div className="name-cell">
                                <div className="avatar">{initials}</div>
                                <span className="name-text">{a.patient_name || "—"}</span>
                              </div>
                            </td>
                            <td style={{ color: "rgba(255,255,255,0.65)" }}>{a.doctor_name || "—"}</td>
                            <td style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{a.doctor_specialization || "—"}</td>
                            <td style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>{fmtDate(a.appointment_time)}</td>
                            <td>
                              <span
                                className="s-pill"
                                style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.color }}
                              >
                                <span className="s-dot" style={{ background: sc.dot }} />
                                {sc.label}
                              </span>
                            </td>
                            <td>
                              <svg className="row-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                              </svg>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7}>
                          <div className="state-box">
                            <div style={{ fontSize: 32 }}>🔍</div>
                            <div className="state-title">No appointments found</div>
                            <div className="state-sub">Try adjusting your search or filter.</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Footer */}
                <div className="table-footer">
                  <span>
                    Showing <strong style={{ color: "rgba(255,255,255,0.5)" }}>{filtered.length}</strong> of{" "}
                    <strong style={{ color: "rgba(255,255,255,0.5)" }}>{appointments.length}</strong> appointments
                  </span>
                  {search || filterStatus !== "all" ? (
                    <button
                      onClick={() => { setSearch(""); setFilterStatus("all"); }}
                      style={{
                        background: "none", border: "none", color: "rgba(96,165,250,0.7)",
                        fontSize: 12, cursor: "pointer", fontFamily: "Plus Jakarta Sans, sans-serif",
                        padding: 0,
                      }}
                    >
                      Clear filters
                    </button>
                  ) : null}
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </>
  );
}

export default Appointments;