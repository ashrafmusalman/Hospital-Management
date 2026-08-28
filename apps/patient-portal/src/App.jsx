import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import "./styles/portal.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import DoctorsList from "./pages/DoctorsList";
import AboutDoctor from "./pages/AboutDoctor";
import MyAppointments from "./pages/MyAppointments";
import ProtectedRoute from "./components/ProtectedRoute";
import PageTransition from "./components/PageTransition";
import Navbar from "./components/Navbar";

function AnimatedRoutes() {
  const location = useLocation();

  // Navbar renders here — once, outside the per-page transition — instead
  // of inside each page. Each page used to mount its own <Navbar/>, so
  // React tore the whole thing down and rebuilt it on every navigation,
  // which is why the active-tab pill could only ever "snap" into place:
  // there was no previous instance left for Framer Motion to animate
  // from. Keeping a single persistent instance here is what makes the
  // shared layoutId animation actually slide between tabs.
  const showNavbar = location.pathname.startsWith("/dashboard");

  return (
    <>
      {showNavbar && <Navbar />}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><Login /></PageTransition>} />
          <Route path="/register" element={<PageTransition><Register /></PageTransition>} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <PageTransition><Dashboard /></PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/doctors"
            element={
              <ProtectedRoute>
                <PageTransition><DoctorsList /></PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/doctors/:doctorId"
            element={
              <ProtectedRoute>
                <PageTransition><AboutDoctor /></PageTransition>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/appointments"
            element={
              <ProtectedRoute>
                <PageTransition><MyAppointments /></PageTransition>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;
