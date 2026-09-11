"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PHASES } from "@/lib/phases";

function PainScale({ id, value, onChange }) {
  return (
    <div className="pain-scale">
      {Array.from({ length: 11 }, (_, n) => n).map((n) => (
        <label key={n}>
          <input
            type="radio"
            name={id}
            checked={value === n}
            onChange={() => onChange(n)}
          />
          <span>{n}</span>
        </label>
      ))}
    </div>
  );
}

export default function LogSessionForm({ patientId, physioId, currentPhase, redirectTo }) {
  const router = useRouter();
  const supabase = createClient();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [phase, setPhase] = useState(currentPhase || PHASES[0].full);
  const [painBefore, setPainBefore] = useState(null);
  const [painAfter, setPainAfter] = useState(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: insertError } = await supabase.from("sessions").insert({
      patient_id: patientId,
      physio_id: physioId,
      session_date: date,
      session_time: time,
      phase,
      pain_before: painBefore,
      pain_after: painAfter,
      notes: notes || null,
    });

    // Keep the patient's current phase in sync with the session's phase.
    if (!insertError) {
      await supabase.from("patients").update({ current_phase: phase }).eq("id", patientId);
    }

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card stack">
      <div className="inline-form">
        <div className="field">
          <label htmlFor="s-date">Date</label>
          <input id="s-date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="s-time">Time</label>
          <input id="s-time" type="time" required value={time} onChange={(e) => setTime(e.target.value)} />
        </div>
        <div className="field" style={{ flex: 2 }}>
          <label htmlFor="s-phase">Phase</label>
          <select id="s-phase" value={phase} onChange={(e) => setPhase(e.target.value)}>
            {PHASES.map((p) => (
              <option key={p.full} value={p.full}>
                {p.full}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label style={{ display: "block", fontSize: "0.82rem", color: "var(--slate)", marginBottom: 8 }}>
          Pain before session
        </label>
        <PainScale id="pain-before" value={painBefore} onChange={setPainBefore} />
      </div>

      <div>
        <label style={{ display: "block", fontSize: "0.82rem", color: "var(--slate)", marginBottom: 8 }}>
          Pain after session
        </label>
        <PainScale id="pain-after" value={painAfter} onChange={setPainAfter} />
      </div>

      <div className="field">
        <label htmlFor="s-notes">Notes</label>
        <textarea id="s-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>

      {error && <p className="error-text">{error}</p>}

      <button className="btn" style={{ width: "auto" }} type="submit" disabled={loading}>
        {loading ? "Saving…" : "Log session"}
      </button>
    </form>
  );
}
