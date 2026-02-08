import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import NotificationBell from "../pages/NotificationBell";
import "./Navbar.css";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
    setMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // User initials for avatar
  const getUserInitials = () => {
    if (!user || !user.name) return "U";
    const nameParts = user.name.split(" ");
    if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
    return (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase();
  };

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="logo-container" onClick={closeMenu}>
          <div className="logo-icon">AI</div>
          <div className="logo-text">InterviewAI</div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${isActive("/")}`}
          >
            Home
          </Link>
          
          <Link 
            to="/job-listings" 
            className={`nav-link ${isActive("/job-listings")}`}
          >
            Job Listings
          </Link>

          {user && user.type === "candidate" && (
            <>
              <Link 
                to="/candidate-dashboard" 
                className={`nav-link ${isActive("/candidate-dashboard")}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/my-applications" 
                className={`nav-link ${isActive("/my-applications")}`}
              >
                My Applications
              </Link>
            </>
          )}

          {user && user.type === "company" && (
            <>
              <Link 
                to="/company-dashboard" 
                className={`nav-link ${isActive("/company-dashboard")}`}
              >
                Dashboard
              </Link>
              <Link 
                to="/company-applications" 
                className={`nav-link ${isActive("/company-applications")}`}
              >
                Applications
              </Link>
            </>
          )}

          {user && (
            <Link 
              to="/analytics" 
              className={`nav-link ${isActive("/analytics")}`}
            >
              Analytics
            </Link>
          )}
        </div>

        {/* Right Side - Notifications & User */}
        <div className="nav-right">
          {/* Notification Bell */}
          <div className="notification-wrapper">
            <div 
              className="notification-icon" 
              onClick={() => navigate("/notifications")}
              title="Notifications"
            >
              <i className="fas fa-bell"></i>
              <span className="notification-badge">3</span>
            </div>
          </div>

          {/* User Menu or Auth Buttons */}
          {user ? (
            <div className="user-menu">
              <div className="avatar">{getUserInitials()}</div>
              <div className="user-info">
                <div className="user-name">{user.name || "User"}</div>
                <div className="user-role">{user.type === "candidate" ? "Candidate" : "Employer"}</div>
              </div>
              <div className="dropdown-icon">
                <i className="fas fa-chevron-down"></i>
              </div>
              
              {/* Dropdown Menu */}
              <div className="user-dropdown-menu">
                <Link 
                  to={user.type === "candidate" ? "/candidate-profile" : "/company-profile"} 
                  className="dropdown-item"
                  onClick={closeMenu}
                >
                  <i className="fas fa-user"></i> Profile
                </Link>
                <Link 
                  to="/settings" 
                  className="dropdown-item"
                  onClick={closeMenu}
                >
                  <i className="fas fa-cog"></i> Settings
                </Link>
                <div className="dropdown-divider"></div>
                <button 
                  className="dropdown-item logout-btn"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt"></i> Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link 
                to="/login" 
                className="auth-btn login-btn"
                onClick={closeMenu}
              >
                Login
              </Link>
              <Link 
                to="/signup" 
                className="auth-btn signup-btn"
                onClick={closeMenu}
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button 
            className="mobile-menu-btn"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span className={`menu-line ${menuOpen ? "open" : ""}`}></span>
            <span className={`menu-line ${menuOpen ? "open" : ""}`}></span>
            <span className={`menu-line ${menuOpen ? "open" : ""}`}></span>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
          <div className="mobile-menu-header">
            <div className="mobile-user-info">
              {user ? (
                <>
                  <div className="mobile-avatar">{getUserInitials()}</div>
                  <div>
                    <div className="mobile-user-name">{user.name || "User"}</div>
                    <div className="mobile-user-role">{user.type === "candidate" ? "Candidate" : "Employer"}</div>
                  </div>
                </>
              ) : (
                <div className="mobile-guest">Welcome Guest</div>
              )}
            </div>
            <button className="close-menu-btn" onClick={closeMenu}>
              <i className="fas fa-times"></i>
            </button>
          </div>

          <div className="mobile-nav-links">
            <Link 
              to="/" 
              className={`mobile-nav-link ${isActive("/")}`}
              onClick={closeMenu}
            >
              Home
            </Link>
            
            <Link 
              to="/job-listings" 
              className={`mobile-nav-link ${isActive("/job-listings")}`}
              onClick={closeMenu}
            >
              Job Listings
            </Link>

            {user && user.type === "candidate" && (
              <>
                <Link 
                  to="/candidate-dashboard" 
                  className={`mobile-nav-link ${isActive("/candidate-dashboard")}`}
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/my-applications" 
                  className={`mobile-nav-link ${isActive("/my-applications")}`}
                  onClick={closeMenu}
                >
                  My Applications
                </Link>
                <Link 
                  to="/candidate-profile" 
                  className={`mobile-nav-link ${isActive("/candidate-profile")}`}
                  onClick={closeMenu}
                >
                  My Profile
                </Link>
              </>
            )}

            {user && user.type === "company" && (
              <>
                <Link 
                  to="/company-dashboard" 
                  className={`mobile-nav-link ${isActive("/company-dashboard")}`}
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
                <Link 
                  to="/company-applications" 
                  className={`mobile-nav-link ${isActive("/company-applications")}`}
                  onClick={closeMenu}
                >
                  Applications
                </Link>
                <Link 
                  to="/company-profile" 
                  className={`mobile-nav-link ${isActive("/company-profile")}`}
                  onClick={closeMenu}
                >
                  Company Profile
                </Link>
              </>
            )}

            {user && (
              <Link 
                to="/analytics" 
                className={`mobile-nav-link ${isActive("/analytics")}`}
                onClick={closeMenu}
              >
                Analytics
              </Link>
            )}

            <Link 
              to="/notifications" 
              className={`mobile-nav-link ${isActive("/notifications")}`}
              onClick={closeMenu}
            >
              Notifications
            </Link>

            <Link 
              to="/settings" 
              className={`mobile-nav-link ${isActive("/settings")}`}
              onClick={closeMenu}
            >
              Settings
            </Link>

            {!user ? (
              <>
                <Link 
                  to="/login" 
                  className="mobile-auth-btn mobile-login-btn"
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link 
                  to="/signup" 
                  className="mobile-auth-btn mobile-signup-btn"
                  onClick={closeMenu}
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <button 
                className="mobile-logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}