"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PHASES } from "@/lib/phases";

export default function EditPatientForm({ patient }) {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    name: patient.name || "",
    phone: patient.phone || "",
    dateOfBirth: patient.date_of_birth || "",
    gender: patient.gender || "",
    emergencyContact: patient.emergency_contact || "",
    currentPhase: patient.current_phase,
    status: patient.status,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: updateError } = await supabase
      .from("patients")
      .update({
        name: form.name,
        phone: form.phone || null,
        date_of_birth: form.dateOfBirth || null,
        gender: form.gender || null,
        emergency_contact: form.emergencyContact || null,
        current_phase: form.currentPhase,
        status: form.status,
      })
      .eq("id", patient.id);

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push(`/dashboard/patients/${patient.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card stack">
      <div className="inline-form">
        <div className="field">
          <label htmlFor="name">Full name</label>
          <input id="name" required value={form.name} onChange={(e) => update("name", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="phone">Phone (with country code, no +)</label>
          <input id="phone" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        </div>
      </div>

      <div className="inline-form">
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

      <div className="field">
        <label htmlFor="emergency">Emergency contact</label>
        <input
          id="emergency"
          value={form.emergencyContact}
          onChange={(e) => update("emergencyContact", e.target.value)}
        />
      </div>

      <div className="inline-form">
        <div className="field">
          <label htmlFor="phase">Current phase</label>
          <select id="phase" value={form.currentPhase} onChange={(e) => update("currentPhase", e.target.value)}>
            {PHASES.map((p) => (
              <option key={p.full} value={p.full}>
                {p.full}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" value={form.status} onChange={(e) => update("status", e.target.value)}>
            <option value="active">Active</option>
            <option value="discharged">Discharged</option>
          </select>
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <button className="btn" style={{ width: "auto" }} type="submit" disabled={loading}>
        {loading ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
