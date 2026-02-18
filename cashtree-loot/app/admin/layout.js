import "../globals.css";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#fff", display: 'flex' }}>
      
      {/* Navigation Layer */}
      <AdminSidebar />

      {/* Main Content Area */}
      {/* Class 'admin-main' is controlled by styles in AdminSidebar.js for responsiveness */}
      <main className="admin-main" style={{ 
        flex: 1,
        minHeight: '100vh',
        background: '#050505',
        position: 'relative'
      }}>
        {/* Mobile Header Spacer */}
        <div style={{ height: '60px', display: 'var(--mobile-spacer, none)' }} className="mobile-only-spacer"></div>
        
        <div style={{ padding: '32px 40px' }} className="content-pad">
          {children}
        </div>

        {/* Global utility styles for layout internals */}
        <style>{`
          @media (max-width: 1024px) {
            .mobile-only-spacer { display: block !important; }
            .content-pad { padding: 20px !important; }
          }
        `}</style>
      </main>

    </div>
  );
}