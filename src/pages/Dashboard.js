import React, { useState, useEffect } from "react";
import "./Styles/Dashboard.css";
import { useNavigate } from "react-router-dom";
import userService from "../api/userService";
import { formatTimeAgo } from "../utils/dateTime";

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activities, setActivities] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  
  // Profile picture state
  const [profileImage, setProfileImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      await Promise.all([fetchUserProfile(), fetchRecentActivities()]);
      setLoading(false);
    };

    loadDashboardData();

    const intervalId = setInterval(() => {
      fetchRecentActivities();
    }, 30000);

    return () => clearInterval(intervalId);
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
    }
  };

  const fetchRecentActivities = async () => {
    setActivityLoading(true);
    try {
      const response = await userService.getActivity();
      if (response.success) {
        setActivities(response.activities || []);
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
      setActivities([]);
    } finally {
      setActivityLoading(false);
    }
  };

  const getActivityIcon = (activityType) => {
    const iconMap = {
      login: "bi-box-arrow-in-right",
      logout: "bi-box-arrow-right",
      signup: "bi-person-plus",
      profile_update: "bi-person-gear",
      profile_picture_update: "bi-image"
    };
    return iconMap[activityType] || "bi-clock-history";
  };

  const getActivityTitle = (activity) => {
    const titleMap = {
      login: "Logged in",
      logout: "Logged out",
      signup: "Account created",
      profile_update: "Profile updated",
      profile_picture_update: "Profile picture updated"
    };
    return titleMap[activity.activity_type] || activity.description || "Activity";
  };

  const getRecentHighlights = () => {
    const latestLogin = activities.find((activity) => activity.activity_type === "login");
    const latestProfileUpdate = activities.find((activity) =>
      ["profile_update", "profile_picture_update"].includes(activity.activity_type)
    );

    return [
      latestLogin
        ? { ...latestLogin, highlightLabel: "Last Login" }
        : null,
      latestProfileUpdate
        ? { ...latestProfileUpdate, highlightLabel: "Last Profile Update" }
        : null,
    ].filter(Boolean);
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
          await fetchRecentActivities();
        }
      } catch (err) {
        console.error("Error uploading image:", err);
      } finally {
        setUploading(false);
      }
    }
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

  const recentHighlights = getRecentHighlights();

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
          {activityLoading ? (
            <p className="activity-empty">Loading activities...</p>
          ) : recentHighlights.length === 0 ? (
            <p className="activity-empty">No recent activities yet.</p>
          ) : (
            <ul>
              {recentHighlights.map((activity) => (
                <li key={activity.id}>
                  <div className="activity-title">
                    <i className={`bi ${getActivityIcon(activity.activity_type)}`}></i>
                    <span>{activity.highlightLabel}: {getActivityTitle(activity)}</span>
                  </div>
                  <small className="activity-time">{formatTimeAgo(activity.created_at)}</small>
                </li>
              ))}
            </ul>
          )}
          <button
            className="activity-more-btn"
            onClick={() => navigate("/activity-details")}
          >
            <i className="bi bi-list-ul"></i> More Details
          </button>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
