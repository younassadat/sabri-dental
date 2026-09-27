import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api";

const emptyVisit = { visit_date: new Date().toISOString().slice(0, 10), procedure: "", medicine: "", dentist_name: "" };

export default function PatientDetail() {
  const { id } = useParams();
  const [patient, setPatient] = useState(null);
  const [visits, setVisits] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyVisit);
  const [downloading, setDownloading] = useState(false);

  function load() {
    api.get(`/patients/${id}`).then((res) => setPatient(res.data));
    api.get(`/patients/${id}/visits`).then((res) => setVisits(res.data));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function addVisit(e) {
    e.preventDefault();
    await api.post(`/patients/${id}/visits`, form);
    setForm(emptyVisit);
    setShowForm(false);
    load();
  }

  async function downloadPdf() {
    setDownloading(true);
    try {
      const res = await api.get(`/patients/${id}/history.pdf`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `${patient.name.replace(/\s+/g, "_")}_history.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  if (!patient) return <p>Loading...</p>;

  return (
    <div>
      <Link to="/patients" style={{ color: "var(--clinic-blue)", fontSize: 13 }}>
        &larr; Back to patients
      </Link>

      <div className="page-header" style={{ marginTop: 8 }}>
        <div>
          <h2 style={{ margin: 0 }}>{patient.name}</h2>
          <p style={{ margin: "4px 0 0", color: "var(--text-muted)" }}>
            {patient.phone || "No phone on file"}
            {patient.age ? ` · Age ${patient.age}` : ""}
          </p>
        </div>
        <button onClick={downloadPdf} disabled={downloading}>
          {downloading ? "Preparing..." : "Export PDF"}
        </button>
      </div>

      <div className="page-header">
        <h3 style={{ margin: 0 }}>Visit history</h3>
        <button className="primary" onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Cancel" : "+ Log new visit"}
        </button>
      </div>

      {showForm && (
        <form className="card form-grid" style={{ gridTemplateColumns: "repeat(2, 1fr)" }} onSubmit={addVisit}>
          <input type="date" value={form.visit_date} onChange={(e) => setForm({ ...form, visit_date: e.target.value })} />
          <input placeholder="Dentist (optional)" value={form.dentist_name} onChange={(e) => setForm({ ...form, dentist_name: e.target.value })} />
          <input
            placeholder="Procedure / treatment"
            required
            style={{ gridColumn: "1 / -1" }}
            value={form.procedure}
            onChange={(e) => setForm({ ...form, procedure: e.target.value })}
          />
          <input
            placeholder="Medicine prescribed"
            style={{ gridColumn: "1 / -1" }}
            value={form.medicine}
            onChange={(e) => setForm({ ...form, medicine: e.target.value })}
          />
          <button className="primary" type="submit" style={{ gridColumn: "1 / -1" }}>
            Save visit
          </button>
        </form>
      )}

      <div className="card">
        {visits.length === 0 && <p style={{ color: "var(--text-muted)" }}>No visits logged yet.</p>}
        {visits.map((v) => (
          <div key={v.id} style={{ padding: "10px 4px", borderBottom: "1px solid var(--border)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>
                Visit {v.visit_number} — {v.visit_date}
              </strong>
              {v.dentist_name && <span className="badge">{v.dentist_name}</span>}
            </div>
            <p style={{ margin: "4px 0 0", color: "var(--text-muted)" }}>Procedure: {v.procedure}</p>
            {v.medicine && <p style={{ margin: "2px 0 0", color: "var(--text-muted)" }}>Medicine: {v.medicine}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
