const DatabaseConfig = require('../config/database-config');

async function railwaySetup() {
  try {
    console.log('🚄 Railway MySQL Setup Started...');
    
    const db = DatabaseConfig.getDatabase();
    const dbType = DatabaseConfig.getDatabaseType();
    
    console.log(`📊 Database Type: ${dbType}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🏠 Host: ${process.env.DB_HOST}`);
    console.log(`🗃️ Database: ${process.env.DB_NAME}`);
    
    // Test connection
    const connection = await db.getConnection();
    console.log('✅ Database connection successful');
    connection.release();
    
    console.log('🎉 Railway setup completed successfully!');
    console.log('🚀 You can now deploy to Railway');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Railway setup failed:');
    console.error('Error:', error.message);
    console.error('\n💡 Troubleshooting tips:');
    console.error('1. Check your Railway MySQL connection variables');
    console.error('2. Ensure MySQL service is running on Railway');
    console.error('3. Verify database credentials');
    console.error('4. Check network connectivity');
    
    process.exit(1);
  }
}

railwaySetup();