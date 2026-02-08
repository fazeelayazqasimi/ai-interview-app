import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./NotificationBell.css";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Sample notifications (temporary until backend is connected)
  const sampleNotifications = [
    {
      id: "1",
      message: "Welcome to AI Interview Platform!",
      type: "info",
      read: false,
      created_at: new Date().toISOString()
    },
    {
      id: "2",
      message: "New job matches your skills: Frontend Developer",
      type: "success",
      read: false,
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: "3",
      message: "Application submitted successfully",
      type: "success",
      read: true,
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ];

  useEffect(() => {
    // Load notifications from localStorage or use sample data
    const storedNotifications = localStorage.getItem("notifications");
    if (storedNotifications) {
      try {
        const parsed = JSON.parse(storedNotifications);
        setNotifications(parsed);
        
        // Calculate unread count
        const unread = parsed.filter(n => !n.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Error parsing notifications:", error);
        setNotifications(sampleNotifications);
        setUnreadCount(2);
      }
    } else {
      setNotifications(sampleNotifications);
      setUnreadCount(2);
    }
  }, []);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = (notificationId) => {
    const updatedNotifications = notifications.map(notification => {
      if (notification.id === notificationId) {
        return { ...notification, read: true };
      }
      return notification;
    });
    
    setNotifications(updatedNotifications);
    
    // Update unread count
    const unread = updatedNotifications.filter(n => !n.read).length;
    setUnreadCount(unread);
    
    // Save to localStorage
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
  };

  const markAllAsRead = () => {
    const updatedNotifications = notifications.map(notification => ({
      ...notification,
      read: true
    }));
    
    setNotifications(updatedNotifications);
    setUnreadCount(0);
    localStorage.setItem("notifications", JSON.stringify(updatedNotifications));
  };

  const formatTime = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "Recently";
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success": return "✅";
      case "warning": return "⚠️";
      case "error": return "❌";
      default: return "ℹ️";
    }
  };

  const handleViewAll = () => {
    setShowDropdown(false);
    navigate("/notifications");
  };

  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem("user") || "null");
  if (!user) return null;

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button
        className="bell-button"
        onClick={() => setShowDropdown(!showDropdown)}
        title="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="dropdown-header">
            <h3>Notifications</h3>
            <div className="header-actions">
              <button 
                className="mark-all-read"
                onClick={markAllAsRead}
                disabled={unreadCount === 0}
              >
                Mark all read
              </button>
              <button 
                className="close-dropdown"
                onClick={() => setShowDropdown(false)}
              >
                ✕
              </button>
            </div>
          </div>

          <div className="notifications-list">
            {notifications.length === 0 ? (
              <div className="empty-notifications">
                <div className="empty-icon">📭</div>
                <p>No notifications yet</p>
              </div>
            ) : (
              notifications.slice(0, 5).map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.read ? "read" : "unread"}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      {formatTime(notification.created_at)}
                    </span>
                  </div>
                  {!notification.read && <div className="unread-dot"></div>}
                </div>
              ))
            )}
          </div>

          <div className="dropdown-footer">
            <button 
              className="view-all-btn"
              onClick={handleViewAll}
            >
              View all notifications
            </button>
            {("Notification" in window) && (
              <button 
                className="settings-btn"
                onClick={() => {
                  if (Notification.permission === "default") {
                    Notification.requestPermission();
                  }
                }}
                title="Notification settings"
              >
                🔧
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}