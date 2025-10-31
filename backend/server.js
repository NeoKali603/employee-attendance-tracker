const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const attendanceRoutes = require('./routes/attendance');

const app = express();
const PORT = process.env.PORT || 5000;

// IMPROVED CORS - Dynamic for Railway with frontend domain
const allowedOrigins = [
  'https://adventurous-enjoyment-production-d459.up.railway.app', // Your frontend
  'https://employee-attendance-tracker-production-5550.up.railway.app', // Your backend
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://localhost:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001'
];

// Add any Railway-provided frontend URLs
if (process.env.RAILWAY_STATIC_URL) {
  allowedOrigins.push(process.env.RAILWAY_STATIC_URL);
}

// Add from environment variable
if (process.env.FRONTEND_URL) {
  const frontendUrls = process.env.FRONTEND_URL.split(',');
  frontendUrls.forEach(url => allowedOrigins.push(url.trim()));
}

// Add from CORS_ORIGIN environment variable
if (process.env.CORS_ORIGIN) {
  const corsUrls = process.env.CORS_ORIGIN.split(',');
  corsUrls.forEach(url => allowedOrigins.push(url.trim()));
}

console.log('🔄 CORS Allowed Origins:', allowedOrigins);

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('✅ CORS allowed for origin:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin']
}));

// Handle preflight requests explicitly
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
    cors: {
      enabled: true,
      allowed_origins: allowedOrigins,
      frontend_url: 'https://adventurous-enjoyment-production-d459.up.railway.app',
      backend_url: 'https://employee-attendance-tracker-production-5550.up.railway.app'
    },
    database: {
      type: process.env.DB_TYPE || 'sqlite',
      connected: true
    }
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Employee Attendance Tracker API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    cors: {
      enabled: true,
      allowed_origins: allowedOrigins
    },
    endpoints: {
      'GET /health': 'Health check',
      'GET /api': 'API information',
      'GET /test-db': 'Test database connection',
      'GET /api/attendance': 'Get all attendance records',
      'POST /api/attendance': 'Create new attendance record',
      'DELETE /api/attendance/:id': 'Delete attendance record',
      'GET /api/attendance/search?q=query': 'Search records by name or ID',
      'GET /api/attendance/filter?date=YYYY-MM-DD': 'Filter records by date',
      'GET /api/attendance/stats': 'Get attendance statistics'
    }
  });
});

// Database connection test endpoint
app.get('/test-db', async (req, res) => {
  try {
    // Test if we can require the database module
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
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
      'GET /test-db',
      'GET /api/attendance',
      'POST /api/attendance',
      'DELETE /api/attendance/:id',
      'GET /api/attendance/search',
      'GET /api/attendance/filter',
      'GET /api/attendance/stats'
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('🚨 Server Error:', err.stack);
  
  // CORS error
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      error: 'CORS Error',
      message: 'Origin not allowed',
      allowed_origins: allowedOrigins,
      your_origin: req.headers.origin
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { 
      details: err.message,
      stack: err.stack 
    })
  });
});

// Start server - Listen on 0.0.0.0 for Railway
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
🚀 Server is running on port ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📍 Host: 0.0.0.0
🔗 Health check: http://0.0.0.0:${PORT}/health
📚 API docs: http://0.0.0.0:${PORT}/api
🌐 Public URL: https://employee-attendance-tracker-production-5550.up.railway.app
✅ CORS enabled for ${allowedOrigins.length} origins:
   ${allowedOrigins.join('\n   ')}
  `);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});