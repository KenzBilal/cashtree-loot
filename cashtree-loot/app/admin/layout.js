import "../globals.css";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: "#000", color: "#fff" }}>
      
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div style={{ marginLeft: "260px", padding: "32px" }}>
        {children}
      </div>

    </div>
  );
}
