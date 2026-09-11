import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";

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
      <aside className="sidebar">
        <div>
          <Link href="/patient" className="sidebar-brand">
            Axis Motion
            <span className="sidebar-brand-sub">CLINICAL MVP</span>
          </Link>
        </div>

        <div className="sidebar-foot">
          <div className="sidebar-user">{profile?.name || user.email}</div>
          <SignOutButton />
        </div>
      </aside>

      <div className="content-area">
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
