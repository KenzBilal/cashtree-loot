import "../globals.css";
import AdminSidebar from "./AdminSidebar";

export const metadata = {
  title: "Admin Panel | CashTree",
  description: "Secure Partner Dashboard",
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex">
      
      {/* 1. SIDEBAR (Sticky Layout) 
          - w-[260px]: Physically occupies 260px of width (pushes main content)
          - h-screen + sticky: Stays pinned to the screen while scrolling
          - flex-shrink-0: Prevents it from getting squashed
      */}
      <aside className="hidden lg:block w-[260px] h-screen sticky top-0 z-50 overflow-y-auto border-r border-white/5 flex-shrink-0">
         <AdminSidebar />
      </aside>

      {/* 2. MAIN CONTENT 
          - flex-1: Fills the remaining space automatically
          - min-w-0: Prevents horizontal scroll issues
          - No manual padding needed (Sidebar does the work)
      */}
      <main className="flex-1 w-full min-w-0">
        
        {/* INNER CONTAINER */}
        <div className="max-w-7xl mx-auto px-4 py-8 lg:px-12 lg:py-10">
          {children}
        </div>
        
      </main>

    </div>
  );
}