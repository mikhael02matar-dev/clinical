import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditPatientForm from "@/components/EditPatientForm";
import DeletePatientButton from "@/components/DeletePatientButton";

export default async function EditPatientPage({ params }) {
  const supabase = createClient();

  const { data: patient } = await supabase
    .from("patients")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!patient) notFound();

  return (
    <>
      <div className="page-head">
        <h1>Edit — {patient.name}</h1>
      </div>
      <EditPatientForm patient={patient} />
      <DeletePatientButton patientId={patient.id} patientName={patient.name} />
    </>
  );
}
