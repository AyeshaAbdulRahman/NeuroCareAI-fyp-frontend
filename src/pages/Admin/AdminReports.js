import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminService } from "../../api/adminService";
import "./Admin.css";

const formatMonth = (date) =>
  date.toLocaleString("en-US", {
    month: "short",
  });

const toTimestamp = (value) => {
  let dateString = value;
  if (typeof dateString === 'string' && !dateString.endsWith('Z')) {
    dateString = dateString + 'Z';
  }
  const time = new Date(dateString).getTime();
  return Number.isNaN(time) ? 0 : time;
};

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

function AdminReports() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dateRange, setDateRange] = useState("30");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setError("");
      const [statsRes, usersRes, feedbackRes] = await Promise.all([
        adminService.getStats(),
        adminService.getAllUsers(1, 300),
        adminService.getAllFeedback(),
      ]);

      setStats(statsRes || {});
      setUsers(usersRes || []);
      setFeedbacks(Array.isArray(feedbackRes) ? feedbackRes : feedbackRes?.feedbacks || []);
    } catch (err) {
      setError(err?.message || "Failed to load report analytics");
    } finally {
      setLoading(false);
    }
  };

  const rangeDays = toNumber(dateRange) || 30;

  const rangeFilteredUsers = useMemo(() => {
    const now = Date.now();
    const msRange = rangeDays * 24 * 60 * 60 * 1000;
    return users.filter((user) => now - toTimestamp(user.created_at) <= msRange);
  }, [users, rangeDays]);

  const rangeFilteredFeedback = useMemo(() => {
    const now = Date.now();
    const msRange = rangeDays * 24 * 60 * 60 * 1000;
    return feedbacks.filter((item) => now - toTimestamp(item.created_at) <= msRange);
  }, [feedbacks, rangeDays]);

  const userGrowthData = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 6; i >= 0; i -= 1) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const count = users.filter((user) => {
        const ts = toTimestamp(user.created_at);
        return ts >= start.getTime() && ts < end.getTime();
      }).length;
      months.push({
        month: formatMonth(start),
        users: count,
      });
    }
    return months;
  }, [users]);

  const maxGrowth = Math.max(...userGrowthData.map((d) => d.users), 1);

  const categoryDistribution = useMemo(() => {
    const totalUsers = toNumber(stats?.total_users);
    const byCategory = stats?.users_by_category || {};
    return Object.entries(byCategory)
      .map(([category, count], index) => {
        const palette = ["#10B981", "#EC4899", "#8B5CF6", "#F59E0B", "#3B82F6"];
        const numericCount = toNumber(count);
        const percentage = totalUsers > 0 ? Math.round((numericCount / totalUsers) * 100) : 0;
        return {
          category,
          count: numericCount,
          percentage,
          color: palette[index % palette.length],
        };
      })
      .sort((a, b) => b.count - a.count);
  }, [stats]);

  const resolvedFeedback = feedbacks.filter((item) => item.status === "resolved").length;

  const avgResponseTime = useMemo(() => {
    const completed = feedbacks.filter(
      (item) =>
        item.status &&
        item.status !== "pending" &&
        item.created_at &&
        item.updated_at &&
        toTimestamp(item.updated_at) > toTimestamp(item.created_at)
    );
    if (!completed.length) return "N/A";
    const avgMs =
      completed.reduce((sum, item) => sum + (toTimestamp(item.updated_at) - toTimestamp(item.created_at)), 0) /
      completed.length;
    const hours = avgMs / (1000 * 60 * 60);
    if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} mins`;
    return `${hours.toFixed(1)} hrs`;
  }, [feedbacks]);

  const growthRate = useMemo(() => {
    const now = Date.now();
    const currentStart = now - rangeDays * 24 * 60 * 60 * 1000;
    const previousStart = currentStart - rangeDays * 24 * 60 * 60 * 1000;
    const current = users.filter((u) => {
      const ts = toTimestamp(u.created_at);
      return ts >= currentStart && ts <= now;
    }).length;
    const previous = users.filter((u) => {
      const ts = toTimestamp(u.created_at);
      return ts >= previousStart && ts < currentStart;
    }).length;
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const pct = ((current - previous) / previous) * 100;
    return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
  }, [users, rangeDays]);

  const recentReports = useMemo(
    () => [
      {
        id: 1,
        title: "User Growth Snapshot",
        date: new Date().toLocaleDateString(),
        type: "Users",
      },
      {
        id: 2,
        title: "Feedback Resolution Snapshot",
        date: new Date().toLocaleDateString(),
        type: "Feedback",
      },
      {
        id: 3,
        title: "Category Distribution Snapshot",
        date: new Date().toLocaleDateString(),
        type: "System",
      },
      {
        id: 4,
        title: "Admin Operations Summary",
        date: new Date().toLocaleDateString(),
        type: "Admin",
      },
    ],
    []
  );

  const exportReport = (format) => {
    const lines = [
      ["Metric", "Value"],
      ["Total Users", toNumber(stats?.total_users)],
      ["Active Users", toNumber(stats?.active_users)],
      [`New Users (Last ${rangeDays} days)`, rangeFilteredUsers.length],
      ["Total Feedback", feedbacks.length],
      ["Resolved Feedback", resolvedFeedback],
      ["Avg Feedback Response", avgResponseTime],
      ["Growth Rate", growthRate],
    ];

    const serialized = lines
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const extension = format === "PDF" ? "txt" : "csv";
    const blob = new Blob([serialized], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `admin-report-${new Date().toISOString().slice(0, 10)}.${extension}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="loading">Loading reports...</div>;

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
          <Link to="/admin/activity">
            <i className="bi bi-clock-history"></i>
            <span>Activity</span>
          </Link>
          <Link to="/admin/reports" className="active">
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
          <h1>Reports & Analytics</h1>
          <div className="header-actions">
            <select className="date-range-select" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <button className="btn-icon" onClick={() => exportReport("PDF")} title="Export Summary">
              <i className="bi bi-file-earmark-text"></i>
            </button>
            <button className="btn-icon" onClick={() => exportReport("CSV")} title="Export CSV">
              <i className="bi bi-file-earmark-spreadsheet"></i>
            </button>
            <span className="admin-badge">
              <i className="bi bi-shield-check"></i> Administrator
            </span>
          </div>
        </header>

        {error && <div className="error-message">{error}</div>}

        <div className="reports-overview">
          <div className="overview-card">
            <div className="overview-icon">
              <i className="bi bi-people-fill"></i>
            </div>
            <div className="overview-content">
              <h3>{toNumber(stats?.total_users).toLocaleString()}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon doctors">
              <i className="bi bi-hospital-fill"></i>
            </div>
            <div className="overview-content">
              <h3>{toNumber(stats?.users_by_category?.Doctor)}</h3>
              <p>Doctors</p>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon caregivers">
              <i className="bi bi-heart-pulse-fill"></i>
            </div>
            <div className="overview-content">
              <h3>{toNumber(stats?.users_by_category?.Caregiver)}</h3>
              <p>Caregivers</p>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon patients">
              <i className="bi bi-person-medical-fill"></i>
            </div>
            <div className="overview-content">
              <h3>{toNumber(stats?.users_by_category?.Patient)}</h3>
              <p>Patients</p>
            </div>
          </div>
        </div>

        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-header">
              <h3>User Growth</h3>
              <span className="chart-period">Last 7 months</span>
            </div>
            <div className="chart-body">
              <div className="bar-chart">
                {userGrowthData.map((data, index) => (
                  <div key={index} className="bar-item">
                    <div className="bar" style={{ height: `${(data.users / maxGrowth) * 100}%` }} title={data.users}>
                      <span className="bar-value">{data.users}</span>
                    </div>
                    <span className="bar-label">{data.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3>User Categories</h3>
              <span className="chart-period">Distribution</span>
            </div>
            <div className="chart-body">
              <div className="pie-chart-container">
                <div className="pie-legend">
                  {categoryDistribution.length > 0 ? (
                    categoryDistribution.map((item, index) => (
                      <div key={index} className="legend-item">
                        <span className="legend-color" style={{ background: item.color }}></span>
                        <span className="legend-label">{item.category}</span>
                        <span className="legend-value">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="no-data">
                      <i className="bi bi-inbox"></i>
                      <p>No category data</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="analytics-header">
              <i className="bi bi-graph-up-arrow"></i>
              <h4>User Analytics</h4>
            </div>
            <div className="analytics-stats">
              <div className="analytics-stat">
                <span className="stat-label">Active Users</span>
                <span className="stat-value">{toNumber(stats?.active_users)}</span>
              </div>
              <div className="analytics-stat">
                <span className="stat-label">New in Range</span>
                <span className="stat-value positive">+{rangeFilteredUsers.length}</span>
              </div>
              <div className="analytics-stat">
                <span className="stat-label">Growth Rate</span>
                <span className="stat-value positive">{growthRate}</span>
              </div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-header">
              <i className="bi bi-chat-square-text-fill"></i>
              <h4>Feedback Analytics</h4>
            </div>
            <div className="analytics-stats">
              <div className="analytics-stat">
                <span className="stat-label">Total Feedback</span>
                <span className="stat-value">{feedbacks.length}</span>
              </div>
              <div className="analytics-stat">
                <span className="stat-label">Resolved</span>
                <span className="stat-value">{resolvedFeedback}</span>
              </div>
              <div className="analytics-stat">
                <span className="stat-label">Avg Response</span>
                <span className="stat-value">{avgResponseTime}</span>
              </div>
            </div>
          </div>

          <div className="analytics-card">
            <div className="analytics-header">
              <i className="bi bi-activity"></i>
              <h4>Platform Health</h4>
            </div>
            <div className="analytics-stats">
              <div className="analytics-stat">
                <span className="stat-label">Recent Registrations</span>
                <span className="stat-value positive">{toNumber(stats?.recent_registrations)}</span>
              </div>
              <div className="analytics-stat">
                <span className="stat-label">Pending Feedback</span>
                <span className="stat-value">{toNumber(stats?.pending_feedback)}</span>
              </div>
              <div className="analytics-stat">
                <span className="stat-label">Feedback in Range</span>
                <span className="stat-value">{rangeFilteredFeedback.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="recent-reports">
          <div className="section-header">
            <h3>Recent Reports</h3>
          </div>
          <div className="reports-list">
            {recentReports.map((report) => (
              <div key={report.id} className="report-item">
                <div className="report-icon">
                  <i className="bi bi-file-earmark-text"></i>
                </div>
                <div className="report-info">
                  <h4>{report.title}</h4>
                  <span>{report.date}</span>
                </div>
                <span className="report-type">{report.type}</span>
                <button className="btn-icon" onClick={() => exportReport("CSV")}>
                  <i className="bi bi-download"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminReports;
