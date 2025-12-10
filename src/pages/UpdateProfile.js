import React, { useState } from "react";
import "./Styles/UpdateProfile.css";

function UpdateProfile() {
  const [formData, setFormData] = useState({
    firstname: "Ayesha",
    lastname: "Rahman",
    username: "ayesha_r",
    email: "ayesha.rahman@example.com",
    age: 26,
    gender: "Female",
    category: "Caregiver",
    country: "Pakistan",
    city: "Karachi",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword)
      alert("Passwords do not match!");
    else alert("Profile updated successfully!");
  };

  return (
    <section className="update-profile">
      <h2>Update Profile</h2>
      <p className="section-subtext">Modify your account details securely.</p>

      <form className="update-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <input name="firstname" value={formData.firstname} onChange={handleChange} placeholder="First Name" required />
          <input name="lastname" value={formData.lastname} onChange={handleChange} placeholder="Last Name" required />
          <input name="username" value={formData.username} onChange={handleChange} placeholder="Username" required />
          <input name="email" value={formData.email} disabled placeholder="Email" />
          <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Age" required />
          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option>Male</option><option>Female</option><option>Other</option>
          </select>
          <select name="category" value={formData.category} onChange={handleChange}>
            <option>Doctor</option><option>Caregiver</option><option>Patient</option><option>Other</option>
          </select>
          <input name="country" value={formData.country} onChange={handleChange} placeholder="Country" required />
          <input name="city" value={formData.city} onChange={handleChange} placeholder="City" required />
          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="New Password" />
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Confirm Password" />
        </div>
        <button type="submit" className="btn">Save Changes</button>
      </form>
    </section>
  );
}

export default UpdateProfile;
