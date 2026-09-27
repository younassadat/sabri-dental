import { useEffect, useState } from "react";
import { api } from "../api";

const todayStr = () => new Date().toISOString().slice(0, 10);
const emptyForm = { patient_id: "", amount: "" };

export default function Billing() {
  const [day, setDay] = useState(todayStr());
  const [payments, setPayments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  function load() {
    api.get("/payments", { params: { day } }).then((res) => setPayments(res.data));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day]);

  useEffect(() => {
    api.get("/patients").then((res) => setPatients(res.data));
  }, []);

  async function addPayment(e) {
    e.preventDefault();
    await api.post("/payments", { ...form, amount: parseFloat(form.amount), payment_date: day });
    setForm(emptyForm);
    setShowForm(false);
    load();
  }

  async function markPaid(id) {
    await api.put(`/payments/${id}/mark-paid`);
    load();
  }

  const collected = payments.filter((p) => p.paid).reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div>
      <div className="page-header">
        <h2 style={{ margin: 0 }}>Billing</h2>
        <button className="primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ Record payment"}
        </button>
      </div>

      <input type="date" value={day} onChange={(e) => setDay(e.target.value)} style={{ marginBottom: 12 }} />

      {showForm && (
        <form className="card form-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }} onSubmit={addPayment}>
          <select required value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })}>
            <option value="">Select patient</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.01"
            placeholder="Amount (Rs)"
            required
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <button className="primary" type="submit" style={{ gridColumn: "1 / -1" }}>
            Save
          </button>
        </form>
      )}

      <div className="card" style={{ marginBottom: 16 }}>
        <span style={{ color: "var(--text-muted)" }}>Collected on {day}: </span>
        <strong>Rs {collected.toLocaleString()}</strong>
      </div>

      <div className="card">
        {payments.length === 0 && <p style={{ color: "var(--text-muted)" }}>No payments recorded for this day.</p>}
        {payments.map((p) => (
          <div className="row" key={p.id} style={{ cursor: "default" }}>
            <span>
              {p.patients?.name} — Rs {Number(p.amount).toLocaleString()}
            </span>
            {p.paid ? <span className="badge">Paid</span> : <button onClick={() => markPaid(p.id)}>Mark as paid</button>}
          </div>
        ))}
      </div>
    </div>
  );
}
