import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { feedbackService } from "../../api/feedbackService";
import "./Admin.css";

function AdminFeedback() {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const data = await feedbackService.getAllFeedback();
      setFeedbacks(data);
    } catch (err) {
      setError("Failed to load feedbacks");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await feedbackService.updateFeedbackStatus(id, status);
      setFeedbacks(feedbacks.map(f => 
        f.id === id ? { ...f, status } : f
      ));
    } catch (err) {
      alert("Failed to update feedback status");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this feedback?")) {
      try {
        await feedbackService.deleteFeedback(id);
        setFeedbacks(feedbacks.filter(f => f.id !== id));
      } catch (err) {
        alert("Failed to delete feedback");
      }
    }
  };

  const filteredFeedbacks = feedbacks.filter(f => 
    !filterStatus || f.status === filterStatus
  );

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'status-pending';
      case 'reviewed': return 'status-reviewed';
      case 'resolved': return 'status-resolved';
      default: return '';
    }
  };

  if (loading) {
    return <div className="loading">Loading feedbacks...</div>;
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
          <Link to="/admin/users">
            <i className="bi bi-people"></i>
            <span>Users</span>
          </Link>
          <Link to="/admin/feedback" className="active">
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
          <h1>Feedback Management</h1>
          <div className="header-actions">
            <span className="admin-badge">
              <i className="bi bi-shield-check"></i> Administrator
            </span>
          </div>
        </header>

        {error && <div className="error-message">{error}</div>}

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon feedback-icon">
              <i className="bi bi-chat-left-text-fill"></i>
            </div>
            <div className="stat-content">
              <h3>{feedbacks.length}</h3>
              <p>Total Feedback</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending-icon">
              <i className="bi bi-hourglass-split"></i>
            </div>
            <div className="stat-content">
              <h3>{feedbacks.filter(f => f.status === 'pending').length}</h3>
              <p>Pending</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{background: 'rgba(59, 130, 246, 0.2)', color: '#3B82F6'}}>
              <i className="bi bi-eye"></i>
            </div>
            <div className="stat-content">
              <h3>{feedbacks.filter(f => f.status === 'reviewed').length}</h3>
              <p>Reviewed</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon new-icon">
              <i className="bi bi-check-circle"></i>
            </div>
            <div className="stat-content">
              <h3>{feedbacks.filter(f => f.status === 'resolved').length}</h3>
              <p>Resolved</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Feedback List */}
        <div className="feedback-list">
          {filteredFeedbacks.length > 0 ? (
            filteredFeedbacks.map(feedback => (
              <div key={feedback.id} className="feedback-card-admin">
                <div className="feedback-header">
                  <div className="feedback-user">
                    <div className="user-avatar small">
                      {feedback.user?.firstname?.[0]}{feedback.user?.lastname?.[0]}
                    </div>
                    <div>
                      <span className="user-name">{feedback.user?.firstname} {feedback.user?.lastname}</span>
                      <span className="user-username">@{feedback.user?.username}</span>
                    </div>
                  </div>
                  <div className="feedback-actions-top">
                    <span className={`status ${getStatusColor(feedback.status)}`}>
                      {feedback.status}
                    </span>
                  </div>
                </div>
                
                <div className="feedback-body">
                  <p>{feedback.feedback_text}</p>
                </div>
                
                <div className="feedback-footer">
                  <span className="date">
                    <i className="bi bi-calendar3"></i>
                    {new Date(feedback.created_at).toLocaleDateString()}
                  </span>
                  <div className="feedback-controls">
                    <select
                      value={feedback.status}
                      onChange={(e) => handleStatusUpdate(feedback.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="resolved">Resolved</option>
                    </select>
                    <button
                      className="btn-icon delete"
                      onClick={() => handleDelete(feedback.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-data">No feedback found</div>
          )}
        </div>
      </main>
    </div>
  );
}

export default AdminFeedback;
