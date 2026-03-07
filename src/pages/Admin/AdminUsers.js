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
            <span className="admin-badge">
              <i className="bi bi-shield-check"></i> Administrator
            </span>
          </div>
        </header>

        {error && <div className="error-message">{error}</div>}

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-box">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Search users..."
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
                <th>Username</th>
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
                    <td>{user.country}</td>
                    <td>
                      <button
                        className={`status-btn ${user.is_active ? 'active' : 'inactive'}`}
                        onClick={() => handleStatusToggle(user)}
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
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
                  <select name="gender" defaultValue={editingUser.gender}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  <input type="number" name="age" defaultValue={editingUser.age} placeholder="Age" />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn secondary" onClick={() => setEditingUser(null)}>Cancel</button>
                  <button type="submit" className="btn">Save Changes</button>
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
