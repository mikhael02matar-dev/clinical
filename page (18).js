import { createClient } from "@/lib/supabase/server";
import CalendarView from "@/components/CalendarView";

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
      <div className="page-head">
        <div>
          <h1>Your calendar</h1>
          <p className="lede">Upcoming sessions across all your patients.</p>
        </div>
      </div>

      <CalendarView sessions={sessions || []} />
    </>
  );
}
