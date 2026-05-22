import { Link, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const navigate  = useNavigate();

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/")
      ? "nav-link active"
      : "nav-link";

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <nav className="navbar">

      {/* LOGO */}
      <Link to="/dashboard" className="nav-logo">
        <div className="nav-logo-icon">+</div>
        <div className="nav-logo-text">Medi<span>Care</span></div>
      </Link>

      {/* LINKS */}
      <div className="nav-links">
        <Link to="/dashboard"              className={isActive("/dashboard")}>Home</Link>
        <Link to="/dashboard/doctors"      className={isActive("/dashboard/doctors")}>Find Doctors</Link>
        <Link to="/dashboard/appointments" className={isActive("/dashboard/appointments")}>My Appointments</Link>
      </div>

      {/* RIGHT SIDE */}
      <div className="nav-right">
        <span className="nav-badge">● Patient</span>
        <button className="nav-logout" onClick={logout}>Sign Out</button>
      </div>

    </nav>
  );
}

export default Navbar;