import "../globals.css";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import AdminSidebar from "./AdminSidebar";

// Master key client — bypasses RLS for admin session verification
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function AdminLayout({ children }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("ct_session")?.value;

  // Guard: no token → redirect immediately
  if (!token) redirect("/login");

  // Verify the token is real — not just present
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(token);

  if (error || !user) redirect("/login");

  // Fetch display name from accounts table
  const { data: account } = await supabaseAdmin
    .from("accounts")
    .select("username")
    .eq("id", user.id)
    .single();

  // Server action: clears session cookie and redirects to login
  async function logoutAction() {
    "use server";
    const cookieStore = await cookies();
    cookieStore.delete("ct_session");
    redirect("/login");
  }

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#fff" }}>

      {/* Sidebar receives real session data */}
      <AdminSidebar
        adminName={account?.username || user.email}
        logoutAction={logoutAction}
      />

      {/* Main content — offset handled by .admin-main class in AdminSidebar styles */}
      <main
        className="admin-main"
        style={{
          minHeight: "100vh",
          background: "#050505",
          position: "relative",
        }}
      >
        {/* Spacer pushes content below mobile top bar — hidden on desktop via CSS */}
        <div
          className="mobile-spacer"
          style={{ height: "58px", display: "none" }}
        />

        <div className="content-pad" style={{ padding: "32px 40px" }}>
          {children}
        </div>
      </main>

    </div>
  );
}
