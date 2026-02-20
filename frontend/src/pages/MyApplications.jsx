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
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const [currentInterview, setCurrentInterview] = useState(null);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [interviewScore, setInterviewScore] = useState(null);
  const [interviewInProgress, setInterviewInProgress] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes in seconds
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

  // Timer for interview
  useEffect(() => {
    let timer;
    if (interviewInProgress && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      handleInterviewComplete();
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [interviewInProgress, timeRemaining]);

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

  // Interview Questions based on job role
  const getInterviewQuestions = (jobTitle) => {
    const questionsByRole = {
      "developer": [
        {
          id: 1,
          question: "Explain the difference between let, const, and var in JavaScript.",
          type: "coding",
          difficulty: "easy",
          maxScore: 10,
          keywords: ["scope", "hoisting", "block", "reassign"]
        },
        {
          id: 2,
          question: "What is React's virtual DOM and how does it improve performance?",
          type: "conceptual",
          difficulty: "medium",
          maxScore: 15,
          keywords: ["virtual", "dom", "reconciliation", "performance"]
        },
        {
          id: 3,
          question: "Write a function to reverse a string in JavaScript.",
          type: "coding",
          difficulty: "easy",
          maxScore: 10,
          keywords: ["reverse", "string", "algorithm"]
        },
        {
          id: 4,
          question: "Explain RESTful API principles and HTTP methods.",
          type: "conceptual",
          difficulty: "medium",
          maxScore: 15,
          keywords: ["rest", "api", "http", "methods"]
        },
        {
          id: 5,
          question: "How would you optimize a slow React component?",
          type: "problem-solving",
          difficulty: "hard",
          maxScore: 20,
          keywords: ["optimization", "memo", "performance", "rendering"]
        },
        {
          id: 6,
          question: "What are closures in JavaScript? Provide an example.",
          type: "coding",
          difficulty: "medium",
          maxScore: 15,
          keywords: ["closure", "scope", "function", "lexical"]
        },
        {
          id: 7,
          question: "Explain the concept of 'state' in React and how it differs from props.",
          type: "conceptual",
          difficulty: "easy",
          maxScore: 10,
          keywords: ["state", "props", "component", "update"]
        },
        {
          id: 8,
          question: "How does async/await work in JavaScript?",
          type: "conceptual",
          difficulty: "medium",
          maxScore: 15,
          keywords: ["async", "await", "promise", "asynchronous"]
        }
      ],
      "designer": [
        {
          id: 1,
          question: "Explain the principles of good UI/UX design.",
          type: "conceptual",
          difficulty: "medium",
          maxScore: 15,
          keywords: ["ui", "ux", "principles", "user-centered"]
        },
        {
          id: 2,
          question: "What tools do you use for prototyping and why?",
          type: "practical",
          difficulty: "easy",
          maxScore: 10,
          keywords: ["tools", "prototyping", "figma", "sketch"]
        }
      ],
      "manager": [
        {
          id: 1,
          question: "How do you handle conflicts within your team?",
          type: "behavioral",
          difficulty: "medium",
          maxScore: 15,
          keywords: ["conflict", "team", "resolution", "communication"]
        }
      ]
    };

    // Determine role from job title
    const jobTitleLower = jobTitle.toLowerCase();
    if (jobTitleLower.includes("developer") || jobTitleLower.includes("engineer")) {
      return questionsByRole.developer.sort(() => Math.random() - 0.5).slice(0, 5);
    } else if (jobTitleLower.includes("designer")) {
      return questionsByRole.designer.sort(() => Math.random() - 0.5).slice(0, 5);
    } else if (jobTitleLower.includes("manager")) {
      return questionsByRole.manager.sort(() => Math.random() - 0.5).slice(0, 5);
    }
    
    // Default to developer questions if no specific role found
    return questionsByRole.developer.sort(() => Math.random() - 0.5).slice(0, 5);
  };

  const startInterview = (application) => {
    const questions = getInterviewQuestions(application.job_details?.title || "Developer");
    setCurrentInterview(application);
    setInterviewQuestions(questions);
    setUserAnswers(new Array(questions.length).fill(""));
    setCurrentQuestionIndex(0);
    setInterviewScore(null);
    setInterviewInProgress(true);
    setTimeRemaining(1800); // Reset to 30 minutes
    setShowInterviewModal(true);
  };

  const handleAnswerChange = (answer) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answer;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < interviewQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const calculateScore = () => {
    let totalScore = 0;
    let maxPossibleScore = 0;
    
    userAnswers.forEach((answer, index) => {
      const question = interviewQuestions[index];
      maxPossibleScore += question.maxScore;
      
      // Simple scoring based on answer length and keywords
      if (answer.trim().length > 0) {
        let questionScore = Math.min(question.maxScore, Math.floor(answer.length / 10));
        
        // Bonus for keywords
        question.keywords.forEach(keyword => {
          if (answer.toLowerCase().includes(keyword.toLowerCase())) {
            questionScore += 2;
          }
        });
        
        // Cap score at max
        questionScore = Math.min(questionScore, question.maxScore);
        totalScore += questionScore;
      }
    });
    
    const percentage = (totalScore / maxPossibleScore) * 100;
    
    // Determine performance level
    let performance = "";
    if (percentage >= 80) {
      performance = "Excellent";
    } else if (percentage >= 60) {
      performance = "Good";
    } else if (percentage >= 40) {
      performance = "Average";
    } else {
      performance = "Needs Improvement";
    }
    
    return {
      score: totalScore,
      maxScore: maxPossibleScore,
      percentage: percentage.toFixed(2),
      performance
    };
  };

  const handleInterviewComplete = () => {
    const scoreResult = calculateScore();
    setInterviewScore(scoreResult);
    setInterviewInProgress(false);
    
    // Save interview results (mock API call)
    saveInterviewResults(scoreResult);
  };

  const saveInterviewResults = async (scoreResult) => {
    try {
      const interviewData = {
        candidate_email: user.email,
        job_id: currentInterview.job_details?.id,
        application_id: currentInterview.id,
        score: scoreResult.score,
        max_score: scoreResult.maxScore,
        percentage: scoreResult.percentage,
        performance: scoreResult.performance,
        answers: userAnswers.map((answer, index) => ({
          question: interviewQuestions[index].question,
          answer: answer,
          type: interviewQuestions[index].type
        })),
        completed_at: new Date().toISOString()
      };
      
      // Mock API call - replace with your actual endpoint
      await axios.post(`${API_BASE_URL}/interviews/save`, interviewData);
      
      console.log("Interview results saved successfully");
    } catch (error) {
      console.error("Error saving interview results:", error);
    }
  };

  const closeInterviewModal = () => {
    setShowInterviewModal(false);
    setInterviewInProgress(false);
    setInterviewScore(null);
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
                    
                    {/* Give Interview Button - Only show for applications in review/accepted status */}
                    {(application.status === "reviewed" || application.status === "accepted") && (
                      <button 
  className="interview-btn"
  onClick={() => navigate(`/interview/${application.id}`, { 
    state: { application } 
  })}
>
  🎤 Give Interview
</button>
                    )}
                    
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

      {/* Interview Modal */}
      {showInterviewModal && currentInterview && (
        <div className="interview-modal-overlay">
          <div className="interview-modal">
            <div className="interview-header">
              <h2>🎤 Interview Session</h2>
              <button className="close-modal-btn" onClick={closeInterviewModal}>✕</button>
            </div>
            
            {interviewScore ? (
              <div className="interview-results">
                <div className="results-header">
                  <h3>🎉 Interview Completed!</h3>
                  <p>Here are your results:</p>
                </div>
                
                <div className="score-card">
                  <div className="score-circle">
                    <span className="score-percentage">{interviewScore.percentage}%</span>
                    <span className="score-label">Score</span>
                  </div>
                  
                  <div className="score-details">
                    <div className="score-item">
                      <span className="score-label">Your Score:</span>
                      <span className="score-value">{interviewScore.score}/{interviewScore.maxScore}</span>
                    </div>
                    <div className="score-item">
                      <span className="score-label">Performance:</span>
                      <span className={`performance-badge ${interviewScore.performance.toLowerCase().replace(" ", "-")}`}>
                        {interviewScore.performance}
                      </span>
                    </div>
                    <div className="score-item">
                      <span className="score-label">Job Position:</span>
                      <span className="score-value">{currentInterview.job_details?.title}</span>
                    </div>
                  </div>
                </div>
                
                <div className="results-summary">
                  <h4>📋 Summary</h4>
                  <p>You have completed the interview for <strong>{currentInterview.job_details?.title}</strong> position.</p>
                  <p>The results will be reviewed by the hiring team and you'll be notified of the next steps.</p>
                </div>
                
                <div className="results-actions">
                  <button className="review-answers-btn" onClick={() => {
                    setInterviewScore(null);
                    setCurrentQuestionIndex(0);
                  }}>
                    Review Answers
                  </button>
                  <button className="close-results-btn" onClick={closeInterviewModal}>
                    Close Interview
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="interview-info">
                  <h3>{currentInterview.job_details?.title}</h3>
                  <div className="interview-timer">
                    <span className="timer-icon">⏱️</span>
                    <span className="timer-text">Time Remaining: {formatTime(timeRemaining)}</span>
                  </div>
                </div>
                
                <div className="interview-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${((currentQuestionIndex + 1) / interviewQuestions.length) * 100}%` }}
                    ></div>
                  </div>
                  <p>Question {currentQuestionIndex + 1} of {interviewQuestions.length}</p>
                </div>
                
                <div className="interview-question">
                  <div className="question-header">
                    <span className="question-type">{interviewQuestions[currentQuestionIndex]?.type}</span>
                    <span className="question-difficulty">
                      Difficulty: {interviewQuestions[currentQuestionIndex]?.difficulty}
                    </span>
                  </div>
                  <h4 className="question-text">{interviewQuestions[currentQuestionIndex]?.question}</h4>
                  
                  <div className="answer-section">
                    <label htmlFor="answer">Your Answer:</label>
                    <textarea
                      id="answer"
                      className="answer-textarea"
                      value={userAnswers[currentQuestionIndex] || ""}
                      onChange={(e) => handleAnswerChange(e.target.value)}
                      placeholder="Type your answer here..."
                      rows={8}
                    />
                    <div className="answer-tips">
                      <p>💡 Tip: Include relevant keywords like: 
                        {interviewQuestions[currentQuestionIndex]?.keywords.map((keyword, idx) => (
                          <span key={idx} className="keyword-tag">{keyword}</span>
                        ))}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="interview-navigation">
                  <button 
                    className="nav-btn prev-btn"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                  >
                    ← Previous
                  </button>
                  
                  <div className="question-indicators">
                    {interviewQuestions.map((_, index) => (
                      <button
                        key={index}
                        className={`question-indicator ${index === currentQuestionIndex ? 'active' : ''} ${userAnswers[index] ? 'answered' : ''}`}
                        onClick={() => setCurrentQuestionIndex(index)}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>
                  
                  {currentQuestionIndex === interviewQuestions.length - 1 ? (
                    <button 
                      className="nav-btn complete-btn"
                      onClick={handleInterviewComplete}
                    >
                      Complete Interview
                    </button>
                  ) : (
                    <button 
                      className="nav-btn next-btn"
                      onClick={handleNextQuestion}
                    >
                      Next →
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}