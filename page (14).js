import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PHASES, phaseShortLabel } from "@/lib/phases";

function initials(name) {
  return (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: patients } = await supabase
    .from("patients")
    .select("id, name, current_phase, status, created_at")
    .eq("physio_id", user.id)
    .order("created_at", { ascending: false });

  const list = patients || [];
  const total = list.length;
  const active = list.filter((p) => p.status === "active").length;
  const discharged = list.filter((p) => p.status === "discharged").length;

  const phaseCounts = PHASES.map((p) => ({
    ...p,
    count: list.filter((pt) => pt.current_phase === p.full).length,
  }));

  const recent = [...list]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 8);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Clinic Overview</h1>
          <p className="lede">Here is what is happening with your patients today.</p>
        </div>
        <div className="head-actions">
          <Link href="/dashboard/patients" className="btn outline">
            View All Patients
          </Link>
          <Link href="/dashboard/patients/new" className="btn solid-link" style={{ background: "var(--accent)", color: "#fff", padding: "10px 18px", borderRadius: 999 }}>
            Add New Patient
          </Link>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">TOTAL PATIENTS</div>
          <div className="stat-value">{total}</div>
          <div className="stat-note">Active caseload</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">ACTIVE</div>
          <div className="stat-value">{active}</div>
          <div className="stat-note">{discharged} discharged</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">PATIENTS BY PHASE</div>
          <div className="phase-breakdown" style={{ marginTop: 14 }}>
            {phaseCounts.map((p) => (
              <div key={p.short} className="phase-col">
                <div className="num">{p.count}</div>
                <div className="label">{p.short}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="section-head">
        <h2>Recent Activity</h2>
        <Link href="/dashboard/patients" style={{ fontSize: "0.88rem" }}>
          View All
        </Link>
      </div>

      {recent.length > 0 ? (
        <div className="table-wrap">
          <table className="activity nice">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Rehab Phase</th>
                <th>Status</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link href={`/dashboard/patients/${p.id}`} className="patient-name-cell">
                      <span className="avatar">{initials(p.name)}</span>
                      {p.name}
                    </Link>
                  </td>
                  <td>
                    <span className="badge phase">{phaseShortLabel(p.current_phase)}</span>
                  </td>
                  <td>
                    <span className={`badge status-${p.status}`}>
                      {p.status === "active" ? "Active" : "Discharged"}
                    </span>
                  </td>
                  <td>
                    {new Date(p.created_at).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">No patients yet. Add your first one to get started.</div>
      )}
    </>
  );
}
