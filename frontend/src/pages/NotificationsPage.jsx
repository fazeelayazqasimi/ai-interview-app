import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import "./NotificationsPage.css";

export default function NotificationsPage() {
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all"); // all, unread, read
  const [loading, setLoading] = useState(true);
  const [ws, setWs] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    
    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    
    // Setup WebSocket
    const socket = new WebSocket(`ws://localhost:8000/ws/${parsedUser.email}`);
    
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "notification") {
        addNewNotification(data.data);
      }
    };
    
    setWs(socket);
    
    // Fetch notifications
    fetchNotifications(parsedUser.email);
    
    return () => {
      if (socket) socket.close();
    };
  }, [navigate]);

  useEffect(() => {
    // Filter notifications based on active filter
    let filtered = notifications;
    
    if (activeFilter === "unread") {
      filtered = notifications.filter(n => !n.read);
    } else if (activeFilter === "read") {
      filtered = notifications.filter(n => n.read);
    }
    
    setFilteredNotifications(filtered);
  }, [notifications, activeFilter]);

  const fetchNotifications = async (userEmail) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/notifications/${userEmail}`);
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const addNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
  };

  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`${API_BASE_URL}/notifications/${notificationId}/read`);
      
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true, read_at: new Date().toISOString() } : n
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user?.email) return;
    
    try {
      await axios.put(`${API_BASE_URL}/notifications/user/${user.email}/read-all`);
      
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true, read_at: new Date().toISOString() }))
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      // Note: Backend doesn't have delete endpoint yet, so we'll just remove from UI
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      setFilteredNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert("Failed to delete notification");
    }
  };

  const clearAllNotifications = () => {
    if (window.confirm("Are you sure you want to clear all notifications?")) {
      setNotifications([]);
      setFilteredNotifications([]);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
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
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return "Unknown time";
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "success": return "✅";
      case "warning": return "⚠️";
      case "error": return "❌";
      case "info": return "ℹ️";
      default: return "📢";
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "success": return "#00ff00";
      case "warning": return "#ff9900";
      case "error": return "#ff0000";
      case "info": return "#0066ff";
      default: return "#666";
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification data
    if (notification.data) {
      if (notification.data.job_id && user?.type === "candidate") {
        navigate(`/job-listings`);
      } else if (notification.data.application_id && user?.type === "company") {
        navigate(`/company-applications`);
      }
    }
  };

  if (loading) {
    return (
      <div className="notifications-loading">
        <div className="spinner"></div>
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>🔔 Notifications</h1>
        <p>Stay updated with your latest activities</p>
        
        <div className="notification-stats">
          <div className="stat-card">
            <span className="stat-value">{notifications.length}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{notifications.filter(n => !n.read).length}</span>
            <span className="stat-label">Unread</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{notifications.filter(n => n.read).length}</span>
            <span className="stat-label">Read</span>
          </div>
        </div>
      </div>

      <div className="notifications-container">
        <div className="notification-actions">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
              onClick={() => setActiveFilter("all")}
            >
              All
            </button>
            <button 
              className={`filter-btn ${activeFilter === "unread" ? "active" : ""}`}
              onClick={() => setActiveFilter("unread")}
            >
              Unread
            </button>
            <button 
              className={`filter-btn ${activeFilter === "read" ? "active" : ""}`}
              onClick={() => setActiveFilter("read")}
            >
              Read
            </button>
          </div>
          
          <div className="action-buttons">
            <button 
              className="mark-all-read-btn"
              onClick={markAllAsRead}
              disabled={notifications.filter(n => !n.read).length === 0}
            >
              Mark all as read
            </button>
            <button 
              className="clear-all-btn"
              onClick={clearAllNotifications}
              disabled={notifications.length === 0}
            >
              Clear all
            </button>
            <button 
              className="refresh-btn"
              onClick={() => fetchNotifications(user?.email)}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="empty-notifications">
            <div className="empty-icon">📭</div>
            <h3>No notifications found</h3>
            <p>When you get notifications, they'll appear here</p>
            <button 
              className="back-btn"
              onClick={() => navigate(-1)}
            >
              Go Back
            </button>
          </div>
        ) : (
          <div className="notifications-list">
            {filteredNotifications.map(notification => (
              <div 
                key={notification.id}
                className={`notification-item ${notification.read ? "read" : "unread"}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div 
                  className="notification-icon"
                  style={{ color: getNotificationColor(notification.type) }}
                >
                  {getNotificationIcon(notification.type)}
                </div>
                
                <div className="notification-content">
                  <p className="notification-message">{notification.message}</p>
                  
                  <div className="notification-meta">
                    <span className="notification-type">
                      {notification.type.toUpperCase()}
                    </span>
                    <span className="notification-time">
                      {formatDate(notification.created_at)}
                    </span>
                    {notification.read && notification.read_at && (
                      <span className="read-time">
                        Read: {formatDate(notification.read_at)}
                      </span>
                    )}
                  </div>
                  
                  {notification.data && (
                    <div className="notification-data">
                      <small>Data: {JSON.stringify(notification.data)}</small>
                    </div>
                  )}
                </div>
                
                <div className="notification-actions">
                  {!notification.read && (
                    <button 
                      className="mark-read-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        markAsRead(notification.id);
                      }}
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button 
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                    title="Delete notification"
                  >
                    🗑️
                  </button>
                </div>
                
                {!notification.read && <div className="unread-indicator"></div>}
              </div>
            ))}
          </div>
        )}

        <div className="notifications-footer">
          <p>
            Showing {filteredNotifications.length} of {notifications.length} notifications
          </p>
          <p className="websocket-status">
            {ws?.readyState === WebSocket.OPEN ? "🟢 Live" : "🔴 Disconnected"}
          </p>
        </div>
      </div>
    </div>
  );
}