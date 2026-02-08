import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import CandidateDashboard from "./pages/CandidateDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import ProfileSettings from "./pages/ProfileSettings";
import MyApplications from "./pages/MyApplications";
import CompanyApplications from "./pages/CompanyApplications";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import JobListings from "./pages/JobListings";
import CandidateProfileView from "./pages/CandidateProfileView";
import NotificationsPage from "./pages/NotificationsPage";
import Contact from "./pages/Contact";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/candidate-dashboard" element={<CandidateDashboard />} />
            <Route path="/company-dashboard" element={<CompanyDashboard />} />
            <Route path="/profile-settings" element={<ProfileSettings />} />
            <Route path="/my-applications" element={<MyApplications />} />
            <Route path="/company-applications" element={<CompanyApplications />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/job-listings" element={<JobListings />} />
            <Route path="/candidate/:candidateEmail" element={<CandidateProfileView />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;