import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: '.env.local' });

// Create a database connection pool
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

async function backupDatabase() {
  console.log('📦 Starting database backup...');
  const pool = createPool();
  const client = await pool.connect();
  
  try {
    // Create backup directory if it doesn't exist
    const backupDir = path.join(__dirname, 'db-backups');
    await fs.mkdir(backupDir, { recursive: true });
    
    // Create timestamp for filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `database-backup-${timestamp}.json`);
    
    // Backup each table
    console.log('Backing up users table...');
    const users = await client.query('SELECT * FROM users');
    
    console.log('Backing up images table...');
    const images = await client.query('SELECT * FROM images');
    
    console.log('Backing up tags table...');
    const tags = await client.query('SELECT * FROM tags');
    
    console.log('Backing up image_tags table...');
    const imageTags = await client.query('SELECT * FROM image_tags');
    
    const backup = {
      metadata: {
        timestamp: new Date().toISOString(),
        tables: {
          users: users.rows.length,
          images: images.rows.length,
          tags: tags.rows.length,
          imageTags: imageTags.rows.length
        }
      },
      users: users.rows,
      images: images.rows,
      tags: tags.rows,
      imageTags: imageTags.rows
    };
    
    // Write to file
    await fs.writeFile(backupPath, JSON.stringify(backup, null, 2));
    
    console.log(`✅ Backup completed successfully to: ${backupPath}`);
    return backupPath;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
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

// Run backup and then cleanup
async function main() {
  try {
    // First backup the database
    const backupPath = await backupDatabase();
    console.log(`Database backed up to: ${backupPath}`);
    
    // Wait a moment to ensure backup is complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Then run the cleanup
    await cleanupDatabase();
    
    console.log('🎉 Database backup and cleanup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Process failed:', error);
    process.exit(1);
  }
}

// Start the process
main();