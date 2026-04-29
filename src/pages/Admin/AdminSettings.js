import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminService } from "../../api/adminService";
import { userService } from "../../api/userService";
import "./Admin.css";

function AdminSettings() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [stats, setStats] = useState({});
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [profile, setProfile] = useState({
    firstname: "",
    lastname: "",
    username: "",
    country: "",
    city: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchSettingsData();
  }, []);

  const fetchSettingsData = async () => {
    try {
      setLoading(true);
      setError("");
      const [profileRes, statsRes, feedbackRes] = await Promise.all([
        userService.getProfile(),
        adminService.getStats(),
        adminService.getAllFeedback(),
      ]);

      const user = profileRes?.user || {};
      setProfile({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        username: user.username || "",
        country: user.country || "",
        city: user.city || "",
      });

      setStats(statsRes || {});
      const feedbacks = Array.isArray(feedbackRes) ? feedbackRes : feedbackRes?.feedbacks || [];
      setFeedbackCount(feedbacks.length);
    } catch (err) {
      setError(err?.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setError("");
      await userService.updateProfile(profile);
      setSuccessMessage("Settings saved successfully.");
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (err) {
      setError(err?.message || "Failed to save settings");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New password and confirm password do not match.");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    try {
      setError("");
      await userService.updateProfile({ password: passwordData.newPassword });
      setSuccessMessage("Password updated successfully.");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch (err) {
      setError(err?.message || "Failed to update password");
    }
  };

  if (loading) {
    return <div className="loading">Loading settings...</div>;
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

      <main className="admin-main">
        <header className="admin-header">
          <h1>System Settings</h1>
          <div className="header-actions">
            <span className="admin-badge">
              <i className="bi bi-shield-check"></i> Administrator
            </span>
          </div>
        </header>

        {successMessage && <div className="success-message">{successMessage}</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="settings-card">
          <div className="settings-card-header">
            <i className="bi bi-graph-up-arrow"></i>
            <h3>Live System Snapshot</h3>
          </div>
          <div className="settings-card-body">
            <div className="settings-option">
              <div className="option-info">
                <p>Total Users</p>
                <small>{stats?.total_users || 0}</small>
              </div>
            </div>
            <div className="settings-option">
              <div className="option-info">
                <p>Active Users</p>
                <small>{stats?.active_users || 0}</small>
              </div>
            </div>
            <div className="settings-option">
              <div className="option-info">
                <p>Total Feedback</p>
                <small>{feedbackCount}</small>
              </div>
            </div>
            <div className="settings-option">
              <div className="option-info">
                <p>Pending Feedback</p>
                <small>{stats?.pending_feedback || 0}</small>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile}>
          <div className="settings-card">
            <div className="settings-card-header">
              <i className="bi bi-person"></i>
              <h3>Admin Account Preferences</h3>
            </div>
            <div className="settings-card-body">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" name="firstname" value={profile.firstname} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" name="lastname" value={profile.lastname} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" name="username" value={profile.username} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input type="text" name="country" value={profile.country} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input type="text" name="city" value={profile.city} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions settings-actions">
            <button type="submit" className="btn-primary">
              <i className="bi bi-check-lg"></i> Save Settings
            </button>
          </div>
        </form>

        <form onSubmit={handleChangePassword}>
          <div className="settings-card">
            <div className="settings-card-header">
              <i className="bi bi-shield-lock"></i>
              <h3>Security</h3>
            </div>
            <div className="settings-card-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                    placeholder="Enter new password"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    placeholder="Confirm new password"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions settings-actions">
            <button type="submit" className="btn-primary">
              <i className="bi bi-shield-check"></i> Update Password
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default AdminSettings;
