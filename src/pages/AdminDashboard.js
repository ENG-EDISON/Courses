import React, { useState } from "react";
import AdminMessagesList from "./AdminMessagesList"; // ⬅️ REQUIRED IMPORT

const menuItems = [
  { id: "overview", label: "Overview" },
  { id: "users", label: "Users" },
  { id: "courses", label: "Courses" },
  { id: "analytics", label: "Analytics" },

  { id: "messages", label: "Messages" }, // ⬅️ ADDED

  { id: "settings", label: "Settings" },
];

// ------------------ PAGE COMPONENTS ------------------

const AdminOverview = () => <h2>📊 Admin Overview</h2>;
const UsersManagement = () => <h2>👤 Users Management</h2>;
const CoursesManagement = () => <h2>📚 Courses Management</h2>;
const AnalyticsDashboard = () => <h2>📈 Analytics Dashboard</h2>;
const AdminSettings = () => <h2>⚙️ Admin Settings</h2>;
// ------------------------------------------------------

const renderPage = (page) => {
  switch (page) {
    case "overview":
      return <AdminOverview />;

    case "users":
      return <UsersManagement />;

    case "courses":
      return <CoursesManagement />;

    case "analytics":
      return <AnalyticsDashboard />;

    case "messages":                         // ⬅️ ADDED
      return <AdminMessagesList />;          // ⬅️ ADDED

    case "settings":
      return <AdminSettings />;

    default:
      return <AdminOverview />;
  }
};

const AdminDashboard = () => {
  const [activePage, setActivePage] = useState("overview");

  return (
    <div style={{ display: "flex", height: "100vh", background: "#f6f8fa" }}>
      {/* SIDEBAR */}
      <aside
        style={{
          width: "240px",
          background: "#111827",
          color: "white",
          padding: "20px",
        }}
      >
        <h2 style={{ marginBottom: "25px" }}>Admin Panel</h2>

        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => setActivePage(item.id)}
            style={{
              padding: "12px",
              borderRadius: "6px",
              marginBottom: "6px",
              cursor: "pointer",
              background: activePage === item.id ? "#374151" : "transparent",
            }}
          >
            {item.label}
          </div>
        ))}
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flexGrow: 1, padding: "30px" }}>
        {renderPage(activePage)}
      </main>
    </div>
  );
};

export default AdminDashboard;
