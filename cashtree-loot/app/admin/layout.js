import "../globals.css";
import AdminSidebar from "./AdminSidebar";

export const metadata = {
  title: "Admin Panel | CashTree",
  description: "Secure Partner Dashboard",
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      
      {/* 1. SIDEBAR (Fixed Layer) */}
      <div className="hidden lg:block">
         <AdminSidebar />
      </div>

      {/* 2. MAIN CONTENT */}
      {/* lg:pl-[260px]: Offsets content to the right so it doesn't hide behind the sidebar */}
      <main className="w-full lg:pl-[260px] transition-all duration-300">
        
        {/* INNER CONTAINER */}
        {/* lg:px-12: Adds the 'normal gap' (48px) between the sidebar edge and your text */}
        <div className="max-w-7xl mx-auto px-4 py-8 lg:px-12 lg:py-10">
          {children}
        </div>
        
      </main>

    </div>
  );
}