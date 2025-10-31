const mysql = require('mysql2/promise');

class Database {
  constructor() {
    this.config = {
      host: process.env.MYSQLHOST || 'localhost',
      user: process.env.MYSQLUSER || 'root',
      password: process.env.MYSQLPASSWORD || '',
      database: process.env.MYSQLDATABASE || 'railway',
      port: process.env.MYSQLPORT || 3306,
    };
    this.pool = null;
  }

  async connect() {
    try {
      this.pool = mysql.createPool(this.config);
      const connection = await this.pool.getConnection();
      console.log('✅ Connected to MySQL database');
      connection.release();
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      return false;
    }
  }

  getConnection() {
    return this.pool;
  }
}

module.exports = new Database();