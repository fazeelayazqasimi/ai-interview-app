import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import "./Signup.css";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
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
    
    // Validation
    if (!formData.name.trim()) {
      setMessage("Please enter your name");
      return;
    }
    if (!formData.email.trim()) {
      setMessage("Please enter your email");
      return;
    }
    if (!formData.password.trim()) {
      setMessage("Please enter your password");
      return;
    }
    if (formData.password.length < 6) {
      setMessage("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(`${API_BASE_URL}/signup`, formData);
      
      setMessage(response.data.message);
      alert("Signup successful! Please login.");
      
      // Redirect to login after 1 second
      setTimeout(() => {
        navigate("/login");
      }, 1000);

    } catch (error) {
      console.error("Signup error:", error);
      setMessage(error.response?.data?.detail || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2>Create Your Account</h2>
        <p className="signup-subtitle">Join AI Interview Platform</p>
        
        {message && (
          <div className={`message ${message.includes("success") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

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
              placeholder="Enter your password (min. 6 characters)"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>I am a</label>
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
            className="signup-btn"
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="signup-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="login-link">
              Login here
            </Link>
          </p>
          <p className="terms">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}