const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://employee-attendance-tracker-production.up.railway.app/api';

export const ENDPOINTS = {
    ATTENDANCE: `${API_BASE_URL}/attendance`,
};

export default API_BASE_URL;