import { createClient } from "@/lib/supabase/server";
import BookSessionForm from "@/components/BookSessionForm";

export default async function BookPatientSessionPage({ params }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: patient } = await supabase
    .from("patients")
    .select("name")
    .eq("id", params.id)
    .single();

  return (
    <>
      <div className="page-head">
        <h1>Book Next Session — {patient?.name}</h1>
      </div>
      <BookSessionForm
        defaultPatientId={params.id}
        physioId={user.id}
        redirectTo={`/dashboard/patients/${params.id}`}
      />
    </>
  );
}
