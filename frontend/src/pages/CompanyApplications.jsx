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
      const jobsResponse = await axios.get(`${API_BASE_URL}/jobs`);
      const companyJobs = jobsResponse.data.jobs.filter(job => 
        job.company_email === email
      );
      setJobs(companyJobs);
      
      if (companyJobs.length > 0) {
        setSelectedJob(companyJobs[0]);
        fetchApplicationsForJob(companyJobs[0].id);
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
      // In real app, you would have an endpoint for this
      alert(`Status updated to: ${newStatus}\n\nIn a real application, this would update in the database.`);
      
      // Update local state
      setApplications(prev => prev.map(app => 
        app.id === applicationId ? { ...app, status: newStatus } : app
      ));
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const calculateMatchScore = (application) => {
    if (!selectedJob || !application.candidate_profile) return 0;
    
    const jobTags = selectedJob.tags || [];
    const candidateSkills = application.candidate_profile.skills || [];
    
    // Simple matching algorithm
    const matches = candidateSkills.filter(skill => 
      jobTags.some(tag => tag.toLowerCase().includes(skill.toLowerCase()) ||
                         skill.toLowerCase().includes(tag.toLowerCase()))
    );
    
    return jobTags.length > 0 ? Math.round((matches.length / jobTags.length) * 100) : 0;
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
            <h3>{stats.pending_review}</h3>
            <p>Pending Review</p>
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
                    📄 {applications.filter(a => a.job_id === job.id).length} applications
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
                  <span className="match-rate">
                    Avg Match: {calculateAverageMatch()}%
                  </span>
                </div>
              </div>

              <div className="applications-table">
                {applications.length === 0 ? (
                  <div className="no-applications">
                    <div className="empty-icon">📭</div>
                    <h3>No Applications Yet</h3>
                    <p>No one has applied for this job yet.</p>
                  </div>
                ) : (
                  <>
                    <div className="table-header">
                      <div className="table-row">
                        <div className="table-cell">Candidate</div>
                        <div className="table-cell">Match Score</div>
                        <div className="table-cell">Skills</div>
                        <div className="table-cell">Applied Date</div>
                        <div className="table-cell">Status</div>
                        <div className="table-cell">Actions</div>
                      </div>
                    </div>
                    
                    <div className="table-body">
                      {applications.map((application, index) => {
                        const matchScore = calculateMatchScore(application);
                        const profile = application.candidate_profile || {};
                        
                        return (
                          <div key={application.id || index} className="table-row application-row">
                            <div className="table-cell candidate-info">
                              <div className="candidate-avatar">
                                {profile.name ? profile.name.charAt(0).toUpperCase() : "C"}
                              </div>
                              <div>
                                <h4>{profile.name || "Candidate"}</h4>
                                <p className="candidate-email">{application.candidate_email}</p>
                              </div>
                            </div>
                            
                            <div className="table-cell">
                              <div className="match-score">
                                <div className="score-bar">
                                  <div 
                                    className="score-fill"
                                    style={{ width: `${matchScore}%` }}
                                  ></div>
                                </div>
                                <span className="score-text">{matchScore}%</span>
                              </div>
                            </div>
                            
                            <div className="table-cell">
                              <div className="skills-preview">
                                {(profile.skills || []).slice(0, 3).map((skill, i) => (
                                  <span key={i} className="skill-tag">{skill}</span>
                                ))}
                                {(profile.skills || []).length > 3 && (
                                  <span className="more-skills">+{(profile.skills || []).length - 3} more</span>
                                )}
                              </div>
                            </div>
                            
                            <div className="table-cell">
                              {new Date(application.applied_date).toLocaleDateString()}
                            </div>
                            
                            <div className="table-cell">
                              <select 
                                value={application.status || "applied"}
                                onChange={(e) => updateApplicationStatus(application.id, e.target.value)}
                                className="status-select"
                              >
                                <option value="applied">Applied</option>
                                <option value="reviewed">Under Review</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                              </select>
                            </div>
                            
                            <div className="table-cell">
                              <div className="action-buttons">
                                <button 
                                  className="view-profile-btn"
                                  onClick={() => alert(`Viewing profile of ${profile.name || application.candidate_email}`)}
                                >
                                  View Profile
                                </button>
                                <button 
                                  className="schedule-btn"
                                  onClick={() => alert(`Schedule interview with ${profile.name || application.candidate_email}`)}
                                >
                                  Schedule Interview
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
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
    </div>
  );

  function calculateAverageMatch() {
    if (applications.length === 0) return 0;
    
    const total = applications.reduce((sum, app) => {
      return sum + calculateMatchScore(app);
    }, 0);
    
    return Math.round(total / applications.length);
  }
}