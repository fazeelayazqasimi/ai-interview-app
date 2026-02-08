import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import "./CompanyDashboard.css";

export default function CompanyDashboard() {
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [newJob, setNewJob] = useState({
    title: "",
    description: "",
    requirements: "",
    location: "Remote",
    salary: "",
    tags: "",
    experience_level: "Mid-level"
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
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
    fetchCompanyJobs(parsedUser.email);
  }, [navigate]);

  const fetchCompanyJobs = async (email) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs/company/${email}`);
      console.log("Company jobs:", response.data);
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error("Error fetching company jobs:", error);
      // Fallback to localStorage
      const savedJobs = JSON.parse(localStorage.getItem("companyJobs") || "[]");
      setJobs(savedJobs);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  const handlePostJob = async () => {
    if (!newJob.title.trim() || !newJob.description.trim()) {
      setMessage("Please fill in job title and description");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const jobData = {
        title: newJob.title,
        description: newJob.description,
        requirements: newJob.requirements.split('\n').filter(req => req.trim()),
        location: newJob.location,
        salary: newJob.salary,
        tags: newJob.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        company_email: user.email,
        experience_level: newJob.experience_level
      };

      console.log("Posting job:", jobData);

      const response = await axios.post(`${API_BASE_URL}/jobs`, jobData);
      
      setMessage("Job posted successfully!");
      alert(response.data.message);
      
      // Clear form
      setNewJob({
        title: "",
        description: "",
        requirements: "",
        location: "Remote",
        salary: "",
        tags: "",
        experience_level: "Mid-level"
      });
      
      // Refresh jobs list
      fetchCompanyJobs(user.email);
      
      // Also save to localStorage as backup
      const savedJobs = JSON.parse(localStorage.getItem("companyJobs") || "[]");
      savedJobs.push(response.data.job);
      localStorage.setItem("companyJobs", JSON.stringify(savedJobs));

    } catch (error) {
      console.error("Error posting job:", error);
      setMessage(error.response?.data?.detail || "Failed to post job");
      alert("Failed to post job: " + (error.response?.data?.detail || "Please try again"));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("Are you sure you want to delete this job?")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/jobs/${jobId}`);
      
      // Update local state
      const updatedJobs = jobs.filter(job => job.id !== jobId);
      setJobs(updatedJobs);
      
      // Update localStorage
      localStorage.setItem("companyJobs", JSON.stringify(updatedJobs));
      
      alert("Job deleted successfully!");
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete job");
    }
  };

  if (!user) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="company-dashboard">
      <div className="dashboard-header">
        <div className="user-info">
          <h2>🏢 {user.name || user.email}</h2>
          <p className="user-email">{user.email}</p>
          <p className="user-type">Company Dashboard</p>
        </div>
        <div className="header-actions">
          <button 
            className="action-btn view-applications"
            onClick={() => navigate("/company-applications")}
          >
            👥 View Applications
          </button>
          <button 
            className="action-btn analytics"
            onClick={() => navigate("/analytics")}
          >
            📊 Analytics
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Post Job Form */}
        <div className="post-job-section">
          <h3>📋 Post New Job</h3>
          
          {message && (
            <div className={`message ${message.includes("success") ? "success" : "error"}`}>
              {message}
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label>Job Title *</label>
              <input
                type="text"
                placeholder="e.g., Senior Frontend Developer"
                value={newJob.title}
                onChange={(e) => setNewJob({...newJob, title: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <select
                value={newJob.location}
                onChange={(e) => setNewJob({...newJob, location: e.target.value})}
              >
                <option value="Remote">Remote</option>
                <option value="On-site">On-site</option>
                <option value="Hybrid">Hybrid</option>
                <option value="New York">New York</option>
                <option value="San Francisco">San Francisco</option>
                <option value="London">London</option>
                <option value="Bangalore">Bangalore</option>
              </select>
            </div>

            <div className="form-group">
              <label>Salary Range</label>
              <input
                type="text"
                placeholder="e.g., $80,000 - $120,000"
                value={newJob.salary}
                onChange={(e) => setNewJob({...newJob, salary: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>Experience Level</label>
              <select
                value={newJob.experience_level}
                onChange={(e) => setNewJob({...newJob, experience_level: e.target.value})}
              >
                <option value="Entry-level">Entry-level</option>
                <option value="Mid-level">Mid-level</option>
                <option value="Senior">Senior</option>
                <option value="Lead">Lead</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Job Description *</label>
            <textarea
              placeholder="Describe the job responsibilities, requirements, and benefits..."
              value={newJob.description}
              onChange={(e) => setNewJob({...newJob, description: e.target.value})}
              rows={5}
            />
          </div>

          <div className="form-group full-width">
            <label>Requirements (one per line) *</label>
            <textarea
              placeholder="React\nJavaScript\nTypeScript\nCSS\nHTML"
              value={newJob.requirements}
              onChange={(e) => setNewJob({...newJob, requirements: e.target.value})}
              rows={4}
            />
          </div>

          <div className="form-group full-width">
            <label>Tags (comma separated)</label>
            <input
              type="text"
              placeholder="React, JavaScript, Frontend, UI/UX"
              value={newJob.tags}
              onChange={(e) => setNewJob({...newJob, tags: e.target.value})}
            />
          </div>

          <button 
            className="post-job-btn"
            onClick={handlePostJob}
            disabled={loading}
          >
            {loading ? "Posting Job..." : "Post Job"}
          </button>
        </div>

        {/* Posted Jobs List */}
        <div className="posted-jobs-section">
          <div className="section-header">
            <h3>💼 Posted Jobs ({jobs.length})</h3>
            <span className="section-subtitle">Manage your job postings</span>
          </div>

          <div className="jobs-list">
            {jobs.length === 0 ? (
              <div className="no-jobs">
                <div className="empty-icon">📋</div>
                <h4>No jobs posted yet</h4>
                <p>Post your first job above to get started!</p>
              </div>
            ) : (
              jobs.map(job => (
                <div key={job.id} className="job-card">
                  <div className="job-card-header">
                    <div>
                      <h4>{job.title}</h4>
                      <div className="job-meta">
                        <span className="location">📍 {job.location}</span>
                        <span className="salary">{job.salary || "Salary not specified"}</span>
                        <span className={`status ${job.status}`}>{job.status}</span>
                      </div>
                    </div>
                    <button 
                      className="delete-job-btn"
                      onClick={() => handleDeleteJob(job.id)}
                      title="Delete job"
                    >
                      🗑️
                    </button>
                  </div>
                  
                  <p className="job-description">
                    {job.description.substring(0, 150)}...
                  </p>
                  
                  {job.tags && job.tags.length > 0 && (
                    <div className="job-tags">
                      {job.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="tag">{tag}</span>
                      ))}
                    </div>
                  )}
                  
                  <div className="job-stats">
                    <span className="applications-count">
                      📄 0 applications
                    </span>
                    <span className="job-date">
                      Posted: {new Date(job.created_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}