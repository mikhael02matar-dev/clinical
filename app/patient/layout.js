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
    <div className="shell">
      <header className="topbar">
        <div>
          <Link href="/patient" className="brand">
            Axis<span>Motion</span>
          </Link>
          <div className="brand-sub" style={{ marginTop: 0 }}>CLINICAL MVP</div>
        </div>
        <nav className="nav-links">
          <span className="role-tag">{profile?.name || user.email}</span>
          <SignOutButton />
        </nav>
      </header>
      <main className="main">{children}</main>
    </div>
  );
}
