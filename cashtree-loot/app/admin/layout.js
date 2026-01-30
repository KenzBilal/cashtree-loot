import "../globals.css";
import AdminSidebar from "./AdminSidebar";

export const metadata = {
  title: "Admin Panel | CashTree",
  description: "Secure Partner Dashboard",
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex">
      
      {/* 1. SIDEBAR: Fixed on Desktop, Hidden on Mobile */}
      {/* This ensures the sidebar stays stuck to the left glass */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-50 w-[260px]">
         <AdminSidebar />
      </div>

      {/* 2. MAIN CONTENT: Smart Responsive Width */}
      {/* lg:pl-[260px] -> Pushes content right ONLY on Desktop */}
      {/* w-full -> Uses 100% width on Mobile (No Sidebar squash) */}
      <main className="w-full lg:pl-[260px] transition-all duration-300">
        
        {/* INNER CONTAINER: The "Breathing Room" */}
        {/* lg:px-12 -> Gives nice wide spacing on big screens */}
        {/* px-4 -> Safe small spacing on phones */}
        <div className="max-w-7xl mx-auto px-4 py-8 lg:px-12 lg:py-10">
          {children}
        </div>
        
      </main>

    </div>
  );
}