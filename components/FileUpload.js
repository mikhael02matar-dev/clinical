"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FILE_TYPES } from "@/lib/phases";

export default function FileUpload({ patientId }) {
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState("Other");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileType", fileType);
    formData.append("patientId", patientId);

    const res = await fetch("/api/clinical-files", {
      method: "POST",
      body: formData,
    });

    const result = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(result.error || "Upload failed.");
      return;
    }

    setFile(null);
    router.refresh();
  }

  return (
    <form onSubmit={handleUpload} className="inline-form" style={{ marginBottom: 16 }}>
      <div className="field">
        <label htmlFor="file-type">File type</label>
        <select id="file-type" value={fileType} onChange={(e) => setFileType(e.target.value)}>
          {FILE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="file-input">File</label>
        <input id="file-input" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      </div>
      <button className="btn" style={{ width: "auto" }} type="submit" disabled={loading || !file}>
        {loading ? "Uploading…" : "Upload"}
      </button>
      {error && <p className="error-text" style={{ width: "100%" }}>{error}</p>}
    </form>
  );
}
