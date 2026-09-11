"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AddExerciseForm({ patientId, physioId }) {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: insertError } = await supabase.from("exercises").insert({
      patient_id: patientId,
      physio_id: physioId,
      title,
      description,
      video_url: videoUrl || null,
    });

    setLoading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setTitle("");
    setDescription("");
    setVideoUrl("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginBottom: 16 }}>
      <h3>Add a home exercise</h3>
      <div className="field">
        <label htmlFor="ex-title">Title</label>
        <input id="ex-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="field">
        <label htmlFor="ex-desc">Instructions</label>
        <textarea
          id="ex-desc"
          rows={3}
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="ex-video">Video/photo link (optional)</label>
        <input
          id="ex-video"
          placeholder="https://…"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
        />
      </div>
      {error && <p className="error-text">{error}</p>}
      <button className="btn" style={{ width: "auto" }} type="submit" disabled={loading}>
        {loading ? "Saving…" : "Add exercise"}
      </button>
    </form>
  );
}
