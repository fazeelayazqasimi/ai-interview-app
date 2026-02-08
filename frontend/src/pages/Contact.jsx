import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Contact.css";

export default function Contact() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "general"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const teamMembers = [
    {
      id: 1,
      name: "Laiba Mir",
      rollNumber: "2022F-BSE-326",
      email: "se22f-326@ssuet.edu.pk",
      role: "Frontend & UI/UX Developer",
      description: "Specialized in React development and user interface design"
    },
    {
      id: 2,
      name: "Ayesha Waheed",
      rollNumber: "2022F-BSE-308",
      email: "se22f-308@ssuet.edu.pk",
      role: "Backend Developer",
      description: "Focused on server-side logic and database architecture"
    },
    {
      id: 3,
      name: "Hamza Raza",
      rollNumber: "2022F-BSE-343",
      email: "se22f-343@ssuet.edu.pk",
      role: "AI/ML Engineer",
      description: "Responsible for AI interview algorithms and machine learning models"
    },
    {
      id: 4,
      name: "Wahaj Abbas",
      rollNumber: "2022F-BSE-162",
      email: "se22f-162@ssuet.edu.pk",
      role: "Project Manager & Full Stack",
      description: "Oversees project coordination and full-stack development"
    }
  ];

  const projectDetails = {
    title: "AI Interview Platform",
    university: "Sir Syed University of Engineering & Technology",
    department: "Department of Software Engineering",
    program: "Bachelor of Software Engineering",
    batch: "2022-2026",
    supervisor: "To be assigned",
    type: "Final Year Project (FYP)",
    description: "An AI-powered interview platform that revolutionizes the hiring process by automating initial screening, conducting intelligent interviews, and providing detailed analytics for both candidates and companies."
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setSubmitStatus({
      success: true,
      message: "Thank you for your message! We'll get back to you within 24 hours."
    });
    
    setIsSubmitting(false);
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
      category: "general"
    });
    
    // Auto-hide success message after 5 seconds
    setTimeout(() => {
      setSubmitStatus(null);
    }, 5000);
  };

  const handleQuickAction = (action) => {
    switch(action) {
      case 'demo':
        navigate('/demo-request');
        break;
      case 'support':
        setFormData(prev => ({ ...prev, category: 'technical', subject: 'Technical Support Request' }));
        break;
      case 'partnership':
        navigate('/partnership');
        break;
      case 'documentation':
        window.open('/api/docs', '_blank');
        break;
      default:
        break;
    }
  };

  const contactInfo = [
    {
      icon: "university",
      title: "University",
      value: projectDetails.university,
      subvalue: projectDetails.department
    },
    {
      icon: "graduation-cap",
      title: "Program",
      value: projectDetails.program,
      subvalue: `Batch: ${projectDetails.batch}`
    },
    {
      icon: "project",
      title: "Project Type",
      value: projectDetails.type,
      subvalue: `Supervisor: ${projectDetails.supervisor}`
    },
    {
      icon: "envelope",
      title: "General Inquiries",
      value: "ai-interview-fyp@ssuet.edu.pk",
      subvalue: "Response within 24 hours"
    }
  ];

  return (
    <div className="contact-container">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Contact <span className="gradient-text">AI Interview</span> Team
          </h1>
          <p className="hero-subtitle">
            Final Year Project • Department of Software Engineering • Sir Syed University of Engineering & Technology
          </p>
          <p className="hero-description">
            Have questions about our AI Interview platform? Interested in collaboration?
            Reach out to our team for inquiries, demos, or technical support.
          </p>
        </div>
      </section>

      {/* Project & Team Information */}
      <section className="project-team-section">
        <div className="section-header">
          <h2 className="section-title">Project & Team Information</h2>
          <p className="section-subtitle">Meet the team behind the AI Interview Platform</p>
        </div>

        <div className="project-details-card">
          <div className="project-overview">
            <h3>Project Overview</h3>
            <p>{projectDetails.description}</p>
            <div className="project-meta">
              <div className="meta-item">
                <span className="meta-label">University:</span>
                <span className="meta-value">{projectDetails.university}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Department:</span>
                <span className="meta-value">{projectDetails.department}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Program:</span>
                <span className="meta-value">{projectDetails.program}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">Batch:</span>
                <span className="meta-value">{projectDetails.batch}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Team Members Grid */}
        <div className="team-section">
          <h3 className="team-title">Development Team</h3>
          <div className="team-grid">
            {teamMembers.map(member => (
              <div key={member.id} className="team-card">
                <div className="member-avatar">
                  {member.name.charAt(0)}
                </div>
                <div className="member-info">
                  <h4 className="member-name">{member.name}</h4>
                  <div className="member-roll">{member.rollNumber}</div>
                  <div className="member-email">{member.email}</div>
                  <div className="member-role">{member.role}</div>
                  <p className="member-description">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions-section">
        <h3 className="actions-title">Quick Actions</h3>
        <div className="actions-grid">
          <button 
            className="action-card"
            onClick={() => handleQuickAction('demo')}
          >
            <div className="action-icon">🎯</div>
            <h4>Request Demo</h4>
            <p>Schedule a live demo of our platform</p>
          </button>
          
          <button 
            className="action-card"
            onClick={() => handleQuickAction('support')}
          >
            <div className="action-icon">🔧</div>
            <h4>Technical Support</h4>
            <p>Get help with technical issues</p>
          </button>
          
          <button 
            className="action-card"
            onClick={() => handleQuickAction('partnership')}
          >
            <div className="action-icon">🤝</div>
            <h4>Partnership</h4>
            <p>Collaborate with our team</p>
          </button>
          
          <button 
            className="action-card"
            onClick={() => handleQuickAction('documentation')}
          >
            <div className="action-icon">📚</div>
            <h4>Documentation</h4>
            <p>Access API docs & guides</p>
          </button>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="contact-form-section">
        <div className="contact-wrapper">
          {/* Contact Form */}
          <div className="contact-form-container">
            <div className="form-header">
              <h3>Send us a Message</h3>
              <p>Fill out the form below and we'll respond promptly</p>
            </div>
            
            {submitStatus && (
              <div className={`submit-status ${submitStatus.success ? 'success' : 'error'}`}>
                {submitStatus.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="general">General Inquiry</option>
                    <option value="technical">Technical Support</option>
                    <option value="academic">Academic Collaboration</option>
                    <option value="feedback">Feedback & Suggestions</option>
                    <option value="partnership">Partnership Opportunity</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Brief subject of your message"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Please provide details about your inquiry..."
                />
              </div>

              <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="contact-info-container">
            <div className="info-header">
              <h3>Contact Information</h3>
              <p>Get in touch with our team</p>
            </div>
            
            <div className="contact-info-grid">
              {contactInfo.map((info, index) => (
                <div key={index} className="info-card">
                  <div className="info-icon">
                    <i className={`fas fa-${info.icon}`}></i>
                  </div>
                  <div className="info-content">
                    <h4>{info.title}</h4>
                    <div className="info-value">{info.value}</div>
                    {info.subvalue && (
                      <div className="info-subvalue">{info.subvalue}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="university-info">
              <h4>University Address</h4>
              <p>
                Sir Syed University of Engineering & Technology<br />
                University Road, Karachi<br />
                Sindh, Pakistan<br />
                +92-21-111-000-432
              </p>
            </div>

            <div className="response-time">
              <div className="response-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="response-content">
                <h4>Response Time</h4>
                <p>We aim to respond to all inquiries within 24 hours during weekdays.</p>
              </div>
            </div>

            <div className="social-links">
              <h4>Connect With Us</h4>
              <div className="social-icons">
                <a href="#" className="social-icon">
                  <i className="fab fa-github"></i>
                </a>
                <a href="#" className="social-icon">
                  <i className="fab fa-linkedin"></i>
                </a>
                <a href="#" className="social-icon">
                  <i className="fab fa-researchgate"></i>
                </a>
                <a href="#" className="social-icon">
                  <i className="fab fa-google-scholar"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="contact-faq">
        <div className="faq-header">
          <h3>Frequently Asked Questions</h3>
          <button 
            className="view-all-faq"
            onClick={() => navigate('/faq')}
          >
            View All FAQs →
          </button>
        </div>
        
        <div className="faq-grid">
          <div className="faq-item">
            <h4>Is this a commercial product?</h4>
            <p>No, this is a Final Year Project (FYP) developed by Software Engineering students at SSUET for academic purposes.</p>
          </div>
          
          <div className="faq-item">
            <h4>Can I use this platform for my company?</h4>
            <p>Yes, the platform is fully functional and can be used for demonstration or evaluation purposes. Contact us for access.</p>
          </div>
          
          <div className="faq-item">
            <h4>Is the source code available?</h4>
            <p>The source code is available for academic review. Please contact us for access to the repository.</p>
          </div>
          
          <div className="faq-item">
            <h4>How can I contribute to the project?</h4>
            <p>We welcome academic collaborations and feedback. Use the contact form above to discuss potential contributions.</p>
          </div>
        </div>
      </section>

      {/* Academic Purpose Notice */}
      <div className="academic-notice">
        <div className="notice-icon">
          <i className="fas fa-graduation-cap"></i>
        </div>
        <div className="notice-content">
          <h4>Academic Project Notice</h4>
          <p>
            This platform has been developed as a Final Year Project (FYP) by Software Engineering students 
            at Sir Syed University of Engineering & Technology. While fully functional, it is primarily 
            intended for academic demonstration and research purposes.
          </p>
        </div>
      </div>
    </div>
  );
}