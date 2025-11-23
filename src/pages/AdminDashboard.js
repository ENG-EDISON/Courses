import React, { useState } from "react";
import AdminMessagesList from "./AdminMessagesList";
import "../static/AdminDashboard.css";
import UserManagement from "./Admin/UserManagement";

const menuItems = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "users", label: "Users", icon: "👤" },
  { id: "courses", label: "Courses", icon: "📚" },
  { id: "analytics", label: "Analytics", icon: "📈" },
  { id: "messages", label: "Messages", icon: "💬" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

// ------------------ PAGE COMPONENTS ------------------
const AdminOverview = () => (
  <div className="admin-page">
    <div className="content-section">
      <h2>📊 Admin Overview</h2>
      <div className="content-grid">
        <div className="content-card">
          <h3>Quick Stats</h3>
          <p>View your platform statistics and key metrics.</p>
        </div>
        <div className="content-card">
          <h3>Recent Activity</h3>
          <p>Monitor recent user and course activities.</p>
        </div>
      </div>
    </div>
  </div>
);

const CoursesManagement = () => (
  <div className="admin-page">
    <div className="content-section">
      <h2>📚 Courses Management</h2>
      <div className="content-grid">
        <div className="content-card">
          <h3>Course Catalog</h3>
          <p>Manage all courses in the platform.</p>
        </div>
        <div className="content-card">
          <h3>Content Moderation</h3>
          <p>Review and approve course content.</p>
        </div>
      </div>
    </div>
  </div>
);

const AnalyticsDashboard = () => (
  <div className="admin-page">
    <div className="content-section">
      <h2>📈 Analytics Dashboard</h2>
      <div className="content-grid">
        <div className="content-card">
          <h3>Performance Metrics</h3>
          <p>Track platform performance and engagement.</p>
        </div>
        <div className="content-card">
          <h3>Revenue Reports</h3>
          <p>View financial reports and revenue analytics.</p>
        </div>
      </div>
    </div>
  </div>
);

const AdminSettings = () => (
  <div className="admin-page">
    <div className="content-section">
      <h2>⚙️ Admin Settings</h2>
      <div className="content-grid">
        <div className="content-card">
          <h3>Platform Settings</h3>
          <p>Configure global platform settings.</p>
        </div>
        <div className="content-card">
          <h3>Security</h3>
          <p>Manage security and privacy settings.</p>
        </div>
      </div>
    </div>
  </div>
);

const renderPage = (page) => {
  switch (page) {
    case "overview":
      return <AdminOverview />;
    case "users":
      return <UserManagement />;
    case "courses":
      return <CoursesManagement />;
    case "analytics":
      return <AnalyticsDashboard />;
    case "messages":
      return <AdminMessagesList />;
    case "settings":
      return <AdminSettings />;
    default:
      return <AdminOverview />;
  }
};

const AdminDashboard = () => {
  const [activePage, setActivePage] = useState("overview");

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <h2 className="admin-sidebar-title">Admin Panel</h2>
        
        <nav className="admin-sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`admin-menu-item ${activePage === item.id ? 'active' : ''}`}
            >
              <span className="menu-item-icon">{item.icon}</span>
              <span className="menu-item-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-content">
        {renderPage(activePage)}
      </main>
    </div>
  );
};

export default AdminDashboard;