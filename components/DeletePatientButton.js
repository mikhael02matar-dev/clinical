"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeletePatientButton({ patientId, patientName }) {
  const router = useRouter();
  const supabase = createClient();
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const canDelete = confirmText.trim() === patientName;

  async function handleDelete() {
    setError("");
    setLoading(true);

    // Clean up the patient's own profile row first (physio-scoped policy),
    // then delete the patient — sessions, exercises, and clinical_files
    // rows all cascade automatically from there.
    await supabase.from("profiles").delete().eq("id", patientId);

    const { error: deleteError } = await supabase.from("patients").delete().eq("id", patientId);

    setLoading(false);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    router.push("/dashboard/patients");
    router.refresh();
  }

  return (
    <div className="danger-zone">
      <h2>Danger Zone</h2>
      <p>
        Permanently delete <strong>{patientName}</strong> along with all of their sessions, exercises,
        and clinical files. This cannot be undone.
      </p>
      <div className="field" style={{ maxWidth: 340 }}>
        <label htmlFor="confirm-name">
          Type <strong>{patientName}</strong> to confirm
        </label>
        <input
          id="confirm-name"
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={patientName}
        />
      </div>
      {error && <p className="error-text">{error}</p>}
      <button
        type="button"
        className="btn danger"
        style={{ width: "auto" }}
        disabled={!canDelete || loading}
        onClick={handleDelete}
      >
        {loading ? "Deleting…" : "Delete patient permanently"}
      </button>
    </div>
  );
}
