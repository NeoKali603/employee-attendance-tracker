const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const attendanceRoutes = require('./routes/attendance');

const app = express();
const PORT = process.env.PORT || 5000;

// SIMPLIFIED CORS - This will definitely work
app.use(cors({
  origin: [
    'https://adventurous-enjoyment-production-d459.up.railway.app',
    'https://employee-attendance-tracker-production-5550.up.railway.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With']
}));

// CRITICAL: Handle preflight requests
app.options('*', cors());

// Body parser middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - Origin: ${req.headers.origin}`);
  next();
});

// Routes
app.use('/api/attendance', attendanceRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    cors: 'enabled for all frontend domains'
  });
});

// Test CORS endpoint
app.get('/test-cors', (req, res) => {
  res.json({
    message: 'CORS test successful!',
    origin: req.headers.origin,
    cors: 'working'
  });
});

// Test POST endpoint for CORS
app.post('/test-cors', (req, res) => {
  res.json({
    message: 'POST CORS test successful!',
    data: req.body,
    origin: req.headers.origin
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Employee Attendance Tracker API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    cors: 'enabled',
    endpoints: {
      'GET /health': 'Health check',
      'GET /test-cors': 'Test CORS GET',
      'POST /test-cors': 'Test CORS POST',
      'GET /api': 'API information',
      'GET /api/attendance': 'Get all attendance records',
      'POST /api/attendance': 'Create new attendance record',
      'DELETE /api/attendance/:id': 'Delete attendance record'
    }
  });
});

// Database connection test endpoint
app.get('/test-db', async (req, res) => {
  try {
    const Database = require('./config/database');
    const db = Database.getConnection();
    
    res.json({ 
      status: 'Database module loaded successfully',
      databaseType: Database.getDatabaseType(),
      connection: 'Connected'
    });
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      details: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.redirect('/api');
});

// 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'GET /api',
      'GET /test-cors',
      'POST /test-cors',
      'GET /test-db',
      'GET /api/attendance',
      'POST /api/attendance',
      'DELETE /api/attendance/:id'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.message);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 Server is running on port ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📍 Host: 0.0.0.0
🔗 Health check: https://employee-attendance-tracker-production-5550.up.railway.app/health
🔧 CORS Test: https://employee-attendance-tracker-production-5550.up.railway.app/test-cors
✅ CORS enabled for frontend: https://adventurous-enjoyment-production-d459.up.railway.app
  `);
});