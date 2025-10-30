const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');

// POST - Add new attendance record
router.post('/', (req, res) => {
  const { employeeName, employeeID, date, status } = req.body;

  // Validation
  if (!employeeName || !employeeID || !date || !status) {
    return res.status(400).json({ 
      error: 'All fields (employeeName, employeeID, date, status) are required' 
    });
  }

  if (status !== 'Present' && status !== 'Absent') {
    return res.status(400).json({ 
      error: 'Status must be either "Present" or "Absent"' 
    });
  }

  Attendance.create(req.body, (err, newAttendance) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json(newAttendance);
  });
});

// GET - Retrieve all attendance records
router.get('/', (req, res) => {
  Attendance.getAll((err, records) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(records);
  });
});

// DELETE - Remove an attendance record
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  Attendance.delete(id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    res.json({ message: 'Attendance record deleted successfully' });
  });
});

// GET - Search attendance by employee name or ID
router.get('/search', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  Attendance.search(q, (err, records) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(records);
  });
});

// GET - Filter attendance by date
router.get('/filter', (req, res) => {
  const { date } = req.query;
  
  if (!date) {
    return res.status(400).json({ error: 'Date parameter is required' });
  }

  Attendance.filterByDate(date, (err, records) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(records);
  });
});

module.exports = router;