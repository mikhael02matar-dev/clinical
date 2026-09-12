"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function BookSessionForm({ patients, defaultPatientId, physioId, redirectTo }) {
  const router = useRouter();
  const supabase = createClient();

  const [patientId, setPatientId] = useState(defaultPatientId || (patients?.[0]?.id ?? ""));
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!patientId) {
      setError("Choose a patient.");
      return;
    }

    setLoading(true);

    const { error: insertError } = await supabase.from("sessions").insert({
      patient_id: patientId,
      physio_id: physioId,
      session_date: date,
      session_time: time,
      notes: notes || null,
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card stack booking-form">
      <div className="inline-form">
        {!defaultPatientId && (
          <div className="field" style={{ flex: 2 }}>
            <label htmlFor="b-patient">Patient</label>
            <select id="b-patient" required value={patientId} onChange={(e) => setPatientId(e.target.value)}>
              <option value="" disabled>
                Choose a patient…
              </option>
              {(patients || []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="field">
          <label htmlFor="b-date">Date</label>
          <input id="b-date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="b-time">Time</label>
          <input id="b-time" type="time" required value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="b-notes">Reason / note for this booking (optional)</label>
        <textarea
          id="b-notes"
          rows={2}
          placeholder="e.g. Follow-up on shoulder mobility"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {error && <p className="error-text">{error}</p>}

      <button className="btn" style={{ width: "auto" }} type="submit" disabled={loading}>
        {loading ? "Booking…" : "Book session"}
      </button>
    </form>
  );
}
