import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getHomepageContent, updateHomepageContent } from "../services/homepageService";

const labelStyle = {
  display: "block",
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.4)",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  borderRadius: 10,
  padding: "10px 13px",
  color: "#fff",
  fontSize: 13.5,
  outline: "none",
  transition: "all 0.2s",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

function Field({ label, value, onChange, textarea, placeholder, maxLength, hint }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      {textarea ? (
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          style={{ ...inputStyle, resize: "vertical", lineHeight: 1.6 }}
        />
      ) : (
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        />
      )}
      {hint && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 5 }}>{hint}</div>}
    </div>
  );
}

function Panel({ title, sub, children }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18,
        padding: "24px 26px",
        marginBottom: 20,
      }}
    >
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 3 }}>{title}</div>
        {sub && <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.4)" }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}

const cardGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 14 };
const cardStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  padding: "14px 16px",
};

function SiteContent() {
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/", { replace: true }); return; }

    getHomepageContent()
      .then((res) => setContent(res.data))
      .catch((e) => setError(e?.response?.data?.detail || "Failed to load homepage content."))
      .finally(() => setLoading(false));
  }, [navigate]);

  const updateStat = (i, field, value) => {
    setContent((c) => {
      const stats = [...c.stats];
      stats[i] = { ...stats[i], [field]: value };
      return { ...c, stats };
    });
  };

  const updateFeature = (i, field, value) => {
    setContent((c) => {
      const cards = [...c.feature_cards];
      cards[i] = { ...cards[i], [field]: value };
      return { ...c, feature_cards: cards };
    });
  };

  const updateBadge = (i, value) => {
    setContent((c) => {
      const badges = [...c.trust_badges];
      badges[i] = value;
      return { ...c, trust_badges: badges };
    });
  };

  const updateSpeciality = (i, field, value) => {
    setContent((c) => {
      const specs = [...c.specialities];
      specs[i] = { ...specs[i], [field]: value };
      return { ...c, specialities: specs };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: "", type: "" });
    try {
      const res = await updateHomepageContent(content);
      setContent(res.data);
      setMessage({ text: "Homepage content saved — live on the patient portal.", type: "success" });
    } catch (err) {
      setMessage({ text: err?.response?.data?.detail || "Failed to save changes.", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Background */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, background: "linear-gradient(135deg, #0a0e1e 0%, #0d1b2a 50%, #0a0e1e 100%)" }} />
      <div style={{
        position: "fixed", inset: 0, zIndex: 1, opacity: 0.4,
        backgroundImage: "linear-gradient(rgba(99,179,237,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(99,179,237,0.07) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {/* Top bar */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100, height: 60,
        display: "flex", alignItems: "center", gap: 14, padding: "0 32px",
        background: "rgba(10,14,30,0.75)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        borderBottom: "1px solid rgba(255,255,255,0.08)",
      }}>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.14)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
          style={{
            display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.14)", borderRadius: 8, padding: "6px 14px",
            color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer", transition: "background 0.15s",
          }}
        >
          ← Back to Dashboard
        </button>
        <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>Site Content</span>
      </div>

      {/* Body */}
      <div style={{ position: "relative", zIndex: 10, minHeight: "100vh", padding: "84px 20px 60px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>

          <div style={{ marginBottom: 28 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center", width: 48, height: 48,
              borderRadius: 14, background: "rgba(99,179,237,0.15)", border: "1px solid rgba(99,179,237,0.3)",
              fontSize: 22, marginBottom: 16,
            }}>🖋️</div>
            <h1 style={{ margin: "0 0 6px", color: "#fff", fontSize: 22, fontWeight: 700, letterSpacing: "-0.3px" }}>
              Homepage Content
            </h1>
            <p style={{ margin: 0, color: "rgba(255,255,255,0.4)", fontSize: 13.5 }}>
              Everything shown here is live on the patient portal's homepage — including the stat counters,
              about section, and specialities grid. Edit it below and hit save.
            </p>
          </div>

          {loading && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "rgba(255,255,255,0.5)" }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%", margin: "0 auto 14px",
                border: "3px solid rgba(255,255,255,0.08)", borderTopColor: "rgba(96,165,250,0.7)",
                animation: "spin 0.8s linear infinite",
              }} />
              Loading homepage content…
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          )}

          {!loading && error && (
            <div style={{ padding: "16px 18px", borderRadius: 12, background: "rgba(220,53,69,0.1)", border: "1px solid rgba(220,53,69,0.3)", color: "#ff8a95" }}>
              ⚠️ {error}
            </div>
          )}

          {!loading && !error && content && (
            <form onSubmit={handleSave}>

              <Panel title="Hero Stats" sub="The four counters shown right under the homepage banner.">
                <div style={cardGridStyle}>
                  {content.stats.map((s, i) => (
                    <div key={i} style={cardStyle}>
                      <Field label="Icon" value={s.icon} onChange={(v) => updateStat(i, "icon", v)} maxLength={8} hint="One emoji only, e.g. 🏆" />
                      <Field label="Number" value={s.num} onChange={(v) => updateStat(i, "num", v)} placeholder="e.g. 25000+" />
                      <Field label="Label" value={s.label} onChange={(v) => updateStat(i, "label", v)} />
                      <Field label="Sub-text" value={s.sub} onChange={(v) => updateStat(i, "sub", v)} />
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="About Us" sub="Intro paragraph and the three feature cards.">
                <Field
                  label="Intro paragraph"
                  value={content.about_intro}
                  onChange={(v) => setContent((c) => ({ ...c, about_intro: v }))}
                  textarea
                />
                <div style={{ ...cardGridStyle, marginTop: 6 }}>
                  {content.feature_cards.map((f, i) => (
                    <div key={i} style={cardStyle}>
                      <Field label="Icon" value={f.icon} onChange={(v) => updateFeature(i, "icon", v)} maxLength={8} hint="One emoji only, e.g. 🏆" />
                      <Field label="Title" value={f.title} onChange={(v) => updateFeature(i, "title", v)} />
                      <Field label="Description" value={f.desc} onChange={(v) => updateFeature(i, "desc", v)} textarea />
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Trust Badges" sub="The small badges under the About Us section.">
                <div style={cardGridStyle}>
                  {content.trust_badges.map((b, i) => (
                    <Field key={i} label={`Badge ${i + 1}`} value={b} onChange={(v) => updateBadge(i, v)} />
                  ))}
                </div>
              </Panel>

              <Panel title="Specialities" sub="The department cards shown on the homepage.">
                <div style={cardGridStyle}>
                  {content.specialities.map((s, i) => (
                    <div key={i} style={cardStyle}>
                      <Field label="Icon" value={s.icon} onChange={(v) => updateSpeciality(i, "icon", v)} maxLength={8} hint="One emoji only, e.g. 🏆" />
                      <Field label="Name" value={s.name} onChange={(v) => updateSpeciality(i, "name", v)} />
                      <Field label="Description" value={s.desc} onChange={(v) => updateSpeciality(i, "desc", v)} textarea />
                    </div>
                  ))}
                </div>
              </Panel>

              {message.text && (
                <div style={{
                  padding: "13px 16px", borderRadius: 10, fontSize: 13.5, marginBottom: 16,
                  background: message.type === "success" ? "rgba(56,161,105,0.15)" : "rgba(220,53,69,0.15)",
                  border: `1px solid ${message.type === "success" ? "rgba(56,161,105,0.35)" : "rgba(220,53,69,0.35)"}`,
                  color: message.type === "success" ? "#68d391" : "#ff8a95",
                }}>
                  {message.type === "success" ? "✅ " : "❌ "}{message.text}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                style={{
                  width: "100%", padding: 14, background: saving ? "rgba(99,179,237,0.3)" : "rgba(99,179,237,0.85)",
                  border: "1px solid rgba(99,179,237,0.5)", borderRadius: 11, color: "#fff",
                  fontSize: 14.5, fontWeight: 600, letterSpacing: "0.3px",
                  cursor: saving ? "not-allowed" : "pointer", transition: "opacity 0.15s",
                }}
              >
                {saving ? "Saving…" : "Save Changes"}
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default SiteContent;
