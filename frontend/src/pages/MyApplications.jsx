import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import "./MyApplications.css";

export default function MyApplications() {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
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
    fetchApplications(parsedUser.email);
    fetchAnalytics(parsedUser.email);
  }, [navigate]);

  const fetchApplications = async (email) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/applications/candidate/${email}`);
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async (email) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics/candidate/${email}`);
      setStats(response.data.statistics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      "applied": { label: "Applied", color: "#ff9900", bg: "rgba(255, 153, 0, 0.1)" },
      "reviewed": { label: "Under Review", color: "#0066ff", bg: "rgba(0, 102, 255, 0.1)" },
      "accepted": { label: "Accepted", color: "#00ff00", bg: "rgba(0, 255, 0, 0.1)" },
      "rejected": { label: "Rejected", color: "#ff0000", bg: "rgba(255, 0, 0, 0.1)" },
    };
    
    const config = statusConfig[status] || { label: status, color: "#666", bg: "rgba(102, 102, 102, 0.1)" };
    
    return (
      <span className="status-badge" style={{ color: config.color, background: config.bg }}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="applications-page">
      <div className="applications-header">
        <div>
          <h1>📝 My Applications</h1>
          <p>Track your job applications and status</p>
        </div>
        <button 
          className="browse-jobs-btn"
          onClick={() => navigate("/job-listings")}
        >
          🔍 Browse More Jobs
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon">📤</div>
            <div className="stat-info">
              <h3>{stats.total_applications}</h3>
              <p>Total Applications</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{stats.applied}</h3>
              <p>Pending Review</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-info">
              <h3>{stats.accepted}</h3>
              <p>Accepted</p>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">❌</div>
            <div className="stat-info">
              <h3>{stats.rejected}</h3>
              <p>Rejected</p>
            </div>
          </div>
        </div>
      )}

      {/* Applications List */}
      <div className="applications-container">
        {applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No Applications Yet</h3>
            <p>You haven't applied for any jobs yet. Start applying now!</p>
            <button 
              className="apply-now-btn"
              onClick={() => navigate("/job-listings")}
            >
              Browse Jobs
            </button>
          </div>
        ) : (
          <>
            <div className="applications-list">
              {applications.map((application, index) => (
                <div key={application.id || index} className="application-card">
                  <div className="application-header">
                    <div>
                      <h3>{application.job_details?.title || "Job Title"}</h3>
                      <p className="company-name">
                        {application.job_details?.company_email || "Company"}
                      </p>
                    </div>
                    {getStatusBadge(application.status)}
                  </div>
                  
                  <div className="application-details">
                    <div className="detail-item">
                      <span className="detail-label">📍 Location:</span>
                      <span>{application.job_details?.location || "Not specified"}</span>
                    </div>
                    
                    <div className="detail-item">
                      <span className="detail-label">📅 Applied:</span>
                      <span>{formatDate(application.applied_date)}</span>
                    </div>
                    
                    {application.cover_letter && (
                      <div className="cover-letter">
                        <span className="detail-label">📝 Cover Letter:</span>
                        <p>{application.cover_letter}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="application-actions">
                    <button 
                      className="view-job-btn"
                      onClick={() => application.job_details?.id && 
                        navigate(`/job-details/${application.job_details.id}`)}
                    >
                      View Job Details
                    </button>
                    
                    {application.status === "applied" && (
                      <button 
                        className="withdraw-btn"
                        onClick={() => alert("Withdraw feature coming soon!")}
                      >
                        Withdraw Application
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="applications-summary">
              <h3>📊 Application Summary</h3>
              <p>Total Applications: <strong>{applications.length}</strong></p>
              <p>Under Review: <strong>{applications.filter(a => a.status === "applied" || a.status === "reviewed").length}</strong></p>
              <p>Successful: <strong>{applications.filter(a => a.status === "accepted").length}</strong></p>
              
              <div className="tip-box">
                <h4>💡 Tips</h4>
                <ul>
                  <li>Follow up after 1-2 weeks</li>
                  <li>Customize each application</li>
                  <li>Keep your profile updated</li>
                  <li>Practice interview questions</li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}