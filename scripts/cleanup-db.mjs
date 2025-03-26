// scripts/cleanup-db.mjs

import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create a database connection pool (copied from db.mjs since getPool isn't exported)
function createPool() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false // Required for some Neon connections
    }
  });
  
  // Handle errors
  pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
  });
  
  return pool;
}

async function cleanupDatabase() {
  const pool = createPool();
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting database cleanup...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Delete all records from tables in correct order (respect foreign keys)
    console.log('Removing image_tags records...');
    await client.query('DELETE FROM image_tags');
    
    console.log('Removing images records...');
    await client.query('DELETE FROM images');
    
    console.log('Removing tags records...');
    await client.query('DELETE FROM tags');
    
    console.log('Removing users records...');
    await client.query('DELETE FROM users');
    
    // Re-initialize sequence IDs to start from 1
    console.log('Resetting sequence IDs...');
    await client.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE images_id_seq RESTART WITH 1');
    await client.query('ALTER SEQUENCE tags_id_seq RESTART WITH 1');
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('✅ Database cleanup complete! All tables have been reset.');
  } catch (error) {
    // Rollback on error
    await client.query('ROLLBACK');
    console.error('❌ Error during database cleanup:', error);
    throw error;
  } finally {
    client.release();
    // Close the pool to end the process
    await pool.end();
  }
}

// Run the cleanup function
cleanupDatabase()
  .then(() => {
    console.log('Database cleanup completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database cleanup failed:', error);
    process.exit(1);
  });