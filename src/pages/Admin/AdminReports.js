import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Admin.css";

function AdminReports() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dateRange, setDateRange] = useState("30");

  // Mock report data
  const stats = {
    totalUsers: 1250,
    totalDoctors: 120,
    totalCaregivers: 350,
    totalPatients: 780,
    activeUsers: 890,
    newUsersThisMonth: 145,
    totalFeedback: 320,
    resolvedFeedback: 280,
    avgResponseTime: "2.5 hours"
  };

  const userGrowthData = [
    { month: "Jul", users: 450 },
    { month: "Aug", users: 580 },
    { month: "Sep", users: 720 },
    { month: "Oct", users: 850 },
    { month: "Nov", users: 980 },
    { month: "Dec", users: 1100 },
    { month: "Jan", users: 1250 }
  ];

  const categoryDistribution = [
    { category: "Patients", count: 780, percentage: 62, color: "#10B981" },
    { category: "Caregivers", count: 350, percentage: 28, color: "#EC4899" },
    { category: "Doctors", count: 120, percentage: 10, color: "#8B5CF6" }
  ];

  const recentReports = [
    { id: 1, title: "User Growth Report", date: "2024-01-15", type: "Users" },
    { id: 2, title: "Feedback Analysis", date: "2024-01-14", type: "Feedback" },
    { id: 3, title: "System Usage Stats", date: "2024-01-13", type: "System" },
    { id: 4, title: "Diagnosis Statistics", date: "2024-01-12", type: "Diagnosis" },
    { id: 5, title: "User Activity Report", date: "2024-01-11", type: "Users" }
  ];

  const maxGrowth = Math.max(...userGrowthData.map(d => d.users));

  const exportReport = (format) => {
    alert(`Exporting report as ${format}...`);
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

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <h1>Reports & Analytics</h1>
          <div className="header-actions">
            <select 
              className="date-range-select"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <button className="btn-icon" onClick={() => exportReport('PDF')} title="Export PDF">
              <i className="bi bi-file-earmark-pdf"></i>
            </button>
            <button className="btn-icon" onClick={() => exportReport('CSV')} title="Export CSV">
              <i className="bi bi-file-earmark-spreadsheet"></i>
            </button>
            <span className="admin-badge">
              <i className="bi bi-shield-check"></i> Administrator
            </span>
          </div>
        </header>

        {/* Overview Stats */}
        <div className="reports-overview">
          <div className="overview-card">
            <div className="overview-icon">
              <i className="bi bi-people-fill"></i>
            </div>
            <div className="overview-content">
              <h3>{stats.totalUsers.toLocaleString()}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon doctors">
              <i className="bi bi-hospital-fill"></i>
            </div>
            <div className="overview-content">
              <h3>{stats.totalDoctors}</h3>
              <p>Doctors</p>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon caregivers">
              <i className="bi bi-heart-pulse-fill"></i>
            </div>
            <div className="overview-content">
              <h3>{stats.totalCaregivers}</h3>
              <p>Caregivers</p>
            </div>
          </div>
          <div className="overview-card">
            <div className="overview-icon patients">
              <i className="bi bi-person-medical-fill"></i>
            </div>
            <div className="overview-content">
              <h3>{stats.totalPatients}</h3>
              <p>Patients</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          {/* User Growth Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>User Growth</h3>
              <span className="chart-period">Last 7 months</span>
            </div>
            <div className="chart-body">
              <div className="bar-chart">
                {userGrowthData.map((data, index) => (
                  <div key={index} className="bar-item">
                    <div 
                      className="bar" 
                      style={{height: `${(data.users / maxGrowth) * 100}%`}}
                      title={data.users}
                    >
                      <span className="bar-value">{data.users}</span>
                    </div>
                    <span className="bar-label">{data.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Distribution */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>User Categories</h3>
              <span className="chart-period">Distribution</span>
            </div>
            <div className="chart-body">
              <div className="pie-chart-container">
                <div className="pie-chart">
                  <svg viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10B981" strokeWidth="20" strokeDasharray="62 38" transform="rotate(-90 50 50)" />
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#EC4899" strokeWidth="20" strokeDasharray="28 72" strokeDashoffset="-62" transform="rotate(-90 50 50)" />
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#8B5CF6" strokeWidth="20" strokeDasharray="10 90" strokeDashoffset="-90" transform="rotate(-90 50 50)" />
                  </svg>
                  <div className="pie-center">
                    <span>{stats.totalUsers}</span>
                    <small>Total</small>
                  </div>
                </div>
                <div className="pie-legend">
                  {categoryDistribution.map((item, index) => (
                    <div key={index} className="legend-item">
                      <span className="legend-color" style={{background: item.color}}></span>
                      <span className="legend-label">{item.category}</span>
                      <span className="legend-value">{item.count} ({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="analytics-header">
              <i className="bi bi-graph-up-arrow"></i>
              <h4>User Analytics</h4>
            </div>
            <div className="analytics-stats">
              <div className="analytics-stat">
                <span className="stat-label">Active Users</span>
                <span className="stat-value">{stats.activeUsers}</span>
              </div>
              <div className="analytics-stat">
                <span className="stat-label">New This Month</span>
                <span className="stat-value positive">+{stats.newUsersThisMonth}</span>
              </div>
              <div className="analytics-stat">
                <span className="stat-label">Growth Rate</span>
                <span className="stat-value positive">+12.5%</span>
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
                <span className="stat-value">{stats.totalFeedback}</span>
              </div>
              <div className="analytics-stat">
                <span className="stat-label">Resolved</span>
                <span className="stat-value">{stats.resolvedFeedback}</span>
              </div>
              <div className="analytics-stat">
                <span className="stat-label">Avg Response</span>
                <span className="stat-value">{stats.avgResponseTime}</span>
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
                <span className="stat-label">Uptime</span>
                <span className="stat-value positive">99.9%</span>
              </div>
              <div className="analytics-stat">
                <span className="stat-label">Response Time</span>
                <span className="stat-value">145ms</span>
              </div>
              <div className="analytics-stat">
                <span className="stat-label">API Calls</span>
                <span className="stat-value">15.2K</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        <div className="recent-reports">
          <div className="section-header">
            <h3>Recent Reports</h3>
            <button className="btn-link">View All</button>
          </div>
          <div className="reports-list">
            {recentReports.map(report => (
              <div key={report.id} className="report-item">
                <div className="report-icon">
                  <i className="bi bi-file-earmark-text"></i>
                </div>
                <div className="report-info">
                  <h4>{report.title}</h4>
                  <span>{report.date}</span>
                </div>
                <span className="report-type">{report.type}</span>
                <button className="btn-icon">
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

