import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import userService from "../api/userService";
import { formatDateTime } from "../utils/dateTime";
import "./Styles/ActivityDetails.css";

const activityFilters = [
  { value: "all", label: "All Activities" },
  { value: "signup", label: "Signups" },
  { value: "login", label: "Logins" },
  { value: "logout", label: "Logouts" },
  { value: "profile_update", label: "Profile Updates" },
  { value: "profile_picture_update", label: "Profile Picture Updates" },
  { value: "report_upload", label: "Report Uploads" },
  { value: "diagnosis_submission", label: "Diagnosis Submissions" },
];

function ActivityDetails() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    fetchActivities(activeFilter);
  }, [activeFilter]);

  const fetchActivities = async (filter) => {
    setLoading(true);
    setError("");

    try {
      const params = { all: true };
      if (filter !== "all") {
        params.activity_type = filter;
      }

      const response = await userService.getActivity(params);
      if (response.success) {
        setActivities(response.activities || []);
      } else {
        setError("Failed to load activities");
      }
    } catch (err) {
      setError("Failed to load activities");
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (activityType) => {
    const iconMap = {
      signup: "bi-person-plus",
      login: "bi-box-arrow-in-right",
      logout: "bi-box-arrow-right",
      profile_update: "bi-person-gear",
      profile_picture_update: "bi-image",
      report_upload: "bi-file-earmark-arrow-up",
      diagnosis_submission: "bi-activity",
    };
    return iconMap[activityType] || "bi-clock-history";
  };

  const getActivityTitle = (activity) => {
    const titleMap = {
      signup: "Account Created",
      login: "Login",
      logout: "Logout",
      profile_update: "Profile Updated",
      profile_picture_update: "Profile Picture Updated",
      report_upload: "Report Uploaded",
      diagnosis_submission: "Diagnosis Submitted",
    };
    return titleMap[activity.activity_type] || "Activity";
  };

  return (
    <section className="activity-details-page">
      <div className="activity-details-header">
        <div>
          <h2>Activity Details</h2>
          <p className="section-subtext">
            Complete timeline of login history, profile updates, and report uploads.
          </p>
        </div>
        <button
          className="activity-back-btn"
          onClick={() => navigate("/dashboard")}
        >
          <i className="bi bi-arrow-left"></i> Back to Dashboard
        </button>
      </div>

      <div className="activity-filter-row">
        {activityFilters.map((filter) => (
          <button
            key={filter.value}
            className={`activity-filter-btn ${activeFilter === filter.value ? "active" : ""}`}
            onClick={() => setActiveFilter(filter.value)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading activities...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : activities.length === 0 ? (
        <div className="activity-empty-state">No activities found for this filter.</div>
      ) : (
        <div className="activity-list">
          {activities.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-item-title">
                <i className={`bi ${getActivityIcon(activity.activity_type)}`}></i>
                <h4>{getActivityTitle(activity)}</h4>
              </div>
              <p className="activity-item-description">
                {activity.description || "No description provided."}
              </p>
              <small className="activity-item-time">{formatDateTime(activity.created_at, "Unknown time")}</small>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default ActivityDetails;
