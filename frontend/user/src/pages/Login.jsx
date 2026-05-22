import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/auth/login", formData);
      localStorage.setItem("token", res.data.access_token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-wrap">

        {/* LEFT — HERO */}
        <div className="auth-hero">
          <span className="section-tag">Patient Portal</span>

          <h1>
            Your health,<br />
            <span>managed simply.</span>
          </h1>

          <p>
            Sign in to book appointments, browse verified specialists, and
            keep track of all your visits — from any device, any time.
          </p>

          <div className="auth-points">
            <div className="auth-point">
              <strong>🔒 Secure Login</strong>
              <span>JWT-protected access keeps your medical data private.</span>
            </div>
            <div className="auth-point">
              <strong>🩺 Find Doctors</strong>
              <span>Browse 200+ specialists and book with one click.</span>
            </div>
            <div className="auth-point">
              <strong>📅 Appointments</strong>
              <span>View, manage, and cancel visits from your dashboard.</span>
            </div>
            <div className="auth-point">
              <strong>📱 Any Device</strong>
              <span>Fully responsive — works on mobile and desktop.</span>
            </div>
          </div>
        </div>

        {/* RIGHT — FORM */}
        <div className="auth-card">
          <h2>Welcome back</h2>
          <p>Sign in to your patient account to continue.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="notice notice-error">{error}</div>}

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
                placeholder="Enter your password"
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
                {loading ? "Signing in…" : "Sign In →"}
              </button>
            </div>
          </form>

          <div className="auth-footer">
            New patient?&nbsp;
            <Link to="/register">Create an account</Link>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;