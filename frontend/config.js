// frontend/src/config.js
// Configuration for AI Interview Platform - SSUET FYP

// ========== ONLY CHANGE THESE TWO LINES FOR DEPLOYMENT ==========
const ENV = "DEV"; // Change to "LIVE" for production deployment
const LIVE_BACKEND_URL = "https://fazeelayazqasimi-ai-interview-backend.hf.space"; // Your Hugging Face URL
// ================================================================

const CONFIG = {
  DEV: {
    API_BASE_URL: "http://127.0.0.1:8000",
    FRONTEND_URL: "http://localhost:5173",
    WEBSOCKET_URL: "ws://localhost:8000/ws",
    
    // Feature flags for development
    FEATURES: {
      DEBUG_MODE: true,
      MOCK_DATA: true,
      LOG_API_CALLS: true
    }
  },
  
  LIVE: {
    API_BASE_URL: LIVE_BACKEND_URL,
    FRONTEND_URL: "https://ai-interview-platform.vercel.app", // Your Vercel URL
    WEBSOCKET_URL: LIVE_BACKEND_URL.replace("https", "wss") + "/ws",
    
    // Feature flags for production
    FEATURES: {
      DEBUG_MODE: false,
      MOCK_DATA: false,
      LOG_API_CALLS: false
    }
  }
};

// Get current config based on environment
const currentConfig = CONFIG[ENV];

// Export all configuration
export const API_BASE_URL = currentConfig.API_BASE_URL;
export const FRONTEND_URL = currentConfig.FRONTEND_URL;
export const WEBSOCKET_URL = currentConfig.WEBSOCKET_URL;
export const FEATURES = currentConfig.FEATURES;

// Helper function to get full API endpoint
export const getApiEndpoint = (endpoint) => {
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Helper to check if running locally
export const isLocal = ENV === "DEV";

// Log current config (only in dev)
if (isLocal) {
  console.log("🔧 Current Configuration:");
  console.log("Environment:", ENV);
  console.log("API Base URL:", API_BASE_URL);
  console.log("Frontend URL:", FRONTEND_URL);
}

// Export default config object
export default {
  API_BASE_URL,
  FRONTEND_URL,
  WEBSOCKET_URL,
  FEATURES,
  getApiEndpoint,
  isLocal,
  ENV
};