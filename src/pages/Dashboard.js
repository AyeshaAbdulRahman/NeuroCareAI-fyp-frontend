import React, { useState, useEffect } from "react";
import "./Styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import userService from "../api/userService";
import authService from "../api/authService";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Profile picture state
  const [profileImage, setProfileImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await userService.getProfile();
      if (response.success) {
        setUser(response.user);
        if (response.user.profile_picture) {
          setProfileImage(response.user.profile_picture);
        }
      } else {
        setError("Failed to load profile");
      }
    } catch (err) {
      setError("Failed to load profile");
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      try {
        const response = await userService.uploadProfilePicture(file);
        if (response.success) {
          setProfileImage(response.profile_picture);
          // Update localStorage
          const updatedUser = { ...user, profile_picture: response.profile_picture };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } catch (err) {
        console.error("Error uploading image:", err);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate("/");
  };

  if (loading) {
    return (
      <section className="dashboard">
        <div className="loading">Loading...</div>
      </section>
    );
  }

  if (error && !user) {
    return (
      <section className="dashboard">
        <div className="error-message">{error}</div>
      </section>
    );
  }

  return (
    <section className="dashboard">
      <h2>User Dashboard</h2>
      <p className="section-subtext">
        Manage your profile and explore your activities. Your NeuroCare AI experience, personalized for you.
      </p>

      <div className="dashboard-container">
        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-pic-wrapper">
              <img
                src={
                  profileImage || 
                  "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                }
                alt="User"
                className="profile-pic"
              />
              <label htmlFor="upload" className="upload-label">
                <i className="bi bi-camera-fill"></i>
              </label>
              <input
                id="upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={uploading}
              />
            </div>
            <div className="profile-details">
              <h3>{user?.firstname} {user?.lastname}</h3>
              <p>@{user?.username}</p>
              <p>{user?.category}</p>
            </div>
          </div>

          {/* User Info */}
          <div className="profile-info">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Age:</strong> {user?.age}</p>
            <p><strong>Gender:</strong> {user?.gender}</p>
            <p><strong>Country:</strong> {user?.country}</p>
            <p><strong>City:</strong> {user?.city}</p>
          </div>

          {/*  Action Buttons (linked to pages) */}
          <div className="profile-actions">
            <button className="btn" onClick={() => navigate("/updateprofile")}>
              <i className="bi bi-pencil-square"></i> Update Profile
            </button>
            <button className="btn secondary-btn" onClick={() => navigate("/feedback")}>
              <i className="bi bi-chat-dots"></i> Send Feedback
            </button>
          </div>
        </div>

        <div className="activity-card">
          <h3>Recent Activity</h3>
          <ul>
            <li><i className="bi bi-clock-history"></i> Last login: Just now</li>
            <li><i className="bi bi-file-earmark-text"></i> Welcome to NeuroCare AI!</li>
            <li><i className="bi bi-person-check"></i> Account verified</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
