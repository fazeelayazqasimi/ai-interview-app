import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import "./AnalyticsDashboard.css";

export default function AnalyticsDashboard() {
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    if (parsedUser.type === "candidate") {
      fetchCandidateAnalytics(parsedUser.email);
      fetchMatchedJobs(parsedUser.email);
    } else {
      fetchCompanyAnalytics(parsedUser.email);
    }
  }, [navigate]);

  const fetchCandidateAnalytics = async (email) => {
    try {
      const [analyticsRes, profileRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/analytics/candidate/${email}`),
        axios.get(`${API_BASE_URL}/profile/${email}`)
      ]);
      
      setAnalytics(analyticsRes.data);
      // You can use profileRes.data for more insights
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanyAnalytics = async (email) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/analytics/company/${email}`);
      setAnalytics(response.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchedJobs = async (email) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/match/${email}`);
      setMatchedJobs(response.data.matched_jobs || []);
    } catch (error) {
      console.error("Error fetching matched jobs:", error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  const isCandidate = user?.type === "candidate";

  return (
    <div className="analytics-dashboard">
      <div className="analytics-header">
        <h1>📊 Analytics Dashboard</h1>
        <p>Insights and performance metrics</p>
      </div>

      {isCandidate ? (
        <div className="candidate-analytics">
          {/* Stats Overview */}
          {analytics?.statistics && (
            <div className="stats-overview">
              <div className="stat-card large">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>{analytics.statistics.total_applications}</h3>
                  <p>Total Applications</p>
                  <div className="stat-trend">
                    <span className="trend-up">↑ 12%</span> from last month
                  </div>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-content">
                  <h3>{analytics.statistics.applied}</h3>
                  <p>Pending Review</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h3>{analytics.statistics.accepted}</h3>
                  <p>Accepted</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon">📈</div>
                <div className="stat-content">
                  <h3>{Math.round((analytics.statistics.accepted / analytics.statistics.total_applications) * 100) || 0}%</h3>
                  <p>Success Rate</p>
                </div>
              </div>
            </div>
          )}

          {/* Matched Jobs Section */}
          {matchedJobs.length > 0 && (
            <div className="matched-jobs-section">
              <h2>🎯 Best Job Matches</h2>
              <div className="matched-jobs-grid">
                {matchedJobs.slice(0, 4).map((job, index) => (
                  <div key={index} className="matched-job-card">
                    <div className="job-header">
                      <h3>{job.title}</h3>
                      <span className="match-badge">
                        {job.match_percentage}% Match
                      </span>
                    </div>
                    
                    <p className="company">{job.company_email}</p>
                    <p className="location">📍 {job.location}</p>
                    
                    <div className="matching-skills">
                      <p>Matching Skills:</p>
                      <div className="skills-list">
                        {job.matching_skills.slice(0, 3).map((skill, i) => (
                          <span key={i} className="skill">{skill}</span>
                        ))}
                      </div>
                    </div>
                    
                    <button 
                      className="apply-match-btn"
                      onClick={() => alert(`Applying for ${job.title}`)}
                    >
                      Quick Apply
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Application Timeline */}
          {analytics?.recent_applications && analytics.recent_applications.length > 0 && (
            <div className="timeline-section">
              <h2>📅 Recent Applications</h2>
              <div className="timeline">
                {analytics.recent_applications.map((app, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-date">
                      {new Date(app.applied_date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="timeline-content">
                      <h4>{app.job_details?.title || "Job Application"}</h4>
                      <p>{app.job_details?.company_email || "Company"}</p>
                      <span className={`status ${app.status}`}>{app.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="company-analytics">
          {/* Company Stats */}
          {analytics?.statistics && (
            <div className="company-stats-grid">
              <div className="company-stat-card large">
                <div className="stat-icon">🏢</div>
                <div className="stat-content">
                  <h3>{analytics.statistics.total_jobs}</h3>
                  <p>Total Jobs Posted</p>
                  <div className="stat-breakdown">
                    <span className="breakdown-item">
                      <strong>{analytics.statistics.open_jobs}</strong> Open
                    </span>
                    <span className="breakdown-item">
                      <strong>{analytics.statistics.closed_jobs}</strong> Closed
                    </span>
                  </div>
                </div>
              </div>

              <div className="company-stat-card">
                <div className="stat-icon">📄</div>
                <div className="stat-content">
                  <h3>{analytics.statistics.total_applications}</h3>
                  <p>Total Applications</p>
                </div>
              </div>

              <div className="company-stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-content">
                  <h3>{analytics.statistics.pending_review}</h3>
                  <p>Pending Review</p>
                </div>
              </div>

              <div className="company-stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-content">
                  <h3>
                    {analytics.statistics.total_jobs > 0 
                      ? Math.round(analytics.statistics.total_applications / analytics.statistics.total_jobs)
                      : 0}
                  </h3>
                  <p>Avg. Applications per Job</p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Applications Table */}
          {analytics?.recent_applications && analytics.recent_applications.length > 0 && (
            <div className="applications-table-section">
              <h2>📋 Recent Applications</h2>
              <div className="analytics-table">
                <div className="table-header">
                  <div className="table-row">
                    <div className="table-cell">Candidate</div>
                    <div className="table-cell">Job Title</div>
                    <div className="table-cell">Applied Date</div>
                    <div className="table-cell">Status</div>
                  </div>
                </div>
                
                <div className="table-body">
                  {analytics.recent_applications.map((app, index) => (
                    <div key={index} className="table-row">
                      <div className="table-cell">
                        {app.candidate_email}
                      </div>
                      <div className="table-cell">
                        {app.job_details?.title || "Unknown Job"}
                      </div>
                      <div className="table-cell">
                        {new Date(app.applied_date).toLocaleDateString()}
                      </div>
                      <div className="table-cell">
                        <span className={`status ${app.status}`}>{app.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recommendations */}
      <div className="recommendations-section">
        <h2>💡 Recommendations</h2>
        <div className="recommendations-grid">
          {isCandidate ? (
            <>
              <div className="recommendation-card">
                <h3>🎯 Improve Your Profile</h3>
                <p>Add more skills to increase your match rate by 40%</p>
                <button 
                  className="action-btn"
                  onClick={() => navigate("/profile-settings")}
                >
                  Update Profile
                </button>
              </div>
              
              <div className="recommendation-card">
                <h3>📝 Custom Applications</h3>
                <p>Personalize your applications to stand out</p>
                <button 
                  className="action-btn"
                  onClick={() => navigate("/job-listings")}
                >
                  Browse Jobs
                </button>
              </div>
              
              <div className="recommendation-card">
                <h3>🤖 Practice Interviews</h3>
                <p>Use AI Interview to prepare for real interviews</p>
                <button 
                  className="action-btn"
                  onClick={() => navigate("/candidate-dashboard")}
                >
                  Practice Now
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="recommendation-card">
                <h3>📋 Review Applications</h3>
                <p>You have {analytics?.statistics?.pending_review || 0} applications pending review</p>
                <button 
                  className="action-btn"
                  onClick={() => navigate("/company-applications")}
                >
                  Review Now
                </button>
              </div>
              
              <div className="recommendation-card">
                <h3>🏢 Post More Jobs</h3>
                <p>Increase your chances of finding the perfect candidate</p>
                <button 
                  className="action-btn"
                  onClick={() => navigate("/company-dashboard")}
                >
                  Post Job
                </button>
              </div>
              
              <div className="recommendation-card">
                <h3>📊 Optimize Job Descriptions</h3>
                <p>Use specific tags to get better matches</p>
                <button 
                  className="action-btn"
                  onClick={() => navigate("/company-dashboard")}
                >
                  Edit Jobs
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}