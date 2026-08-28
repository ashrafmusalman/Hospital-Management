import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Already signed in? No need to register again.
  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await API.post("/auth/register", formData);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-wrap">

        {/* LEFT — HERO */}
        <div className="auth-hero">
          <span className="section-tag">New Patient</span>

          <h1>
            Join MediCare.<br />
            <span>Start your care today.</span>
          </h1>

          <p>
            Register once and get instant access to our full patient portal —
            book appointments, find specialists, and manage your healthcare
            all from one clean dashboard.
          </p>

          <div className="auth-points">
            <div className="auth-point">
              <strong>⚡ Quick Setup</strong>
              <span>Register in under a minute and access your dashboard.</span>
            </div>
            <div className="auth-point">
              <strong>🏥 200+ Doctors</strong>
              <span>Connect with verified specialists across all departments.</span>
            </div>
            <div className="auth-point">
              <strong>🔐 Data Privacy</strong>
              <span>Your personal information is encrypted and secure.</span>
            </div>
            <div className="auth-point">
              <strong>✅ Free to Join</strong>
              <span>Patient registration is always completely free.</span>
            </div>
          </div>
        </div>

        {/* RIGHT — FORM */}
        <div className="auth-card">
          <h2>Create account</h2>
          <p>Fill in your details to register as a patient.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="notice notice-error">{error}</div>}

            <div className="form-row">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Your full name"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Create a strong password"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <label>Phone Number</label>
              <input
                type="text"
                name="phone"
                placeholder="+91 98765 43210"
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row" style={{ marginTop: 6 }}>
              <button
                className="btn btn-primary btn-lg btn-full"
                type="submit"
                disabled={loading}
              >
                {loading && <span className="btn-spinner" aria-hidden="true" />}
                {loading ? "Creating account…" : "Create Account →"}
              </button>
            </div>
          </form>

          <div className="auth-footer">
            Already registered?&nbsp;
            <Link to="/">Sign in here</Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Register;