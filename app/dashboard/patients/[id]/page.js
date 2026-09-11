import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { phaseShortLabel } from "@/lib/phases";
import AddExerciseForm from "@/components/AddExerciseForm";
import FileUpload from "@/components/FileUpload";
import MedicalInfoEditor from "@/components/MedicalInfoEditor";
import ProgressChart from "@/components/ProgressChart";
import RemindButton from "@/components/RemindButton";

function initials(name) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

function formatDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default async function PatientDetailPage({ params }) {
  const supabase = createClient();

  const { data: patient } = await supabase
    .from("patients")
    .select("*")
    .eq("id", params.id)
    .single();

  // RLS means this comes back empty for a patient that belongs to a
  // different physio, even though the query itself looks unrestricted.
  if (!patient) notFound();

  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, session_date, session_time, phase, pain_before, pain_after, notes")
    .eq("patient_id", params.id)
    .order("session_date", { ascending: false })
    .order("session_time", { ascending: false });

  const { data: exercises } = await supabase
    .from("exercises")
    .select("id, title, description, video_url, created_at")
    .eq("patient_id", params.id)
    .order("created_at", { ascending: false });

  const { data: files } = await supabase
    .from("clinical_files")
    .select("id, file_name, file_type, storage_path, created_at")
    .eq("patient_id", params.id)
    .order("created_at", { ascending: false });

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const filesWithUrls = await Promise.all(
    (files || []).map(async (f) => {
      const { data: signed } = await admin.storage
        .from("clinical-files")
        .createSignedUrl(f.storage_path, 60 * 60);
      return { ...f, url: signed?.signedUrl };
    })
  );

  const sessionList = sessions || [];
  const latestSession = sessionList[0];
  const currentPain =
    latestSession?.pain_after ?? latestSession?.pain_before ?? null;

  return (
    <>
      <div className="profile-header">
        <div className="who">
          <span className="avatar lg">{initials(patient.name)}</span>
          <div>
            <h1>{patient.name}</h1>
            <div className="badges">
              <span className={`badge status-${patient.status}`}>
                {patient.status === "active" ? "Active" : "Discharged"}
              </span>
              <span className="badge phase">{phaseShortLabel(patient.current_phase)}</span>
              <span className="session-count">{sessionList.length} sessions recorded</span>
            </div>
          </div>
        </div>
        <div className="head-actions">
          <RemindButton patient={patient} />
          <Link href={`/dashboard/patients/${patient.id}/edit`} className="btn outline">
            Edit
          </Link>
          <Link
            href={`/dashboard/patients/${patient.id}/sessions/new`}
            className="btn solid-link"
            style={{ background: "var(--accent)", color: "#fff", padding: "10px 18px", borderRadius: 999 }}
          >
            Log New Session
          </Link>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">CURRENT PAIN</div>
          <div className="stat-value">{currentPain ?? "—"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">LATEST SESSION</div>
          <div className="stat-value" style={{ fontSize: "1.4rem" }}>
            {latestSession ? formatDate(latestSession.session_date) : "—"}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">TOTAL SESSIONS</div>
          <div className="stat-value">{sessionList.length}</div>
        </div>
      </div>

      <div className="two-col">
        <div className="stack">
          <div className="card">
            <h2>Clinical Files</h2>
            <FileUpload patientId={patient.id} />
            {filesWithUrls.length > 0 ? (
              filesWithUrls.map((f) => (
                <div key={f.id} className="file-row">
                  <div>
                    <div>{f.file_name}</div>
                    <div className="tag">
                      {f.file_type} · {formatDate(f.created_at)}
                    </div>
                  </div>
                  {f.url && (
                    <a href={f.url} target="_blank" rel="noreferrer">
                      View
                    </a>
                  )}
                </div>
              ))
            ) : (
              <p style={{ color: "var(--slate-soft)", fontSize: "0.88rem", margin: 0 }}>
                No files uploaded yet. Upload MRIs, X-rays, reports, or other clinical documents above.
              </p>
            )}
          </div>

          <MedicalInfoEditor
            patientId={patient.id}
            pathologies={patient.pathologies}
            patientHistory={patient.patient_history}
          />

          <div className="card">
            <h2>Progress Overview</h2>
            <ProgressChart sessions={sessionList} />
          </div>

          <div className="card">
            <h2>Session Timeline</h2>
            {sessionList.length > 0 ? (
              <ul className="timeline">
                {sessionList.map((s) => (
                  <li key={s.id}>
                    <div className="t-date">{formatDate(s.session_date)}</div>
                    <div className="t-phase">{s.phase || "—"}</div>
                    {(s.pain_before !== null || s.pain_after !== null) && (
                      <div className="t-pain">
                        Pain: {s.pain_before ?? "—"} → {s.pain_after ?? "—"}
                      </div>
                    )}
                    {s.notes && <div className="t-pain">{s.notes}</div>}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty">No sessions logged yet.</div>
            )}
          </div>

          <div className="card">
            <h2>Home Exercises</h2>
            <AddExerciseForm patientId={patient.id} physioId={patient.physio_id} />
            {exercises && exercises.length > 0 ? (
              exercises.map((ex) => (
                <div key={ex.id} className="exercise-item">
                  <h4>{ex.title}</h4>
                  <p>{ex.description}</p>
                  {ex.video_url && (
                    <p style={{ marginTop: 6 }}>
                      <a href={ex.video_url} target="_blank" rel="noreferrer">
                        View video/photo
                      </a>
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="empty">No exercises assigned yet.</div>
            )}
          </div>
        </div>

        <div className="stack">
          <div className="card">
            <h2>Personal Information</h2>
            <ul className="info-list">
              <li><span className="k">Phone</span><span className="v">{patient.phone || "—"}</span></li>
              <li><span className="k">Email</span><span className="v">{patient.email || "—"}</span></li>
              <li><span className="k">Date of Birth</span><span className="v">{formatDate(patient.date_of_birth)}</span></li>
              <li><span className="k">Gender</span><span className="v">{patient.gender || "—"}</span></li>
              <li><span className="k">Emergency Contact</span><span className="v">{patient.emergency_contact || "—"}</span></li>
            </ul>
          </div>

          <div className="card">
            <h2>Rehabilitation Status</h2>
            <ul className="info-list">
              <li><span className="k">Current Phase</span><span className="v">{patient.current_phase}</span></li>
              <li><span className="k">Status</span><span className="v">{patient.status === "active" ? "Active" : "Discharged"}</span></li>
              <li><span className="k">Date Created</span><span className="v">{formatDate(patient.created_at)}</span></li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
