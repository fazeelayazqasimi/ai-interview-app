import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import "./JobListings.css";

export default function JobListings() {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Load jobs
    fetchJobs();
  }, []);

  useEffect(() => {
    // Filter jobs based on search term and location
    const filtered = jobs.filter(job => {
      const matchesSearch = !searchTerm || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.tags && job.tags.some(tag => 
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      
      const matchesLocation = !locationFilter || 
        (job.location && job.location.toLowerCase().includes(locationFilter.toLowerCase()));
      
      return matchesSearch && matchesLocation;
    });
    
    setFilteredJobs(filtered);
  }, [searchTerm, locationFilter, jobs]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/jobs`);
      console.log("Jobs response:", response.data);
      setJobs(response.data.jobs || []);
      setFilteredJobs(response.data.jobs || []);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      // Fallback to sample data if API fails
      const sampleJobs = [
        {
          id: "1",
          title: "Frontend Developer",
          description: "Build amazing user interfaces with React and TypeScript",
          requirements: ["React", "JavaScript", "CSS", "HTML"],
          location: "Remote",
          salary: "$80,000 - $120,000",
          tags: ["React", "JavaScript", "Frontend"],
          company_email: "tech@example.com",
          company_name: "Tech Corp",
          status: "open",
          created_date: new Date().toISOString()
        },
        {
          id: "2",
          title: "Backend Developer",
          description: "Develop scalable APIs and microservices",
          requirements: ["Node.js", "Python", "SQL", "AWS"],
          location: "New York",
          salary: "$90,000 - $130,000",
          tags: ["Node.js", "Python", "Backend"],
          company_email: "backend@example.com",
          company_name: "Backend Systems",
          status: "open",
          created_date: new Date().toISOString()
        }
      ];
      setJobs(sampleJobs);
      setFilteredJobs(sampleJobs);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (job) => {
    if (!user) {
      alert("Please login to apply for jobs");
      navigate("/login");
      return;
    }

    if (user.type !== "candidate") {
      alert("Only candidates can apply for jobs");
      return;
    }

    try {
      const application = {
        job_id: job.id,
        candidate_email: user.email,
        cover_letter: `I'm interested in the ${job.title} position at ${job.company_name || job.company_email}`
      };

      const response = await axios.post(`${API_BASE_URL}/apply`, application);
      
      alert(response.data.message || "Application submitted successfully!");
      
      // Close modal if open
      setSelectedJob(null);
      
    } catch (error) {
      console.error("Application error:", error);
      alert(error.response?.data?.detail || "Failed to apply. Please try again.");
    }
  };

  const handleSaveJob = (job) => {
    // Save to localStorage
    const savedJobs = JSON.parse(localStorage.getItem("savedJobs") || "[]");
    
    // Check if already saved
    if (savedJobs.some(savedJob => savedJob.id === job.id)) {
      alert("Job already saved!");
      return;
    }
    
    savedJobs.push(job);
    localStorage.setItem("savedJobs", JSON.stringify(savedJobs));
    alert("Job saved to your list!");
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
      return "Recently";
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="job-listings">
      <div className="job-header">
        <h1>💼 Available Jobs</h1>
        <p>Find your dream job and apply with one click</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="search-filter-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search jobs by title, skills, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <div className="filter-box">
          <input
            type="text"
            placeholder="Filter by location..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="filter-input"
          />
          <span className="filter-icon">
</span>
        </div>
        
        <button className="refresh-btn" onClick={fetchJobs}>
          🔄 Refresh
        </button>
      </div>

      <div className="job-stats">
        <span className="job-count">
          {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'} found
        </span>
        {user?.type === "candidate" && (
          <button 
            className="view-saved-btn"
            onClick={() => alert("Saved jobs feature coming soon!")}
          >
             View Saved Jobs
          </button>
        )}
      </div>

      {/* Jobs Grid */}
      <div className="jobs-grid">
        {filteredJobs.length === 0 ? (
          <div className="no-jobs">
            <div className="empty-icon">📭</div>
            <h3>No jobs found</h3>
            <p>Try different search terms or check back later</p>
            <button className="clear-filters-btn" onClick={() => {
              setSearchTerm("");
              setLocationFilter("");
            }}>
              Clear Filters
            </button>
          </div>
        ) : (
          filteredJobs.map(job => (
            <div key={job.id} className="job-listing-card">
              <div className="job-card-header">
                <div>
                  <h3>{job.title}</h3>
                  <div className="job-meta">
                    <span className="company-name">
                      {job.company_name || job.company_email || "Company"}
                    </span>
                    <span className="job-date">
                      
 {formatDate(job.created_date)}
                    </span>
                  </div>
                </div>
                <button 
                  className="save-job-btn"
                  onClick={() => handleSaveJob(job)}
                  title="Save job"
                >
                  
                </button>
              </div>

              <div className="job-details">
                <div className="detail-item">
                  <span className="detail-label">
 Location:</span>
                  <span className="detail-value">{job.location || "Not specified"}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">
 Salary:</span>
                  <span className="detail-value">{job.salary || "Competitive"}</span>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">
 Experience:</span>
                  <span className="detail-value">{job.experience_level || "Mid-level"}</span>
                </div>
              </div>

              <p className="job-description">
                {job.description.length > 120 
                  ? `${job.description.substring(0, 120)}...` 
                  : job.description}
              </p>

              {job.tags && job.tags.length > 0 && (
                <div className="job-tags">
                  {job.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                  {job.tags.length > 3 && (
                    <span className="more-tags">+{job.tags.length - 3} more</span>
                  )}
                </div>
              )}

              <div className="job-actions">
                <button 
                  className="view-details-btn"
                  onClick={() => setSelectedJob(job)}
                >
                  View Details
                </button>
                <button 
                  className="apply-btn"
                  onClick={() => handleApply(job)}
                  disabled={user?.type === "company"}
                >
                  {user?.type === "company" ? "Post Job" : "Apply Now"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedJob(null)}>
              ✕
            </button>
            
            <div className="modal-header">
              <h2>{selectedJob.title}</h2>
              <div className="modal-company">
                <span className="company-badge">
                  {selectedJob.company_name || selectedJob.company_email}
                </span>
                <span className="job-status">{selectedJob.status}</span>
              </div>
            </div>

            <div className="modal-info-grid">
              <div className="info-item">
                <span className="info-label">
 Location:</span>
                <span className="info-value">{selectedJob.location}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">
 Salary:</span>
                <span className="info-value">{selectedJob.salary || "Not specified"}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">
 Posted:</span>
                <span className="info-value">{formatDate(selectedJob.created_date)}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">
 Experience:</span>
                <span className="info-value">{selectedJob.experience_level || "Mid-level"}</span>
              </div>
            </div>

            <div className="modal-section">
              <h3>📝 Description</h3>
              <p className="modal-description">{selectedJob.description}</p>
            </div>

            <div className="modal-section">
              <h3>✅ Requirements</h3>
              <ul className="requirements-list">
                {selectedJob.requirements && selectedJob.requirements.length > 0 ? (
                  selectedJob.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))
                ) : (
                  <li>No specific requirements listed</li>
                )}
              </ul>
            </div>

            {selectedJob.tags && selectedJob.tags.length > 0 && (
              <div className="modal-section">
                <h3>🏷️ Tags</h3>
                <div className="modal-tags">
                  {selectedJob.tags.map((tag, index) => (
                    <span key={index} className="modal-tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button 
                className="modal-save-btn"
                onClick={() => {
                  handleSaveJob(selectedJob);
                  setSelectedJob(null);
                }}
              >
                 Save Job
              </button>
              <button 
                className="modal-apply-btn"
                onClick={() => {
                  handleApply(selectedJob);
                  setSelectedJob(null);
                }}
                disabled={user?.type === "company"}
              >
                {user?.type === "company" ? "Manage Job" : "Apply Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}