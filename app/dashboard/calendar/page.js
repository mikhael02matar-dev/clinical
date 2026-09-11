import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function CalendarPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, session_date, session_time, notes, patient_id, patients ( name )")
    .eq("physio_id", user.id)
    .order("session_date", { ascending: true })
    .order("session_time", { ascending: true });

  return (
    <>
      <div className="section-head">
        <h1>Your calendar</h1>
      </div>

      {sessions && sessions.length > 0 ? (
        <table className="sessions">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Patient</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.id}>
                <td>{s.session_date}</td>
                <td>{s.session_time}</td>
                <td>
                  <Link href={`/dashboard/patients/${s.patient_id}`}>
                    {s.patients?.name}
                  </Link>
                </td>
                <td>{s.notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="empty">No sessions booked yet. Book one from a patient's page.</div>
      )}
    </>
  );
}
