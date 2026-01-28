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

      {/* Main Content is PUSHED to the right by 260px to clear the sidebar */}
      <main style={{ paddingLeft: '260px' }} className="w-full">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}