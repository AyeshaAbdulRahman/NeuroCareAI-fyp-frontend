import React, { useState } from "react";
import "./Styles/Dashboard.css";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  // Example user data
  const user = {
    firstname: "John",
    lastname: "Doe",
    username: "johndoe123",
    email: "john.doe@example.com",
    age: 35,
    gender: "Male",
    category: "Caregiver",
    country: "Pakistan",
    city: "Karachi",
  };

  // Profile picture state
  const [profileImage, setProfileImage] = useState(null);
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setProfileImage(URL.createObjectURL(file));
  };

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
              />
            </div>
            <div className="profile-details">
              <h3>{user.firstname} {user.lastname}</h3>
              <p>@{user.username}</p>
              <p>{user.category}</p>
            </div>
          </div>

          {/* User Info */}
          <div className="profile-info">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Age:</strong> {user.age}</p>
            <p><strong>Gender:</strong> {user.gender}</p>
            <p><strong>Country:</strong> {user.country}</p>
            <p><strong>City:</strong> {user.city}</p>
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
            <li><i className="bi bi-clock-history"></i> Last login: 2 hours ago</li>
            <li><i className="bi bi-file-earmark-text"></i> Viewed reports: Yesterday</li>
            <li><i className="bi bi-pencil-square"></i> Updated profile: 3 days ago</li>
            <li><i className="bi bi-folder2-open"></i> Accessed caregiver library: Last week</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
