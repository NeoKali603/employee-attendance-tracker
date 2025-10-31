import React, { useState } from 'react';
import axios from 'axios';

const AttendanceForm = ({ onAttendanceAdded, apiBaseUrl }) => {
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeID: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Present'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.employeeName.trim() || !formData.employeeID.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      console.log('🔄 Submitting attendance data...');
      console.log('API URL:', `${apiBaseUrl}/api/attendance`);
      console.log('Data to send:', formData);

      const response = await axios.post(`${apiBaseUrl}/api/attendance`, formData, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Success Response:', response.data);
      
      alert('Attendance recorded successfully!');
      setFormData({
        employeeName: '',
        employeeID: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Present'
      });
      onAttendanceAdded(); // Refresh the dashboard
    } catch (error) {
      console.error('❌ Full Error Object:', error);
      console.error('❌ Error Message:', error.message);
      console.error('❌ Error Code:', error.code);
      console.error('❌ Error Response:', error.response);
      console.error('❌ Error Request:', error.request);

      if (error.response) {
        // Server responded with error status
        const serverError = error.response.data;
        console.error('❌ Server Error Details:', serverError);
        alert(`Server Error (${error.response.status}): ${serverError.error || serverError.message || 'Unknown server error'}`);
      } else if (error.request) {
        // Request was made but no response received
        console.error('❌ Network Error - No response received');
        alert('Network Error: Cannot connect to server. Please check:\n1. Backend is running\n2. Internet connection\n3. CORS configuration');
      } else if (error.code === 'ECONNABORTED') {
        // Request timeout
        console.error('❌ Request Timeout');
        alert('Request timeout: Server took too long to respond');
      } else {
        // Something else happened
        console.error('❌ Unexpected Error:', error.message);
        alert('Unexpected error: ' + error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Test backend connection
  const testConnection = async () => {
    try {
      console.log('🔍 Testing backend connection...');
      const response = await axios.get(`${apiBaseUrl}/health`);
      console.log('✅ Backend connection successful:', response.data);
      return true;
    } catch (error) {
      console.error('❌ Backend connection failed:', error.message);
      return false;
    }
  };

  return (
    <div className="attendance-form-container">
      <h2>Mark Attendance</h2>
      
      <button 
        type="button" 
        onClick={testConnection}
        style={{marginBottom: '20px', padding: '8px 16px', backgroundColor: '#17a2b8'}}
      >
        Test Backend Connection
      </button>

      <form onSubmit={handleSubmit} className="attendance-form">
        <div className="form-group">
          <label htmlFor="employeeName">Employee Name *</label>
          <input
            type="text"
            id="employeeName"
            name="employeeName"
            value={formData.employeeName}
            onChange={handleChange}
            required
            placeholder="Enter employee name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="employeeID">Employee ID *</label>
          <input
            type="text"
            id="employeeID"
            name="employeeID"
            value={formData.employeeID}
            onChange={handleChange}
            required
            placeholder="Enter employee ID"
          />
        </div>

        <div className="form-group">
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Attendance Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={submitting}
        >
          {submitting ? 'Recording...' : 'Record Attendance'}
        </button>
      </form>
    </div>
  );
};

export default AttendanceForm;