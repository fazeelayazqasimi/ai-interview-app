import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import "./CandidateDashboard.css";

export default function CandidateDashboard() {
  const [user, setUser] = useState(null);
  const [jobRole, setJobRole] = useState("");
  const [answer, setAnswer] = useState("");
  const [aiQuestion, setAiQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.type !== "candidate") {
      navigate("/company-dashboard");
      return;
    }
    
    setUser(parsedUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handleInterview = async () => {
    if (!jobRole.trim()) {
      alert("Please enter a job role");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/interview`, {
        name: user?.name || "Candidate",
        job_role: jobRole,
        answer: answer || ""
      });
      
      setAiQuestion(res.data.question);
    } catch (err) {
      alert(err.response?.data?.detail || "Error connecting to AI service");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="candidate-dashboard">
      <div className="dashboard-header">
        <div className="user-info">
          <h2>👤 Welcome, {user.name}</h2>
          <p className="user-email">{user.email}</p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-card">
          <h3>🎯 AI Interview Practice</h3>
          <p>Practice interview questions for your target job role</p>
          
          <div className="input-group">
            <label>Job Role</label>
            <input
              type="text"
              placeholder="e.g., Frontend Developer, Data Scientist"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
            />
          </div>
          
          <div className="input-group">
            <label>Your Answer (Optional)</label>
            <textarea
              placeholder="Type your previous answer here..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              rows={4}
            />
          </div>
          
          <button 
            className="interview-btn"
            onClick={handleInterview}
            disabled={loading}
          >
            {loading ? "Getting AI Question..." : "Get AI Interview Question"}
          </button>
          
          {aiQuestion && (
            <div className="ai-response">
              <h4>🤖 AI Question:</h4>
              <p className="question-text">{aiQuestion}</p>
              <button 
                className="copy-btn"
                onClick={() => {
                  navigator.clipboard.writeText(aiQuestion);
                  alert("Question copied to clipboard!");
                }}
              >
                Copy Question
              </button>
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <h3>📊 Quick Actions</h3>
          <div className="actions-grid">
            <button className="action-btn" onClick={() => navigate("/job-listings")}>
              💼 Browse Jobs
            </button>
            <button className="action-btn" onClick={() => navigate("/my-applications")}>
              📝 My Applications
            </button>
            <button className="action-btn" onClick={() => navigate("/profile-settings")}>
              ⚙️ Profile Settings
            </button>
            <button className="action-btn" onClick={() => navigate("/analytics")}>
              📈 View Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}