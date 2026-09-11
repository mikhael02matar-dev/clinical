import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { phaseShortLabel } from "@/lib/phases";

export default async function PatientsListPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: patients } = await supabase
    .from("patients")
    .select("id, name, email, current_phase, status")
    .eq("physio_id", user.id)
    .order("name", { ascending: true });

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Patients</h1>
          <p className="lede">Everyone on your caseload — coworkers' patients don't appear here.</p>
        </div>
        <div className="head-actions">
          <Link href="/dashboard/patients/new" className="btn solid-link" style={{ background: "var(--accent)", color: "#fff", padding: "10px 18px", borderRadius: 999 }}>
            + Add New Patient
          </Link>
        </div>
      </div>

      {patients && patients.length > 0 ? (
        patients.map((p) => (
          <Link key={p.id} href={`/dashboard/patients/${p.id}`} className="patient-row-card">
            <div>
              <div style={{ fontWeight: 600, color: "var(--blue-deep)" }}>{p.name}</div>
              <div style={{ fontSize: "0.82rem", color: "var(--slate-soft)" }}>{p.email}</div>
            </div>
            <div className="badges">
              <span className="badge phase">{phaseShortLabel(p.current_phase)}</span>
              <span className={`badge status-${p.status}`}>
                {p.status === "active" ? "Active" : "Discharged"}
              </span>
            </div>
          </Link>
        ))
      ) : (
        <div className="empty">No patients yet. Add your first one above.</div>
      )}
    </>
  );
}
