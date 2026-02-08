import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import "./CandidateProfileView.css";

export default function CandidateProfileView() {
  const [user, setUser] = useState(null);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [companyApplications, setCompanyApplications] = useState([]);
  const [skillsAnalysis, setSkillsAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const { candidateEmail } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.type !== "company") {
      navigate("/candidate-dashboard");
      return;
    }
    
    setUser(parsedUser);
    fetchCandidateProfile(parsedUser.email, candidateEmail);
  }, [navigate, candidateEmail]);

  const fetchCandidateProfile = async (companyEmail, candidateEmail) => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_BASE_URL}/profile/company-view/${candidateEmail}?company_email=${companyEmail}`
      );
      
      setCandidateProfile(response.data.profile);
      setCompanyApplications(response.data.company_applications);
      setSkillsAnalysis(response.data.skills_analysis);
      
    } catch (error) {
      console.error("Error fetching candidate profile:", error);
      alert("Failed to load candidate profile");
    } finally {
      setLoading(false);
    }
  };

  const calculateMatchScore = (job) => {
    if (!candidateProfile || !job) return 0;
    
    const candidateSkills = new Set(candidateProfile.skills?.map(s => s.toLowerCase()) || []);
    const jobTags = new Set(job.tags?.map(t => t.toLowerCase()) || []);
    
    const matches = [...candidateSkills].filter(skill => 
      [...jobTags].some(tag => tag.includes(skill) || skill.includes(tag))
    );
    
    return jobTags.size > 0 ? Math.round((matches.length / jobTags.size) * 100) : 0;
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      "applied": { color: "#ff9900", bg: "rgba(255, 153, 0, 0.1)" },
      "reviewed": { color: "#0066ff", bg: "rgba(0, 102, 255, 0.1)" },
      "interview": { color: "#9900ff", bg: "rgba(153, 0, 255, 0.1)" },
      "accepted": { color: "#00ff00", bg: "rgba(0, 255, 0, 0.1)" },
      "rejected": { color: "#ff0000", bg: "rgba(255, 0, 0, 0.1)" }
    };
    
    const config = statusColors[status] || { color: "#666", bg: "rgba(102, 102, 102, 0.1)" };
    
    return (
      <span className="status-badge" style={{ color: config.color, background: config.bg }}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "Unknown date";
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading candidate profile...</p>
      </div>
    );
  }

  if (!candidateProfile) {
    return (
      <div className="error-container">
        <h2>Candidate not found</h2>
        <button 
          className="back-button"
          onClick={() => navigate("/company-applications")}
        >
          ← Back to Applications
        </button>
      </div>
    );
  }

  return (
    <div className="candidate-profile-view">
      <div className="profile-header">
        <button 
          className="back-button"
          onClick={() => navigate("/company-applications")}
        >
          ← Back to Applications
        </button>
        <h1>👤 Candidate Profile</h1>
        <p>Detailed view of candidate's profile and history</p>
      </div>

      <div className="profile-container">
        {/* Sidebar */}
        <div className="profile-sidebar">
          <div className="candidate-summary">
            <div className="candidate-avatar">
              {candidateProfile.name ? candidateProfile.name.charAt(0).toUpperCase() : "C"}
            </div>
            <h2>{candidateProfile.name}</h2>
            <p className="candidate-email">{candidateProfile.email}</p>
            
            <div className="contact-info">
              {candidateProfile.phone && (
                <p className="contact-item">📱 {candidateProfile.phone}</p>
              )}
              {candidateProfile.location && (
                <p className="contact-item">📍 {candidateProfile.location}</p>
              )}
            </div>
            
            <div className="profile-score">
              <h3>Profile Score</h3>
              <div className="score-circle">
                <span className="score-value">{skillsAnalysis?.profile_completeness || 0}%</span>
              </div>
              <p className="score-label">Complete</p>
            </div>
          </div>

          <div className="skills-summary">
            <h3>🎯 Skills Summary</h3>
            <p className="total-skills">
              {skillsAnalysis?.total_skills || 0} Total Skills
            </p>
            
            <div className="skill-categories">
              <div className="skill-category">
                <span className="category-label">Technical:</span>
                <span className="category-count">
                  {skillsAnalysis?.technical_skills?.length || 0}
                </span>
              </div>
              <div className="skill-category">
                <span className="category-label">Soft Skills:</span>
                <span className="category-count">
                  {skillsAnalysis?.soft_skills?.length || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button className="schedule-interview-btn">
              📅 Schedule Interview
            </button>
            <button className="download-resume-btn">
              📄 Download Resume
            </button>
            <button className="send-message-btn">
              💬 Send Message
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="profile-main">
          <div className="profile-tabs">
            <button 
              className={`tab-btn ${activeTab === "profile" ? "active" : ""}`}
              onClick={() => setActiveTab("profile")}
            >
              👤 Profile
            </button>
            <button 
              className={`tab-btn ${activeTab === "applications" ? "active" : ""}`}
              onClick={() => setActiveTab("applications")}
            >
              📝 Applications
            </button>
            <button 
              className={`tab-btn ${activeTab === "skills" ? "active" : ""}`}
              onClick={() => setActiveTab("skills")}
            >
              🎯 Skills
            </button>
          </div>

          {activeTab === "profile" && (
            <div className="tab-content">
              <div className="section">
                <h3>📋 Personal Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Full Name</span>
                    <span className="info-value">{candidateProfile.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{candidateProfile.email}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{candidateProfile.phone || "Not provided"}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Location</span>
                    <span className="info-value">{candidateProfile.location || "Not provided"}</span>
                  </div>
                </div>
              </div>

              <div className="section">
                <h3>💼 Experience</h3>
                <div className="experience-content">
                  {candidateProfile.experience ? (
                    <p>{candidateProfile.experience}</p>
                  ) : (
                    <p className="empty-text">No experience information provided</p>
                  )}
                </div>
              </div>

              <div className="section">
                <h3>🎓 Education</h3>
                <div className="education-content">
                  {candidateProfile.education ? (
                    <p>{candidateProfile.education}</p>
                  ) : (
                    <p className="empty-text">No education information provided</p>
                  )}
                </div>
              </div>

              <div className="section">
                <h3>📝 Bio / Summary</h3>
                <div className="bio-content">
                  {candidateProfile.bio ? (
                    <p>{candidateProfile.bio}</p>
                  ) : (
                    <p className="empty-text">No bio provided</p>
                  )}
                </div>
              </div>

              {candidateProfile.resume_url && (
                <div className="section">
                  <h3>📄 Resume</h3>
                  <a 
                    href={candidateProfile.resume_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="resume-link"
                  >
                    🔗 View Resume
                  </a>
                </div>
              )}
            </div>
          )}

          {activeTab === "applications" && (
            <div className="tab-content">
              <h3>📋 Applications to Your Company</h3>
              
              {companyApplications.length === 0 ? (
                <div className="empty-applications">
                  <p>No applications found from this candidate</p>
                </div>
              ) : (
                <div className="applications-list">
                  {companyApplications.map((app, index) => (
                    <div key={index} className="application-card">
                      <div className="app-header">
                        <h4>{app.job_title}</h4>
                        {getStatusBadge(app.status)}
                      </div>
                      
                      <div className="app-details">
                        <div className="detail-item">
                          <span className="detail-label">Applied:</span>
                          <span className="detail-value">{formatDate(app.applied_date)}</span>
                        </div>
                        
                        <div className="detail-item">
                          <span className="detail-label">Location:</span>
                          <span className="detail-value">{app.job_location}</span>
                        </div>
                        
                        {app.status_message && (
                          <div className="detail-item">
                            <span className="detail-label">Message:</span>
                            <span className="detail-value">{app.status_message}</span>
                          </div>
                        )}
                      </div>
                      
                      {app.cover_letter && (
                        <div className="cover-letter">
                          <h5>Cover Letter:</h5>
                          <p>{app.cover_letter}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "skills" && (
            <div className="tab-content">
              <h3>🎯 Skills Analysis</h3>
              
              <div className="skills-stats">
                <div className="stat-card">
                  <div className="stat-value">{skillsAnalysis?.total_skills || 0}</div>
                  <div className="stat-label">Total Skills</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{skillsAnalysis?.technical_skills?.length || 0}</div>
                  <div className="stat-label">Technical Skills</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{skillsAnalysis?.soft_skills?.length || 0}</div>
                  <div className="stat-label">Soft Skills</div>
                </div>
              </div>

              <div className="skills-section">
                <h4>Technical Skills</h4>
                <div className="skills-list">
                  {skillsAnalysis?.technical_skills?.length > 0 ? (
                    skillsAnalysis.technical_skills.map((skill, index) => (
                      <span key={index} className="skill-tag technical">{skill}</span>
                    ))
                  ) : (
                    <p className="empty-text">No technical skills listed</p>
                  )}
                </div>
              </div>

              <div className="skills-section">
                <h4>Soft Skills</h4>
                <div className="skills-list">
                  {skillsAnalysis?.soft_skills?.length > 0 ? (
                    skillsAnalysis.soft_skills.map((skill, index) => (
                      <span key={index} className="skill-tag soft">{skill}</span>
                    ))
                  ) : (
                    <p className="empty-text">No soft skills listed</p>
                  )}
                </div>
              </div>

              <div className="skills-section">
                <h4>All Skills</h4>
                <div className="skills-list">
                  {candidateProfile.skills?.length > 0 ? (
                    candidateProfile.skills.map((skill, index) => (
                      <span key={index} className="skill-tag">{skill}</span>
                    ))
                  ) : (
                    <p className="empty-text">No skills listed</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}