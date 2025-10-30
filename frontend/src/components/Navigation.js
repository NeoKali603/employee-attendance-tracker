import React from 'react';

const Navigation = ({ currentPage, setCurrentPage }) => {
  return (
    <nav className="navigation">
      <button 
        className={`nav-btn ${currentPage === 'form' ? 'active' : ''}`}
        onClick={() => setCurrentPage('form')}
      >
        Mark Attendance
      </button>
      <button 
        className={`nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`}
        onClick={() => setCurrentPage('dashboard')}
      >
        View Records
      </button>
    </nav>
  );
};

export default Navigation;