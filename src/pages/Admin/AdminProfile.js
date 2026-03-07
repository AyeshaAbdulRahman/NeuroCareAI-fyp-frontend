import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Admin.css";

function AdminProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    phone: "",
    country: ""
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        setUser(JSON.parse(userData));
        const parsedUser = JSON.parse(userData);
        setFormData({
          firstname: parsedUser.firstname || "",
          lastname: parsedUser.lastname || "",
          username: parsedUser.username || "",
          email: parsedUser.email || "",
          phone: parsedUser.phone || "",
          country: parsedUser.country || ""
        });
      }
    } catch (err) {
      console.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update profile");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert("Password must be at least 6 characters!");
      return;
    }
    try {
      setSuccessMessage("Password changed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      alert("Failed to change password");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>NeuroCare<span>Admin</span></h2>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <i className={`bi ${sidebarOpen ? 'bi-x-lg' : 'bi-list'}`}></i>
          </button>
        </div>
        <nav className="sidebar-nav">
          <Link to="/admin"><i className="bi bi-speedometer2"></i><span>Dashboard</span></Link>
          <Link to="/admin/users"><i className="bi bi-people"></i><span>Users</span></Link>
          <Link to="/admin/feedback"><i className="bi bi-chat-dots"></i><span>Feedback</span></Link>
          <Link to="/admin/profile" className="active"><i className="bi bi-person-gear"></i><span>Profile</span></Link>
          <Link to="/admin/settings"><i className="bi bi-gear"></i><span>Settings</span></Link>
          <Link to="/admin/activity"><i className="bi bi-clock-history"></i><span>Activity</span></Link>
          <Link to="/admin/reports"><i className="bi bi-bar-chart"></i><span>Reports</span></Link>
          <button onClick={() => navigate("/dashboard")}><i className="bi bi-arrow-left"></i><span>Back to User</span></button>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <h1>Admin Profile</h1>
          <div className="header-actions">
            <span className="admin-badge"><i className="bi bi-shield-check"></i> Administrator</span>
          </div>
        </header>

        {successMessage && <div className="success-message">{successMessage}</div>}

        <div className="profile-header">
          <div className="profile-avatar-large">
            <div className="avatar-circle">{user?.firstname?.[0]}{user?.lastname?.[0]}</div>
            <button className="avatar-edit-btn"><i className="bi bi-camera"></i></button>
          </div>
          <div className="profile-header-info">
            <h2>{user?.firstname} {user?.lastname}</h2>
            <p>@{user?.username}</p>
            <span className="admin-role-badge"><i className="bi bi-shield-fill"></i> Super Administrator</span>
          </div>
        </div>

        <div className="profile-tabs">
          <button className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
            <i className="bi bi-person"></i> Profile Info
          </button>
          <button className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
            <i className="bi bi-shield-lock"></i> Security
          </button>
          <button className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`} onClick={() => setActiveTab('activity')}>
            <i className="bi bi-clock-history"></i> Activity
          </button>
          <button className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <i className="bi bi-gear"></i> Settings
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'profile' && (
            <div className="profile-section">
              <div className="section-header">
                <h3>Profile Information</h3>
                <button className="btn-edit" onClick={() => setIsEditing(!isEditing)}>
                  <i className={`bi ${isEditing ? 'bi-x-circle' : 'bi-pencil'}`}></i>
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>
              <form onSubmit={handleProfileSubmit} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input type="text" name="firstname" value={formData.firstname} onChange={handleInputChange} disabled={!isEditing} />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input type="text" name="lastname" value={formData.lastname} onChange={handleInputChange} disabled={!isEditing} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Username</label>
                    <input type="text" name="username" value={formData.username} onChange={handleInputChange} disabled={!isEditing} />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" value={formData.email} disabled />
                    <small>Email cannot be changed</small>
                  </div>
                </div>
                {isEditing && (
                  <div className="form-actions">
                    <button type="submit" className="btn-primary"><i className="bi bi-check-lg"></i> Save Changes</button>
                  </div>
                )}
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="profile-section">
              <div className="section-header"><h3>Change Password</h3></div>
              <form onSubmit={handlePasswordSubmit} className="password-form">
                <div className="form-group full-width">
                  <label>Current Password</label>
                  <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} required placeholder="Enter current password" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>New Password</label>
                    <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} required minLength={6} placeholder="Enter new password" />
                  </div>
                  <div className="form-group">
                    <label>Confirm Password</label>
                    <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} required placeholder="Confirm new password" />
                  </div>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-primary"><i className="bi bi-shield-check"></i> Update Password</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="profile-section">
              <div className="section-header"><h3>Recent Activity</h3></div>
              <div className="activity-list">
                <div className="activity-item">
                  <div className="activity-icon"><i className="bi bi-person-plus"></i></div>
                  <div className="activity-details"><p>Updated user profile</p><small>2 hours ago</small></div>
                </div>
                <div className="activity-item">
                  <div className="activity-icon"><i className="bi bi-chat-dots"></i></div>
                  <div className="activity-details"><p>Reviewed feedback</p><small>5 hours ago</small></div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="profile-section">
              <div className="section-header"><h3>Admin Settings</h3></div>
              <div className="settings-group">
                <div className="settings-option">
                  <div className="option-info"><p>Email Notifications</p><small>Receive alerts</small></div>
                  <label className="toggle-switch"><input type="checkbox" defaultChecked /><span className="slider"></span></label>
                </div>
              </div>
              <div className="danger-zone">
                <h4>Danger Zone</h4>
                <button className="btn-danger" onClick={handleLogout}><i className="bi bi-box-arrow-right"></i> Logout</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminProfile;

