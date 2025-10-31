const express = require('express');
const router = express.Router();
const Database = require('../config/database');

// GET all attendance records
router.get('/', async (req, res) => {
  try {
    const db = Database.getConnection();
    const records = await db.getAllAttendance();
    
    res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attendance records',
      details: error.message
    });
  }
});

// POST new attendance record
router.post('/', async (req, res) => {
  try {
    const { employeeId, employeeName, date, status, checkIn, checkOut, department } = req.body;
    
    // Validation
    if (!employeeId || !employeeName || !date || !status) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: employeeId, employeeName, date, status'
      });
    }

    const db = Database.getConnection();
    const result = await db.addAttendance({
      employeeId,
      employeeName,
      date,
      status,
      checkIn,
      checkOut,
      department
    });

    res.status(201).json({
      success: true,
      message: 'Attendance record created successfully',
      data: result
    });
  } catch (error) {
    console.error('Error creating attendance record:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create attendance record',
      details: error.message
    });
  }
});

// DELETE attendance record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const db = Database.getConnection();
    const result = await db.deleteAttendance(id);
    
    if (result) {
      res.json({
        success: true,
        message: 'Attendance record deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Record not found'
      });
    }
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete attendance record',
      details: error.message
    });
  }
});

// SEARCH attendance records
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required'
      });
    }

    const db = Database.getConnection();
    const results = await db.searchAttendance(q);
    
    res.json({
      success: true,
      query: q,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Error searching attendance records:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search attendance records',
      details: error.message
    });
  }
});

// FILTER attendance records by date
router.get('/filter', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "date" is required (YYYY-MM-DD)'
      });
    }

    const db = Database.getConnection();
    const results = await db.filterByDate(date);
    
    res.json({
      success: true,
      date: date,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Error filtering attendance records:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to filter attendance records',
      details: error.message
    });
  }
});

// GET attendance statistics
router.get('/stats', async (req, res) => {
  try {
    const db = Database.getConnection();
    const stats = await db.getAttendanceStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attendance statistics',
      details: error.message
    });
  }
});

module.exports = router;