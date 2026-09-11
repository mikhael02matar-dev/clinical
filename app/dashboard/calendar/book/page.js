import { createClient } from "@/lib/supabase/server";
import BookSessionForm from "@/components/BookSessionForm";

export default async function BookSessionPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: patients } = await supabase
    .from("patients")
    .select("id, name")
    .eq("physio_id", user.id)
    .eq("status", "active")
    .order("name", { ascending: true });

  return (
    <>
      <div className="page-head">
        <h1>Book Next Session</h1>
      </div>
      <BookSessionForm patients={patients || []} physioId={user.id} redirectTo="/dashboard/calendar" />
    </>
  );
}
