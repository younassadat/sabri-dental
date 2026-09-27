import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { staff, logout } = useAuth();

  return (
    <div className="sidebar">
      <div className="brand">Sabri's Dental</div>
      <NavLink to="/" end>
        Dashboard
      </NavLink>
      <NavLink to="/patients">Patients</NavLink>
      <NavLink to="/appointments">Appointments</NavLink>
      <NavLink to="/billing">Billing</NavLink>
      <div className="footer">
        {staff?.name} ({staff?.role})
        <br />
        <a href="#" onClick={(e) => { e.preventDefault(); logout(); }} style={{ opacity: 1 }}>
          Log out
        </a>
      </div>
    </div>
  );
}
