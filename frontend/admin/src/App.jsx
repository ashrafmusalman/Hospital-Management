import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminLogin       from "./pages/AdminLogin";
import Dashboard        from "./pages/AdminDashboard";
import CreateDoctor     from "./pages/CreateDoctor";
import EditDoctor       from "./pages/Editdoctor";          // ← new
import DoctorsList      from "./pages/AdminDoctorsList";    // ← updated (with edit/delete)
import Appointments     from "./pages/Appointments";
import AppointmentDetail from "./pages/AppointmentDetail";

import ProtectedRoute   from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public ── */}
        <Route path="/" element={<AdminLogin />} />

        {/* ── Protected ── */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

        {/* Doctors */}
        <Route path="/doctors"           element={<ProtectedRoute><DoctorsList /></ProtectedRoute>} />
        <Route path="/create-doctor"     element={<ProtectedRoute><CreateDoctor /></ProtectedRoute>} />
        <Route path="/doctors/edit/:doctorId" element={<ProtectedRoute><EditDoctor /></ProtectedRoute>} />

        {/* Appointments */}
        <Route path="/appointments"                    element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
        <Route path="/appointments/:appointmentId"     element={<ProtectedRoute><AppointmentDetail /></ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;