// frontend/config.js

const ENV = "DEV"; // Change to "LIVE" for production

const CONFIG = {
  DEV: {
    API_BASE_URL: "http://127.0.0.1:8000", // backend URL
    FRONTEND_URL: "http://localhost:5173"
  },
  LIVE: {
    API_BASE_URL: "https://your-live-backend.com",
    FRONTEND_URL: "https://your-live-frontend.com"
  }
};

export const API_BASE_URL = CONFIG[ENV].API_BASE_URL;
export const FRONTEND_URL = CONFIG[ENV].FRONTEND_URL;
