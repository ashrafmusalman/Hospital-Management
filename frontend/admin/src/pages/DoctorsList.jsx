import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listDoctors } from "../services/doctorService";

function DoctorsList() {
  const navigate  = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [search,  setSearch]  = useState("");
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await listDoctors();
        if (!cancelled) setDoctors(res?.data || []);
      } catch {
        if (!cancelled) setError("Unable to load doctors.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = doctors.filter((d) => {
    const q = search.toLowerCase();
    return !q || d.name?.toLowerCase().includes(q) || d.specialization?.toLowerCase().includes(q);
  });

  const GRADIENTS = [
    ["#3859c8","#0ea5e9"],
    ["#7c3aed","#06b6d4"],
    ["#059669","#0ea5e9"],
    ["#b45309","#f59e0b"],
    ["#7c3aed","#ec4899"],
    ["#0891b2","#34d399"],
  ];
  const grad     = (i) => GRADIENTS[i % GRADIENTS.length];
  const initials = (name = "") => name.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();

  const toggle = (id) => setExpanded(prev => prev === id ? null : id);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Sora', sans-serif; background: #060b18; }

        .dl-page { min-height:100vh; background:#060b18; font-family:'Sora',sans-serif; position:relative; overflow-x:hidden; }
        .orb { position:fixed; border-radius:50%; filter:blur(90px); pointer-events:none; z-index:0; }
        .orb-1 { width:540px; height:540px; top:-150px; left:-130px; background:radial-gradient(circle,rgba(56,89,200,0.24) 0%,transparent 70%); animation:d1 14s ease-in-out infinite alternate; }
        .orb-2 { width:400px; height:400px; bottom:-80px; right:-100px; background:radial-gradient(circle,rgba(14,165,233,0.18) 0%,transparent 70%); animation:d2 18s ease-in-out infinite alternate; }
        @keyframes d1 { from{transform:translate(0,0)} to{transform:translate(45px,30px)} }
        @keyframes d2 { from{transform:translate(0,0)} to{transform:translate(-30px,20px)} }
        .grid-bg { position:fixed; inset:0; z-index:0; pointer-events:none; background-image:linear-gradient(rgba(255,255,255,0.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.022) 1px,transparent 1px); background-size:44px 44px; }

        /* topbar */
        .topbar { position:fixed; top:0; left:0; right:0; z-index:200; height:58px; display:flex; align-items:center; gap:12px; padding:0 32px; background:rgba(6,11,24,0.78); backdrop-filter:blur(18px); -webkit-backdrop-filter:blur(18px); border-bottom:1px solid rgba(255,255,255,0.07); }
        .back-btn { display:flex; align-items:center; gap:7px; background:rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); border-radius:9px; padding:7px 16px; color:rgba(255,255,255,0.8); font-size:13px; font-weight:500; cursor:pointer; font-family:'Sora',sans-serif; transition:all 0.18s; }
        .back-btn:hover { background:rgba(255,255,255,0.11); border-color:rgba(255,255,255,0.22); color:#fff; }
        .topbar-crumb { font-size:13px; color:rgba(255,255,255,0.3); }
        .topbar-crumb span { color:rgba(255,255,255,0.55); }

        /* body */
        .dl-body { position:relative; z-index:10; max-width:860px; margin:0 auto; padding:90px 24px 60px; }

        /* header */
        .page-header { margin-bottom:26px; }
        .page-eyebrow { font-size:10.5px; font-weight:700; letter-spacing:1.6px; text-transform:uppercase; color:rgba(96,165,250,0.7); margin-bottom:8px; }
        .page-title   { font-size:26px; font-weight:800; color:#fff; letter-spacing:-0.6px; margin-bottom:5px; }
        .page-sub     { font-size:13px; color:rgba(255,255,255,0.3); }

        /* toolbar */
        .toolbar { display:flex; align-items:center; gap:12px; margin-bottom:20px; flex-wrap:wrap; }
        .search-wrap { position:relative; flex:1; min-width:200px; }
        .search-icon { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:rgba(255,255,255,0.28); pointer-events:none; }
        .search-input { width:100%; padding:10px 14px 10px 40px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09); border-radius:10px; color:#fff; font-size:13.5px; font-family:'Sora',sans-serif; outline:none; transition:all 0.18s; }
        .search-input::placeholder { color:rgba(255,255,255,0.25); }
        .search-input:focus { border-color:rgba(96,165,250,0.4); background:rgba(255,255,255,0.06); box-shadow:0 0 0 3px rgba(96,165,250,0.08); }
        .count-chip { display:flex; align-items:center; gap:6px; padding:9px 14px; border-radius:10px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.09); font-size:12.5px; font-weight:600; color:rgba(255,255,255,0.45); white-space:nowrap; }
        .count-chip strong { color:#fff; }

        /* list */
        .doc-list { display:flex; flex-direction:column; gap:12px; }

        /* doctor row card */
        .doc-row {
          background:rgba(255,255,255,0.04);
          border:1px solid rgba(255,255,255,0.08);
          border-radius:16px; overflow:hidden;
          backdrop-filter:blur(14px); -webkit-backdrop-filter:blur(14px);
          transition:border-color 0.2s, box-shadow 0.2s;
          animation:fadeUp 0.35s ease both;
        }
        .doc-row:hover { border-color:rgba(255,255,255,0.15); box-shadow:0 8px 32px rgba(0,0,0,0.3); }
        .doc-row.open  { border-color:rgba(96,165,250,0.25); box-shadow:0 8px 40px rgba(0,0,0,0.35); }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

        /* accent bar */
        .accent-bar { height:3px; width:100%; }

        /* summary row — always visible */
        .doc-summary {
          display:flex; align-items:center; gap:16px; padding:18px 22px;
          cursor:pointer; user-select:none;
        }

        /* avatar */
        .avatar { width:52px; height:52px; border-radius:14px; flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:17px; font-weight:800; color:#fff; border:1px solid rgba(255,255,255,0.12); }

        /* text block */
        .doc-info { flex:1; min-width:0; }
        .doc-name { font-size:15.5px; font-weight:700; color:#fff; letter-spacing:-0.2px; margin-bottom:5px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .doc-meta  { display:flex; align-items:center; gap:8px; flex-wrap:wrap; }
        .spec-pill { display:inline-flex; align-items:center; gap:5px; padding:3px 11px; border-radius:20px; background:rgba(96,165,250,0.1); border:1px solid rgba(96,165,250,0.2); font-size:11.5px; font-weight:600; color:rgba(96,165,250,0.85); }
        .dot-sep   { width:3px; height:3px; border-radius:50%; background:rgba(255,255,255,0.2); flex-shrink:0; }
        .meta-text { font-size:12px; color:rgba(255,255,255,0.35); font-weight:500; }

        /* stats strip */
        .stats-strip { display:flex; align-items:center; gap:24px; flex-shrink:0; }
        .stat-item { display:flex; flex-direction:column; align-items:flex-end; gap:2px; }
        .stat-label { font-size:9.5px; font-weight:700; letter-spacing:0.8px; text-transform:uppercase; color:rgba(255,255,255,0.28); }
        .stat-value { font-size:15px; font-weight:700; }
        .stat-divider { width:1px; height:28px; background:rgba(255,255,255,0.08); }

        /* chevron */
        .chevron { margin-left:8px; color:rgba(255,255,255,0.25); transition:transform 0.25s, color 0.2s; flex-shrink:0; }
        .doc-row.open .chevron { transform:rotate(180deg); color:rgba(96,165,250,0.7); }

        /* expanded detail panel */
        .doc-detail {
          overflow:hidden; max-height:0;
          transition:max-height 0.35s cubic-bezier(0.4,0,0.2,1);
        }
        .doc-detail.open { max-height:600px; }
        .detail-inner { padding:0 22px 24px; border-top:1px solid rgba(255,255,255,0.07); }

        /* detail grid */
        .detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:18px; padding-top:18px; }
        .detail-card { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:12px; padding:14px 16px; }
        .detail-card-label { font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:rgba(255,255,255,0.28); margin-bottom:7px; }
        .detail-card-value { font-size:14px; font-weight:600; color:#fff; }

        /* description block */
        .desc-block { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.07); border-radius:12px; padding:16px 18px; }
        .desc-label { font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:rgba(255,255,255,0.28); margin-bottom:10px; }
        .desc-text  { font-size:13.5px; line-height:1.75; color:rgba(255,255,255,0.65); font-weight:400; }

        /* empty / loading / error */
        .state-box { padding:72px 20px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:14px; }
        .spinner { width:40px; height:40px; border-radius:50%; border:3px solid rgba(255,255,255,0.07); border-top-color:rgba(96,165,250,0.65); animation:spin 0.8s linear infinite; }
        @keyframes spin { to{transform:rotate(360deg)} }
        .state-title { font-size:14px; font-weight:600; color:rgba(255,255,255,0.4); }
        .state-sub   { font-size:12.5px; color:rgba(255,255,255,0.22); }
        .error-box   { border-radius:14px; padding:20px 24px; background:rgba(248,113,113,0.08); border:1px solid rgba(248,113,113,0.22); display:flex; gap:12px; align-items:flex-start; }
        .error-title { font-size:13px; font-weight:600; color:#fca5a5; margin-bottom:3px; }
        .error-msg   { font-size:12.5px; color:rgba(252,165,165,0.6); }

        /* footer */
        .list-footer { margin-top:18px; font-size:12px; color:rgba(255,255,255,0.22); text-align:center; }
        .clear-btn { background:none; border:none; color:rgba(96,165,250,0.6); font-size:12px; cursor:pointer; margin-left:10px; font-family:'Sora',sans-serif; }

        @media (max-width:640px) {
          .stats-strip { gap:14px; }
          .detail-grid { grid-template-columns:1fr; }
          .topbar { padding:0 16px; }
          .dl-body { padding:78px 14px 50px; }
          .doc-summary { padding:14px 16px; gap:12px; }
        }
        @media (max-width:480px) {
          .stats-strip { display:none; }
          .doc-name { font-size:14.5px; }
        }
      `}</style>

      <div className="dl-page">
        <div className="orb orb-1"/><div className="orb orb-2"/>
        <div className="grid-bg"/>

        {/* Topbar */}
        <div className="topbar">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Dashboard
          </button>
          <span className="topbar-crumb">/ <span>Doctors</span></span>
        </div>

        <div className="dl-body">

          {/* Header */}
          <div className="page-header">
            <div className="page-eyebrow">Admin · Directory</div>
            <div className="page-title">Doctors</div>
            <div className="page-sub">Click any row to expand full profile details.</div>
          </div>

          {/* Toolbar */}
          {!loading && !error && (
            <div className="toolbar">
              <div className="search-wrap">
                <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <input className="search-input" type="text" placeholder="Search by name or specialization…" value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>
              <div className="count-chip">
                👨‍⚕️ <strong>{filtered.length}</strong> doctor{filtered.length !== 1 ? "s" : ""}
              </div>
            </div>
          )}

          {/* List */}
          <div className="doc-list">

            {loading && (
              <div className="state-box">
                <div className="spinner"/>
                <div className="state-title">Loading doctors…</div>
              </div>
            )}

            {!loading && error && (
              <div className="error-box">
                <span style={{fontSize:20}}>⚠️</span>
                <div>
                  <div className="error-title">Could not load doctors</div>
                  <div className="error-msg">{error}</div>
                </div>
              </div>
            )}

            {!loading && !error && filtered.length === 0 && (
              <div className="state-box">
                <div style={{fontSize:36}}>🔍</div>
                <div className="state-title">No doctors found</div>
                <div className="state-sub">Try a different search term.</div>
              </div>
            )}

            {!loading && !error && filtered.map((doc, i) => {
              const [c1, c2] = grad(i);
              const isOpen   = expanded === doc.id;
              const exp      = doc.experience ?? doc.years_of_experience ?? null;

              return (
                <div className={`doc-row ${isOpen ? "open" : ""}`} key={doc.id} style={{animationDelay:`${i*0.04}s`}}>

                  {/* Top accent line */}
                  <div className="accent-bar" style={{background:`linear-gradient(90deg,${c1},${c2})`}}/>

                  {/* Summary row — click to expand */}
                  <div className="doc-summary" onClick={() => toggle(doc.id)}>

                    {/* Avatar */}
                    <div className="avatar" style={{background:`linear-gradient(135deg,${c1}cc,${c2}cc)`}}>
                      {initials(doc.name)}
                    </div>

                    {/* Name + meta */}
                    <div className="doc-info">
                      <div className="doc-name">{doc.name || "—"}</div>
                      <div className="doc-meta">
                        <span className="spec-pill">🔬 {doc.specialization || "General"}</span>
                        {exp !== null && (
                          <>
                            <span className="dot-sep"/>
                            <span className="meta-text">{exp} yrs experience</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="stats-strip">
                      {exp !== null && (
                        <>
                          <div className="stat-item">
                            <div className="stat-label">Experience</div>
                            <div className="stat-value" style={{color:"rgba(52,211,153,0.9)"}}>{exp} <span style={{fontSize:11,fontWeight:500,color:"rgba(52,211,153,0.5)"}}>yrs</span></div>
                          </div>
                          <div className="stat-divider"/>
                        </>
                      )}
                      <div className="stat-item">
                        <div className="stat-label">Fee</div>
                        <div className="stat-value" style={{color:"rgba(251,191,36,0.9)"}}>₹ {doc.consultation_fee ?? "—"}</div>
                      </div>
                    </div>

                    {/* Chevron */}
                    <svg className="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </div>

                  {/* Expanded detail panel */}
                  <div className={`doc-detail ${isOpen ? "open" : ""}`}>
                    <div className="detail-inner">

                      {/* Stat cards grid */}
                      <div className="detail-grid">
                        <div className="detail-card">
                          <div className="detail-card-label">Full Name</div>
                          <div className="detail-card-value">{doc.name || "—"}</div>
                        </div>
                        <div className="detail-card">
                          <div className="detail-card-label">Specialization</div>
                          <div className="detail-card-value">{doc.specialization || "—"}</div>
                        </div>
                        <div className="detail-card">
                          <div className="detail-card-label">Consultation Fee</div>
                          <div className="detail-card-value" style={{color:"rgba(251,191,36,0.9)"}}>₹ {doc.consultation_fee ?? "—"}</div>
                        </div>
                        {exp !== null && (
                          <div className="detail-card">
                            <div className="detail-card-label">Experience</div>
                            <div className="detail-card-value" style={{color:"rgba(52,211,153,0.9)"}}>{exp} years</div>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {doc.description && (
                        <div className="desc-block">
                          <div className="desc-label">About this Doctor</div>
                          <div className="desc-text">{doc.description}</div>
                        </div>
                      )}

                      {!doc.description && (
                        <div className="desc-block">
                          <div className="desc-label">About this Doctor</div>
                          <div className="desc-text" style={{color:"rgba(255,255,255,0.25)",fontStyle:"italic"}}>No description provided.</div>
                        </div>
                      )}

                    </div>
                  </div>

                </div>
              );
            })}

          </div>

          {/* Footer */}
          {!loading && !error && filtered.length > 0 && (
            <div className="list-footer">
              Showing {filtered.length} of {doctors.length} doctors
              {search && <button className="clear-btn" onClick={()=>setSearch("")}>Clear search</button>}
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default DoctorsList;