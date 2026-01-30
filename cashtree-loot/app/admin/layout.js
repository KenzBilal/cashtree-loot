import "../globals.css";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white font-sans">

      {/* SIDEBAR (Fixed, hidden on mobile) */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* MAIN CONTENT — SAME LOGIC AS PROMOTER */}
      <main className="min-h-screen px-4 py-8 lg:px-12 lg:py-10 lg:pl-[260px]">
        {children}
      </main>

    </div>
  );
}
