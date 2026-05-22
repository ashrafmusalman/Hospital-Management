import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./styles/portal.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DoctorsList from "./pages/DoctorsList";
import AboutDoctor from "./pages/AboutDoctor";
import MyAppointments from "./pages/MyAppointments";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/doctors"
          element={
            <ProtectedRoute>
              <DoctorsList />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/doctors/:doctorId"
          element={
            <ProtectedRoute>
              {/* Doctor details */}
              <AboutDoctor />
            </ProtectedRoute>
          }
        />


        <Route
          path="/dashboard/appointments"
          element={
            <ProtectedRoute>
              <MyAppointments />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;