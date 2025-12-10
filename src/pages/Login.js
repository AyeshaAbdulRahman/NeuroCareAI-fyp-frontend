import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Styles/Login.css";

function Login({ setIsLoggedIn }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { username, password } = formData;

    if (!username || !password) {
      alert("Please fill in all fields");
      return;
    }

    // ✅ Simulated login success
    alert("Login successful!");
    setIsLoggedIn(true);
    navigate("/dashboard");
  };

  return (
    <div className="login-page">
      <div className="auth-container">
        <h1 className="brand-title">NeuroCare AI</h1>

        <div className="form-box">
          <h2>Welcome Back</h2>
          <p className="auth-subtext">
            Access your NeuroCare AI dashboard securely.
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="username"
              placeholder="Username or Email"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button type="submit" className="auth-btn">
              Login
            </button>

            <div className="text-small">
              <a href="#">Forgot Password?</a>
            </div>

            <div className="text-small">
              Don’t have an account? <Link to="/signup">Sign Up</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
