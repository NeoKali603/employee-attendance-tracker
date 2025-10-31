import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AttendanceForm from './components/AttendanceForm';
import AttendanceDashboard from './components/AttendanceDashboard';
import Navigation from './components/Navigation';
import './App.css';

// Use your actual backend URL
const API_BASE_URL ='https://employee-attendance-tracker-production-5550.up.railway.app';

function App() {
  const [currentPage, setCurrentPage] = useState('form');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      console.log(' Backend connected:', response.data);
      return true;
    } catch (error) {
      console.error(' Backend connection failed:', error.message);
      return false;
    }
  };

  // Fetch all attendance records
  const fetchAttendance = async () => {
    setLoading(true);
    try {
      console.log(' Fetching from:', `${API_BASE_URL}/api/attendance`);
      const response = await axios.get(`${API_BASE_URL}/api/attendance`);
      console.log(' Fetch response:', response.data);
      setAttendanceRecords(response.data.data || response.data);
    } catch (error) {
      console.error(' Error fetching attendance:', error);
      
      const isConnected = await testBackendConnection();
      if (!isConnected) {
        alert(' Cannot connect to backend server. Please check the backend URL.');
      } else {
        alert('Error: ' + (error.response?.data?.error || error.message));
      }
    } finally {
      setLoading(false);
    }
  };

  // Search attendance records
  const searchAttendance = async (query) => {
    if (!query.trim()) {
      fetchAttendance();
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/attendance/search?q=${query}`);
      setAttendanceRecords(response.data.data || response.data);
    } catch (error) {
      console.error('Error searching:', error);
      alert('Search error: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Filter attendance by date
  const filterAttendanceByDate = async (date) => {
    if (!date) {
      fetchAttendance();
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/attendance/filter?date=${date}`);
      setAttendanceRecords(response.data.data || response.data);
    } catch (error) {
      console.error('Error filtering:', error);
      alert('Filter error: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Delete attendance record
  const deleteAttendance = async (id) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/attendance/${id}`);
        fetchAttendance();
        alert('Record deleted successfully');
      } catch (error) {
        console.error('Error deleting:', error);
        alert('Delete error: ' + (error.response?.data?.error || error.message));
      }
    }
  };

  useEffect(() => {
    testBackendConnection();
    fetchAttendance();
  }, []);

  return (
    <div className="App">
      <header className="app-header">
        <h1>Employee Attendance Tracker</h1>
        <p>HR Staff Portal</p>
        <div className="connection-status">
          <small>Backend: {API_BASE_URL}</small>
        </div>
      </header>

      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />

      <main className="main-content">
        {currentPage === 'form' && (
          <AttendanceForm 
            onAttendanceAdded={fetchAttendance}
            apiBaseUrl={API_BASE_URL}
          />
        )}

        {currentPage === 'dashboard' && (
          <AttendanceDashboard
            attendanceRecords={attendanceRecords}
            loading={loading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            filterDate={filterDate}
            setFilterDate={setFilterDate}
            onSearch={searchAttendance}
            onFilter={filterAttendanceByDate}
            onRefresh={fetchAttendance}
            onDelete={deleteAttendance}
          />
        )}
      </main>
    </div>
  );
}

export default App;