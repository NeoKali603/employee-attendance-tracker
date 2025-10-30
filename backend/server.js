const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const attendanceRoutes = require('./routes/attendance');
const DatabaseConfig = require('./config/database-config');

const app = express();
const PORT = process.env.PORT || process.env.RAILWAY_PORT || 5000;

// Initialize database
const db = DatabaseConfig.getDatabase();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', message: 'Service is running' });
});

// Routes
app.use('/api/attendance', attendanceRoutes);

// Log startup information
console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
console.log(`Server starting on port ${PORT}`);
console.log('Database configuration:', {
  host: process.env.MYSQL_HOST || 'nozomi.proxy.rlwy.net',
  port: process.env.MYSQL_PORT || 46172,
  database: process.env.MYSQL_DATABASE || 'railway',
  user: process.env.MYSQL_USER || 'root'
});

// Health check with DB status
app.get('/health', async (req, res) => {
  try {
    const connection = await db.getConnection();
    connection.release();
    
    res.status(200).json({ 
      status: 'OK', 
      message: 'Server is running',
      database: 'Connected',
      timestamp: new Date().toISOString(),
      env: process.env.NODE_ENV,
      railway: DatabaseConfig.isRailway() ? 'true' : 'false'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Server is running but database connection failed',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Database connection error',
      timestamp: new Date().toISOString()
    });
  }
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`📊 Database: ${DatabaseConfig.getDatabaseType()}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    db.close().then(() => {
      console.log('Database connections closed');
      process.exit(0);
    });
  });
});