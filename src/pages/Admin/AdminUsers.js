import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminService } from "../../api/adminService";
import "./Admin.css";

function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await adminService.deleteUser(userId);
        setUsers(users.filter(u => u.id !== userId));
      } catch (err) {
        alert("Failed to delete user");
      }
    }
  };

  const handleStatusToggle = async (user) => {
    try {
      await adminService.updateUser(user.id, { is_active: !user.is_active });
      setUsers(users.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
    } catch (err) {
      alert("Failed to update user status");
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || user.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return <div className="loading">Loading users...</div>;
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
          <Link to="/admin">
            <i className="bi bi-speedometer2"></i>
            <span>Dashboard</span>
          </Link>
          <Link to="/admin/users" className="active">
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
          <h1>User Management</h1>
          <div className="header-actions">
            <button className="export-btn" onClick={() => alert("Exporting users to CSV...")}>
              <i className="bi bi-download"></i> Export CSV
            </button>
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
              <h3>{users.length}</h3>
              <p>Total Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon new-icon">
              <i className="bi bi-person-plus-fill"></i>
            </div>
            <div className="stat-content">
              <h3>{users.filter(u => {
                let dateString = u.created_at;
                if (!dateString.endsWith('Z')) {
                  dateString = dateString + 'Z';
                }
                const created = new Date(dateString);
                const now = new Date();
                const diff = (now - created) / (1000 * 60 * 60 * 24);
                return diff <= 30;
              }).length}</h3>
              <p>New This Month</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{background: 'rgba(16, 185, 129, 0.2)', color: '#10B981'}}>
              <i className="bi bi-check-circle-fill"></i>
            </div>
            <div className="stat-content">
              <h3>{users.filter(u => u.is_active).length}</h3>
              <p>Active Users</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{background: 'rgba(239, 68, 68, 0.2)', color: '#EF4444'}}>
              <i className="bi bi-x-circle-fill"></i>
            </div>
            <div className="stat-content">
              <h3>{users.filter(u => !u.is_active).length}</h3>
              <p>Inactive Users</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-box">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            <option value="Doctor">Doctor</option>
            <option value="Caregiver">Caregiver</option>
            <option value="Patient">Patient</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>User</th>
                <th>Email</th>
                <th>Category</th>
                <th>Country</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>#{user.id}</td>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">
                          {user.firstname?.[0]}{user.lastname?.[0]}
                        </div>
                        <div>
                          <span className="user-name">{user.firstname} {user.lastname}</span>
                          <span className="user-username">@{user.username}</span>
                        </div>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`category-badge ${user.category?.toLowerCase()}`}>
                        {user.category}
                      </span>
                    </td>
                    <td>{user.country || '-'}</td>
                    <td>
                      <button
                        className={`status-btn ${user.is_active ? 'active' : 'inactive'}`}
                        onClick={() => handleStatusToggle(user)}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>{user.created_at ? new Date((user.created_at.endsWith('Z') ? user.created_at : user.created_at + 'Z')).toLocaleDateString() : '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon edit"
                          onClick={() => setEditingUser(user)}
                          title="Edit"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn-icon delete"
                          onClick={() => handleDelete(user.id)}
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="no-data">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {editingUser && (
          <div className="modal-overlay" onClick={() => setEditingUser(null)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Edit User</h2>
                <button className="close-btn" onClick={() => setEditingUser(null)}>
                  <i className="bi bi-x-lg"></i>
                </button>
              </div>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const data = Object.fromEntries(formData);
                  try {
                    await adminService.updateUser(editingUser.id, data);
                    fetchUsers();
                    setEditingUser(null);
                  } catch (err) {
                    alert("Failed to update user");
                  }
                }}
              >
                <div className="form-grid">
                  <input name="firstname" defaultValue={editingUser.firstname} placeholder="First Name" required />
                  <input name="lastname" defaultValue={editingUser.lastname} placeholder="Last Name" required />
                  <input name="username" defaultValue={editingUser.username} placeholder="Username" required />
                  <input name="email" defaultValue={editingUser.email} disabled placeholder="Email" />
                  <select name="category" defaultValue={editingUser.category}>
                    <option value="Doctor">Doctor</option>
                    <option value="Caregiver">Caregiver</option>
                    <option value="Patient">Patient</option>
                    <option value="Other">Other</option>
                  </select>
                  <input name="country" defaultValue={editingUser.country} placeholder="Country" />
                  <select name="gender" defaultValue={editingUser.gender || 'Other'}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <input type="number" name="age" defaultValue={editingUser.age} placeholder="Age" />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn secondary" onClick={() => setEditingUser(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminUsers;

