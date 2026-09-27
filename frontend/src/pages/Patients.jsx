import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

const emptyForm = { name: "", phone: "", age: "", gender: "", address: "" };

export default function Patients() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  function load(q) {
    api.get("/patients", { params: q ? { search: q } : {} }).then((res) => setPatients(res.data));
  }

  useEffect(() => {
    const t = setTimeout(() => load(search), 250);
    return () => clearTimeout(t);
  }, [search]);

  async function addPatient(e) {
    e.preventDefault();
    await api.post("/patients", { ...form, age: form.age ? parseInt(form.age, 10) : null });
    setForm(emptyForm);
    setShowForm(false);
    load(search);
  }

  return (
    <div>
      <div className="page-header">
        <h2 style={{ margin: 0 }}>Patients</h2>
        <button className="primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ Add patient"}
        </button>
      </div>

      {showForm && (
        <form className="card form-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }} onSubmit={addPatient}>
          <input placeholder="Full name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input placeholder="Age" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          <input placeholder="Gender" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} />
          <input
            placeholder="Address"
            style={{ gridColumn: "1 / -1" }}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
          <button className="primary" type="submit" style={{ gridColumn: "1 / -1" }}>
            Save patient
          </button>
        </form>
      )}

      <input
        style={{ width: "100%", marginBottom: 12 }}
        placeholder="Search by name or phone"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="card">
        {patients.length === 0 && <p style={{ color: "var(--text-muted)" }}>No patients yet.</p>}
        {patients.map((p) => (
          <div className="row" key={p.id} onClick={() => navigate(`/patients/${p.id}`)}>
            <span>{p.name}</span>
            <span style={{ color: "var(--text-muted)" }}>{p.phone}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
