const DatabaseConfig = require('../config/database-config');

class Attendance {
  constructor() {
    this.dbConfig = DatabaseConfig.getDatabase();
    this.db = this.dbConfig.getConnection();
    this.dbType = DatabaseConfig.getDatabaseType();
    this.isRailway = DatabaseConfig.isRailway();
  }

  // Create new attendance record
  async create(attendanceData) {
    const { employeeName, employeeID, date, status } = attendanceData;
    
    try {
      const sql = `INSERT INTO attendance (employeeName, employeeID, date, status) 
                   VALUES (?, ?, ?, ?)`;
      const values = [employeeName, employeeID, date, status];
      
      const [result] = await this.db.execute(sql, values);
      return { id: result.insertId, ...attendanceData };
    } catch (error) {
      throw error;
    }
  }

  // Get all attendance records
  async getAll() {
    try {
      const sql = `SELECT * FROM attendance ORDER BY date DESC, id DESC`;
      const [rows] = await this.db.execute(sql);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get attendance by ID
  async getById(id) {
    try {
      const sql = `SELECT * FROM attendance WHERE id = ?`;
      const [rows] = await this.db.execute(sql, [id]);
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Delete attendance record
  async delete(id) {
    try {
      const sql = `DELETE FROM attendance WHERE id = ?`;
      const [result] = await this.db.execute(sql, [id]);
      return { changes: result.affectedRows };
    } catch (error) {
      throw error;
    }
  }

  // Search attendance by employee name or ID
  async search(query) {
    try {
      const sql = `SELECT * FROM attendance 
                   WHERE employeeName LIKE ? OR employeeID LIKE ? 
                   ORDER BY date DESC, id DESC`;
      const searchTerm = `%${query}%`;
      const [rows] = await this.db.execute(sql, [searchTerm, searchTerm]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Filter attendance by date
  async filterByDate(date) {
    try {
      const sql = `SELECT * FROM attendance WHERE date = ? ORDER BY id DESC`;
      const [rows] = await this.db.execute(sql, [date]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Get attendance statistics
  async getStats() {
    try {
      const sql = `
        SELECT 
          COUNT(*) as totalRecords,
          COUNT(DISTINCT employeeID) as totalEmployees,
          SUM(CASE WHEN status = 'Present' THEN 1 ELSE 0 END) as presentCount,
          SUM(CASE WHEN status = 'Absent' THEN 1 ELSE 0 END) as absentCount
        FROM attendance
      `;
      const [rows] = await this.db.execute(sql);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Attendance;