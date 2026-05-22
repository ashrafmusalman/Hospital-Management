import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listDoctors, deleteDoctor } from "../services/doctorService";

function AdminDoctorsList() {
  const navigate = useNavigate();
  const [doctors,   setDoctors]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState("");
  const [search,    setSearch]    = useState("");
  const [expanded,  setExpanded]  = useState(null);
  const [deleting,  setDeleting]  = useState(null);   // id being deleted
  const [confirmId, setConfirmId] = useState(null);   // id awaiting confirm

  const load = async () => {
    let cancelled = false;
    try {
      setLoading(true); setError("");
      const res = await listDoctors();
      if (!cancelled) setDoctors(res?.data || []);
    } catch {
      if (!cancelled) setError("Unable to load doctors.");
    } finally {
      if (!cancelled) setLoading(false);
    }
    return () => { cancelled = true; };
  };

  useEffect(() => { load(); }, []);

  const filtered = doctors.filter(d => {
    const q = search.toLowerCase();
    return !q || d.name?.toLowerCase().includes(q) || d.specialization?.toLowerCase().includes(q);
  });

  const handleDelete = async (id) => {
    setConfirmId(null);
    setDeleting(id);
    try {
      await deleteDoctor(id);
      setDoctors(prev => prev.filter(d => d.id !== id));
      if (expanded === id) setExpanded(null);
    } catch (e) {
      setError(e?.response?.data?.detail || "Delete failed.");
    } finally {
      setDeleting(null);
    }
  };

  const GRADS = [
    ["#3859c8","#0ea5e9"],["#7c3aed","#06b6d4"],["#059669","#0ea5e9"],
    ["#b45309","#f59e0b"],["#7c3aed","#ec4899"],["#0891b2","#34d399"],
  ];
  const grad     = i => GRADS[i % GRADS.length];
  const initials = (name="") => name.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
  const toggle   = id => setExpanded(p => p===id ? null : id);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { font-family:'Sora',sans-serif; background:#060b18; }

        .dl-page { min-height:100vh; background:#060b18; font-family:'Sora',sans-serif; position:relative; overflow-x:hidden; }
        .orb { position:fixed; border-radius:50%; filter:blur(90px); pointer-events:none; z-index:0; }
        .orb-1 { width:540px; height:540px; top:-150px; left:-130px; background:radial-gradient(circle,rgba(56,89,200,.24) 0%,transparent 70%); animation:d1 14s ease-in-out infinite alternate; }
        .orb-2 { width:400px; height:400px; bottom:-80px; right:-100px; background:radial-gradient(circle,rgba(14,165,233,.18) 0%,transparent 70%); animation:d2 18s ease-in-out infinite alternate; }
        @keyframes d1{from{transform:translate(0,0)}to{transform:translate(45px,30px)}}
        @keyframes d2{from{transform:translate(0,0)}to{transform:translate(-30px,20px)}}
        .grid-bg{position:fixed;inset:0;z-index:0;pointer-events:none;background-image:linear-gradient(rgba(255,255,255,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.022) 1px,transparent 1px);background-size:44px 44px;}

        .topbar{position:fixed;top:0;left:0;right:0;z-index:200;height:58px;display:flex;align-items:center;gap:12px;padding:0 32px;background:rgba(6,11,24,.78);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-bottom:1px solid rgba(255,255,255,.07);}
        .back-btn{display:flex;align-items:center;gap:7px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);border-radius:9px;padding:7px 16px;color:rgba(255,255,255,.8);font-size:13px;font-weight:500;cursor:pointer;font-family:'Sora',sans-serif;transition:all .18s;}
        .back-btn:hover{background:rgba(255,255,255,.11);border-color:rgba(255,255,255,.22);color:#fff;}
        .topbar-crumb{font-size:13px;color:rgba(255,255,255,.3);}
        .topbar-crumb span{color:rgba(255,255,255,.55);}
        .topbar-actions{margin-left:auto;display:flex;gap:10px;}
        .btn-add{display:flex;align-items:center;gap:7px;background:rgba(99,179,237,.85);border:1px solid rgba(99,179,237,.5);border-radius:9px;padding:7px 16px;color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:'Sora',sans-serif;transition:all .18s;}
        .btn-add:hover{background:rgba(99,179,237,1);}

        .dl-body{position:relative;z-index:10;max-width:860px;margin:0 auto;padding:90px 24px 60px;}

        .page-header{margin-bottom:26px;}
        .page-eyebrow{font-size:10.5px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:rgba(96,165,250,.7);margin-bottom:8px;}
        .page-title{font-size:26px;font-weight:800;color:#fff;letter-spacing:-.6px;margin-bottom:5px;}
        .page-sub{font-size:13px;color:rgba(255,255,255,.3);}

        .toolbar{display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap;}
        .search-wrap{position:relative;flex:1;min-width:200px;}
        .search-icon{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:rgba(255,255,255,.28);pointer-events:none;}
        .search-input{width:100%;padding:10px 14px 10px 40px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);border-radius:10px;color:#fff;font-size:13.5px;font-family:'Sora',sans-serif;outline:none;transition:all .18s;}
        .search-input::placeholder{color:rgba(255,255,255,.25);}
        .search-input:focus{border-color:rgba(96,165,250,.4);background:rgba(255,255,255,.06);box-shadow:0 0 0 3px rgba(96,165,250,.08);}
        .count-chip{display:flex;align-items:center;gap:6px;padding:9px 14px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.09);font-size:12.5px;font-weight:600;color:rgba(255,255,255,.45);white-space:nowrap;}
        .count-chip strong{color:#fff;}

        .doc-list{display:flex;flex-direction:column;gap:12px;}

        /* doctor row */
        .doc-row{background:rgba(255,255,255,.04);border:1.5px solid rgba(255,255,255,.08);border-radius:16px;overflow:hidden;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);transition:border-color .2s,box-shadow .2s;animation:fadeUp .35s ease both;}
        .doc-row:hover{border-color:rgba(255,255,255,.15);box-shadow:0 8px 32px rgba(0,0,0,.3);}
        .doc-row.open{border-color:rgba(96,165,250,.25);box-shadow:0 8px 40px rgba(0,0,0,.35);}
        .doc-row.deleting-row{opacity:.45;pointer-events:none;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}

        .accent-bar{height:3px;width:100%;}

        .doc-summary{display:flex;align-items:center;gap:16px;padding:16px 20px;cursor:pointer;user-select:none;}
        .avatar{width:50px;height:50px;border-radius:13px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:#fff;border:1px solid rgba(255,255,255,.12);}
        .doc-info{flex:1;min-width:0;}
        .doc-name{font-size:15px;font-weight:700;color:#fff;letter-spacing:-.2px;margin-bottom:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
        .doc-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}
        .spec-pill{display:inline-flex;align-items:center;gap:5px;padding:3px 11px;border-radius:20px;background:rgba(96,165,250,.1);border:1px solid rgba(96,165,250,.2);font-size:11.5px;font-weight:600;color:rgba(96,165,250,.85);}
        .meta-text{font-size:12px;color:rgba(255,255,255,.35);font-weight:500;}
        .dot-sep{width:3px;height:3px;border-radius:50%;background:rgba(255,255,255,.2);flex-shrink:0;}

        .stats-strip{display:flex;align-items:center;gap:20px;flex-shrink:0;}
        .stat-item{display:flex;flex-direction:column;align-items:flex-end;gap:2px;}
        .stat-label{font-size:9.5px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:rgba(255,255,255,.28);}
        .stat-value{font-size:14px;font-weight:700;}
        .stat-div{width:1px;height:26px;background:rgba(255,255,255,.08);}

        /* row action buttons */
        .row-actions{display:flex;align-items:center;gap:8px;margin-left:8px;flex-shrink:0;}
        .action-btn{display:flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:9px;border:none;cursor:pointer;font-size:15px;transition:all .18s;flex-shrink:0;}
        .btn-edit{background:rgba(99,179,237,.12);color:rgba(99,179,237,.85);}
        .btn-edit:hover{background:rgba(99,179,237,.25);color:#fff;}
        .btn-delete{background:rgba(248,113,113,.1);color:rgba(248,113,113,.75);}
        .btn-delete:hover{background:rgba(248,113,113,.22);color:#f87171;}

        .chevron{color:rgba(255,255,255,.25);transition:transform .25s,color .2s;flex-shrink:0;}
        .doc-row.open .chevron{transform:rotate(180deg);color:rgba(96,165,250,.7);}

        /* expanded */
        .doc-detail{overflow:hidden;max-height:0;transition:max-height .35s cubic-bezier(.4,0,.2,1);}
        .doc-detail.open{max-height:500px;}
        .detail-inner{padding:0 20px 22px;border-top:1px solid rgba(255,255,255,.07);}
        .detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin-bottom:16px;padding-top:18px;}
        .detail-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:11px;padding:13px 15px;}
        .detail-card-label{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.28);margin-bottom:7px;}
        .detail-card-value{font-size:14px;font-weight:600;color:#fff;}
        .desc-block{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:11px;padding:15px 17px;}
        .desc-label{font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:rgba(255,255,255,.28);margin-bottom:10px;}
        .desc-text{font-size:13.5px;line-height:1.75;color:rgba(255,255,255,.65);}

        /* expanded action bar */
        .detail-actions{display:flex;gap:10px;margin-top:14px;}
        .detail-edit-btn{flex:1;padding:11px;border-radius:11px;background:rgba(99,179,237,.15);border:1px solid rgba(99,179,237,.3);color:rgba(99,179,237,.9);font-size:13.5px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;transition:all .18s;display:flex;align-items:center;justify-content:center;gap:7px;}
        .detail-edit-btn:hover{background:rgba(99,179,237,.28);color:#fff;}
        .detail-delete-btn{flex:1;padding:11px;border-radius:11px;background:rgba(248,113,113,.1);border:1px solid rgba(248,113,113,.25);color:rgba(248,113,113,.9);font-size:13.5px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;transition:all .18s;display:flex;align-items:center;justify-content:center;gap:7px;}
        .detail-delete-btn:hover{background:rgba(248,113,113,.22);color:#fff;}

        /* confirm modal */
        .overlay{position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .18s ease;}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        .modal{background:#0d1b2a;border:1px solid rgba(255,255,255,.12);border-radius:18px;padding:34px 30px;max-width:380px;width:100%;text-align:center;box-shadow:0 32px 80px rgba(0,0,0,.5);animation:scaleUp .2s ease;}
        @keyframes scaleUp{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
        .modal-icon{font-size:40px;margin-bottom:14px;}
        .modal-title{font-size:20px;font-weight:800;color:#fff;margin-bottom:8px;letter-spacing:-.3px;}
        .modal-sub{font-size:13.5px;color:rgba(255,255,255,.45);line-height:1.65;margin-bottom:26px;}
        .modal-btns{display:flex;gap:11px;}
        .modal-cancel{flex:1;padding:12px;border-radius:10px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);color:rgba(255,255,255,.7);font-size:14px;font-weight:600;cursor:pointer;font-family:'Sora',sans-serif;transition:all .18s;}
        .modal-cancel:hover{background:rgba(255,255,255,.12);color:#fff;}
        .modal-del{flex:1;padding:12px;border-radius:10px;border:none;background:#dc2626;color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:'Sora',sans-serif;transition:all .18s;box-shadow:0 4px 16px rgba(220,38,38,.3);}
        .modal-del:hover{background:#b91c1c;}

        /* states */
        .state-box{padding:64px 20px;text-align:center;display:flex;flex-direction:column;align-items:center;gap:14px;}
        .spinner{width:40px;height:40px;border-radius:50%;border:3px solid rgba(255,255,255,.07);border-top-color:rgba(96,165,250,.65);animation:spin .8s linear infinite;}
        @keyframes spin{to{transform:rotate(360deg)}}
        .state-title{font-size:14px;font-weight:600;color:rgba(255,255,255,.4);}
        .state-sub{font-size:12.5px;color:rgba(255,255,255,.22);}
        .error-box{border-radius:13px;padding:18px 22px;background:rgba(248,113,113,.08);border:1px solid rgba(248,113,113,.22);display:flex;gap:12px;align-items:flex-start;}
        .error-title{font-size:13px;font-weight:600;color:#fca5a5;margin-bottom:3px;}
        .error-msg{font-size:12.5px;color:rgba(252,165,165,.6);}

        .list-footer{margin-top:18px;font-size:12px;color:rgba(255,255,255,.22);text-align:center;}
        .clear-btn{background:none;border:none;color:rgba(96,165,250,.6);font-size:12px;cursor:pointer;margin-left:10px;font-family:'Sora',sans-serif;}

        @media(max-width:640px){
          .stats-strip{display:none;}
          .detail-grid{grid-template-columns:1fr;}
          .topbar{padding:0 16px;}
          .dl-body{padding:78px 14px 50px;}
        }
      `}</style>

      <div className="dl-page">
        <div className="orb orb-1"/><div className="orb orb-2"/>
        <div className="grid-bg"/>

        {/* Topbar */}
        <div className="topbar">
          <button className="back-btn" onClick={()=>navigate("/dashboard")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Dashboard
          </button>
          <span className="topbar-crumb">/ <span>Doctors</span></span>
          <div className="topbar-actions">
            <button className="btn-add" onClick={()=>navigate("/create-doctor")}>
              ➕ Add Doctor
            </button>
          </div>
        </div>

        <div className="dl-body">
          {/* Header */}
          <div className="page-header">
            <div className="page-eyebrow">Admin · Directory</div>
            <div className="page-title">Doctors</div>
            <div className="page-sub">Click a row to expand. Edit or delete any doctor.</div>
          </div>

          {/* Toolbar */}
          {!loading && !error && (
            <div className="toolbar">
              <div className="search-wrap">
                <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                </svg>
                <input className="search-input" type="text" placeholder="Search by name or specialization…"
                  value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>
              <div className="count-chip">👨‍⚕️ <strong>{filtered.length}</strong> doctor{filtered.length!==1?"s":""}</div>
            </div>
          )}

          {/* List */}
          <div className="doc-list">
            {loading && <div className="state-box"><div className="spinner"/><div className="state-title">Loading doctors…</div></div>}

            {!loading && error && (
              <div className="error-box">
                <span style={{fontSize:20}}>⚠️</span>
                <div><div className="error-title">Could not load doctors</div><div className="error-msg">{error}</div></div>
              </div>
            )}

            {!loading && !error && filtered.length===0 && (
              <div className="state-box">
                <div style={{fontSize:36}}>🔍</div>
                <div className="state-title">No doctors found</div>
                <div className="state-sub">Try a different search term.</div>
              </div>
            )}

            {!loading && !error && filtered.map((doc, i) => {
              const [c1,c2] = grad(i);
              const isOpen  = expanded === doc.id;
              const isDel   = deleting  === doc.id;
              const exp     = doc.experience ?? doc.years_of_experience ?? null;

              return (
                <div key={doc.id} className={`doc-row ${isOpen?"open":""} ${isDel?"deleting-row":""}`}
                  style={{animationDelay:`${i*.04}s`}}>

                  <div className="accent-bar" style={{background:`linear-gradient(90deg,${c1},${c2})`}}/>

                  <div className="doc-summary" onClick={()=>toggle(doc.id)}>
                    <div className="avatar" style={{background:`linear-gradient(135deg,${c1}cc,${c2}cc)`}}>
                      {initials(doc.name)}
                    </div>

                    <div className="doc-info">
                      <div className="doc-name">{doc.name||"—"}</div>
                      <div className="doc-meta">
                        <span className="spec-pill">🔬 {doc.specialization||"General"}</span>
                        {exp!==null && <><span className="dot-sep"/><span className="meta-text">{exp} yrs exp</span></>}
                      </div>
                    </div>

                    <div className="stats-strip">
                      {exp!==null && (
                        <><div className="stat-item">
                          <div className="stat-label">Experience</div>
                          <div className="stat-value" style={{color:"rgba(52,211,153,.9)"}}>{exp} <span style={{fontSize:11,fontWeight:500,color:"rgba(52,211,153,.5)"}}>yrs</span></div>
                        </div><div className="stat-div"/></>
                      )}
                      <div className="stat-item">
                        <div className="stat-label">Fee</div>
                        <div className="stat-value" style={{color:"rgba(251,191,36,.9)"}}>₹ {doc.consultation_fee??"—"}</div>
                      </div>
                    </div>

                    {/* Inline action icons */}
                    <div className="row-actions" onClick={e=>e.stopPropagation()}>
                      <button className="action-btn btn-edit" title="Edit doctor"
                        onClick={()=>navigate(`/doctors/edit/${doc.id}`)}>✏️</button>
                      <button className="action-btn btn-delete" title="Delete doctor"
                        onClick={()=>setConfirmId(doc.id)}>🗑️</button>
                    </div>

                    <svg className="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </div>

                  {/* Expanded panel */}
                  <div className={`doc-detail ${isOpen?"open":""}`}>
                    <div className="detail-inner">
                      <div className="detail-grid">
                        <div className="detail-card"><div className="detail-card-label">Full Name</div><div className="detail-card-value">{doc.name||"—"}</div></div>
                        <div className="detail-card"><div className="detail-card-label">Specialization</div><div className="detail-card-value">{doc.specialization||"—"}</div></div>
                        <div className="detail-card"><div className="detail-card-label">Consultation Fee</div><div className="detail-card-value" style={{color:"rgba(251,191,36,.9)"}}>₹ {doc.consultation_fee??"—"}</div></div>
                        {exp!==null && <div className="detail-card"><div className="detail-card-label">Experience</div><div className="detail-card-value" style={{color:"rgba(52,211,153,.9)"}}>{exp} years</div></div>}
                      </div>
                      <div className="desc-block">
                        <div className="desc-label">About this Doctor</div>
                        <div className="desc-text">{doc.description||<em style={{opacity:.4}}>No description provided.</em>}</div>
                      </div>
                      {/* Expanded action bar */}
                      <div className="detail-actions">
                        <button className="detail-edit-btn" onClick={()=>navigate(`/doctors/edit/${doc.id}`)}>
                          ✏️ Edit Doctor
                        </button>
                        <button className="detail-delete-btn" onClick={()=>setConfirmId(doc.id)}>
                          🗑️ Delete Doctor
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {!loading && !error && filtered.length>0 && (
            <div className="list-footer">
              Showing {filtered.length} of {doctors.length} doctors
              {search && <button className="clear-btn" onClick={()=>setSearch("")}>Clear search</button>}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm modal */}
      {confirmId && (
        <div className="overlay" onClick={()=>setConfirmId(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="modal-icon">⚠️</div>
            <div className="modal-title">Delete Doctor?</div>
            <p className="modal-sub">
              This will permanently remove <strong style={{color:"#fff"}}>
                {doctors.find(d=>d.id===confirmId)?.name||"this doctor"}
              </strong> from the system. This action cannot be undone.
            </p>
            <div className="modal-btns">
              <button className="modal-cancel" onClick={()=>setConfirmId(null)}>Cancel</button>
              <button className="modal-del"    onClick={()=>handleDelete(confirmId)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminDoctorsList;