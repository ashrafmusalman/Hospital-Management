import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../config";

import "../styles/auth.css";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Already signed in? Bounce straight to the dashboard instead of showing
  // the login form again — this is also what makes the browser's back
  // button behave: without it, navigating back to "/" after logging in
  // would just sit on the login page (this used to actually wipe the
  // session token here on every visit, which was worse — clicking back
  // silently logged the admin out).
  useEffect(() => {
    if (localStorage.getItem("token") && localStorage.getItem("admin")) {
      navigate("/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(
        `${API_BASE_URL}/auth/login`,
        formData
      );

      const token = response.data.access_token;
      localStorage.setItem("token", token);

      const userResponse = await axios.get(
        `${API_BASE_URL}/auth/currentUser`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (userResponse.data.role !== "admin") {
        setMessage("Access Denied");
        return;
      }

      localStorage.setItem("admin", JSON.stringify(userResponse.data));
      // replace, not push — so the login page isn't left in the history
      // stack for the back button to return to.
      navigate("/dashboard", { replace: true });

    } catch (error) {
      setMessage(error.response?.data?.detail || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <form className="form-card" onSubmit={handleSubmit}>
        <div className="auth-icon" aria-hidden="true">🏥</div>
        <h2>Hospital Admin</h2>
        <p>Secure access to the management dashboard</p>

        <label className="field-label" htmlFor="admin-email">Email</label>
        <input
          id="admin-email"
          type="email"
          name="email"
          placeholder="admin@hospital.com"
          value={formData.email}
          onChange={handleChange}
          autoComplete="username"
          required
        />

        <label className="field-label" htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="current-password"
          required
        />

        {message && (
          <div className="notice notice-error" role="alert">
            ⚠️ {message}
          </div>
        )}

        <button type="submit" disabled={loading}>
          {loading && <span className="btn-spinner" aria-hidden="true" />}
          {loading ? "Authenticating…" : "Login"}
        </button>
      </form>
    </div>
  );
}

export default AdminLogin;