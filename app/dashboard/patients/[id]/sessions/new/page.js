import { createClient } from "@/lib/supabase/server";
import LogSessionForm from "@/components/LogSessionForm";

export default async function NewSessionPage({ params }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: patient } = await supabase
    .from("patients")
    .select("name, current_phase")
    .eq("id", params.id)
    .single();

  return (
    <>
      <div className="page-head">
        <h1>Log Session — {patient?.name}</h1>
      </div>
      <LogSessionForm
        patientId={params.id}
        physioId={user.id}
        currentPhase={patient?.current_phase}
        redirectTo={`/dashboard/patients/${params.id}`}
      />
    </>
  );
}
