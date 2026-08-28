import axios from "axios";

// ── base instance ─────────────────────────────────────────────────────────
// Adjust BASE_URL to wherever your FastAPI server runs.
// Vite projects: set VITE_API_URL in .env  →  VITE_API_URL=http://localhost:8000
const BASE_URL = import.meta.env.VITE_API_URL || "http://api.44.205.19.225.nip.io";
const api = axios.create({
  baseURL: BASE_URL,
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── appointment endpoints (must match FastAPI router exactly) ─────────────
//
//  GET  /admin/appointments/summary          → getAppointmentSummary()
//  GET  /admin/appointments/list             → listAppointments()
//  GET  /admin/appointments/{appointment_id} → getAppointmentDetail(id)

/**
 * Returns { appointments, completed, cancelled }
 */
export const getAppointmentSummary = () =>
  api.get("/admin/appointments/summary");

/**
 * Returns an array of appointment objects.
 */
export const listAppointments = () =>
  api.get("/admin/appointments/list");   // ← was likely "/appointments" or "/admin/appointments"

/**
 * Returns a single appointment by ID.
 * @param {number|string} id
 */
export const getAppointmentDetail = (id) =>
  api.get(`/admin/appointments/${id}`);

/**
 * Mark an appointment as completed (admin only).
 * @param {number|string} id
 */
export const markAppointmentCompleted = (id) =>
  api.put(`/admin/appointments/${id}/complete`);

export const getWeeklyAppointments = () =>
  api.get("/admin/appointments/weekly");