import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import authService from "../api/authService";
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // Handle submit
  const handleSubmit = async (e) => {
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
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userData = {
        firstname,
        lastname,
        username,
        email,
        age: parseInt(age),
        gender,
        category,
        country,
        city,
        password,
      };

      const response = await authService.signup(userData);

      if (response.success) {
        setIsLoggedIn(true);
        navigate("/dashboard");
      } else {
        setError(response.message || "Registration failed");
      }
    } catch (err) {
      console.error("Signup error caught:", err);
      // Display the error message from the thrown object
      setError(err.message || "An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="auth-container">
        <h1 className="brand-title">NeuroCare AI</h1>
        <div className="form-box">
          <h2>Create Your Account</h2>

          {error && <div className="error-message">{error}</div>}

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

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
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
