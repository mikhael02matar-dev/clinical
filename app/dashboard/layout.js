import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SignOutButton from "@/components/SignOutButton";
import SidebarNav from "@/components/SidebarNav";

const NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/dashboard/patients", label: "Patients", icon: "patients" },
  { href: "/dashboard/calendar", label: "Calendar", icon: "calendar" },
];

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
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <Link href="/dashboard" className="sidebar-brand">
            Axis Motion
            <span className="sidebar-brand-sub">CLINICAL MVP</span>
          </Link>
          <SidebarNav links={NAV_LINKS} />
        </div>

        <div className="sidebar-foot">
          <Link href="/dashboard/patients/new" className="btn sidebar-add-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Add New Patient
          </Link>
          <div className="sidebar-user">{profile?.name || user.email}</div>
          <SignOutButton />
        </div>
      </aside>

      <div className="content-area">
        <header className="topsearch">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input type="text" placeholder="Search patients or sessions…" readOnly />
        </header>
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
