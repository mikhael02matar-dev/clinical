import { createClient } from "@/lib/supabase/server";
import AccountSettings from "@/components/AccountSettings";

export default async function DashboardAccountPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <div className="page-head">
        <h1>Account settings</h1>
      </div>
      <AccountSettings email={user.email} />
    </>
  );
}
