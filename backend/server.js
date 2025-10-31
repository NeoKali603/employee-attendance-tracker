const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const attendanceRoutes = require('./routes/attendance');

const app = express();
const PORT = process.env.PORT || 5000;

// FIXED CORS - Added localhost:3001 and all common development ports
app.use(cors({
  origin: [
    'https://employee-attendance-tracker-production-5550.up.railway.app', // Your backend URL
    'http://localhost:3000', // React default port
    'http://localhost:3001', // Your current frontend port
    'http://localhost:3002', // Additional common ports
    'http://localhost:3003',
    'http://localhost:5000', // Local backend development
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Handle preflight requests explicitly
app.options('*', cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/attendance', attendanceRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Backend server is running',
    timestamp: new Date().toISOString(),
    port: PORT,
    environment: process.env.NODE_ENV,
    backendUrl: 'https://employee-attendance-tracker-production-5550.up.railway.app',
    cors: 'enabled for localhost:3001'
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Employee Attendance Tracker API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    port: PORT,
    cors: {
      enabled: true,
      allowed_origins: [
        'localhost:3000',
        'localhost:3001', 
        'localhost:3002',
        'localhost:3003',
        'employee-attendance-tracker-production-5550.up.railway.app'
      ]
    },
    endpoints: {
      'GET /health': 'Health check',
      'GET /api': 'API information',
      'GET /api/attendance': 'Get all attendance records',
      'POST /api/attendance': 'Create new attendance record',
      'DELETE /api/attendance/:id': 'Delete attendance record',
      'GET /api/attendance/search?q=query': 'Search records by name or ID',
      'GET /api/attendance/filter?date=YYYY-MM-DD': 'Filter records by date',
      'GET /api/attendance/stats': 'Get attendance statistics'
    }
  });
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
      'GET /api/attendance',
      'POST /api/attendance',
      'DELETE /api/attendance/:id',
      'GET /api/attendance/search',
      'GET /api/attendance/filter'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Start server - Listen on 0.0.0.0 for Railway
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📍 Host: 0.0.0.0`);
  console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
  console.log(`📚 API docs: http://0.0.0.0:${PORT}/api`);
  console.log(`🌐 Public URL: https://employee-attendance-tracker-production-5550.up.railway.app`);
  console.log(`✅ CORS enabled for: localhost:3000, localhost:3001, localhost:3002, localhost:3003`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});
// Database connection test endpoint
app.get('/test-db', async (req, res) => {
  try {
    // Test if we can require the database module
    const Database = require('./config/database');
    const db = Database.getConnection();
    
    res.json({ 
      status: 'Database module loaded successfully',
      databaseType: Database.getDatabaseType()
    });
  } catch (error) {
    console.error('Database test failed:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      details: error.message 
    });
  }
});