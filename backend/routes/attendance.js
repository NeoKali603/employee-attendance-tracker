const express = require('express');
const router = express.Router();

// Simple in-memory storage for testing (remove later)
let temporaryStorage = [];

// POST - Add new attendance record (TEMPORARY FIX)
router.post('/', async (req, res) => {
  try {
    console.log('📥 Received POST request to /api/attendance');
    console.log('Request body:', req.body);
    
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

    // TEMPORARY: Store in memory (bypass database)
    const newRecord = {
      id: Date.now(),
      employeeName,
      employeeID,
      date,
      status,
      created_at: new Date().toISOString()
    };
    
    temporaryStorage.push(newRecord);
    console.log('✅ Record stored temporarily:', newRecord);
    
    res.status(201).json({
      message: 'Attendance recorded successfully (temporary storage)',
      data: newRecord
    });
    
  } catch (error) {
    console.error('❌ Error in POST /api/attendance:', error);
    res.status(500).json({ 
      error: 'Failed to record attendance',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// GET - Retrieve all attendance records (TEMPORARY)
router.get('/', async (req, res) => {
  try {
    console.log('📥 Received GET request to /api/attendance');
    res.json({
      message: 'Attendance records retrieved successfully (temporary storage)',
      data: temporaryStorage,
      count: temporaryStorage.length
    });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ 
      error: 'Failed to fetch attendance records',
      details: error.message 
    });
  }
});

// DELETE - Remove an attendance record (TEMPORARY)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const recordId = parseInt(id);
    
    const initialLength = temporaryStorage.length;
    temporaryStorage = temporaryStorage.filter(record => record.id !== recordId);
    
    if (temporaryStorage.length === initialLength) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json({ 
      message: 'Attendance record deleted successfully',
      deletedId: id
    });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ 
      error: 'Failed to delete attendance record',
      details: error.message 
    });
  }
});

// GET - Search attendance (TEMPORARY)
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    const filtered = temporaryStorage.filter(record => 
      record.employeeName.toLowerCase().includes(q.toLowerCase()) ||
      record.employeeID.toLowerCase().includes(q.toLowerCase())
    );
    
    res.json({
      message: 'Search completed successfully',
      data: filtered,
      count: filtered.length,
      query: q
    });
  } catch (error) {
    console.error('Error searching attendance:', error);
    res.status(500).json({ 
      error: 'Failed to search attendance records',
      details: error.message 
    });
  }
});

// GET - Filter by date (TEMPORARY)
router.get('/filter', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date parameter is required' });
    }

    const filtered = temporaryStorage.filter(record => record.date === date);
    
    res.json({
      message: 'Filter completed successfully',
      data: filtered,
      count: filtered.length,
      date: date
    });
  } catch (error) {
    console.error('Error filtering attendance:', error);
    res.status(500).json({ 
      error: 'Failed to filter attendance records',
      details: error.message 
    });
  }
});

module.exports = router;