import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Admin.css";

function AdminActivity() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock activity data
  const activities = [
    {
      id: 1,
      type: "user",
      action: "User Registration",
      description: "New user 'johndoctor' registered as Doctor",
      admin: "System",
      timestamp: "2024-01-15 10:30:00",
      icon: "person-plus",
      color: "success"
    },
    {
      id: 2,
      type: "feedback",
      action: "Feedback Reviewed",
      description: "Feedback from patient 'janesmith' marked as resolved",
      admin: "Admin User",
      timestamp: "2024-01-15 09:45:00",
      icon: "chat-dots",
      color: "info"
    },
    {
      id: 3,
      type: "user",
      action: "User Updated",
      description: "Updated profile information for user ID #42",
      admin: "Admin User",
      timestamp: "2024-01-15 08:20:00",
      icon: "pencil",
      color: "warning"
    },
    {
      id: 4,
      type: "system",
      action: "System Backup",
      description: "Automated daily backup completed successfully",
      admin: "System",
      timestamp: "2024-01-15 03:00:00",
      icon: "cloud-upload",
      color: "primary"
    },
    {
      id: 5,
      type: "user",
      action: "User Deleted",
      description: "Inactive user account 'olduser123' has been removed",
      admin: "Admin User",
      timestamp: "2024-01-14 16:30:00",
      icon: "trash",
      color: "danger"
    },
    {
      id: 6,
      type: "feedback",
      action: "Feedback Priority Changed",
      description: "Priority for feedback #15 changed to High",
      admin: "Admin User",
      timestamp: "2024-01-14 14:15:00",
      icon: "flag",
      color: "warning"
    },
    {
      id: 7,
      type: "auth",
      action: "Login",
      description: "Admin user logged in from new device",
      admin: "Admin User",
      timestamp: "2024-01-14 09:00:00",
      icon: "box-arrow-in-right",
      color: "success"
    },
    {
      id: 8,
      type: "settings",
      action: "Settings Updated",
      description: "Email notification preferences modified",
      admin: "Admin User",
      timestamp: "2024-01-13 15:45:00",
      icon: "gear",
      color: "info"
    },
    {
      id: 9,
      type: "diagnosis",
      action: "Diagnosis Report Generated",
      description: "New EEG analysis report generated for patient #28",
      admin: "System",
      timestamp: "2024-01-13 12:00:00",
      icon: "file-earmark-medical",
      color: "primary"
    },
    {
      id: 10,
      type: "user",
      action: "User Status Changed",
      description: "User 'testpatient' account deactivated",
      admin: "Admin User",
      timestamp: "2024-01-12 11:30:00",
      icon: "person-dash",
      color: "danger"
    }
  ];

  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filter === "all" || activity.type === filter;
    const matchesSearch = activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.action.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getActivityIcon = (icon) => {
    return <i className={`bi bi-${icon}`}></i>;
  };

  const getActivityColor = (color) => {
    const colors = {
      success: "var(--admin-success)",
      warning: "var(--admin-warning)",
      danger: "var(--admin-danger)",
      info: "#3B82F6",
      primary: "var(--admin-primary)"
    };
    return colors[color] || colors.info;
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>NeuroCare<span>Admin</span></h2>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <i className={`bi ${sidebarOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
          </button>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin">
            <i className="bi bi-speedometer2"></i>
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/users">
            <i className="bi bi-people"></i>
            <span>Users</span>
          </Link>
          <Link to="/admin/feedback">
            <i className="bi bi-chat-dots"></i>
            <span>Feedback</span>
          </Link>
          <Link to="/admin/profile">
            <i className="bi bi-person-gear"></i>
            <span>Profile</span>
          </Link>
          <Link to="/admin/settings">
            <i className="bi bi-gear"></i>
            <span>Settings</span>
          </Link>
          <Link to="/admin/activity" className="active">
            <i className="bi bi-clock-history"></i>
            <span>Activity</span>
          </Link>
          <Link to="/admin/reports">
            <i className="bi bi-bar-chart"></i>
            <span>Reports</span>
          </Link>
          <button onClick={() => navigate("/dashboard")}>
            <i className="bi bi-arrow-left"></i>
            <span>Back to User</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1>Activity Logs</h1>
          <div className="header-actions">
            <button className="btn-icon export-btn" title="Export Logs">
              <i className="bi bi-download"></i> Export
            </button>
            <span className="admin-badge">
              <i className="bi bi-shield-check"></i> Administrator
            </span>
          </div>
        </header>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{background: 'rgba(139, 92, 246, 0.2)', color: 'var(--admin-primary)'}}>
              <i className="bi bi-clock-history"></i>
            </div>
            <div className="stat-content">
              <h3>{activities.length}</h3>
              <p>Total Activities</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{background: 'rgba(16, 185, 129, 0.2)', color: 'var(--admin-success)'}}>
              <i className="bi bi-person-plus"></i>
            </div>
            <div className="stat-content">
              <h3>{activities.filter(a => a.type === 'user').length}</h3>
              <p>User Activities</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{background: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6'}}>
              <i className="bi bi-chat-dots"></i>
            </div>
            <div className="stat-content">
              <h3>{activities.filter(a => a.type === 'feedback').length}</h3>
              <p>Feedback Activities</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{background: 'rgba(107, 114, 128, 0.2)', color: '#6B7280'}}>
              <i className="bi bi-gear"></i>
            </div>
            <div className="stat-content">
              <h3>{activities.filter(a => a.type === 'system' || a.type === 'settings').length}</h3>
              <p>System Activities</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="activity-filters">
          <div className="search-box">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search activities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              <i className="bi bi-grid"></i> All
            </button>
            <button
              className={`filter-btn ${filter === 'user' ? 'active' : ''}`}
              onClick={() => setFilter('user')}
            >
              <i className="bi bi-person"></i> Users
            </button>
            <button
              className={`filter-btn ${filter === 'feedback' ? 'active' : ''}`}
              onClick={() => setFilter('feedback')}
            >
              <i className="bi bi-chat-dots"></i> Feedback
            </button>
            <button
              className={`filter-btn ${filter === 'system' ? 'active' : ''}`}
              onClick={() => setFilter('system')}
            >
              <i className="bi bi-gear"></i> System
            </button>
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="activity-timeline">
          {filteredActivities.length > 0 ? (
            filteredActivities.map(activity => (
              <div key={activity.id} className="timeline-item">
                <div className="timeline-marker" style={{background: getActivityColor(activity.color)}}>
                  {getActivityIcon(activity.icon)}
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="activity-action">{activity.action}</span>
                    <span className="activity-time">
                      <i className="bi bi-clock"></i> {activity.timestamp}
                    </span>
                  </div>
                  <p className="activity-description">{activity.description}</p>
                  <div className="timeline-footer">
                    <span className={`activity-type type-${activity.type}`}>
                      {activity.type}
                    </span>
                    <span className="activity-admin">
                      <i className="bi bi-person"></i> {activity.admin}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">
              <i className="bi bi-inbox"></i>
              <p>No activities found</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminActivity;

