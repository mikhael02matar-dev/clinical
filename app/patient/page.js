import { createClient } from "@/lib/supabase/server";
import AddToCalendarButton from "@/components/AddToCalendarButton";

export default async function PatientPortalPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: patient } = await supabase
    .from("patients")
    .select("current_phase, status")
    .eq("id", user.id)
    .single();

  const todayKey = new Date().toISOString().slice(0, 10);

  // RLS restricts both queries to rows where patient_id = this patient's own id.
  const { data: sessions } = await supabase
    .from("sessions")
    .select("id, session_date, session_time")
    .eq("patient_id", user.id)
    .order("session_date", { ascending: true });

  const { data: exercises } = await supabase
    .from("exercises")
    .select("id, title, description, video_url")
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <>
      {patient && (
        <div className="badges" style={{ marginBottom: 24 }}>
          <span className={`badge status-${patient.status}`}>
            {patient.status === "active" ? "Active" : "Discharged"}
          </span>
          <span className="badge phase">{patient.current_phase}</span>
        </div>
      )}

      <h1>Your sessions</h1>
      {sessions && sessions.length > 0 ? (
        <div className="table-wrap" style={{ marginBottom: 32 }}>
          <table className="sessions nice">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Calendar</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => {
                const isUpcoming = s.session_date >= todayKey;
                return (
                  <tr key={s.id}>
                    <td>{s.session_date}</td>
                    <td>{s.session_time}</td>
                    <td>
                      {isUpcoming ? (
                        <AddToCalendarButton
                          id={s.id}
                          title="Physio session"
                          dateStr={s.session_date}
                          timeStr={s.session_time}
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty" style={{ marginBottom: 32 }}>No sessions booked yet.</div>
      )}

      <h1>Your home exercises</h1>
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
        <div className="empty">Your physio hasn't assigned any exercises yet.</div>
      )}
    </>
  );
}
