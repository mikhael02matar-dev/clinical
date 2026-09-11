import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(request) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const fileType = formData.get("fileType") || "Other";
  const patientId = formData.get("patientId");

  if (!file || !patientId) {
    return NextResponse.json({ error: "A file and patient are required." }, { status: 400 });
  }

  // Confirm this physio actually owns the patient before touching storage.
  // This query runs under RLS with the signed-in user's own session, so it
  // naturally returns nothing if the patient belongs to someone else.
  const { data: patient } = await supabase
    .from("patients")
    .select("id, physio_id")
    .eq("id", patientId)
    .single();

  if (!patient || patient.physio_id !== user.id) {
    return NextResponse.json({ error: "You don't have access to this patient." }, { status: 403 });
  }

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const path = `${patientId}/${Date.now()}-${file.name}`;
  const bytes = new Uint8Array(await file.arrayBuffer());

  const { error: uploadError } = await admin.storage
    .from("clinical-files")
    .upload(path, bytes, { contentType: file.type || "application/octet-stream" });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { error: insertError } = await admin.from("clinical_files").insert({
    patient_id: patientId,
    physio_id: user.id,
    file_name: file.name,
    file_type: fileType,
    storage_path: path,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
