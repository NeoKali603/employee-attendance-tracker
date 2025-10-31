import React from 'react';

const AttendanceDashboard = ({
  attendanceRecords,
  loading,
  searchQuery,
  setSearchQuery,
  filterDate,
  setFilterDate,
  onSearch,
  onFilter,
  onRefresh,
  onDelete
}) => {
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    onFilter(filterDate);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilterDate('');
    onRefresh();
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  console.log('📊 Dashboard records:', attendanceRecords); // Debug log

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2>Attendance Records</h2>
        <div className="stats">
          <span>Total Records: {attendanceRecords?.length || 0}</span>
        </div>
        <button onClick={onRefresh} className="refresh-btn">
          Refresh
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="controls-container">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">Search</button>
        </form>

        <form onSubmit={handleFilterSubmit} className="filter-form">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="date-input"
          />
          <button type="submit" className="filter-btn">Filter by Date</button>
        </form>

        <button onClick={handleClearFilters} className="clear-btn">
          Clear Filters
        </button>
      </div>

      {/* Attendance Records Table */}
      <div className="records-container">
        {loading ? (
          <div className="loading">Loading attendance records...</div>
        ) : !attendanceRecords || attendanceRecords.length === 0 ? (
          <div className="no-records">
            <h3>No attendance records found</h3>
            <p>Add some records using the "Mark Attendance" form</p>
          </div>
        ) : (
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Employee ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map(record => (
                <tr key={record.id} className={record.status.toLowerCase()}>
                  <td>{record.employeeName}</td>
                  <td>{record.employeeID}</td>
                  <td>{formatDate(record.date)}</td>
                  <td>
                    <span className={`status-badge ${record.status.toLowerCase()}`}>
                      {record.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => onDelete(record.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AttendanceDashboard;