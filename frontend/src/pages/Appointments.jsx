import { useEffect, useState } from "react";
import { api } from "../api";

const todayStr = () => new Date().toISOString().slice(0, 10);
const emptyForm = { patient_id: "", appointment_time: "", procedure: "" };

export default function Appointments() {
  const [day, setDay] = useState(todayStr());
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  function load() {
    api.get("/appointments", { params: { day } }).then((res) => setAppointments(res.data));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day]);

  useEffect(() => {
    api.get("/patients").then((res) => setPatients(res.data));
  }, []);

  async function addAppointment(e) {
    e.preventDefault();
    await api.post("/appointments", { ...form, appointment_date: day });
    setForm(emptyForm);
    setShowForm(false);
    load();
  }

  async function setStatus(id, status) {
    await api.put(`/appointments/${id}/status`, { status });
    load();
  }

  return (
    <div>
      <div className="page-header">
        <h2 style={{ margin: 0 }}>Appointments</h2>
        <button className="primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ New appointment"}
        </button>
      </div>

      <input type="date" value={day} onChange={(e) => setDay(e.target.value)} style={{ marginBottom: 12 }} />

      {showForm && (
        <form className="card form-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }} onSubmit={addAppointment}>
          <select required value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })}>
            <option value="">Select patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            type="time"
            required
            value={form.appointment_time}
            onChange={(e) => setForm({ ...form, appointment_time: e.target.value })}
          />
          <input
            placeholder="Reason / procedure"
            style={{ gridColumn: "1 / -1" }}
            value={form.procedure}
            onChange={(e) => setForm({ ...form, procedure: e.target.value })}
          />
          <button className="primary" type="submit" style={{ gridColumn: "1 / -1" }}>
            Save
          </button>
        </form>
      )}

      <div className="card">
        {appointments.length === 0 && <p style={{ color: "var(--text-muted)" }}>No appointments for this day.</p>}
        {appointments.map((a) => (
          <div className="row" key={a.id} style={{ cursor: "default" }}>
            <span>
              {a.appointment_time?.slice(0, 5)} — {a.patients?.name} {a.procedure ? `(${a.procedure})` : ""}
            </span>
            <select value={a.status} onChange={(e) => setStatus(a.id, e.target.value)}>
              <option value="scheduled">Scheduled</option>
              <option value="checked_in">Checked in</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}
