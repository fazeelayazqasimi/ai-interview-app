import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import "./ProfileSettings.css";

export default function ProfileSettings() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    skills: "",
    experience: "",
    education: "",
    bio: "",
    resume_url: ""
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
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
    fetchProfile(parsedUser.email);
  }, [navigate]);

  const fetchProfile = async (email) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/profile/${email}`);
      
      if (response.data.profile) {
        const profileData = response.data.profile;
        setProfile({
          name: profileData.name || "",
          email: profileData.email || email,
          skills: Array.isArray(profileData.skills) ? profileData.skills.join(", ") : "",
          experience: profileData.experience || "",
          education: profileData.education || "",
          bio: profileData.bio || "",
          resume_url: profileData.resume_url || ""
        });
      } else {
        setProfile(prev => ({
          ...prev,
          email: email,
          name: user?.name || ""
        }));
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setMessage("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!profile.name.trim()) {
      setMessage("Name is required");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const profileData = {
        ...profile,
        skills: profile.skills.split(",").map(skill => skill.trim()).filter(skill => skill),
        email: user.email
      };

      await axios.post(`${API_BASE_URL}/profile`, profileData);
      
      setMessage("Profile saved successfully!");
      
      // Update local storage
      const updatedUser = {
        ...user,
        name: profileData.name
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setTimeout(() => {
        navigate("/candidate-dashboard");
      }, 1500);

    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-settings">
      <div className="profile-header">
        <h1>👤 Profile Settings</h1>
        <p>Complete your profile to get better job matches</p>
      </div>

      <div className="profile-container">
        <div className="profile-card">
          <form onSubmit={handleSubmit}>
            {message && (
              <div className={`message ${message.includes("success") ? "success" : "error"}`}>
                {message}
              </div>
            )}

            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="disabled-input"
                />
                <small className="hint">Email cannot be changed</small>
              </div>
            </div>

            <div className="form-section">
              <h3>Professional Details</h3>
              
              <div className="form-group">
                <label>Skills *</label>
                <input
                  type="text"
                  name="skills"
                  value={profile.skills}
                  onChange={handleChange}
                  placeholder="e.g., React, Node.js, Python, SQL (comma separated)"
                  required
                />
                <small className="hint">List your skills separated by commas</small>
              </div>

              <div className="form-group">
                <label>Experience *</label>
                <textarea
                  name="experience"
                  value={profile.experience}
                  onChange={handleChange}
                  placeholder="Describe your work experience, projects, achievements..."
                  rows={4}
                  required
                />
                <small className="hint">Minimum 2-3 years experience recommended</small>
              </div>

              <div className="form-group">
                <label>Education *</label>
                <textarea
                  name="education"
                  value={profile.education}
                  onChange={handleChange}
                  placeholder="Your educational background, degrees, certifications..."
                  rows={3}
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Additional Information</h3>
              
              <div className="form-group">
                <label>Bio / Summary</label>
                <textarea
                  name="bio"
                  value={profile.bio}
                  onChange={handleChange}
                  placeholder="Brief introduction about yourself..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Resume URL (Optional)</label>
                <input
                  type="url"
                  name="resume_url"
                  value={profile.resume_url}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/your-resume"
                />
                <small className="hint">Link to your resume/CV</small>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={() => navigate("/candidate-dashboard")}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="save-btn"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </div>

        <div className="profile-sidebar">
          <div className="sidebar-card">
            <h3>💡 Tips for Better Profile</h3>
            <ul className="tips-list">
              <li>✅ Be specific with your skills</li>
              <li>✅ Quantify your achievements</li>
              <li>✅ Include relevant keywords</li>
              <li>✅ Update your profile regularly</li>
              <li>✅ Add certifications if any</li>
            </ul>
          </div>

          <div className="sidebar-card">
            <h3>📊 Profile Strength</h3>
            <div className="strength-meter">
              <div className="meter-bar">
                <div 
                  className="meter-fill"
                  style={{ width: `${calculateProfileStrength()}%` }}
                ></div>
              </div>
              <span className="strength-text">
                {calculateProfileStrength()}% Complete
              </span>
            </div>
            
            <div className="strength-checklist">
              <p>✅ Name: {profile.name ? "Added" : "Missing"}</p>
              <p>✅ Skills: {profile.skills ? "Added" : "Missing"}</p>
              <p>✅ Experience: {profile.experience ? "Added" : "Missing"}</p>
              <p>✅ Education: {profile.education ? "Added" : "Missing"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function calculateProfileStrength() {
    let score = 0;
    if (profile.name.trim()) score += 25;
    if (profile.skills.trim()) score += 25;
    if (profile.experience.trim()) score += 25;
    if (profile.education.trim()) score += 25;
    return score;
  }
}