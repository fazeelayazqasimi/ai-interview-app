import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import "./InterviewPage.css";

export default function InterviewPage() {
  const [user, setUser] = useState(null);
  const [application, setApplication] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(1800); // 30 minutes
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { applicationId } = useParams();
  const location = useLocation();

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
    
    // Try to get application data from location state first
    if (location.state?.application) {
      setApplication(location.state.application);
      generateQuestions(location.state.application);
      setLoading(false);
    } else {
      // If not in state, fetch from API
      fetchApplicationData();
    }
  }, [navigate, location]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (interviewStarted && !interviewCompleted && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 0) {
            handleCompleteInterview();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [interviewStarted, interviewCompleted, timeRemaining]);

  const fetchApplicationData = async () => {
    try {
      // First get all applications for the candidate
      const response = await axios.get(`${API_BASE_URL}/applications/candidate/${user.email}`);
      const applications = response.data.applications || [];
      
      console.log("All applications:", applications);
      console.log("Looking for applicationId:", applicationId);
      
      // Find the specific application
      const foundApplication = applications.find(app => 
        String(app.id) === String(applicationId)
      );
      
      if (!foundApplication) {
        throw new Error("Application not found in your applications list");
      }
      
      setApplication(foundApplication);
      generateQuestions(foundApplication);
      
    } catch (error) {
      console.error("Error fetching application:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateQuestions = (appData) => {
    const jobTitle = appData.job_details?.title || "Software Developer";
    const jobTitleLower = jobTitle.toLowerCase();
    
    const questionBank = {
      developer: [
        {
          id: 1,
          question: "What is the difference between let, const, and var in JavaScript?",
          type: "coding",
          difficulty: "easy",
          maxScore: 10,
          expectedKeywords: ["scope", "hoisting", "block", "reassign", "function"],
          timeLimit: 180
        },
        {
          id: 2,
          question: "Explain the concept of closures in JavaScript with an example.",
          type: "coding",
          difficulty: "medium",
          maxScore: 15,
          expectedKeywords: ["scope", "function", "lexical", "environment", "memory"],
          timeLimit: 240
        },
        {
          id: 3,
          question: "What is the Virtual DOM in React and how does it improve performance?",
          type: "conceptual",
          difficulty: "medium",
          maxScore: 15,
          expectedKeywords: ["virtual", "dom", "reconciliation", "diffing", "performance", "batch"],
          timeLimit: 240
        },
        {
          id: 4,
          question: "Write a function to reverse a string in JavaScript.",
          type: "coding",
          difficulty: "easy",
          maxScore: 10,
          expectedKeywords: ["reverse", "string", "split", "join", "algorithm"],
          timeLimit: 180
        },
        {
          id: 5,
          question: "Explain RESTful API principles and best practices.",
          type: "conceptual",
          difficulty: "medium",
          maxScore: 15,
          expectedKeywords: ["rest", "stateless", "resource", "http", "methods", "status", "codes"],
          timeLimit: 300
        }
      ],
      designer: [
        {
          id: 1,
          question: "Explain the difference between UI and UX design.",
          type: "conceptual",
          difficulty: "easy",
          maxScore: 10,
          expectedKeywords: ["interface", "experience", "user", "interaction", "visual", "usability"],
          timeLimit: 240
        },
        {
          id: 2,
          question: "What tools do you use for prototyping and why?",
          type: "practical",
          difficulty: "medium",
          maxScore: 15,
          expectedKeywords: ["figma", "sketch", "adobe", "xd", "prototype", "collaboration", "feedback"],
          timeLimit: 300
        },
        {
          id: 3,
          question: "What is responsive design and why is it important?",
          type: "conceptual",
          difficulty: "easy",
          maxScore: 10,
          expectedKeywords: ["responsive", "mobile", "desktop", "adapt", "layout", "breakpoints"],
          timeLimit: 240
        }
      ],
      manager: [
        {
          id: 1,
          question: "How do you handle conflicts between team members?",
          type: "behavioral",
          difficulty: "medium",
          maxScore: 15,
          expectedKeywords: ["conflict", "resolution", "communication", "mediation", "understanding", "solution"],
          timeLimit: 300
        },
        {
          id: 2,
          question: "Describe your approach to project planning and execution.",
          type: "management",
          difficulty: "hard",
          maxScore: 20,
          expectedKeywords: ["agile", "scrum", "planning", "timeline", "resources", "risk", "management"],
          timeLimit: 360
        }
      ]
    };

    // Determine role from job title
    let role = "developer";
    if (jobTitleLower.includes("design") || jobTitleLower.includes("ui") || jobTitleLower.includes("ux")) {
      role = "designer";
    } else if (jobTitleLower.includes("manager") || jobTitleLower.includes("lead") || jobTitleLower.includes("director")) {
      role = "manager";
    }

    // If role not found in bank, use developer questions
    const selectedBank = questionBank[role] || questionBank.developer;
    
    // Shuffle questions and take first 5
    const shuffledQuestions = [...selectedBank]
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
      .map((q, idx) => ({ ...q, index: idx }));

    setQuestions(shuffledQuestions);
    setAnswers(new Array(shuffledQuestions.length).fill(""));
  };

  const startInterview = () => {
    setInterviewStarted(true);
  };

  const handleAnswerChange = (value) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = value;
    setAnswers(newAnswers);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const goToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  const calculateScore = () => {
    let totalScore = 0;
    let maxPossibleScore = 0;

    questions.forEach((question, index) => {
      maxPossibleScore += question.maxScore;
      const answer = answers[index] || "";
      
      if (answer.trim().length > 0) {
        let questionScore = Math.min(question.maxScore * 0.3, answer.length / 20);
        
        const answerLower = answer.toLowerCase();
        question.expectedKeywords.forEach(keyword => {
          if (answerLower.includes(keyword.toLowerCase())) {
            questionScore += (question.maxScore * 0.7) / question.expectedKeywords.length;
          }
        });
        
        if (answer.split('.').length > 2) {
          questionScore += question.maxScore * 0.1;
        }
        
        questionScore = Math.min(questionScore, question.maxScore);
        totalScore += questionScore;
      }
    });

    const percentage = (totalScore / maxPossibleScore) * 100;
    
    let performance = "";
    let feedback = "";
    
    if (percentage >= 85) {
      performance = "Excellent";
      feedback = "Outstanding performance! You demonstrate deep understanding of the concepts.";
    } else if (percentage >= 70) {
      performance = "Good";
      feedback = "Solid performance. You show good understanding with room for improvement in some areas.";
    } else if (percentage >= 50) {
      performance = "Average";
      feedback = "Decent attempt. Consider reviewing some key concepts and practicing more.";
    } else {
      performance = "Needs Improvement";
      feedback = "You may need to strengthen your fundamentals and gain more practical experience.";
    }

    return {
      totalScore: Math.round(totalScore),
      maxPossibleScore,
      percentage: percentage.toFixed(2),
      performance,
      feedback
    };
  };

  const handleCompleteInterview = async () => {
    if (!interviewStarted || !application) return;
    
    const scoreResult = calculateScore();
    setScore(scoreResult);
    setInterviewCompleted(true);
    
    try {
      // Prepare answers for saving
      const answerData = questions.map((q, idx) => ({
        question: q.question,
        answer: answers[idx] || "",
        type: q.type
      }));
      
      console.log("Saving interview data:", {
        candidate_email: user.email,
        job_id: application.job_id,
        application_id: applicationId,
        score: scoreResult.totalScore,
        max_score: scoreResult.maxPossibleScore,
        percentage: scoreResult.percentage,
        performance: scoreResult.performance,
        answers: answerData,
        time_taken: 1800 - timeRemaining
      });
      
      // Save interview results
      const response = await axios.post(`${API_BASE_URL}/interviews/save`, {
        candidate_email: user.email,
        job_id: application.job_id,
        application_id: applicationId,
        score: scoreResult.totalScore,
        max_score: scoreResult.maxPossibleScore,
        percentage: scoreResult.percentage,
        performance: scoreResult.performance,
        answers: answerData,
        time_taken: 1800 - timeRemaining
      });
      
      console.log("Interview saved successfully:", response.data);
      
    } catch (error) {
      console.error("Error submitting interview:", error);
      alert("Error saving interview results. Please try again.");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty.toLowerCase()) {
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
      default: return '#9e9e9e';
    }
  };

  if (loading) {
    return (
      <div className="interview-loading">
        <div className="loading-spinner"></div>
        <p>Preparing your interview...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="interview-error">
        <div className="error-content">
          <h2>Unable to Load Interview</h2>
          <p>{error || "Application data could not be loaded"}</p>
          <p className="error-details">
            Application ID: {applicationId}<br />
            User: {user?.email}
          </p>
          <div className="error-actions">
            <button 
              className="retry-btn"
              onClick={() => window.location.reload()}
            >
              🔄 Retry
            </button>
            <button 
              className="dashboard-btn"
              onClick={() => navigate("/my-applications")}
            >
              📋 Back to Applications
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-page">
      {/* Interview Header */}
      <div className="interview-header">
        <div className="header-left">
          <button 
            className="back-button"
            onClick={() => navigate("/my-applications")}
          >
            ← Back to Applications
          </button>
          <div>
            <h1>🎤 Technical Interview</h1>
            <p className="job-title">{application.job_details?.title || "Software Developer"}</p>
            <p className="company-name">{application.job_details?.company_email?.split('@')[0] || "Company"}</p>
          </div>
        </div>
        
        <div className="header-right">
          {interviewStarted && !interviewCompleted && (
            <div className="timer">
              <span className="timer-icon">⏱️</span>
              <span className="timer-text">{formatTime(timeRemaining)}</span>
            </div>
          )}
          {!interviewStarted && !interviewCompleted && (
            <button className="start-button" onClick={startInterview}>
              🚀 Start Interview
            </button>
          )}
        </div>
      </div>

      {!interviewStarted ? (
        <div className="interview-instructions">
          <div className="instructions-card">
            <h2>📋 Interview Instructions</h2>
            <div className="instructions-content">
              <div className="instruction-section">
                <h3>🎯 What to Expect</h3>
                <ul>
                  <li><strong>{questions.length} questions</strong> covering various topics</li>
                  <li><strong>30 minutes</strong> total time</li>
                  <li>Questions will test your <strong>technical knowledge</strong> and <strong>problem-solving skills</strong></li>
                  <li>Each question has a <strong>difficulty rating</strong> and <strong>expected time</strong></li>
                </ul>
              </div>
              
              <div className="instruction-section">
                <h3>✅ Guidelines</h3>
                <ul>
                  <li>Find a <strong>quiet environment</strong> with good internet connection</li>
                  <li>Use <strong>clear, structured answers</strong> with examples where possible</li>
                  <li>You can <strong>navigate between questions</strong> freely</li>
                  <li>Your answers are <strong>automatically saved</strong> as you type</li>
                  <li>Try to <strong>answer all questions</strong> even if you're unsure</li>
                </ul>
              </div>
              
              <div className="instruction-section">
                <h3>📊 Scoring</h3>
                <ul>
                  <li>Each question has a <strong>maximum score</strong></li>
                  <li>Scores are based on <strong>completeness</strong> and <strong>accuracy</strong></li>
                  <li>Use of <strong>relevant keywords</strong> and <strong>examples</strong> improves scores</li>
                  <li>Get instant <strong>performance feedback</strong> after completion</li>
                </ul>
              </div>
            </div>
            
            <div className="questions-preview">
              <h3>📝 Sample Question</h3>
              <div className="preview-question">
                <p><strong>{questions[0]?.question}</strong></p>
                <div className="question-meta-preview">
                  <span className="type-preview">Type: {questions[0]?.type}</span>
                  <span className="difficulty-preview" style={{ color: getDifficultyColor(questions[0]?.difficulty) }}>
                    Difficulty: {questions[0]?.difficulty}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="start-section">
              <button className="primary-start-btn" onClick={startInterview}>
                🚀 Begin Interview
              </button>
              <p className="note">Once started, the timer will begin counting down from 30:00</p>
            </div>
          </div>
        </div>
      ) : interviewCompleted ? (
        <div className="interview-results">
          <div className="results-container">
            <div className="results-header">
              <h2>🎉 Interview Completed!</h2>
              <p className="results-subtitle">Here's how you performed</p>
            </div>
            
            <div className="score-summary">
              <div className="score-circle">
                <div className="circle-inner">
                  <span className="score-percentage">{score?.percentage}%</span>
                  <span className="score-label">Overall Score</span>
                </div>
              </div>
              
              <div className="score-details">
                <div className="score-item">
                  <span className="score-label">Score:</span>
                  <span className="score-value">{score?.totalScore}/{score?.maxPossibleScore}</span>
                </div>
                <div className="score-item">
                  <span className="score-label">Performance:</span>
                  <span className={`performance-badge ${score?.performance?.toLowerCase().replace(' ', '-')}`}>
                    {score?.performance}
                  </span>
                </div>
                <div className="score-item">
                  <span className="score-label">Time Taken:</span>
                  <span className="score-value">{formatTime(1800 - timeRemaining)}</span>
                </div>
                <div className="score-item">
                  <span className="score-label">Questions Attempted:</span>
                  <span className="score-value">
                    {answers.filter(a => a && a.trim().length > 0).length}/{questions.length}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="performance-feedback">
              <h3>📝 Feedback</h3>
              <p>{score?.feedback}</p>
              
              <div className="suggestions">
                <h4>💡 Suggestions for Improvement</h4>
                <ul>
                  <li>Practice more coding problems on platforms like LeetCode</li>
                  <li>Review core concepts and design patterns</li>
                  <li>Work on explaining your thought process clearly</li>
                  <li>Time yourself while solving problems</li>
                </ul>
              </div>
            </div>
            
            <div className="results-actions">
              <button 
                className="dashboard-btn"
                onClick={() => navigate("/my-applications")}
              >
                📋 Back to Applications
              </button>
              <button 
                className="retry-btn"
                onClick={() => window.location.reload()}
              >
                🔄 Retry Interview
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="interview-interface">
          <div className="interview-main">
            {/* Progress Bar */}
            <div className="interview-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
              <div className="progress-text">
                Question {currentQuestionIndex + 1} of {questions.length}
                <span className="progress-percentage">
                  {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
                </span>
              </div>
            </div>

            {/* Question Display */}
            <div className="question-container">
              <div className="question-header">
                <div className="question-meta">
                  <span className="question-type">
                    {questions[currentQuestionIndex]?.type}
                  </span>
                  <span 
                    className="question-difficulty"
                    style={{ color: getDifficultyColor(questions[currentQuestionIndex]?.difficulty) }}
                  >
                    {questions[currentQuestionIndex]?.difficulty}
                  </span>
                  <span className="question-time">
                    Max Score: {questions[currentQuestionIndex]?.maxScore} points
                  </span>
                </div>
              </div>

              <div className="question-body">
                <h3 className="question-text">
                  {questions[currentQuestionIndex]?.question}
                </h3>
                
                {questions[currentQuestionIndex]?.expectedKeywords && (
                  <div className="keywords-hint">
                    <p>💡 Keywords to consider:</p>
                    <div className="keywords-list">
                      {questions[currentQuestionIndex].expectedKeywords.map((keyword, idx) => (
                        <span key={idx} className="keyword-tag">{keyword}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Answer Input */}
              <div className="answer-container">
                <label htmlFor="answer" className="answer-label">
                  Your Answer:
                  <span className="word-count">
                    Words: {answers[currentQuestionIndex]?.split(/\s+/).filter(w => w.length > 0).length || 0}
                  </span>
                </label>
                <textarea
                  id="answer"
                  className="answer-textarea"
                  value={answers[currentQuestionIndex] || ""}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Type your detailed answer here... (Be specific, use examples, and structure your thoughts)"
                  rows={8}
                  autoFocus
                />
                <div className="answer-tips">
                  <p>📝 <strong>Tip:</strong> Structure your answer with:</p>
                  <ul>
                    <li>Clear explanation of the concept</li>
                    <li>Relevant examples or code snippets</li>
                    <li>Practical applications or use cases</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="interview-navigation">
              <button
                className="nav-btn prev-btn"
                onClick={goToPreviousQuestion}
                disabled={currentQuestionIndex === 0}
              >
                ← Previous
              </button>
              
              <div className="question-jump">
                <div className="jump-buttons">
                  {questions.map((_, idx) => (
                    <button
                      key={idx}
                      className={`jump-btn ${idx === currentQuestionIndex ? 'active' : ''} ${answers[idx] ? 'answered' : ''}`}
                      onClick={() => goToQuestion(idx)}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
              
              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  className="nav-btn submit-btn"
                  onClick={handleCompleteInterview}
                >
                  🎯 Complete Interview
                </button>
              ) : (
                <button
                  className="nav-btn next-btn"
                  onClick={goToNextQuestion}
                >
                  Next →
                </button>
              )}
            </div>
            
            {/* Quick Stats */}
            <div className="quick-stats">
              <div className="stat-item">
                <span className="stat-label">Answered:</span>
                <span className="stat-value">
                  {answers.filter(a => a && a.trim().length > 0).length}/{questions.length}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Time Left:</span>
                <span className="stat-value time-warning">{formatTime(timeRemaining)}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Current:</span>
                <span className="stat-value">{currentQuestionIndex + 1}/{questions.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}