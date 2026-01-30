import "../globals.css";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex">

      {/* SIDEBAR SLOT (space reservation) */}
      <div className="hidden lg:block w-[260px] flex-shrink-0">
        <AdminSidebar />
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8 lg:px-12 lg:py-10">
          {children}
        </div>
      </main>

    </div>
  );
}
