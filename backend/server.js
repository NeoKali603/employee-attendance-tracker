const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  console.log('Headers:', req.headers);
  next();
});

// Configure CORS - Allow all origins temporarily for debugging
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true
}));

// Handle preflight requests
app.options('*', cors());

// Log all requests and responses for debugging
app.use((req, res, next) => {
  const oldJson = res.json;
  res.json = function(body) {
    console.log('Response Body:', body);
    return oldJson.call(this, body);
  };
  next();
});

// Body parser
app.use(express.json());

// SIMPLE in-memory storage (no database dependencies)
let attendanceRecords = [];
let nextId = 1;

// Test endpoint for CORS
app.get('/api/test-cors', (req, res) => {
  console.log('CORS Test Request:', {
    origin: req.headers.origin,
    method: req.method,
    headers: req.headers
  });
  res.json({
    message: 'Test endpoint working',
    headers: req.headers,
    origin: req.headers.origin
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    records: attendanceRecords.length
  });
});

// Test CORS
app.get('/test-cors', (req, res) => {
  res.json({
    message: 'CORS is working!',
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// GET all attendance records
app.get('/api/attendance', (req, res) => {
  try {
    console.log('GET /api/attendance - Origin:', req.headers.origin);
    console.log('Records count:', attendanceRecords.length);
    
    res.json({
      success: true,
      count: attendanceRecords.length,
      data: attendanceRecords
    });
  } catch (error) {
    console.error('Error in /api/attendance:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST new attendance record
app.post('/api/attendance', (req, res) => {
  try {
    const { employeeId, employeeName, date, status, checkIn, checkOut, department } = req.body;
    
    console.log('📨 Received:', req.body);
    
    // Validation
    if (!employeeId || !employeeName || !date || !status) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    const record = {
      id: nextId++,
      employeeId,
      employeeName,
      date,
      status,
      checkIn: checkIn || null,
      checkOut: checkOut || null,
      department: department || null,
      createdAt: new Date().toISOString()
    };

    attendanceRecords.push(record);
    
    console.log('✅ Created record:', record.id);
    
    res.status(201).json({
      success: true,
      message: 'Record created successfully',
      data: record
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// DELETE attendance record
app.delete('/api/attendance/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = attendanceRecords.findIndex(record => record.id === id);
  
  if (index !== -1) {
    attendanceRecords.splice(index, 1);
    res.json({
      success: true,
      message: 'Record deleted successfully'
    });
  } else {
    res.status(404).json({
      success: false,
      error: 'Record not found'
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Employee Attendance API',
    endpoints: {
      'GET /health': 'Health check',
      'GET /test-cors': 'Test CORS',
      'GET /api/attendance': 'Get all records',
      'POST /api/attendance': 'Create record',
      'DELETE /api/attendance/:id': 'Delete record'
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 Server running on port ${PORT}
✅ CORS enabled for ALL origins
🌐 URL:https://adventurous-enjoyment-production-d459.up.railway.app
  `);
});