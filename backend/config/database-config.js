const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
  constructor() {
    this.db = null;
    this.init();
  }

  init() {
    try {
      // Create data directory if it doesn't exist
      const dataDir = path.join(__dirname, '..', 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
        console.log('📁 Created data directory:', dataDir);
      }

      const dbPath = path.join(dataDir, 'attendance.db');
      console.log('📁 Database path:', dbPath);
      
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('❌ Error opening database:', err.message);
        } else {
          console.log('✅ Connected to SQLite database');
          this.createTable();
        }
      });
    } catch (error) {
      console.error('❌ Database initialization error:', error);
    }
  }

  createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        employeeId TEXT NOT NULL,
        employeeName TEXT NOT NULL,
        date TEXT NOT NULL,
        status TEXT NOT NULL,
        checkIn TEXT,
        checkOut TEXT,
        department TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.run(sql, (err) => {
      if (err) {
        console.error('❌ Error creating table:', err.message);
      } else {
        console.log('✅ Attendance table ready');
      }
    });
  }

  // Add attendance record
  addAttendance(record) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO attendance (employeeId, employeeName, date, status, checkIn, checkOut, department)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      
      const params = [
        record.employeeId,
        record.employeeName,
        record.date,
        record.status,
        record.checkIn || null,
        record.checkOut || null,
        record.department || null
      ];

      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...record });
        }
      });
    });
  }

  // Get all attendance records
  getAllAttendance() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM attendance ORDER BY createdAt DESC`;
      
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Delete attendance record
  deleteAttendance(id) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM attendance WHERE id = ?`;
      
      this.db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  // Search attendance records
  searchAttendance(query) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT * FROM attendance 
        WHERE employeeName LIKE ? OR employeeId LIKE ? 
        ORDER BY createdAt DESC
      `;
      const searchTerm = `%${query}%`;
      
      this.db.all(sql, [searchTerm, searchTerm], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Filter by date
  filterByDate(date) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM attendance WHERE date = ? ORDER BY createdAt DESC`;
      
      this.db.all(sql, [date], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Get attendance statistics
  getAttendanceStats() {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          COUNT(*) as totalRecords,
          COUNT(DISTINCT employeeId) as totalEmployees,
          SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as presentCount,
          SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absentCount,
          SUM(CASE WHEN status = 'Late' THEN 1 ELSE 0 END) as lateCount
        FROM attendance
      `;
      
      this.db.get(sql, [], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  getConnection() {
    if (!this.db) {
      this.init();
    }
    return this;
  }

  static getDatabaseType() {
    return 'SQLite';
  }
}

// Create and export instance
const databaseInstance = new Database();
module.exports = databaseInstance;