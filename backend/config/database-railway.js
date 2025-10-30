// backend/config/database-railway.js
const mysql = require('mysql2/promise');
require('dotenv').config();
const { URL } = require('url');

class RailwayMySQLDatabase {
  constructor() {
    this.config = this.buildConfig();
    this.pool = null;
    this.init();
  }

  buildConfig() {
    // Try using the MYSQL_URL first (Railway's preferred connection method)
    const mysqlUrl = process.env.MYSQL_URL;
    
    if (mysqlUrl) {
      try {
        const parsed = new URL(mysqlUrl);
        return {
          host: parsed.hostname,
          user: parsed.username,
          password: parsed.password,
          database: parsed.pathname.replace('/', ''),
          port: parseInt(parsed.port || '3306'),
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          ssl: {
            rejectUnauthorized: false
          }
        };
      } catch (err) {
        console.error('Failed to parse MYSQL_URL:', err.message);
      }
    }

    // Fallback to individual environment variables
    const config = {
      host: process.env.MYSQLHOST || 'localhost',
      user: process.env.MYSQLUSER || 'root',
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE || 'railway',
      port: parseInt(process.env.MYSQLPORT || '3306'),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: {
        rejectUnauthorized: false
      }
    };

    // Log connection details (excluding password)
    console.log('MySQL Configuration:', {
      host: config.host,
      user: config.user,
      database: config.database,
      port: config.port,
      ssl: config.ssl
    });

    return config;
  }

  async init() {
    try {
      console.log('Connecting to Railway MySQL database...');
      console.log('Database Config:', {
        host: this.config.host,
        user: this.config.user,
        database: this.config.database,
        port: this.config.port
      });

      this.pool = mysql.createPool(this.config);
      const testConn = await this.pool.getConnection();
      console.log('✓ Successfully connected to Railway MySQL');
      testConn.release();

      await this.createTables();
      await this.insertSampleData();

      console.log('✓ Railway MySQL database initialized successfully');
    } catch (error) {
      console.error('✗ Error connecting to Railway MySQL:', error.message);
      console.error('Connection details:', {
        host: this.config.host,
        user: this.config.user,
        database: this.config.database
      });
      throw error;
    }
  }

  async createTables() {
    try {
      const connection = await this.pool.getConnection();
      const schema = `
        CREATE TABLE IF NOT EXISTS attendance (
          id INT AUTO_INCREMENT PRIMARY KEY,
          employeeName VARCHAR(255) NOT NULL,
          employeeID VARCHAR(50) NOT NULL,
          date DATE NOT NULL,
          status ENUM('Present', 'Absent') NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
      `;
      await connection.query(schema);
      connection.release();
      console.log('✓ Attendance table verified/created');
    } catch (error) {
      console.error('✗ Error creating tables:', error.message);
      throw error;
    }
  }

  async insertSampleData() {
    try {
      const connection = await this.pool.getConnection();
      const [rows] = await connection.query('SELECT COUNT(*) AS count FROM attendance');

      if (rows[0].count === 0) {
        const sampleData = `
          INSERT INTO attendance (employeeName, employeeID, date, status) VALUES
          ('John Smith', 'EMP001', CURDATE(), 'Present'),
          ('Sarah Johnson', 'EMP002', CURDATE(), 'Present'),
          ('Mike Wilson', 'EMP003', CURDATE(), 'Absent'),
          ('Lisa Brown', 'EMP004', CURDATE(), 'Present'),
          ('David Lee', 'EMP005', CURDATE(), 'Present');
        `;
        await connection.query(sampleData);
        console.log('✓ Sample data inserted');
      } else {
        console.log('✓ Sample data already exists');
      }

      connection.release();
    } catch (error) {
      console.error('✗ Error inserting sample data:', error.message);
      throw error;
    }
  }

  getConnection() {
    return this.pool;
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('✓ MySQL pool closed');
    }
  }
}

module.exports = new RailwayMySQLDatabase();
