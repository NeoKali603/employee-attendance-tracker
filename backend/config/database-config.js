require('dotenv').config();

class DatabaseConfig {
  static getDatabase() {
    const dbType = process.env.DB_TYPE || 'sqlite';
    
    switch (dbType.toLowerCase()) {
      case 'mysql':
      case 'railway':
        return require('./database-railway'); // Use Railway-specific MySQL
      case 'postgresql':
      case 'postgres':
        return require('./database-postgresql');
      case 'sqlite':
      default:
        return require('./database');
    }
  }

  static getDatabaseType() {
    return process.env.DB_TYPE || 'sqlite';
  }

  // Railway-specific method
  static isRailway() {
    return process.env.RAILWAY_ENVIRONMENT === 'true' || 
           process.env.RAILWAY_STATIC_URL !== undefined;
  }
}

module.exports = DatabaseConfig;