import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    companies: 1250,
    candidates: 8500,
    interviews: 24500,
    hires: 3200
  });
  const [activeTab, setActiveTab] = useState("candidate");
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [animationActive, setAnimationActive] = useState(false);

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Senior HR Manager",
      company: "TechNova Inc.",
      text: "Reduced our hiring time by 70% and found better quality candidates than traditional methods.",
      rating: 5
    },
    {
      name: "Michael Rodriguez",
      role: "Software Engineer",
      company: "Hired at Google",
      text: "The AI mock interviews prepared me perfectly for my FAANG interviews. Landed my dream job!",
      rating: 5
    },
    {
      name: "David Park",
      role: "CEO",
      company: "StartUpScale",
      text: "As a startup, we can't afford expensive recruiters. AI Interview gave us enterprise-level hiring at startup cost.",
      rating: 5
    },
    {
      name: "Priya Sharma",
      role: "Product Manager",
      company: "Hired at Amazon",
      text: "The behavioral analysis from AI interviews helped me understand my communication gaps and improve significantly.",
      rating: 5
    }
  ];

  const partners = [
    "Google", "Microsoft", "Amazon", "Meta", "Netflix", "Tesla", "Adobe", "Intel"
  ];

  const candidateFeatures = [
    {
      icon: "ai-interviewer",
      title: "AI Mock Interviews",
      description: "Practice with intelligent AI interviewers that simulate real technical and HR interviews.",
      benefits: ["Real-time feedback", "Technical question bank", "Behavioral analysis", "Performance tracking"]
    },
    {
      icon: "skill-analysis",
      title: "Skill Gap Analysis",
      description: "Identify your weak areas with detailed analytics and personalized improvement plans.",
      benefits: ["Technical skill assessment", "Communication evaluation", "Industry benchmarking", "Learning resources"]
    },
    {
      icon: "job-matching",
      title: "Smart Job Matching",
      description: "Get matched with ideal positions based on your skills, experience, and career goals.",
      benefits: ["Personalized job alerts", "Company culture fit", "Salary expectation match", "Growth opportunities"]
    }
  ];

  const companyFeatures = [
    {
      icon: "automated-screening",
      title: "Automated Screening",
      description: "AI-powered initial screening to filter candidates based on technical and soft skills.",
      benefits: ["Resume parsing", "Skill verification", "Cultural fit assessment", "Time saved: 80%"]
    },
    {
      icon: "automated-screening",
      title: "Hiring Analytics",
      description: "Comprehensive dashboard with insights on hiring funnel, candidate quality, and team performance.",
      benefits: ["Pipeline tracking", "Diversity metrics", "Time-to-hire analysis", "Cost-per-hire optimization"]
    },
    {
      icon: "interview-platform",
      title: "Integrated Platform",
      description: "End-to-end hiring platform from job posting to offer letter with AI-assisted interviews.",
      benefits: ["One-click scheduling", "Collaborative evaluation", "Candidate engagement", "Integration with ATS"]
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Create Profile",
      candidate: "Sign up and build your professional profile with skills, experience, and preferences.",
      company: "Register your company and set up hiring preferences, team structure, and interview process."
    },
    {
      step: 2,
      title: "AI Assessment",
      candidate: "Take AI-powered assessments to showcase your technical and soft skills.",
      company: "Post jobs and receive pre-screened candidates ranked by AI based on role requirements."
    },
    {
      step: 3,
      title: "Interview Phase",
      candidate: "Practice with AI mock interviews and get real-time feedback to improve performance.",
      company: "Conduct AI-assisted interviews with automated scoring and detailed candidate reports."
    },
    {
      step: 4,
      title: "Match & Connect",
      candidate: "Get matched with suitable opportunities and connect directly with hiring managers.",
      company: "Review top candidates, schedule final interviews, and make data-driven hiring decisions."
    }
  ];

  const statsData = [
    { label: "Companies Trust Us", value: stats.companies, suffix: "+" },
    { label: "Candidates Hired", value: stats.candidates, suffix: "+" },
    { label: "AI Interviews Conducted", value: stats.interviews, suffix: "+" },
    { label: "Successful Placements", value: stats.hires, suffix: "+" }
  ];

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Animate stats
    const interval = setInterval(() => {
      setStats(prev => ({
        companies: prev.companies + Math.floor(Math.random() * 5),
        candidates: prev.candidates + Math.floor(Math.random() * 25),
        interviews: prev.interviews + Math.floor(Math.random() * 50),
        hires: prev.hires + Math.floor(Math.random() * 10)
      }));
    }, 3000);

    // Auto-rotate testimonials
    const testimonialInterval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
    }, 6000);

    return () => {
      clearInterval(interval);
      clearInterval(testimonialInterval);
    };
  }, []);

  const handleGetStarted = () => {
    if (user) {
      navigate(user.type === "candidate" ? "/candidate-dashboard" : "/company-dashboard");
    } else {
      navigate("/signup");
    }
  };

  const handleLearnMore = () => {
    navigate("/features");
  };

  const handleContactSales = () => {
    navigate("/contact");
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-text">Botboss</span>
          </div>
          <h1 className="hero-title">
            Transform Your Hiring with 
            <span className="gradient-text"> Artificial Intelligence</span>
          </h1>
          <p className="hero-description">
            Revolutionizing recruitment through intelligent automation. 
            Companies find perfect candidates 5x faster. 
            Candidates ace interviews with AI-powered preparation.
          </p>
          <div className="hero-cta">
            <button 
              className="primary-button"
              onClick={handleGetStarted}
            >
              {user ? "Go to Dashboard" : "Start Free Trial"}
            </button>
            <button 
              className="secondary-button"
              onClick={handleLearnMore}
            >
              Learn More
            </button>
            <button 
              className="tertiary-button"
              onClick={handleContactSales}
            >
              Contact Team
            </button>
          </div>
          <div className="hero-stats">
            {statsData.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-value">{stat.value.toLocaleString()}{stat.suffix}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="hero-visual">
          <div className="dashboard-preview">
            <div className="dashboard-card analytics-card">
              <div className="card-header">Interview Analytics</div>
              <div className="card-content">
                <div className="metric">85%</div>
                <div className="metric-label">Completion Rate</div>
              </div>
            </div>
            <div className="dashboard-card candidate-card">
              <div className="card-header">Top Candidates</div>
              <div className="card-content">
                <div className="metric">4.8/5</div>
                <div className="metric-label">Average Score</div>
              </div>
            </div>
            <div className="dashboard-card ai-card">
              <div className="card-header">AI Assessment</div>
              <div className="card-content">
                <div className="metric">92%</div>
                <div className="metric-label">Accuracy</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="trusted-section">
        <div className="section-header">
          <h2 className="section-title">Trusted by Industry Leaders</h2>
          <p className="section-subtitle">Join thousands of companies revolutionizing their hiring</p>
        </div>
        <div className="partners-grid">
          {partners.map((partner, index) => (
            <div key={index} className="partner-logo">
              {partner}
            </div>
          ))}
        </div>
      </section>

      {/* Features Tabs */}
      <section className="features-section">
        <div className="section-header">
          <h2 className="section-title">Designed for Both Sides of Hiring</h2>
          <p className="section-subtitle">Comprehensive solutions for candidates and companies</p>
        </div>
        
        <div className="features-tabs">
          <div className="tab-header">
            <button 
              className={`tab-button ${activeTab === 'candidate' ? 'active' : ''}`}
              onClick={() => setActiveTab('candidate')}
            >
              For Candidates
            </button>
            <button 
              className={`tab-button ${activeTab === 'company' ? 'active' : ''}`}
              onClick={() => setActiveTab('company')}
            >
              For Companies
            </button>
          </div>
          
          <div className="tab-content">
            {activeTab === 'candidate' ? (
              <div className="features-grid">
                {candidateFeatures.map((feature, index) => (
                  <div key={index} className="feature-card">
                    <div className="feature-icon">
                      <div className={`icon-container ${feature.icon}`}></div>
                    </div>
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                    <ul className="feature-benefits">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="features-grid">
                {companyFeatures.map((feature, index) => (
                  <div key={index} className="feature-card">
                    <div className="feature-icon">
                      <div className={`icon-container ${feature.icon}`}></div>
                    </div>
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                    <ul className="feature-benefits">
                      {feature.benefits.map((benefit, idx) => (
                        <li key={idx}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="process-section">
        <div className="section-header">
          <h2 className="section-title">How AI Interview Works</h2>
          <p className="section-subtitle">Simple four-step process to better hiring outcomes</p>
        </div>
        
        <div className="process-steps">
          {howItWorks.map((step, index) => (
            <div key={index} className="process-step">
              <div className="step-number">{step.step}</div>
              <h3 className="step-title">{step.title}</h3>
              <div className="step-content">
                <div className="step-for">
                  <strong>For Candidates:</strong> {step.candidate}
                </div>
                <div className="step-for">
                  <strong>For Companies:</strong> {step.company}
                </div>
              </div>
              {index < howItWorks.length - 1 && (
                <div className="step-connector"></div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2 className="section-title">Success Stories</h2>
          <p className="section-subtitle">What our users say about AI Interview</p>
        </div>
        
        <div className="testimonials-container">
          <div className="testimonial-card">
            <div className="testimonial-rating">
              {'★'.repeat(testimonials[currentTestimonial].rating)}
            </div>
            <p className="testimonial-text">"{testimonials[currentTestimonial].text}"</p>
            <div className="testimonial-author">
              <div className="author-info">
                <div className="author-name">{testimonials[currentTestimonial].name}</div>
                <div className="author-role">{testimonials[currentTestimonial].role}</div>
                <div className="author-company">{testimonials[currentTestimonial].company}</div>
              </div>
            </div>
          </div>
          
          <div className="testimonial-navigation">
            {testimonials.map((_, index) => (
              <button
                key={index}
                className={`nav-dot ${index === currentTestimonial ? 'active' : ''}`}
                onClick={() => setCurrentTestimonial(index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="pricing-cta">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Transform Your Hiring?</h2>
          <p className="cta-subtitle">
            Join thousands of companies and candidates already using AI Interview. 
            Start with our free plan or upgrade for advanced features.
          </p>
          <div className="cta-buttons">
            <button 
              className="cta-primary"
              onClick={() => navigate("/pricing")}
            >
              View Pricing Plans
            </button>
            <button 
              className="cta-secondary"
              onClick={() => navigate("/signup")}
            >
              Sign Up Free
            </button>
          </div>
          <div className="cta-features">
            <div className="feature-item">✓ No credit card required</div>
            <div className="feature-item">✓ 14-day free trial</div>
            <div className="feature-item">✓ Cancel anytime</div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="faq-preview">
        <div className="section-header">
          <h2 className="section-title">Frequently Asked Questions</h2>
        </div>
        <div className="faq-grid">
          <div className="faq-item">
            <h3>How accurate is the AI interviewer?</h3>
            <p>Our AI achieves 92% accuracy in technical assessment and 88% in behavioral evaluation, validated against human expert ratings.</p>
          </div>
          <div className="faq-item">
            <h3>Is my data secure?</h3>
            <p>Yes, we use enterprise-grade encryption, GDPR compliance, and never share your data with third parties.</p>
          </div>
          <div className="faq-item">
            <h3>Can I integrate with existing ATS?</h3>
            <p>Yes, we offer integrations with popular ATS platforms like Greenhouse, Lever, and Workday.</p>
          </div>
          <div className="faq-item">
            <h3>How long does setup take?</h3>
            <p>Companies can be ready in under 30 minutes. Candidates can complete their profile in 10 minutes.</p>
          </div>
        </div>
            
      </section>
    </div>
  );
}