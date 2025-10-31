// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://employee-attendance-tracker-production-25ac.up.railway.app';

export const ENDPOINTS = {
  // Attendance endpoints
  ATTENDANCE: `${API_BASE_URL}/api/attendance`,
  ATTENDANCE_SEARCH: `${API_BASE_URL}/api/attendance/search`,
  ATTENDANCE_FILTER: `${API_BASE_URL}/api/attendance/filter`,
  ATTENDANCE_STATS: `${API_BASE_URL}/api/attendance/stats`,
  
  // Health check
  HEALTH: `${API_BASE_URL}/health`,
  
  // API info
  API_INFO: `${API_BASE_URL}/api`
};

// Axios default configuration
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000,
  headers: {
    'Content-Type': 'application/json',
  }
};