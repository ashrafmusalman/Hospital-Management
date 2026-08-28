import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const LINKS = [
  { to: "/dashboard",              label: "Home" },
  { to: "/dashboard/doctors",      label: "Find Doctors" },
  { to: "/dashboard/appointments", label: "My Appointments" },
];

const mobileListVariants = {
  open: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
  closed: {},
};
const mobileItemVariants = {
  open: { opacity: 1, x: 0 },
  closed: { opacity: 0, x: -10 },
};

function Navbar() {
  const location = useLocation();
  const navigate  = useNavigate();
  const [open, setOpen] = useState(false);

  // close the mobile panel whenever the route changes
  useEffect(() => setOpen(false), [location.pathname]);

  // "/dashboard" is the Home root — it must match exactly, otherwise it'd
  // also match every other tab's sub-path ("/dashboard/doctors",
  // "/dashboard/appointments", ...) since they all share that prefix,
  // and Home would stay highlighted no matter which tab you're actually on.
  const isActive = (path) =>
    path === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname === path || location.pathname.startsWith(path + "/");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/", { replace: true });
  };

  return (
    <nav className="navbar">

      {/* LOGO */}
      <Link to="/dashboard" className="nav-logo">
        <motion.div className="nav-logo-icon" whileHover={{ rotate: 90 }} transition={{ duration: 0.25 }}>+</motion.div>
        <div className="nav-logo-text">Medi<span>Care</span></div>
      </Link>

      {/* LINKS (desktop) — shared sliding active pill via layoutId */}
      <div className="nav-links">
        {LINKS.map((l) => {
          const active = isActive(l.to);
          return (
            <Link key={l.to} to={l.to} className={`nav-link${active ? " active" : ""}`}>
              {active && (
                <motion.span
                  layoutId="nav-active-pill"
                  className="nav-active-pill"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              <span className="nav-link-text">{l.label}</span>
            </Link>
          );
        })}
      </div>

      {/* RIGHT SIDE (desktop) */}
      <div className="nav-right">
        <span className="nav-badge">● Patient</span>
        <motion.button className="nav-logout" onClick={logout} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
          Sign Out
        </motion.button>
        <motion.button
          className="nav-hamburger"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          whileTap={{ scale: 0.9 }}
        >
          {open ? "✕" : "☰"}
        </motion.button>
      </div>

      {/* MOBILE PANEL */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="nav-backdrop"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
            />
            <motion.div
              className="nav-mobile-panel"
              initial={{ opacity: 0, y: -14, scaleY: 0.96 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -14, scaleY: 0.96 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              variants={mobileListVariants}
            >
              {LINKS.map((l) => (
                <motion.div key={l.to} variants={mobileItemVariants}>
                  <Link to={l.to} className={`nav-link${isActive(l.to) ? " active" : ""}`}>
                    <span className="nav-link-text">{l.label}</span>
                  </Link>
                </motion.div>
              ))}
              <div className="nav-mobile-divider" />
              <div className="nav-mobile-row">
                <span className="nav-badge">● Patient</span>
                <button className="nav-logout" onClick={logout}>Sign Out</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </nav>
  );
}

export default Navbar;
