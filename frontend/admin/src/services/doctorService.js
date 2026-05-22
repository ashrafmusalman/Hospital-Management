import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({ baseURL: BASE_URL });

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── doctor endpoints (matches FastAPI router exactly) ──────────────────────
//
//  POST   /admin/doctors/create          → createDoctor(formData)
//  GET    /admin/doctors/list_doctors     → listDoctors()
//  GET    /admin/doctors/{id}             → getDoctorById(id)
//  PUT    /admin/doctors/{id}             → updateDoctor(id, data)
//  DELETE /admin/doctors/{id}             → deleteDoctor(id)

export const createDoctor  = (formData) =>
  api.post("/admin/doctors/create", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const listDoctors   = ()         => api.get("/admin/doctors/list_doctors");

export const getDoctorById = (id)       => api.get(`/admin/doctors/${id}`);

export const updateDoctor  = (id, data) =>
  api.put(`/admin/doctors/${id}`, data);          // JSON body (DoctorCreate schema)

export const deleteDoctor  = (id)       => api.delete(`/admin/doctors/${id}`);