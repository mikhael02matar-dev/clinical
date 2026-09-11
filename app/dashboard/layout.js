import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";

export default async function DashboardLayout({ children }) {
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

  if (profile?.role === "patient") redirect("/patient");

  return (
    <div className="shell">
      <header className="topbar">
        <div>
          <Link href="/dashboard" className="brand">
            Axis<span>Motion</span>
          </Link>
          <div className="brand-sub" style={{ marginTop: 0 }}>CLINICAL MVP</div>
        </div>
        <nav className="nav-links">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/dashboard/patients">Patients</Link>
          <Link href="/dashboard/calendar">Calendar</Link>
          <Link href="/dashboard/patients/new" className="btn solid-link btn-nav">
            + Add New Patient
          </Link>
          <span className="role-tag">{profile?.name || user.email}</span>
          <SignOutButton />
        </nav>
      </header>
      <main className="main">{children}</main>
    </div>
  );
}
