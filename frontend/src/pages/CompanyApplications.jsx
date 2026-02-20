import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import "./CompanyApplications.css";

export default function CompanyApplications() {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [viewingCandidate, setViewingCandidate] = useState(null);
  const [candidateInterviews, setCandidateInterviews] = useState([]);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
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
    fetchCompanyData(parsedUser.email);
  }, [navigate]);

  const fetchCompanyData = async (email) => {
    try {
      // Fetch company's jobs
      const jobsResponse = await axios.get(`${API_BASE_URL}/jobs/company/${email}`);
      setJobs(jobsResponse.data.jobs || []);
      
      if (jobsResponse.data.jobs && jobsResponse.data.jobs.length > 0) {
        setSelectedJob(jobsResponse.data.jobs[0]);
        fetchApplicationsForJob(jobsResponse.data.jobs[0].id);
      }
      
      // Fetch analytics
      const analyticsResponse = await axios.get(`${API_BASE_URL}/analytics/company/${email}`);
      setStats(analyticsResponse.data.statistics);
      
    } catch (error) {
      console.error("Error fetching company data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationsForJob = async (jobId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/applications/job/${jobId}`);
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setApplications([]);
    }
  };

  const handleJobSelect = (job) => {
    setSelectedJob(job);
    fetchApplicationsForJob(job.id);
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/applications/${applicationId}/status`,
        {
          application_id: applicationId,
          status: newStatus,
          updated_by: user.email,
          message: `Status changed to ${newStatus}`
        }
      );
      
      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
      
      alert(`Status updated to: ${newStatus}`);
      
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status. Please try again.");
    }
  };

  const calculateMatchScore = (application) => {
    if (!selectedJob || !application.candidate_profile) return 0;
    
    const jobTags = selectedJob.tags || [];
    const jobRequirements = selectedJob.requirements || [];
    const candidateSkills = application.candidate_profile.skills || [];
    
    const jobKeywords = [...jobTags, ...jobRequirements.join(" ").toLowerCase().split(/\s+/)];
    const candidateKeywords = candidateSkills.map(skill => skill.toLowerCase());
    
    const matches = candidateKeywords.filter(skill => 
      jobKeywords.some(keyword => 
        skill.includes(keyword) || keyword.includes(skill)
      )
    );
    
    return jobKeywords.length > 0 ? Math.round((matches.length / jobKeywords.length) * 100) : 0;
  };

  const viewCandidateDetails = async (application) => {
    setSelectedApplication(application);
    setViewingCandidate(application);
    
    try {
      // Fetch candidate's interviews
      const response = await axios.get(`${API_BASE_URL}/interviews/candidate/${application.candidate_email}`);
      setCandidateInterviews(response.data.interviews || []);
    } catch (error) {
      console.error("Error fetching candidate interviews:", error);
      setCandidateInterviews([]);
    }
    
    setShowInterviewModal(true);
  };

  const scheduleInterview = (application) => {
    const confirmSchedule = window.confirm(
      `Schedule interview for ${application.candidate_profile?.name || application.candidate_email}?\n\n` +
      `Job: ${selectedJob?.title}\n` +
      `Candidate will be notified about the interview.`
    );
    
    if (confirmSchedule) {
      updateApplicationStatus(application.id, "interview_scheduled");
      alert("Interview scheduled! The candidate will be notified.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "applied": return "#ff9900";
      case "reviewed": return "#0066ff";
      case "interview_scheduled": return "#9c27b0";
      case "interview_completed": return "#2196f3";
      case "accepted": return "#4caf50";
      case "rejected": return "#f44336";
      default: return "#666";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "applied": return "Applied";
      case "reviewed": return "Under Review";
      case "interview_scheduled": return "Interview Scheduled";
      case "interview_completed": return "Interview Completed";
      case "accepted": return "Accepted";
      case "rejected": return "Rejected";
      default: return status;
    }
  };

  const getPerformanceBadge = (performance) => {
    const performanceMap = {
      "Excellent": { color: "#4caf50", bg: "#e8f5e9" },
      "Good": { color: "#2196f3", bg: "#e3f2fd" },
      "Average": { color: "#ff9800", bg: "#fff3e0" },
      "Needs Improvement": { color: "#f44336", bg: "#ffebee" }
    };
    
    const config = performanceMap[performance] || { color: "#666", bg: "#f5f5f5" };
    
    return (
      <span className="performance-badge" style={{ 
        color: config.color, 
        background: config.bg,
        border: `1px solid ${config.color}`,
        padding: "4px 12px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: "600"
      }}>
        {performance}
      </span>
    );
  };

  const renderInterviewScore = (application) => {
    if (!application.latest_interview) return null;
    
    const interview = application.latest_interview;
    
    return (
      <div className="interview-score-display">
        <div className="score-header">
          <span className="score-icon">🎯</span>
          <span className="score-title">Interview Score</span>
        </div>
        <div className="score-details">
          <div className="score-item">
            <span>Score:</span>
            <strong>{interview.score}/{interview.max_score}</strong>
          </div>
          <div className="score-item">
            <span>Percentage:</span>
            <strong className="score-percentage">{interview.percentage}%</strong>
          </div>
          <div className="score-item">
            <span>Performance:</span>
            {getPerformanceBadge(interview.performance)}
          </div>
          <div className="score-item">
            <span>Completed:</span>
            <span>{new Date(interview.completed_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    );
  };

  const closeCandidateModal = () => {
    setShowInterviewModal(false);
    setViewingCandidate(null);
    setCandidateInterviews([]);
    setSelectedApplication(null);
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
    <div className="company-applications">
      <div className="company-header">
        <div>
          <h1>🏢 Candidate Applications</h1>
          <p>Review applications for your job postings</p>
        </div>
        <button 
          className="post-job-btn"
          onClick={() => navigate("/company-dashboard")}
        >
          ➕ Post New Job
        </button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="company-stats">
          <div className="company-stat-card">
            <h3>{stats.total_jobs}</h3>
            <p>Total Jobs</p>
          </div>
          <div className="company-stat-card">
            <h3>{stats.open_jobs}</h3>
            <p>Open Jobs</p>
          </div>
          <div className="company-stat-card">
            <h3>{stats.total_applications}</h3>
            <p>Total Applications</p>
          </div>
          <div className="company-stat-card">
            <h3>{stats.interview_completed}</h3>
            <p>Interviews Completed</p>
          </div>
        </div>
      )}

      <div className="applications-dashboard">
        {/* Job Selection Sidebar */}
        <div className="jobs-sidebar">
          <h3>📋 Your Job Postings</h3>
          <div className="jobs-list">
            {jobs.length === 0 ? (
              <div className="no-jobs">
                <p>No jobs posted yet</p>
                <button 
                  className="create-job-btn"
                  onClick={() => navigate("/company-dashboard")}
                >
                  Create First Job
                </button>
              </div>
            ) : (
              jobs.map(job => (
                <div 
                  key={job.id}
                  className={`job-item ${selectedJob?.id === job.id ? 'active' : ''}`}
                  onClick={() => handleJobSelect(job)}
                >
                  <h4>{job.title}</h4>
                  <div className="job-meta">
                    <span className="location">📍 {job.location}</span>
                    <span className={`status ${job.status}`}>{job.status}</span>
                  </div>
                  <p className="applications-count">
                    📄 {applications.length} applications
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Applications Main Content */}
        <div className="applications-main">
          {selectedJob ? (
            <>
              <div className="selected-job-header">
                <div>
                  <h2>{selectedJob.title}</h2>
                  <p className="job-description">{selectedJob.description.substring(0, 100)}...</p>
                  <div className="job-tags">
                    {selectedJob.tags && selectedJob.tags.map((tag, index) => (
                      <span key={index} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="job-stats">
                  <span className="applications-count">
                    {applications.length} Applications
                  </span>
                  <span className="interview-stats">
                    🎯 {applications.filter(app => app.status === "interview_completed").length} Interviews Completed
                  </span>
                </div>
              </div>

              <div className="applications-table-container">
                {applications.length === 0 ? (
                  <div className="no-applications">
                    <div className="empty-icon">📭</div>
                    <h3>No Applications Yet</h3>
                    <p>No one has applied for this job yet.</p>
                  </div>
                ) : (
                  <table className="applications-table">
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Match Score</th>
                        <th>Skills</th>
                        <th>Applied Date</th>
                        <th>Status</th>
                        <th>Interview Score</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((application, index) => {
                        const matchScore = calculateMatchScore(application);
                        const profile = application.candidate_profile || {};
                        const hasInterview = application.latest_interview;
                        
                        return (
                          <tr key={application.id || index} className="application-row">
                            <td className="candidate-info">
                              <div className="candidate-avatar">
                                {profile.name ? profile.name.charAt(0).toUpperCase() : "C"}
                              </div>
                              <div>
                                <h4>{profile.name || "Candidate"}</h4>
                                <p className="candidate-email">{application.candidate_email}</p>
                              </div>
                            </td>
                            
                            <td>
                              <div className="match-score">
                                <div className="score-bar">
                                  <div 
                                    className="score-fill"
                                    style={{ width: `${matchScore}%` }}
                                  ></div>
                                </div>
                                <span className="score-text">{matchScore}%</span>
                              </div>
                            </td>
                            
                            <td>
                              <div className="skills-preview">
                                {(profile.skills || []).slice(0, 3).map((skill, i) => (
                                  <span key={i} className="skill-tag">{skill}</span>
                                ))}
                                {(profile.skills || []).length > 3 && (
                                  <span className="more-skills">+{(profile.skills || []).length - 3} more</span>
                                )}
                              </div>
                            </td>
                            
                            <td>
                              {new Date(application.applied_date).toLocaleDateString()}
                            </td>
                            
                            <td>
                              <div className="status-container">
                                <select 
                                  value={application.status || "applied"}
                                  onChange={(e) => updateApplicationStatus(application.id, e.target.value)}
                                  className="status-select"
                                  style={{ borderColor: getStatusColor(application.status) }}
                                >
                                  <option value="applied">Applied</option>
                                  <option value="reviewed">Under Review</option>
                                  <option value="interview_scheduled">Interview Scheduled</option>
                                  <option value="interview_completed">Interview Completed</option>
                                  <option value="accepted">Accepted</option>
                                  <option value="rejected">Rejected</option>
                                </select>
                                <span 
                                  className="status-indicator"
                                  style={{ background: getStatusColor(application.status) }}
                                ></span>
                              </div>
                            </td>
                            
                            <td>
                              {hasInterview ? (
                                <div className="interview-score-preview">
                                  <div className="score-circle-small">
                                    <span className="score-percent-small">
                                      {application.latest_interview.percentage}%
                                    </span>
                                  </div>
                                  <span className="performance-small">
                                    {application.latest_interview.performance}
                                  </span>
                                </div>
                              ) : (
                                <span className="no-interview">No Interview</span>
                              )}
                            </td>
                            
                            <td>
                              <div className="action-buttons">
                                <button 
                                  className="view-profile-btn"
                                  onClick={() => viewCandidateDetails(application)}
                                >
                                  View Details
                                </button>
                                {application.status === "reviewed" && (
                                  <button 
                                    className="schedule-btn"
                                    onClick={() => scheduleInterview(application)}
                                  >
                                    Schedule Interview
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          ) : (
            <div className="no-job-selected">
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>Select a Job</h3>
                <p>Choose a job posting from the left to view applications</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Candidate Details Modal */}
      {showInterviewModal && viewingCandidate && (
        <div className="candidate-modal-overlay">
          <div className="candidate-modal">
            <div className="modal-header">
              <h2>Candidate Details</h2>
              <button className="close-modal" onClick={closeCandidateModal}>✕</button>
            </div>
            
            <div className="modal-content">
              <div className="candidate-profile">
                <div className="profile-header">
                  <div className="profile-avatar">
                    {viewingCandidate.candidate_profile?.name?.charAt(0).toUpperCase() || "C"}
                  </div>
                  <div>
                    <h3>{viewingCandidate.candidate_profile?.name || "Candidate"}</h3>
                    <p className="profile-email">{viewingCandidate.candidate_email}</p>
                    <p className="profile-status">
                      Status: <span style={{ color: getStatusColor(viewingCandidate.status) }}>
                        {getStatusLabel(viewingCandidate.status)}
                      </span>
                    </p>
                    <p className="match-score-display">
                      Match Score: <strong>{calculateMatchScore(viewingCandidate)}%</strong>
                    </p>
                  </div>
                </div>
                
                <div className="profile-details">
                  <div className="detail-section">
                    <h4>📝 Cover Letter</h4>
                    <p className="cover-letter">
                      {viewingCandidate.cover_letter || "No cover letter provided."}
                    </p>
                  </div>
                  
                  <div className="detail-section">
                    <h4>🛠️ Skills</h4>
                    <div className="skills-list">
                      {(viewingCandidate.candidate_profile?.skills || []).map((skill, index) => (
                        <span key={index} className="skill-tag-large">{skill}</span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="detail-section">
                    <h4>📊 Application Info</h4>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Applied Date:</span>
                        <span className="info-value">
                          {new Date(viewingCandidate.applied_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Job:</span>
                        <span className="info-value">{selectedJob?.title}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Interview History */}
              {candidateInterviews.length > 0 ? (
                <div className="interview-history">
                  <h3>🎯 Interview History</h3>
                  <div className="interviews-list">
                    {candidateInterviews.map((interview, index) => (
                      <div key={index} className="interview-card">
                        <div className="interview-header">
                          <span className="interview-title">Interview #{index + 1}</span>
                          <span className="interview-date">
                            {new Date(interview.completed_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="interview-scores">
                          <div className="score-item-modal">
                            <span>Score:</span>
                            <strong>{interview.score}/{interview.max_score}</strong>
                          </div>
                          <div className="score-item-modal">
                            <span>Percentage:</span>
                            <strong className="score-percentage-modal">
                              {interview.percentage}%
                            </strong>
                          </div>
                          <div className="score-item-modal">
                            <span>Performance:</span>
                            {getPerformanceBadge(interview.performance)}
                          </div>
                          <div className="score-item-modal">
                            <span>Job:</span>
                            <span>{interview.job_title}</span>
                          </div>
                        </div>
                        {interview.answers && interview.answers.slice(0, 2).map((answer, idx) => (
                          <div key={idx} className="answer-preview">
                            <p><strong>Q:</strong> {answer.question?.substring(0, 80)}...</p>
                            <p><strong>A:</strong> {answer.answer?.substring(0, 100)}...</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="no-interviews">
                  <p>No interview history available for this candidate.</p>
                </div>
              )}
            </div>
            
            <div className="modal-actions">
              <button 
                className="update-status-btn"
                onClick={() => {
                  const newStatus = prompt("Enter new status (applied, reviewed, interview_scheduled, interview_completed, accepted, rejected):", viewingCandidate.status);
                  if (newStatus && ["applied", "reviewed", "interview_scheduled", "interview_completed", "accepted", "rejected"].includes(newStatus)) {
                    updateApplicationStatus(viewingCandidate.id, newStatus);
                    closeCandidateModal();
                  }
                }}
              >
                Update Status
              </button>
              {viewingCandidate.status === "reviewed" && (
                <button 
                  className="schedule-modal-btn"
                  onClick={() => scheduleInterview(viewingCandidate)}
                >
                  Schedule Interview
                </button>
              )}
              <button 
                className="close-btn"
                onClick={closeCandidateModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}