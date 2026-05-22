import { useState, useEffect, useRef } from "react";
import { createDoctor } from "../services/doctorService";
import { useNavigate } from "react-router-dom";

function CreateDoctor() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [doctor, setDoctor] = useState({
    name: "",
    specialization: "",
    description: "",
    image: null,
    experience: "",
    consultation_fee: "",
  });

  const [preview, setPreview]   = useState(null);
  const [message, setMessage]   = useState({ text: "", type: "" });
  const [loading, setLoading]   = useState(false);
  const [focused, setFocused]   = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/");
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files && files[0]) {
      setDoctor((d) => ({ ...d, [name]: files[0] }));
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setDoctor((d) => ({ ...d, [name]: value }));
    }
  };

  const removeImage = () => {
    setDoctor((d) => ({ ...d, image: null }));
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const formData = new FormData();
      formData.append("name", doctor.name);
      formData.append("specialization", doctor.specialization);
      formData.append("description", doctor.description);
      formData.append("experience", doctor.experience);
      formData.append("consultation_fee", doctor.consultation_fee);
      if (doctor.image) formData.append("image", doctor.image);

      await createDoctor(formData);
      setMessage({ text: "Doctor created successfully!", type: "success" });
      setDoctor({ name: "", specialization: "", description: "", image: null, experience: "", consultation_fee: "" });
      setPreview(null);
      setTimeout(() => navigate("/dashboard"), 1400);
    } catch (error) {
      setMessage({ text: error.response?.data?.detail || "Failed to create doctor.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const specializations = [
    "Cardiologist", "Neurologist", "Orthopedic Surgeon", "Dermatologist",
    "Pediatrician", "Gynecologist", "Oncologist", "Psychiatrist",
    "Radiologist", "General Physician", "ENT Specialist", "Ophthalmologist",
  ];

  const inputStyle = (name) => ({
    width: "100%",
    background: focused === name ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.04)",
    border: focused === name ? "1px solid rgba(99,179,237,0.6)" : "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "13px 16px",
    color: "#fff",
    fontSize: 14,
    outline: "none",
    transition: "all 0.2s",
    boxSizing: "border-box",
    boxShadow: focused === name ? "0 0 0 3px rgba(99,179,237,0.1)" : "none",
  });

  const labelStyle = {
    display: "block",
    fontSize: 11.5,
    fontWeight: 600,
    letterSpacing: "0.8px",
    textTransform: "uppercase",
    color: "rgba(255,255,255,0.45)",
    marginBottom: 7,
  };

  return (
    <>
      {/* ── Background ── */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0,
        background: "linear-gradient(135deg, #0a0e1e 0%, #0d1b2a 50%, #0a0e1e 100%)",
      }} />
      <div style={{
        position: "fixed", inset: 0, zIndex: 1, opacity: 0.4,
        backgroundImage: `
          linear-gradient(rgba(99,179,237,0.07) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,179,237,0.07) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
      }} />

      {/* ── Fixed top bar ── */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        height: 60,
        display: "flex", alignItems: "center", gap: 14, padding: "0 32px",
        background: "rgba(10,14,30,0.75)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.14)"}
          onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)",
            borderRadius: 8, padding: "6px 14px",
            color: "#fff", fontSize: 13, fontWeight: 500,
            cursor: "pointer", letterSpacing: "0.2px", transition: "background 0.15s",
          }}
        >
          ← Back to Dashboard
        </button>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
          Create New Doctor
        </span>
      </div>

      {/* ── Page body ── */}
      <div style={{
        position: "relative", zIndex: 10,
        minHeight: "100vh",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "80px 20px 48px",
      }}>
        <div style={{
          width: "100%", maxWidth: 680,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          padding: "40px 44px",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}>

          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 48, height: 48, borderRadius: 14,
              background: "rgba(99,179,237,0.15)",
              border: "1px solid rgba(99,179,237,0.3)",
              fontSize: 22, marginBottom: 16,
            }}>
              🩺
            </div>
            <h1 style={{ margin: "0 0 6px", color: "#fff", fontSize: 22, fontWeight: 700, letterSpacing: "-0.3px" }}>
              Add New Doctor
            </h1>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.4)", fontSize: 13.5 }}>
              Fill in the details below to register a medical professional.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 22 }}>

            {/* Row 1 — Name + Specialization */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div>
                <label style={labelStyle}>Doctor Name</label>
                <input
                  type="text" name="name"
                  placeholder="e.g. Dr. Priya Sharma"
                  value={doctor.name}
                  onChange={handleChange}
                  onFocus={() => setFocused("name")}
                  onBlur={() => setFocused("")}
                  required
                  style={inputStyle("name")}
                />
              </div>

              <div>
                <label style={labelStyle}>Specialization</label>
                <select
                  name="specialization"
                  value={doctor.specialization}
                  onChange={handleChange}
                  onFocus={() => setFocused("specialization")}
                  onBlur={() => setFocused("")}
                  required
                  style={{
                    ...inputStyle("specialization"),
                    appearance: "none",
                    cursor: "pointer",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 14px center",
                    paddingRight: 36,
                  }}
                >
                  <option value="" style={{ background: "#0d1b2a" }}>Select specialization</option>
                  {specializations.map((s) => (
                    <option key={s} value={s} style={{ background: "#0d1b2a" }}>{s}</option>
                  ))}
                  <option value="Other" style={{ background: "#0d1b2a" }}>Other</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label style={labelStyle}>Description</label>
              <textarea
                name="description"
                placeholder="Write a brief professional bio — qualifications, expertise, notable achievements, patient approach..."
                value={doctor.description}
                onChange={handleChange}
                onFocus={() => setFocused("description")}
                onBlur={() => setFocused("")}
                rows={5}
                style={{
                  ...inputStyle("description"),
                  resize: "vertical",
                  minHeight: 120,
                  lineHeight: 1.6,
                  fontFamily: "inherit",
                }}
              />
              <div style={{
                display: "flex", justifyContent: "flex-end",
                marginTop: 5, fontSize: 11.5, color: "rgba(255,255,255,0.25)",
              }}>
                {doctor.description.length} characters
              </div>
            </div>

            {/* Row 2 — Experience + Fee */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
              <div>
                <label style={labelStyle}>Experience (years)</label>
                <input
                  type="number" name="experience" min="0" max="60"
                  placeholder="e.g. 8"
                  value={doctor.experience}
                  onChange={handleChange}
                  onFocus={() => setFocused("experience")}
                  onBlur={() => setFocused("")}
                  required
                  style={inputStyle("experience")}
                />
              </div>

              <div>
                <label style={labelStyle}>Consultation Fee (₹)</label>
                <input
                  type="number" name="consultation_fee" min="0"
                  placeholder="e.g. 500"
                  value={doctor.consultation_fee}
                  onChange={handleChange}
                  onFocus={() => setFocused("consultation_fee")}
                  onBlur={() => setFocused("")}
                  required
                  style={inputStyle("consultation_fee")}
                />
              </div>
            </div>

            {/* Image upload */}
            <div>
              <label style={labelStyle}>Profile Photo</label>
              {!preview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    border: "2px dashed rgba(255,255,255,0.15)",
                    borderRadius: 12,
                    padding: "28px 20px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    background: "rgba(255,255,255,0.02)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "rgba(99,179,237,0.4)";
                    e.currentTarget.style.background = "rgba(99,179,237,0.05)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                  }}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>📷</div>
                  <p style={{ margin: "0 0 4px", color: "rgba(255,255,255,0.6)", fontSize: 13.5, fontWeight: 500 }}>
                    Click to upload photo
                  </p>
                  <p style={{ margin: 0, color: "rgba(255,255,255,0.3)", fontSize: 12 }}>
                    PNG, JPG, WEBP — max 5 MB
                  </p>
                </div>
              ) : (
                <div style={{
                  display: "flex", alignItems: "center", gap: 16,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12, padding: "14px 16px",
                }}>
                  <img
                    src={preview} alt="Preview"
                    style={{ width: 60, height: 60, borderRadius: 10, objectFit: "cover", flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: "0 0 3px", color: "#fff", fontSize: 13.5, fontWeight: 500,
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {doctor.image?.name}
                    </p>
                    <p style={{ margin: 0, color: "rgba(255,255,255,0.35)", fontSize: 12 }}>
                      {doctor.image ? (doctor.image.size / 1024).toFixed(1) + " KB" : ""}
                    </p>
                  </div>
                  <button
                    type="button" onClick={removeImage}
                    style={{
                      background: "rgba(220,53,69,0.15)", border: "1px solid rgba(220,53,69,0.3)",
                      color: "#ff8a95", borderRadius: 8, padding: "6px 12px",
                      fontSize: 12, cursor: "pointer", flexShrink: 0,
                    }}
                  >
                    Remove
                  </button>
                </div>
              )}
              <input
                ref={fileInputRef} type="file" name="image"
                accept="image/*" onChange={handleChange}
                style={{ display: "none" }}
              />
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "2px 0" }} />

            {/* Toast */}
            {message.text && (
              <div style={{
                padding: "13px 16px", borderRadius: 10, fontSize: 13.5,
                background: message.type === "success"
                  ? "rgba(56,161,105,0.15)" : "rgba(220,53,69,0.15)",
                border: `1px solid ${message.type === "success"
                  ? "rgba(56,161,105,0.35)" : "rgba(220,53,69,0.35)"}`,
                color: message.type === "success" ? "#68d391" : "#ff8a95",
              }}>
                {message.type === "success" ? "✅ " : "❌ "}{message.text}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = "0.88"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
              style={{
                width: "100%", padding: "14px",
                background: loading ? "rgba(99,179,237,0.3)" : "rgba(99,179,237,0.85)",
                border: "1px solid rgba(99,179,237,0.5)",
                borderRadius: 11, color: "#fff",
                fontSize: 14.5, fontWeight: 600, letterSpacing: "0.3px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "opacity 0.15s",
              }}
            >
              {loading ? "Creating doctor…" : "Create Doctor"}
            </button>

          </form>
        </div>
      </div>
    </>
  );
}

export default CreateDoctor;