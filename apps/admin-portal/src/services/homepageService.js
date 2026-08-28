import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── homepage content endpoints ──────────────────────────────────────────
//
//  GET  /settings/homepage         → getHomepageContent()
//  PUT  /admin/settings/homepage   → updateHomepageContent(data)

export const getHomepageContent    = ()     => api.get("/settings/homepage");

export const updateHomepageContent = (data) => api.put("/admin/settings/homepage", data);
