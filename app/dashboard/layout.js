import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/Sidebar";

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
      <Sidebar
        navLinks={NAV_LINKS}
        addPatientHref="/dashboard/patients/new"
        userLabel={profile?.name || user.email}
        accountHref="/dashboard/account"
      />

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
