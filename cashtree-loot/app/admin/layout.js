import "../globals.css"; // ✅ Correct Path (Two dots for Admin folder)
import AdminSidebar from "./AdminSidebar";

export const metadata = {
  title: "Admin Panel | CashTree",
  description: "Secure Partner Dashboard",
};

export default function AdminLayout({ children }) {
  return (
    // Flex container makes them sit side-by-side
    <div className="flex min-h-screen bg-black text-white font-sans">
      
      {/* Sidebar (Sticky) */}
      <AdminSidebar />

      {/* Main Content (Fills the rest of the screen) */}
      <main className="flex-1 p-8 overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}