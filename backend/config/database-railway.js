const mysql = require('mysql2/promise');
require('dotenv').config();

class RailwayMySQLDatabase {
  constructor() {
    // Railway provides MySQL connection URL or individual variables
    this.config = {
      host: process.env.MYSQLHOST || process.env.DB_HOST || 'mysql.railway.internal',
      user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
      password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
      database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'railway',
      port: process.env.MYSQLPORT || process.env.DB_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      // Railway specific SSL configuration
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    };
    this.pool = null;
    this.init();
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

      // Create pool directly - Railway database is already created
      this.pool = mysql.createPool(this.config);
      
      // Test connection
      const testConnection = await this.pool.getConnection();
      console.log('✓ Successfully connected to Railway MySQL');
      testConnection.release();
      
      await this.createTables();
      await this.insertSampleData();
      
      console.log('✓ Railway MySQL database initialized successfully');
    } catch (error) {
      console.error('✗ Error connecting to Railway MySQL database:', error.message);
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

        CREATE INDEX IF NOT EXISTS idx_attendance_employee_id ON attendance(employeeID);
        CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
        CREATE INDEX IF NOT EXISTS idx_attendance_status ON attendance(status);
        CREATE INDEX IF NOT EXISTS idx_attendance_employee_name ON attendance(employeeName);
      `;

      await connection.execute(schema);
      connection.release();
      console.log('✓ Railway MySQL tables created/verified');
    } catch (error) {
      console.error('✗ Error creating Railway MySQL tables:', error.message);
      throw error;
    }
  }

  async insertSampleData() {
    try {
      const connection = await this.pool.getConnection();
      
      // Check if data already exists
      const [rows] = await connection.execute('SELECT COUNT(*) as count FROM attendance');
      
      if (rows[0].count === 0) {
        const sampleData = `
          INSERT INTO attendance (employeeName, employeeID, date, status) VALUES
          ('John Smith', 'EMP001', CURDATE(), 'Present'),
          ('Sarah Johnson', 'EMP002', CURDATE(), 'Present'),
          ('Mike Wilson', 'EMP003', CURDATE(), 'Absent'),
          ('Lisa Brown', 'EMP004', CURDATE(), 'Present'),
          ('David Lee', 'EMP005', CURDATE(), 'Present')
        `;

        await connection.execute(sampleData);
        console.log('✓ Sample data inserted into Railway MySQL');
      } else {
        console.log('✓ Sample data already exists in Railway MySQL');
      }
      
      connection.release();
    } catch (error) {
      console.error('✗ Error inserting sample data into Railway MySQL:', error.message);
      throw error;
    }
  }

  getConnection() {
    return this.pool;
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('✓ Railway MySQL connection pool closed');
    }
  }
}

module.exports = new RailwayMySQLDatabase();