const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const attendanceRoutes = require('./routes/attendance');
const DatabaseConfig = require('./config/database-config');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.RAILWAY_STATIC_URL, 'https://your-app-name.railway.app'] 
    : ['http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint for Railway
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: DatabaseConfig.getDatabaseType()
  });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Employee Attendance Tracker API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    database: DatabaseConfig.getDatabaseType(),
    endpoints: {
      'POST /api/attendance': 'Create new attendance record',
      'GET /api/attendance': 'Get all attendance records',
      'GET /api/attendance/stats': 'Get attendance statistics',
      'DELETE /api/attendance/:id': 'Delete attendance record',
      'GET /api/attendance/search?q=query': 'Search records',
      'GET /api/attendance/filter?date=YYYY-MM-DD': 'Filter by date'
    }
  });
});

// Routes
app.use('/api/attendance', attendanceRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'GET /api',
      'POST /api/attendance',
      'GET /api/attendance',
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
    error: 'Something went wrong!',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️ Database: ${DatabaseConfig.getDatabaseType()}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API docs: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server gracefully...');
  try {
    const db = DatabaseConfig.getDatabase();
    if (db.close) {
      await db.close();
    }
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

module.exports = app;