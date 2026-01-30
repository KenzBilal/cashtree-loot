import "../globals.css";
import AdminSidebar from "./AdminSidebar";

export const metadata = {
  title: "Admin Panel | CashTree",
  description: "Secure Partner Dashboard",
};

export default function AdminLayout({ children }) {
  return (
    // REMOVED 'flex': standard block layout is safer for fixed sidebars
    <div className="min-h-screen bg-black text-white font-sans">
      
      {/* 1. SIDEBAR (Hidden on Mobile, Visible on Desktop) */}
      <div className="hidden lg:block">
         <AdminSidebar />
      </div>

      {/* 2. MAIN CONTENT */}
      {/* w-full: Takes full width */}
      {/* lg:pl-[260px]: Adds 260px padding on the left to clear the sidebar */}
      <main className="w-full lg:pl-[260px] transition-all duration-300">
        
        {/* INNER CONTAINER (Centers content in the remaining space) */}
        {/* lg:px-12: Adds nice gap between sidebar edge and your text */}
        <div className="max-w-7xl mx-auto px-4 py-8 lg:px-12 lg:py-10">
          {children}
        </div>
        
      </main>

    </div>
  );
}