import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import "./VideoInterview.css";

export default function VideoInterview() {
  const [jobRole, setJobRole] = useState("");
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [questions, setQuestions] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startInterview = async () => {
    if (!jobRole.trim()) {
      alert("Please enter a job role");
      return;
    }

    try {
      const res = await axios.post(`${API_BASE_URL}/interview`, {
        name: "Candidate",
        job_role: jobRole,
        answer: ""
      });
      
      setCurrentQuestion(res.data.question);
      setQuestions([{ question: res.data.question, answer: "" }]);
      setInterviewStarted(true);
      
      // Start camera
      startCamera();
    } catch (err) {
      alert("Error starting interview: " + err.message);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const startRecording = () => {
    if (!videoRef.current?.srcObject) return;

    chunksRef.current = [];
    const stream = videoRef.current.srcObject;
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
    };

    mediaRecorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      alert("Please provide an answer");
      return;
    }

    stopRecording();
    
    try {
      const res = await axios.post(`${API_BASE_URL}/interview`, {
        name: "Candidate",
        job_role: jobRole,
        answer: answer
      });
      
      const newQuestion = {
        question: res.data.question,
        answer: ""
      };
      
      setCurrentQuestion(res.data.question);
      setQuestions([...questions, newQuestion]);
      setAnswer("");
      setVideoUrl("");
      
      // Start recording for next question
      setTimeout(startRecording, 1000);
    } catch (err) {
      alert("Error getting next question: " + err.message);
    }
  };

  useEffect(() => {
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="video-interview">
      <div className="interview-header">
        <h1>🎥 AI Video Interview</h1>
        <p>Record your answers to AI questions for a realistic interview experience</p>
      </div>

      {!interviewStarted ? (
        <div className="interview-setup">
          <div className="setup-card">
            <h2>Start Your Interview</h2>
            <input
              className="setup-input"
              placeholder="Enter Job Role (e.g., Frontend Developer)"
              value={jobRole}
              onChange={e => setJobRole(e.target.value)}
            />
            <button className="start-btn" onClick={startInterview}>
              Start AI Interview
            </button>
            
            <div className="setup-tips">
              <h3>📝 Tips for Success:</h3>
              <ul>
                <li>Ensure good lighting and a quiet environment</li>
                <li>Dress professionally</li>
                <li>Speak clearly and confidently</li>
                <li>Take a moment to think before answering</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="interview-container">
          <div className="interview-left">
            <div className="question-card">
              <h3>🤖 AI Question:</h3>
              <p className="current-question">{currentQuestion}</p>
              
              <div className="recording-status">
                <div className={`status-indicator ${isRecording ? 'recording' : 'paused'}`}>
                  <span className="status-dot"></span>
                  {isRecording ? 'Recording...' : 'Ready to record'}
                </div>
                <div className="recording-controls">
                  <button 
                    className={`record-btn ${isRecording ? 'stop' : 'start'}`}
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? '⏹️ Stop Recording' : '● Start Recording'}
                  </button>
                </div>
              </div>
            </div>

            <div className="answer-section">
              <h3>Your Answer:</h3>
              <textarea
                className="answer-input"
                placeholder="Type your answer here..."
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                rows={6}
              />
              
              <div className="answer-actions">
                <button className="skip-btn">
                  Skip Question
                </button>
                <button className="submit-btn" onClick={submitAnswer}>
                  Submit Answer & Next Question
                </button>
              </div>
            </div>
          </div>

          <div className="interview-right">
            <div className="video-preview">
              <h3>🎥 Your Video</h3>
              <video
                ref={videoRef}
                autoPlay
                muted
                className="camera-feed"
              />
              
              {videoUrl && (
                <div className="recorded-video">
                  <h4>Last Recorded Answer:</h4>
                  <video src={videoUrl} controls className="playback-video" />
                </div>
              )}
            </div>

            <div className="questions-history">
              <h3>📋 Questions History</h3>
              {questions.map((q, index) => (
                <div key={index} className="history-item">
                  <p className="history-question">
                    <strong>Q{index + 1}:</strong> {q.question}
                  </p>
                  {q.answer && (
                    <p className="history-answer">
                      <strong>Your Answer:</strong> {q.answer}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}