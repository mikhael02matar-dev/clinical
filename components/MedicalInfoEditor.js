"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function MedicalInfoEditor({ patientId, pathologies, patientHistory }) {
  const router = useRouter();
  const supabase = createClient();

  const [editing, setEditing] = useState(false);
  const [pathText, setPathText] = useState(pathologies || "");
  const [historyText, setHistoryText] = useState(patientHistory || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    setError("");
    setLoading(true);

    const { error: updateError } = await supabase
      .from("patients")
      .update({ pathologies: pathText, patient_history: historyText })
      .eq("id", patientId);

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setEditing(false);
    router.refresh();
  }

  return (
    <div className="card">
      <div className="section-head" style={{ marginBottom: editing ? 14 : 8 }}>
        <h2 style={{ marginBottom: 0 }}>Medical Information</h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            style={{ background: "none", border: "none", color: "var(--teal)", cursor: "pointer", fontSize: "0.88rem" }}
          >
            Edit
          </button>
        )}
      </div>

      {editing ? (
        <>
          <div className="field">
            <label htmlFor="pathologies-edit">Pathologies</label>
            <textarea id="pathologies-edit" rows={3} value={pathText} onChange={(e) => setPathText(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="history-edit">Patient history</label>
            <textarea id="history-edit" rows={3} value={historyText} onChange={(e) => setHistoryText(e.target.value)} />
          </div>
          {error && <p className="error-text">{error}</p>}
          <div className="row-actions">
            <button className="btn" style={{ width: "auto" }} onClick={handleSave} disabled={loading}>
              {loading ? "Saving…" : "Save"}
            </button>
            <button className="btn secondary" style={{ width: "auto" }} onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <h3>Pathologies</h3>
          <p style={{ color: "var(--slate)", whiteSpace: "pre-wrap", marginBottom: 16 }}>
            {pathologies || "—"}
          </p>
          <h3>Patient History</h3>
          <p style={{ color: "var(--slate)", whiteSpace: "pre-wrap", margin: 0 }}>
            {patientHistory || "—"}
          </p>
        </>
      )}
    </div>
  );
}
