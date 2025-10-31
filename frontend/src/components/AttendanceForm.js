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
      console.log(' Submitting to:', `${apiBaseUrl}/api/attendance`);
      console.log('Data:', formData);

      const response = await axios.post(`${apiBaseUrl}/api/attendance`, formData, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log(' Success Response:', response.data);
      
      alert(' ' + response.data.message);
      setFormData({
        employeeName: '',
        employeeID: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Present'
      });
      onAttendanceAdded(); // Refresh the dashboard
    } catch (error) {
      console.error(' Full Error:', error);
      
      if (error.response) {
        // Server responded with error status
        console.error(' Server Response:', error.response.data);
        alert(` Server Error: ${error.response.data.error || error.response.data.message}`);
      } else if (error.request) {
        // No response received
        console.error(' No Response:', error.request);
        alert(' Network Error: Cannot connect to server');
      } else {
        // Other error
        console.error(' Other Error:', error.message);
        alert(' Error: ' + error.message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="attendance-form-container">
      <h2>Mark Attendance</h2>
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