import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import "./Login.css";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    type: "candidate"
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.password.trim()) {
      setMessage("Please fill in all fields");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, formData);
      
      // Save user to localStorage
      localStorage.setItem("user", JSON.stringify(response.data.user));
      
      setMessage("Login successful! Redirecting...");
      
      // Redirect based on user type
      setTimeout(() => {
        if (formData.type === "candidate") {
          navigate("/candidate-dashboard");
        } else {
          navigate("/company-dashboard");
        }
      }, 1000);

    } catch (error) {
      console.error("Login error:", error);
      setMessage(error.response?.data?.detail || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p className="login-subtitle">Sign in to your account</p>
        
        {message && (
          <div className={`message ${message.includes("success") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Login as</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${formData.type === "candidate" ? "active" : ""}`}
                onClick={() => setFormData({...formData, type: "candidate"})}
              >
                👤 Candidate
              </button>
              <button
                type="button"
                className={`role-btn ${formData.type === "company" ? "active" : ""}`}
                onClick={() => setFormData({...formData, type: "company"})}
              >
                🏢 Company
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Sign In"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/signup" className="signup-link">
              Sign up here
            </Link>
          </p>
          <p className="demo-credentials">
            <strong>Demo:</strong> candidate@example.com / password123
          </p>
        </div>
      </div>
    </div>
  );
}