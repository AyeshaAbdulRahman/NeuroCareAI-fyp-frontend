import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Admin.css";

function AdminSettings() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settings, setSettings] = useState({
    siteName: "NeuroCare AI",
    siteEmail: "admin@neurocare.ai",
    timezone: "UTC",
    language: "en",
    emailNotifications: true,
    feedbackAlerts: true,
    userAlerts: true,
    autoApproveUsers: false,
    maintenanceMode: false,
    registrationEnabled: true,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    requireEmailVerification: true,
    allowSocialLogin: false,
    dataRetention: 90,
    backupFrequency: "daily"
  });

  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setSuccessMessage("Settings saved successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const handleReset = () => {
    if (window.confirm("Reset all settings to default?")) {
      setSettings({
        siteName: "NeuroCare AI",
        siteEmail: "admin@neurocare.ai",
        timezone: "UTC",
        language: "en",
        emailNotifications: true,
        feedbackAlerts: true,
        userAlerts: true,
        autoApproveUsers: false,
        maintenanceMode: false,
        registrationEnabled: true,
        sessionTimeout: 60,
        maxLoginAttempts: 5,
        requireEmailVerification: true,
        allowSocialLogin: false,
        dataRetention: 90,
        backupFrequency: "daily"
      });
    }
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
          <Link to="/admin/settings" className="active">
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
          <h1>System Settings</h1>
          <div className="header-actions">
            <span className="admin-badge">
              <i className="bi bi-shield-check"></i> Administrator
            </span>
          </div>
        </header>

        {successMessage && (
          <div className="success-message">{successMessage}</div>
        )}

        <form onSubmit={handleSave}>
          {/* General Settings */}
          <div className="settings-card">
            <div className="settings-card-header">
              <i className="bi bi-globe"></i>
              <h3>General Settings</h3>
            </div>
            <div className="settings-card-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Site Name</label>
                  <input
                    type="text"
                    name="siteName"
                    value={settings.siteName}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label>Site Email</label>
                  <input
                    type="email"
                    name="siteEmail"
                    value={settings.siteEmail}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Timezone</label>
                  <select name="timezone" value={settings.timezone} onChange={handleChange}>
                    <option value="UTC">UTC</option>
                    <option value="EST">EST (Eastern Standard Time)</option>
                    <option value="PST">PST (Pacific Standard Time)</option>
                    <option value="GMT">GMT (Greenwich Mean Time)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Language</label>
                  <select name="language" value={settings.language} onChange={handleChange}>
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="settings-card">
            <div className="settings-card-header">
              <i className="bi bi-bell"></i>
              <h3>Notifications</h3>
            </div>
            <div className="settings-card-body">
              <div className="settings-option">
                <div className="option-info">
                  <p>Email Notifications</p>
                  <small>Receive email notifications for important events</small>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={settings.emailNotifications}
                    onChange={handleChange}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="settings-option">
                <div className="option-info">
                  <p>Feedback Alerts</p>
                  <small>Get notified when users submit new feedback</small>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="feedbackAlerts"
                    checked={settings.feedbackAlerts}
                    onChange={handleChange}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="settings-option">
                <div className="option-info">
                  <p>User Alerts</p>
                  <small>Notifications for new user registrations</small>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="userAlerts"
                    checked={settings.userAlerts}
                    onChange={handleChange}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* User Management Settings */}
          <div className="settings-card">
            <div className="settings-card-header">
              <i className="bi bi-people"></i>
              <h3>User Management</h3>
            </div>
            <div className="settings-card-body">
              <div className="settings-option">
                <div className="option-info">
                  <p>Auto-approve Users</p>
                  <small>Automatically approve new user registrations</small>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="autoApproveUsers"
                    checked={settings.autoApproveUsers}
                    onChange={handleChange}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="settings-option">
                <div className="option-info">
                  <p>Allow Registration</p>
                  <small>Allow new users to register on the platform</small>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="registrationEnabled"
                    checked={settings.registrationEnabled}
                    onChange={handleChange}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="settings-option">
                <div className="option-info">
                  <p>Require Email Verification</p>
                  <small>Users must verify email before accessing platform</small>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="requireEmailVerification"
                    checked={settings.requireEmailVerification}
                    onChange={handleChange}
                  />
                  <span className="slider"></span>
                </label>
              </div>
              <div className="form-group">
                <label>Session Timeout (minutes)</label>
                <select name="sessionTimeout" value={settings.sessionTimeout} onChange={handleChange}>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="120">2 hours</option>
                  <option value="0">Never</option>
                </select>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="settings-card">
            <div className="settings-card-header">
              <i className="bi bi-shield-lock"></i>
              <h3>Security</h3>
            </div>
            <div className="settings-card-body">
              <div className="form-group">
                <label>Max Login Attempts</label>
                <select name="maxLoginAttempts" value={settings.maxLoginAttempts} onChange={handleChange}>
                  <option value="3">3 attempts</option>
                  <option value="5">5 attempts</option>
                  <option value="10">10 attempts</option>
                </select>
              </div>
              <div className="settings-option">
                <div className="option-info">
                  <p>Maintenance Mode</p>
                  <small>Put the site in maintenance mode</small>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    name="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onChange={handleChange}
                  />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
          </div>

          {/* Data Management Settings */}
          <div className="settings-card">
            <div className="settings-card-header">
              <i className="bi bi-database"></i>
              <h3>Data Management</h3>
            </div>
            <div className="settings-card-body">
              <div className="form-group">
                <label>Data Retention Period (days)</label>
                <select name="dataRetention" value={settings.dataRetention} onChange={handleChange}>
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">1 year</option>
                </select>
              </div>
              <div className="form-group">
                <label>Backup Frequency</label>
                <select name="backupFrequency" value={settings.backupFrequency} onChange={handleChange}>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions settings-actions">
            <button type="button" className="btn-secondary" onClick={handleReset}>
              <i className="bi bi-arrow-counterclockwise"></i> Reset to Default
            </button>
            <button type="submit" className="btn-primary">
              <i className="bi bi-check-lg"></i> Save Settings
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default AdminSettings;

