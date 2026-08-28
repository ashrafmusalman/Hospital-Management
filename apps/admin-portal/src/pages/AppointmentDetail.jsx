import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAppointmentDetail } from "../services/appointmentService";
import { markAppointmentCompleted } from "../services/appointmentService";

export default function AppointmentDetail() {
  const { appointmentId } = useParams();
  const navigate = useNavigate();

  const [detail,    setDetail]    = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [completing,setCompleting]= useState(false);
  const [actionMsg, setActionMsg] = useState({ text:"", type:"" });

  const load = async () => {
    setDetail(null); setError(""); setLoading(true);
    let cancelled = false;
    try {
      const res = await getAppointmentDetail(appointmentId);
      const payload = res?.data ?? res;
      if (!cancelled) {
        if (!payload || typeof payload !== "object") setError("Unexpected server response.");
        else setDetail(payload);
      }
    } catch (e) {
      if (!cancelled)
        setError(e?.response?.data?.detail || e?.response?.data?.message || e?.message || "Unable to load appointment.");
    } finally {
      if (!cancelled) setLoading(false);
    }
    return () => { cancelled = true; };
  };

  useEffect(() => { load(); }, [appointmentId]);

  const handleComplete = async () => {
    setCompleting(true);
    setActionMsg({ text:"", type:"" });
    try {
      await markAppointmentCompleted(appointmentId);
      setActionMsg({ text:"Appointment marked as completed.", type:"success" });
      // refresh detail so status updates live
      await load();
    } catch (e) {
      setActionMsg({ text: e?.response?.data?.detail || "Could not mark as completed.", type:"error" });
    } finally {
      setCompleting(false);
    }
  };

  const fmt = (v) => (v !== undefined && v !== null && v !== "" ? v : "—");
  const fmtDate = (v) => {
    if (!v) return "—";
    const d = new Date(v);
    if (isNaN(d.getTime())) return v;
    return d.toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })
      + " · " + d.toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
  };

  const statusConfig = {
    booked:    { color:"#60a5fa", bg:"rgba(96,165,250,.12)",  border:"rgba(96,165,250,.3)",  dot:"#60a5fa",  label:"Booked"    },
    completed: { color:"#34d399", bg:"rgba(52,211,153,.12)",  border:"rgba(52,211,153,.3)",  dot:"#34d399",  label:"Completed" },
    cancelled: { color:"#f87171", bg:"rgba(248,113,113,.12)", border:"rgba(248,113,113,.3)", dot:"#f87171",  label:"Cancelled" },
  };
  const statusKey  = detail?.status?.toLowerCase() || "booked";
  const statusConf = statusConfig[statusKey] || statusConfig.booked;

  const isBookedStatus  = statusKey === "booked";
  const isTerminal      = statusKey === "completed" || statusKey === "cancelled";

  const rows = detail ? [
    { icon:"🙍",  label:"Patient Name",     value: fmt(detail.patient_name) },
    { icon:"🩺",  label:"Doctor Name",      value: fmt(detail.doctor_name)  },
    { icon:"🔬",  label:"Speciality",       value: fmt(detail.doctor_specialization) },
    { icon:"💳",  label:"Consultation Fee", value: detail.doctor_charge != null ? `₹ ${detail.doctor_charge}` : "—" },
    { icon:"📅",  label:"Date & Time",      value: fmtDate(detail.appointment_time) },
    { icon:"🏷️",  label:"Status",           value: (
        <span style={{ color:statusConf.color, fontWeight:700 }}>{statusConf.label}</span>
      )
    },
  ] : [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'Plus Jakarta Sans',sans-serif; background:#060b18; }

        .appt-page { min-height:100vh; background:#060b18; font-family:'Plus Jakarta Sans',sans-serif; position:relative; overflow-x:hidden; }
        .orb { position:fixed; border-radius:50%; filter:blur(80px); pointer-events:none; z-index:0; }
        .orb-1 { width:480px; height:480px; top:-120px; left:-100px; background:radial-gradient(circle,rgba(56,89,200,.28) 0%,transparent 70%); animation:drift1 12s ease-in-out infinite alternate; }
        .orb-2 { width:360px; height:360px; bottom:-60px; right:-80px; background:radial-gradient(circle,rgba(14,165,233,.22) 0%,transparent 70%); animation:drift2 15s ease-in-out infinite alternate; }
        @keyframes drift1{from{transform:translate(0,0)}to{transform:translate(40px,30px)}}
        @keyframes drift2{from{transform:translate(0,0)}to{transform:translate(-30px,20px)}}
        .grid-bg{position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.028) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.028) 1px,transparent 1px);background-size:44px 44px;}

        .topbar{position:fixed;top:0;left:0;right:0;z-index:200;height:58px;display:flex;align-items:center;gap:12px;padding:0 32px;background:rgba(6,11,24,.7);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid rgba(255,255,255,.07);}
        .back-btn{display:flex;align-items:center;gap:7px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:9px;padding:7px 16px;color:rgba(255,255,255,.8);font-size:13px;font-weight:500;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;transition:background .18s,border-color .18s,color .18s;}
        .back-btn:hover{background:rgba(255,255,255,.11);border-color:rgba(255,255,255,.22);color:#fff;}
        .breadcrumb{font-size:12.5px;color:rgba(255,255,255,.28);display:flex;align-items:center;gap:8px;}
        .breadcrumb span{color:rgba(255,255,255,.55);}

        .page-wrap{position:relative;z-index:10;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:90px 20px 48px;}

        .card{width:100%;max-width:620px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:22px;overflow:hidden;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);box-shadow:0 32px 80px rgba(0,0,0,.5),0 0 0 1px rgba(255,255,255,.04) inset;animation:fadeUp .4s ease both;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}

        .card-hero{padding:30px 36px 26px;background:rgba(255,255,255,.025);border-bottom:1px solid rgba(255,255,255,.07);position:relative;overflow:hidden;}
        .card-hero::before{content:'';position:absolute;top:-40px;right:-40px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,rgba(56,89,200,.18) 0%,transparent 70%);pointer-events:none;}
        .hero-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:18px;}
        .appt-id{font-size:11px;font-weight:600;letter-spacing:1.2px;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:8px;}
        .appt-title{font-size:22px;font-weight:700;color:#fff;letter-spacing:-.4px;line-height:1.2;}
        .status-pill{display:inline-flex;align-items:center;gap:6px;padding:6px 13px;border-radius:20px;font-size:12px;font-weight:600;letter-spacing:.3px;flex-shrink:0;margin-top:2px;}
        .status-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;box-shadow:0 0 6px currentColor;}

        .hero-strips{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        .strip{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:11px;padding:12px 14px;display:flex;align-items:center;gap:10px;}
        .strip-icon{width:32px;height:32px;border-radius:9px;background:rgba(255,255,255,.06);display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;}
        .strip-label{font-size:10.5px;font-weight:600;letter-spacing:.6px;text-transform:uppercase;color:rgba(255,255,255,.3);margin-bottom:3px;}
        .strip-value{font-size:13px;font-weight:600;color:rgba(255,255,255,.88);line-height:1.2;}

        .detail-body{padding:24px 36px 28px;}
        .section-label{font-size:10px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;color:rgba(255,255,255,.22);margin-bottom:14px;}
        .detail-row{display:flex;align-items:center;padding:12px 0;border-bottom:1px solid rgba(255,255,255,.05);gap:14px;}
        .detail-row:last-child{border-bottom:none;}
        .row-icon{width:34px;height:34px;border-radius:9px;flex-shrink:0;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.07);display:flex;align-items:center;justify-content:center;font-size:15px;}
        .row-label{font-size:12px;color:rgba(255,255,255,.38);font-weight:500;min-width:130px;flex-shrink:0;}
        .row-value{font-size:13.5px;color:#fff;font-weight:500;flex:1;text-align:right;}

        /* ── ACTION ZONE ── */
        .action-zone{padding:0 36px 28px;display:flex;flex-direction:column;gap:12px;}
        .action-divider{height:1px;background:rgba(255,255,255,.08);margin-bottom:4px;}

        .btn-complete{
          width:100%;padding:14px;border-radius:13px;border:none;
          background:linear-gradient(135deg,rgba(52,211,153,.85),rgba(16,185,129,.85));
          color:#fff;font-size:14.5px;font-weight:700;font-family:'Plus Jakarta Sans',sans-serif;
          cursor:pointer;transition:all .2s;
          box-shadow:0 6px 24px rgba(52,211,153,.25);
          display:flex;align-items:center;justify-content:center;gap:9px;
        }
        .btn-complete:hover:not(:disabled){filter:brightness(1.1);transform:translateY(-1px);box-shadow:0 10px 32px rgba(52,211,153,.35);}
        .btn-complete:disabled{opacity:.5;cursor:not-allowed;transform:none;box-shadow:none;}

        .terminal-badge{
          display:flex;align-items:center;justify-content:center;gap:8px;
          padding:13px;border-radius:13px;font-size:14px;font-weight:600;
          color:rgba(255,255,255,.5);
          background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);
        }

        .msg-success{padding:11px 15px;border-radius:10px;font-size:13px;background:rgba(52,211,153,.12);border:1px solid rgba(52,211,153,.3);color:#6ee7b7;display:flex;align-items:center;gap:8px;}
        .msg-error  {padding:11px 15px;border-radius:10px;font-size:13px;background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.25);color:#fca5a5;display:flex;align-items:center;gap:8px;}

        /* states */
        .center-state{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;}
        .spinner{width:42px;height:42px;border-radius:50%;border:3px solid rgba(255,255,255,.08);border-top-color:rgba(96,165,250,.7);animation:spin .8s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .error-card{max-width:440px;width:100%;background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.25);border-radius:14px;padding:22px 26px;display:flex;gap:14px;align-items:flex-start;}
        .error-title{font-size:13px;font-weight:600;color:#fca5a5;margin-bottom:4px;}
        .error-msg{font-size:12.5px;color:rgba(252,165,165,.7);line-height:1.5;}
      `}</style>

      <div className="appt-page">
        <div className="orb orb-1"/><div className="orb orb-2"/>
        <div className="grid-bg"/>

        {/* Topbar */}
        <div className="topbar">
          <button className="back-btn" onClick={()=>navigate("/appointments")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Appointments
          </button>
          <div className="breadcrumb">
            / <span>{detail ? `Appointment #${detail.id}` : "Detail"}</span>
          </div>
        </div>

        <div className="page-wrap">
          {loading && (
            <div className="center-state">
              <div className="spinner"/>
              <p style={{color:"rgba(255,255,255,.4)",fontSize:13}}>Fetching appointment details…</p>
            </div>
          )}

          {!loading && (error || !detail) && (
            <div className="error-card">
              <div style={{fontSize:20}}>⚠️</div>
              <div>
                <div className="error-title">Could not load appointment</div>
                <div className="error-msg">{error||"Appointment not found."}</div>
              </div>
            </div>
          )}

          {!loading && !error && detail && (
            <div className="card">

              {/* Hero */}
              <div className="card-hero">
                <div className="hero-top">
                  <div>
                    <div className="appt-id">Appointment · #{detail.id}</div>
                    <div className="appt-title">{fmt(detail.patient_name)}</div>
                  </div>
                  <div className="status-pill"
                    style={{background:statusConf.bg, border:`1px solid ${statusConf.border}`, color:statusConf.color}}>
                    <div className="status-dot" style={{background:statusConf.dot}}/>
                    {statusConf.label}
                  </div>
                </div>
                <div className="hero-strips">
                  <div className="strip">
                    <div className="strip-icon">👨‍⚕️</div>
                    <div><div className="strip-label">Doctor</div><div className="strip-value">{fmt(detail.doctor_name)}</div></div>
                  </div>
                  <div className="strip">
                    <div className="strip-icon">🫀</div>
                    <div><div className="strip-label">Speciality</div><div className="strip-value">{fmt(detail.doctor_specialization)}</div></div>
                  </div>
                </div>
              </div>

              {/* Detail rows */}
              <div className="detail-body">
                <div className="section-label">Appointment Info</div>
                {rows.map(row => (
                  <div className="detail-row" key={row.label}>
                    <div className="row-icon">{row.icon}</div>
                    <div className="row-label">{row.label}</div>
                    <div className="row-value">{row.value}</div>
                  </div>
                ))}
              </div>

              {/* ── ACTION ZONE ── */}
              <div className="action-zone">
                <div className="action-divider"/>

                {/* Feedback message */}
                {actionMsg.text && (
                  <div className={actionMsg.type==="success" ? "msg-success" : "msg-error"}>
                    {actionMsg.type==="success" ? "✅" : "⚠️"} {actionMsg.text}
                  </div>
                )}

                {/* Mark Complete button — only for booked appointments */}
                {isBookedStatus && (
                  <button
                    className="btn-complete"
                    onClick={handleComplete}
                    disabled={completing}
                  >
                    {completing ? (
                      <>
                        <div style={{width:16,height:16,borderRadius:"50%",border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",animation:"spin .7s linear infinite"}}/>
                        Marking as Completed…
                      </>
                    ) : (
                      <>✅ Mark as Completed</>
                    )}
                  </button>
                )}

                {/* Terminal state badge — completed or cancelled */}
                {isTerminal && (
                  <div className="terminal-badge">
                    {statusKey==="completed"
                      ? <><span style={{fontSize:18}}>✅</span> This appointment has been completed</>
                      : <><span style={{fontSize:18}}>❌</span> This appointment was cancelled</>
                    }
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </>
  );
}