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

  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
  }, []);

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
      navigate("/dashboard");

    } catch (error) {
      setMessage(error.response?.data?.detail || "Login Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <form className="form-card" onSubmit={handleSubmit}>
        <h2>Hospital Admin</h2>
        <p>Secure access to futuristic medical dashboard</p>

        <input
          type="email"
          name="email"
          placeholder="Admin Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Authenticating..." : "Login"}
        </button>

        {message && (
          <p style={{ color: "#f87171", marginTop: "10px" }}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
}

export default AdminLogin;