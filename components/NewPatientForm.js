"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PHASES } from "@/lib/phases";

export default function NewPatientForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    emergencyContact: "",
    currentPhase: PHASES[0].full,
    pathologies: "",
    patientHistory: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState(null);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const result = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(result.error || "Something went wrong.");
      return;
    }

    setCredentials({ email: form.email, password: result.tempPassword, patientId: result.patientId });
  }

  if (credentials) {
    return (
      <div className="card">
        <h2>Patient added</h2>
        <p style={{ color: "var(--slate)", fontSize: "0.9rem" }}>
          Share these sign-in details with the patient — they should change the
          password after their first login.
        </p>
        <p style={{ fontSize: "0.9rem" }}>
          <strong>Email:</strong> {credentials.email}
          <br />
          <strong>Temporary password:</strong> {credentials.password}
        </p>
        <button
          className="btn"
          style={{ width: "auto" }}
          onClick={() => router.push(`/dashboard/patients/${credentials.patientId}`)}
        >
          Go to patient profile
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card stack">
      <div>
        <h2>Personal Information</h2>
        <div className="inline-form">
          <div className="field">
            <label htmlFor="name">Full name</label>
            <input id="name" required value={form.name} onChange={(e) => update("name", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
        </div>
        <div className="inline-form" style={{ marginTop: 14 }}>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="dob">Date of birth</label>
            <input
              id="dob"
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => update("dateOfBirth", e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="gender">Gender</label>
            <select id="gender" value={form.gender} onChange={(e) => update("gender", e.target.value)}>
              <option value="">—</option>
              <option value="Female">Female</option>
              <option value="Male">Male</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        <div className="field" style={{ marginTop: 14 }}>
          <label htmlFor="emergency">Emergency contact</label>
          <input
            id="emergency"
            placeholder="Name and phone number"
            value={form.emergencyContact}
            onChange={(e) => update("emergencyContact", e.target.value)}
          />
        </div>
      </div>

      <div>
        <h2>Rehabilitation Status</h2>
        <div className="field">
          <label htmlFor="phase">Starting phase</label>
          <select id="phase" value={form.currentPhase} onChange={(e) => update("currentPhase", e.target.value)}>
            {PHASES.map((p) => (
              <option key={p.full} value={p.full}>
                {p.full}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <h2>Medical Information</h2>
        <div className="field">
          <label htmlFor="pathologies">Pathologies</label>
          <textarea
            id="pathologies"
            rows={2}
            value={form.pathologies}
            onChange={(e) => update("pathologies", e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="history">Patient history</label>
          <textarea
            id="history"
            rows={2}
            value={form.patientHistory}
            onChange={(e) => update("patientHistory", e.target.value)}
          />
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <button className="btn" style={{ width: "auto" }} type="submit" disabled={loading}>
        {loading ? "Adding…" : "Add patient"}
      </button>
    </form>
  );
}
