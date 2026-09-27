import { useEffect, useState } from "react";
import { api } from "../api";

export default function Dashboard() {
  const [appointments, setAppointments] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    api.get("/appointments").then((res) => setAppointments(res.data));
    api.get("/payments").then((res) => setPayments(res.data));
  }, []);

  const checkedIn = appointments.filter((a) => a.status === "checked_in").length;
  const collectedToday = payments
    .filter((p) => p.paid)
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div>
      <h2>Today, {new Date().toLocaleDateString()}</h2>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="label">Appointments</div>
          <div className="value">{appointments.length}</div>
        </div>
        <div className="stat-card">
          <div className="label">Checked in</div>
          <div className="value">{checkedIn}</div>
        </div>
        <div className="stat-card">
          <div className="label">Collected today</div>
          <div className="value">Rs {collectedToday.toLocaleString()}</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Today's schedule</h3>
        {appointments.length === 0 && <p style={{ color: "var(--text-muted)" }}>No appointments today.</p>}
        {appointments.map((a) => (
          <div className="row" key={a.id}>
            <span>
              {a.appointment_time?.slice(0, 5)} — {a.patients?.name}
            </span>
            <span className="badge">{a.procedure || a.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
