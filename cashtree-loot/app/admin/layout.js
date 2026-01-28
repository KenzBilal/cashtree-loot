import "../globals.css";
import AdminSidebar from "./AdminSidebar";

export const metadata = {
  title: "Admin Panel | CashTree",
  description: "Secure Partner Dashboard",
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      
      {/* Sidebar is FIXED on top left */}
      <AdminSidebar />

      {/* Main Content:
          1. style={{ paddingLeft: '260px' }} -> Starts AFTER the sidebar
          2. className="p-10" -> Adds nice breathing room INSIDE the content area
      */}
      <main style={{ paddingLeft: '260px' }} className="w-full">
        <div className="max-w-7xl mx-auto px-12 py-10">
          {children}
        </div>
      </main>
    </div>
  );
}