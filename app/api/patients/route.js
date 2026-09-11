import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

function generateTempPassword() {
  return Math.random().toString(36).slice(-6) + Math.random().toString(36).slice(-6);
}

export async function POST(request) {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const {
    name,
    email,
    phone,
    dateOfBirth,
    gender,
    emergencyContact,
    pathologies,
    patientHistory,
    currentPhase,
  } = await request.json();

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  // This route needs the service role key because creating another person's
  // auth account can't be done with the signed-in physio's own permissions.
  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const tempPassword = generateTempPassword();

  const { data: newUser, error: createError } = await admin.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { role: "patient", name },
  });

  if (createError) {
    return NextResponse.json({ error: createError.message }, { status: 400 });
  }

  const { data: patientRow, error: patientError } = await admin
    .from("patients")
    .insert({
      id: newUser.user.id,
      physio_id: user.id,
      name,
      email,
      phone: phone || null,
      date_of_birth: dateOfBirth || null,
      gender: gender || null,
      emergency_contact: emergencyContact || null,
      pathologies: pathologies || null,
      patient_history: patientHistory || null,
      current_phase: currentPhase || undefined,
    })
    .select("id")
    .single();

  if (patientError) {
    return NextResponse.json({ error: patientError.message }, { status: 400 });
  }

  return NextResponse.json({ tempPassword, patientId: patientRow.id });
}
