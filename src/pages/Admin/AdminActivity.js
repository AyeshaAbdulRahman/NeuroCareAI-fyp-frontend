import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminService } from "../../api/adminService";
import "./Admin.css";

const iconByType = {
  user: "person-plus",
  feedback: "chat-dots",
  system: "gear",
  auth: "shield-lock",
};

const colorByType = {
  user: "success",
  feedback: "info",
  system: "primary",
  auth: "warning",
};

const styleColorMap = {
  success: "var(--admin-success)",
  warning: "var(--admin-warning)",
  danger: "var(--admin-danger)",
  info: "#3B82F6",
  primary: "var(--admin-primary)",
};

const normalizeType = (activityType = "") => {
  const value = activityType.toLowerCase();
  if (value.startsWith("admin_") || value.includes("profile") || value.includes("setting") || value.includes("password")) return "system";
  if (value.includes("login") || value.includes("logout") || value.includes("auth")) return "auth";
  if (value.includes("feedback")) return "feedback";
  return "user";
};

const toTitleCase = (text = "") =>
  text
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const toTimestamp = (value) => {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
};

function AdminActivity() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchActivityData();
    const intervalId = setInterval(fetchActivityData, 30000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchActivityData = async () => {
    try {
      setLoading(true);
      setError("");

      const activityRes = await adminService.getActivityLogs({ all: true, limit: 200 });
      const activityEvents = (activityRes?.activities || []).map((entry) => {
        const type = normalizeType(entry.activity_type);
        const actor = entry.user
          ? `${entry.user.firstname || ""} ${entry.user.lastname || ""}`.trim() ||
            entry.user.username ||
            entry.user.email
          : "Unknown user";

        return {
          id: `activity-${entry.id}`,
          type,
          action: toTitleCase(entry.activity_type || "activity"),
          description: entry.description || "Activity recorded",
          admin: entry.user?.is_admin ? `${actor} (Admin)` : actor,
          timestamp: entry.created_at,
          icon: iconByType[type] || "activity",
          color: colorByType[type] || "info",
        };
      });
      setActivities(
        activityEvents
          .sort((a, b) => toTimestamp(b.timestamp) - toTimestamp(a.timestamp))
          .slice(0, 200)
      );
    } catch (err) {
      setError(err?.message || "Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  const filteredActivities = useMemo(
    () =>
      activities.filter((activity) => {
        const matchesFilter =
          filter === "all" ||
          activity.type === filter ||
          (filter === "system" && activity.type === "auth");
        const query = searchTerm.toLowerCase();
        const matchesSearch =
          activity.description.toLowerCase().includes(query) ||
          activity.action.toLowerCase().includes(query);
        return matchesFilter && matchesSearch;
      }),
    [activities, filter, searchTerm]
  );

  const exportLogs = () => {
    if (!filteredActivities.length) return;
    const headers = ["Action", "Type", "Description", "By", "Timestamp"];
    const rows = filteredActivities.map((item) => [
      item.action,
      item.type,
      item.description,
      item.admin,
      item.timestamp ? new Date(item.timestamp).toISOString() : "",
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `admin-activity-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getActivityIcon = (icon) => <i className={`bi bi-${icon}`}></i>;

  const getActivityColor = (color) => styleColorMap[color] || styleColorMap.info;

  if (loading) {
    return <div className="loading">Loading activity logs...</div>;
  }

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2>NeuroCare<span>Admin</span></h2>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <i className={`bi ${sidebarOpen ? "bi-x-lg" : "bi-list"}`}></i>
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

      <main className="admin-main">
        <header className="admin-header">
          <h1>Activity Logs</h1>
          <div className="header-actions">
            <button className="btn-icon export-btn" title="Export Logs" onClick={exportLogs}>
              <i className="bi bi-download"></i> Export
            </button>
            <span className="admin-badge">
              <i className="bi bi-shield-check"></i> Administrator
            </span>
          </div>
        </header>

        {error && <div className="error-message">{error}</div>}

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "rgba(139, 92, 246, 0.2)", color: "var(--admin-primary)" }}>
              <i className="bi bi-clock-history"></i>
            </div>
            <div className="stat-content">
              <h3>{activities.length}</h3>
              <p>Total Activities</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "rgba(16, 185, 129, 0.2)", color: "var(--admin-success)" }}>
              <i className="bi bi-person-plus"></i>
            </div>
            <div className="stat-content">
              <h3>{activities.filter((a) => a.type === "user").length}</h3>
              <p>User Activities</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "rgba(59, 130, 246, 0.2)", color: "#3B82F6" }}>
              <i className="bi bi-chat-dots"></i>
            </div>
            <div className="stat-content">
              <h3>{activities.filter((a) => a.type === "feedback").length}</h3>
              <p>Feedback Activities</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: "rgba(107, 114, 128, 0.2)", color: "#6B7280" }}>
              <i className="bi bi-gear"></i>
            </div>
            <div className="stat-content">
              <h3>{activities.filter((a) => a.type === "system" || a.type === "auth").length}</h3>
              <p>System Activities</p>
            </div>
          </div>
        </div>

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
            <button className={`filter-btn ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
              <i className="bi bi-grid"></i> All
            </button>
            <button className={`filter-btn ${filter === "user" ? "active" : ""}`} onClick={() => setFilter("user")}>
              <i className="bi bi-person"></i> Users
            </button>
            <button className={`filter-btn ${filter === "feedback" ? "active" : ""}`} onClick={() => setFilter("feedback")}>
              <i className="bi bi-chat-dots"></i> Feedback
            </button>
            <button className={`filter-btn ${filter === "system" ? "active" : ""}`} onClick={() => setFilter("system")}>
              <i className="bi bi-gear"></i> System & Auth
            </button>
          </div>
        </div>

        <div className="activity-timeline">
          {filteredActivities.length > 0 ? (
            filteredActivities.map((activity) => (
              <div key={activity.id} className="timeline-item">
                <div className="timeline-marker" style={{ background: getActivityColor(activity.color) }}>
                  {getActivityIcon(activity.icon)}
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="activity-action">{activity.action}</span>
                    <span className="activity-time">
                      <i className="bi bi-clock"></i>{" "}
                      {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : "-"}
                    </span>
                  </div>
                  <p className="activity-description">{activity.description}</p>
                  <div className="timeline-footer">
                    <span className={`activity-type type-${activity.type}`}>{activity.type}</span>
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
