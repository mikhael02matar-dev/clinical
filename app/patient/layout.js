import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";

export default async function PatientLayout({ children }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, name")
    .eq("id", user.id)
    .single();

  if (profile?.role === "physio") redirect("/dashboard");

  return (
    <div className="app-shell">
      <Sidebar navLinks={[]} userLabel={profile?.name || user.email} accountHref="/patient/account" />

      <div className="content-area">
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
