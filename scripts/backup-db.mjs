// scripts/backup-db.mjs

import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function backupDatabase() {
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
  
  const client = await pool.connect();
  
  try {
    console.log('Starting database backup...');
    
    // Backup each table
    const users = await client.query('SELECT * FROM users');
    const images = await client.query('SELECT * FROM images');
    const tags = await client.query('SELECT * FROM tags');
    const imageTags = await client.query('SELECT * FROM image_tags');
    
    const backup = {
      users: users.rows,
      images: images.rows,
      tags: tags.rows,
      imageTags: imageTags.rows,
      timestamp: new Date().toISOString()
    };
    
    // Write to file
    await fs.writeFile(
      `database-backup-${new Date().toISOString().replace(/:/g, '-')}.json`, 
      JSON.stringify(backup, null, 2)
    );
    
    console.log('Backup completed successfully!');
  } catch (error) {
    console.error('Backup failed:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

backupDatabase();