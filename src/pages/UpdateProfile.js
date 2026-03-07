import React, { useState, useEffect } from "react";
import "./Styles/UpdateProfile.css";
import userService from "../api/userService";

function UpdateProfile() {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    age: "",
    gender: "",
    category: "",
    country: "",
    city: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await userService.getProfile();
      if (response.success) {
        const user = response.user;
        setFormData({
          firstname: user.firstname || "",
          lastname: user.lastname || "",
          username: user.username || "",
          email: user.email || "",
          age: user.age || "",
          gender: user.gender || "",
          category: user.category || "",
          country: user.country || "",
          city: user.city || "",
          password: "",
          confirmPassword: "",
        });
      } else {
        setError(response.message || "Failed to load profile data");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.message || "Failed to load profile data");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const updateData = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        username: formData.username,
        age: parseInt(formData.age),
        gender: formData.gender,
        category: formData.category,
        country: formData.country,
        city: formData.city,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      const response = await userService.updateProfile(updateData);

      if (response.success) {
        setSuccess("Profile updated successfully!");
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(response.user));
        setFormData({
          ...formData,
          password: "",
          confirmPassword: "",
        });
      } else {
        setError(response.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update profile error caught:", err);
      setError(err.message || "An error occurred while updating profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="update-profile">
      <h2>Update Profile</h2>
      <p className="section-subtext">Modify your account details securely.</p>

      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      <form className="update-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <input 
            name="firstname" 
            value={formData.firstname} 
            onChange={handleChange} 
            placeholder="First Name" 
            required 
          />
          <input 
            name="lastname" 
            value={formData.lastname} 
            onChange={handleChange} 
            placeholder="Last Name" 
            required 
          />
          <input 
            name="username" 
            value={formData.username} 
            onChange={handleChange} 
            placeholder="Username" 
            required 
          />
          <input 
            name="email" 
            value={formData.email} 
            disabled 
            placeholder="Email" 
            title="Email cannot be changed"
          />
          <input 
            type="number" 
            name="age" 
            value={formData.age} 
            onChange={handleChange} 
            placeholder="Age" 
            required 
          />
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="">Select Gender</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          <select name="category" value={formData.category} onChange={handleChange}>
            <option value="">Select Category</option>
            <option>Doctor</option>
            <option>Caregiver</option>
            <option>Patient</option>
            <option>Other</option>
          </select>
          <input 
            name="country" 
            value={formData.country} 
            onChange={handleChange} 
            placeholder="Country" 
            required 
          />
          <input 
            name="city" 
            value={formData.city} 
            onChange={handleChange} 
            placeholder="City" 
            required 
          />
          <input 
            type="password" 
            name="password" 
            value={formData.password} 
            onChange={handleChange} 
            placeholder="New Password (leave blank to keep current)" 
          />
          <input 
            type="password" 
            name="confirmPassword" 
            value={formData.confirmPassword} 
            onChange={handleChange} 
            placeholder="Confirm Password" 
          />
        </div>
        <button type="submit" className="btn" disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </section>
  );
}

export default UpdateProfile;
