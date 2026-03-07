import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminService } from "../../api/adminService";
import "./Admin.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (err) {
      setError("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading admin dashboard...</div>;
  }

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
          <Link to="/admin" className="active">
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
          <Link to="/admin/activity">
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
          <h1>Admin Dashboard</h1>
          <div className="header-actions">
            <span className="admin-badge">
              <i className="bi bi-shield-check"></i> Administrator
            </span>
          </div>
        </header>

        {error && <div className="error-message">{error}</div>}

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon users-icon">
              <i className="bi bi-people-fill"></i>
            </div>
            <div className="stat-content">
              <h3>{stats?.total_users || 0}</h3>
              <p>Total Users</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon feedback-icon">
              <i className="bi bi-chat-left-text-fill"></i>
            </div>
            <div className="stat-content">
              <h3>{stats?.total_feedback || 0}</h3>
              <p>Total Feedback</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending-icon">
              <i className="bi bi-hourglass-split"></i>
            </div>
            <div className="stat-content">
              <h3>{stats?.pending_feedback || 0}</h3>
              <p>Pending Feedback</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon new-icon">
              <i className="bi bi-person-plus-fill"></i>
            </div>
            <div className="stat-content">
              <h3>{stats?.recent_registrations || 0}</h3>
              <p>New Users (7 days)</p>
            </div>
          </div>
        </div>

        {/* Users by Category */}
        <div className="dashboard-section">
          <h2>Users by Category</h2>
          <div className="category-grid">
            {stats?.users_by_category && Object.entries(stats.users_by_category).map(([category, count]) => (
              <div key={category} className="category-card">
                <div className="category-icon">
                  <i className={`bi ${
                    category === 'Doctor' ? 'bi-hospital' :
                    category === 'Caregiver' ? 'bi-heart-pulse' :
                    category === 'Patient' ? 'bi-person-medical' :
                    'bi-person'
                  }`}></i>
                </div>
                <h3>{count}</h3>
                <p>{category}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button className="action-btn" onClick={() => navigate("/admin/users")}>
              <i className="bi bi-people"></i>
              <span>Manage Users</span>
            </button>
            <button className="action-btn" onClick={() => navigate("/admin/feedback")}>
              <i className="bi bi-chat-dots"></i>
              <span>Review Feedback</span>
            </button>
            <button className="action-btn" onClick={() => navigate("/admin/reports")}>
              <i className="bi bi-bar-chart"></i>
              <span>View Reports</span>
            </button>
            <button className="action-btn" onClick={() => navigate("/admin/profile")}>
              <i className="bi bi-person"></i>
              <span>My Profile</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;

