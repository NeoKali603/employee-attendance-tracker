const express = require('express');
const router = express.Router();

// GET all attendance records
router.get('/', async (req, res) => {
  try {
    console.log('📋 Fetching all attendance records');
    
    // Import database inside function to avoid startup issues
    const Database = require('../config/database');
    const db = Database.getConnection();
    
    // Check if database is connected
    if (!db || !db.db) {
      throw new Error('Database not connected');
    }
    
    const records = await db.getAllAttendance();
    
    console.log(`✅ Retrieved ${records.length} attendance records`);
    
    res.json({
      success: true,
      count: records.length,
      data: records,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching attendance records:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attendance records',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// POST new attendance record
router.post('/', async (req, res) => {
  try {
    const { employeeId, employeeName, date, status, checkIn, checkOut, department } = req.body;
    
    console.log('📨 Received attendance data:', {
      employeeId,
      employeeName,
      date,
      status,
      checkIn,
      checkOut,
      department
    });
    
    // Validation
    if (!employeeId || !employeeName || !date || !status) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: employeeId, employeeName, date, status',
        received: { employeeId, employeeName, date, status }
      });
    }

    // Import database inside function to avoid startup issues
    const Database = require('../config/database');
    const db = Database.getConnection();
    
    // Check if database is connected
    if (!db || !db.db) {
      throw new Error('Database not connected');
    }

    const result = await db.addAttendance({
      employeeId,
      employeeName,
      date,
      status,
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      department: department || null
    });

    console.log('✅ Attendance record created with ID:', result.id);
    
    res.status(201).json({
      success: true,
      message: 'Attendance record created successfully',
      data: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error creating attendance record:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create attendance record',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// DELETE attendance record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Attempting to delete attendance record ID: ${id}`);
    
    // Import database inside function to avoid startup issues
    const Database = require('../config/database');
    const db = Database.getConnection();
    
    // Check if database is connected
    if (!db || !db.db) {
      throw new Error('Database not connected');
    }

    const result = await db.deleteAttendance(id);
    
    if (result) {
      console.log(`✅ Attendance record ${id} deleted successfully`);
      res.json({
        success: true,
        message: 'Attendance record deleted successfully',
        deletedId: parseInt(id),
        timestamp: new Date().toISOString()
      });
    } else {
      console.log(`❌ Attendance record ${id} not found`);
      res.status(404).json({
        success: false,
        error: 'Record not found',
        deletedId: parseInt(id),
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error(`❌ Error deleting attendance record ${req.params.id}:`, error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to delete attendance record',
      details: error.message,
      timestamp: new Date().toISOString()
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
        error: 'Query parameter "q" is required',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`🔍 Searching attendance records for: "${q}"`);
    
    // Import database inside function to avoid startup issues
    const Database = require('../config/database');
    const db = Database.getConnection();
    
    // Check if database is connected
    if (!db || !db.db) {
      throw new Error('Database not connected');
    }

    const results = await db.searchAttendance(q);
    
    console.log(`✅ Found ${results.length} records for search: "${q}"`);
    
    res.json({
      success: true,
      query: q,
      count: results.length,
      data: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`❌ Error searching attendance records for "${req.query.q}":`, error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to search attendance records',
      details: error.message,
      timestamp: new Date().toISOString()
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
        error: 'Query parameter "date" is required (YYYY-MM-DD)',
        timestamp: new Date().toISOString()
      });
    }

    console.log(`📅 Filtering attendance records for date: ${date}`);
    
    // Import database inside function to avoid startup issues
    const Database = require('../config/database');
    const db = Database.getConnection();
    
    // Check if database is connected
    if (!db || !db.db) {
      throw new Error('Database not connected');
    }

    const results = await db.filterByDate(date);
    
    console.log(`✅ Found ${results.length} records for date: ${date}`);
    
    res.json({
      success: true,
      date: date,
      count: results.length,
      data: results,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`❌ Error filtering attendance records for date "${req.query.date}":`, error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to filter attendance records',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET attendance statistics
router.get('/stats', async (req, res) => {
  try {
    console.log('📊 Fetching attendance statistics');
    
    // Import database inside function to avoid startup issues
    const Database = require('../config/database');
    const db = Database.getConnection();
    
    // Check if database is connected
    if (!db || !db.db) {
      throw new Error('Database not connected');
    }

    const stats = await db.getAttendanceStats();
    
    console.log('✅ Retrieved attendance statistics:', stats);
    
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error fetching attendance stats:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attendance statistics',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// GET single attendance record by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 Fetching attendance record ID: ${id}`);
    
    // Import database inside function to avoid startup issues
    const Database = require('../config/database');
    const db = Database.getConnection();
    
    // Check if database is connected
    if (!db || !db.db) {
      throw new Error('Database not connected');
    }

    // Get all records and find the specific one
    const records = await db.getAllAttendance();
    const record = records.find(r => r.id === parseInt(id));
    
    if (record) {
      console.log(`✅ Found attendance record ID: ${id}`);
      res.json({
        success: true,
        data: record,
        timestamp: new Date().toISOString()
      });
    } else {
      console.log(`❌ Attendance record ID: ${id} not found`);
      res.status(404).json({
        success: false,
        error: 'Record not found',
        id: parseInt(id),
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error(`❌ Error fetching attendance record ${req.params.id}:`, error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch attendance record',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

module.exports = router;