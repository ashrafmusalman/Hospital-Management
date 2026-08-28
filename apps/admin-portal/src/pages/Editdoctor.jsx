import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDoctorById, updateDoctor } from "../services/doctorService";

const SPECIALIZATIONS = [
  "Cardiologist","Neurologist","Orthopedic Surgeon","Dermatologist",
  "Pediatrician","Gynecologist","Oncologist","Psychiatrist",
  "Radiologist","General Physician","ENT Specialist","Ophthalmologist","Other",
];

export default function EditDoctor() {
  const { doctorId } = useParams();
  const navigate      = useNavigate();

  const [form,    setForm]    = useState({ name:"", specialization:"", description:"", experience:"", consultation_fee:"", hospital_id:"" });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [message, setMessage] = useState({ text:"", type:"" });
  const [focused, setFocused] = useState("");

  // ── load existing data ──
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getDoctorById(doctorId);
        const d   = res?.data ?? res;
        if (!cancelled && d) {
          setForm({
            name:             d.name             ?? "",
            specialization:   d.specialization   ?? "",
            description:      d.description      ?? "",
            experience:       d.experience       ?? "",
            consultation_fee: d.consultation_fee ?? "",
            hospital_id:      d.hospital_id      ?? "",
          });
        }
      } catch (e) {
        if (!cancelled) setMessage({ text: e?.response?.data?.detail || "Failed to load doctor.", type:"error" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [doctorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text:"", type:"" });
    setSaving(true);
    try {
      await updateDoctor(doctorId, {
        name:             form.name,
        specialization:   form.specialization,
        description:      form.description      || null,
        experience:       form.experience       ? Number(form.experience)       : null,
        consultation_fee: form.consultation_fee ? Number(form.consultation_fee) : null,
        hospital_id:      form.hospital_id      ? Number(form.hospital_id)      : null,
        image:            null,   // image update not supported via this form
      });
      setMessage({ text:"Doctor updated successfully!", type:"success" });
      setTimeout(() => navigate("/doctors"), 1400);
    } catch (err) {
      setMessage({ text: err?.response?.data?.detail || "Update failed.", type:"error" });
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = (name) => ({
    width:"100%",
    background: focused===name ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.04)",
    border: focused===name ? "1px solid rgba(99,179,237,.6)" : "1px solid rgba(255,255,255,.1)",
    borderRadius:10, padding:"13px 16px", color:"#fff", fontSize:14,
    outline:"none", transition:"all .2s", boxSizing:"border-box",
    boxShadow: focused===name ? "0 0 0 3px rgba(99,179,237,.1)" : "none",
    fontFamily:"inherit",
  });

  const labelStyle = {
    display:"block", fontSize:11.5, fontWeight:600, letterSpacing:".8px",
    textTransform:"uppercase", color:"rgba(255,255,255,.45)", marginBottom:7,
  };

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:#060b18; }
        select option { background:#0d1b2a; color:#fff; }
        textarea { resize:vertical; font-family:inherit; }
      `}</style>

      {/* Background */}
      <div style={{ position:"fixed", inset:0, zIndex:0, background:"linear-gradient(135deg,#0a0e1e 0%,#0d1b2a 50%,#0a0e1e 100%)" }} />
      <div style={{ position:"fixed", inset:0, zIndex:1, opacity:.4,
        backgroundImage:"linear-gradient(rgba(99,179,237,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(99,179,237,.07) 1px,transparent 1px)",
        backgroundSize:"40px 40px" }} />

      {/* Topbar */}
      <div style={{ position:"fixed", top:0, left:0, right:0, zIndex:100, height:60,
        display:"flex", alignItems:"center", gap:14, padding:"0 32px",
        background:"rgba(10,14,30,.78)", backdropFilter:"blur(14px)",
        WebkitBackdropFilter:"blur(14px)", borderBottom:"1px solid rgba(255,255,255,.08)" }}>
        <button
          type="button" onClick={() => navigate("/doctors")}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.14)"}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.08)"}
          style={{ display:"flex", alignItems:"center", gap:8,
            background:"rgba(255,255,255,.08)", border:"1px solid rgba(255,255,255,.14)",
            borderRadius:8, padding:"6px 14px", color:"#fff", fontSize:13, fontWeight:500,
            cursor:"pointer", transition:"background .15s" }}
        >
          ← Doctors
        </button>
        <span style={{ color:"rgba(255,255,255,.35)", fontSize:13 }}>
          / Edit Doctor #{doctorId}
        </span>
      </div>

      {/* Page body */}
      <div style={{ position:"relative", zIndex:10, minHeight:"100vh",
        display:"flex", alignItems:"center", justifyContent:"center",
        padding:"80px 20px 48px" }}>

        {loading ? (
          <div style={{ textAlign:"center" }}>
            <div style={{ width:42, height:42, borderRadius:"50%", margin:"0 auto 14px",
              border:"3px solid rgba(255,255,255,.08)", borderTopColor:"rgba(96,165,250,.7)",
              animation:"spin .8s linear infinite" }} />
            <p style={{ color:"rgba(255,255,255,.5)", fontSize:14 }}>Loading doctor…</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <div style={{ width:"100%", maxWidth:680,
            background:"rgba(255,255,255,.05)", border:"1px solid rgba(255,255,255,.1)",
            borderRadius:20, padding:"40px 44px",
            backdropFilter:"blur(20px)", WebkitBackdropFilter:"blur(20px)" }}>

            {/* Header */}
            <div style={{ marginBottom:36 }}>
              <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center",
                width:48, height:48, borderRadius:14,
                background:"rgba(99,179,237,.15)", border:"1px solid rgba(99,179,237,.3)",
                fontSize:22, marginBottom:16 }}>✏️</div>
              <h1 style={{ margin:"0 0 6px", color:"#fff", fontSize:22, fontWeight:700, letterSpacing:"-.3px" }}>
                Edit Doctor
              </h1>
              <p style={{ margin:0, color:"rgba(255,255,255,.4)", fontSize:13.5 }}>
                Update the details for Doctor #{doctorId}.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:22 }}>

              {/* Row 1 — Name + Specialization */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
                <div>
                  <label style={labelStyle}>Doctor Name</label>
                  <input type="text" name="name" value={form.name} onChange={handleChange}
                    placeholder="e.g. Dr. Priya Sharma" required
                    onFocus={()=>setFocused("name")} onBlur={()=>setFocused("")}
                    style={inputStyle("name")} />
                </div>
                <div>
                  <label style={labelStyle}>Specialization</label>
                  <select name="specialization" value={form.specialization} onChange={handleChange} required
                    onFocus={()=>setFocused("specialization")} onBlur={()=>setFocused("")}
                    style={{ ...inputStyle("specialization"), appearance:"none", cursor:"pointer",
                      backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat:"no-repeat", backgroundPosition:"right 14px center", paddingRight:36 }}>
                    <option value="">Select specialization</option>
                    {SPECIALIZATIONS.map(s=><option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description</label>
                <textarea name="description" value={form.description} onChange={handleChange} rows={5}
                  placeholder="Professional bio — qualifications, expertise, notable achievements…"
                  onFocus={()=>setFocused("description")} onBlur={()=>setFocused("")}
                  style={{ ...inputStyle("description"), minHeight:120, lineHeight:1.6 }} />
                <div style={{ display:"flex", justifyContent:"flex-end", marginTop:5,
                  fontSize:11.5, color:"rgba(255,255,255,.25)" }}>
                  {form.description.length} characters
                </div>
              </div>

              {/* Row 2 — Experience + Fee */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
                <div>
                  <label style={labelStyle}>Experience (years)</label>
                  <input type="number" name="experience" value={form.experience} onChange={handleChange}
                    placeholder="e.g. 8" min="0" max="60"
                    onFocus={()=>setFocused("experience")} onBlur={()=>setFocused("")}
                    style={inputStyle("experience")} />
                </div>
                <div>
                  <label style={labelStyle}>Consultation Fee (₹)</label>
                  <input type="number" name="consultation_fee" value={form.consultation_fee} onChange={handleChange}
                    placeholder="e.g. 500" min="0"
                    onFocus={()=>setFocused("consultation_fee")} onBlur={()=>setFocused("")}
                    style={inputStyle("consultation_fee")} />
                </div>
              </div>

              {/* Hospital ID */}
              <div>
                <label style={labelStyle}>Hospital ID <span style={{ opacity:.5, fontWeight:400, textTransform:"none", letterSpacing:0 }}>(optional)</span></label>
                <input type="number" name="hospital_id" value={form.hospital_id} onChange={handleChange}
                  placeholder="e.g. 1"
                  onFocus={()=>setFocused("hospital_id")} onBlur={()=>setFocused("")}
                  style={inputStyle("hospital_id")} />
              </div>

              {/* Image note */}
              <div style={{ padding:"12px 16px", borderRadius:10,
                background:"rgba(251,191,36,.08)", border:"1px solid rgba(251,191,36,.2)",
                fontSize:12.5, color:"rgba(251,191,36,.85)", display:"flex", gap:8, alignItems:"flex-start" }}>
                <span style={{ flexShrink:0 }}>ℹ️</span>
                <span>Profile photo cannot be changed here. To update the image, delete this record and re-create it with the new photo.</span>
              </div>

              <div style={{ height:1, background:"rgba(255,255,255,.08)", margin:"2px 0" }} />

              {/* Message */}
              {message.text && (
                <div style={{ padding:"13px 16px", borderRadius:10, fontSize:13.5,
                  background: message.type==="success" ? "rgba(56,161,105,.15)" : "rgba(220,53,69,.15)",
                  border:`1px solid ${message.type==="success" ? "rgba(56,161,105,.35)" : "rgba(220,53,69,.35)"}`,
                  color: message.type==="success" ? "#68d391" : "#ff8a95" }}>
                  {message.type==="success" ? "✅ " : "❌ "}{message.text}
                </div>
              )}

              {/* Actions */}
              <div style={{ display:"flex", gap:12 }}>
                <button type="button" onClick={() => navigate("/doctors")}
                  style={{ flex:1, padding:13, borderRadius:11,
                    background:"rgba(255,255,255,.07)", border:"1px solid rgba(255,255,255,.12)",
                    color:"rgba(255,255,255,.7)", fontSize:14, fontWeight:600, cursor:"pointer",
                    transition:"all .18s", fontFamily:"inherit" }}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,.12)"}
                  onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.07)"}>
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ flex:2, padding:13, borderRadius:11,
                    background: saving ? "rgba(99,179,237,.3)" : "rgba(99,179,237,.85)",
                    border:"1px solid rgba(99,179,237,.5)", color:"#fff",
                    fontSize:14.5, fontWeight:700, cursor: saving ? "not-allowed" : "pointer",
                    transition:"opacity .15s", fontFamily:"inherit" }}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>

            </form>
          </div>
        )}
      </div>
    </>
  );
}