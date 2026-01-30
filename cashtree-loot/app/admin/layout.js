import "../globals.css";
import AdminSidebar from "./AdminSidebar";

export const metadata = {
  title: "Admin Panel | CashTree",
  description: "Secure Partner Dashboard",
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white font-sans flex">
      
      {/* 1. SIDEBAR: Fixed position.
          - 'hidden': Hides it on Mobile (so it doesn't block content)
          - 'lg:block': Shows it on Desktop
      */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-50 w-[260px]">
         <AdminSidebar />
      </div>

      {/* 2. MAIN CONTENT:
          - 'w-full': Uses 100% width on Mobile
          - 'lg:pl-[260px]': Pushes content right ONLY on Desktop
          - 'transition-all': Makes the resize smooth
      */}
      <main className="w-full lg:pl-[260px] transition-all duration-300">
        
        {/* INNER CONTAINER: Adds the "Breathing Room" 
            - 'px-4': Small padding on mobile
            - 'lg:px-12': Big padding on desktop
        */}
        <div className="max-w-7xl mx-auto px-4 py-8 lg:px-12 lg:py-10">
          {children}
        </div>
        
      </main>

    </div>
  );
}