import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Styles/Signup.css";

function Signup({ setIsLoggedIn }) {
  const navigate = useNavigate();

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

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();

    const {
      firstname,
      lastname,
      username,
      email,
      age,
      gender,
      category,
      country,
      city,
      password,
      confirmPassword,
    } = formData;

    if (
      !firstname ||
      !lastname ||
      !username ||
      !email ||
      !age ||
      !gender ||
      !category ||
      !country ||
      !city ||
      !password ||
      !confirmPassword
    ) {
      alert("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    alert("Account created successfully!");
    setIsLoggedIn(true);
    navigate("/dashboard");
  };

  return (
    <div className="signup-page">
      <div className="auth-container">
        <h1 className="brand-title">NeuroCare AI</h1>
        <div className="form-box">
          <h2>Create Your Account</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="firstname"
              placeholder="First Name"
              value={formData.firstname}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lastname"
              placeholder="Last Name"
              value={formData.lastname}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="username"
              placeholder="Username (unique)"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              name="age"
              placeholder="Age"
              value={formData.age}
              onChange={handleChange}
              min="1"
              required
            />

            <select name="gender" value={formData.gender} onChange={handleChange} required>
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>

            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="">Select Category</option>
              <option>Doctor</option>
              <option>Caregiver</option>
              <option>Patient</option>
              <option>Other</option>
            </select>

            <input
              type="text"
              name="country"
              placeholder="Country"
              value={formData.country}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Create Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <button type="submit" className="auth-btn">
              Sign Up
            </button>

            <div className="text-small">
              Already have an account? <Link to="/login">Login</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Signup;
