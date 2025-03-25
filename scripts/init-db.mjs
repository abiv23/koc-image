// scripts/init-db.js
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import { mkdir } from 'fs/promises';
import { join } from 'path';
// import { fileURLToPath } from 'url';
// import { dirname } from 'path';

// Get the directory name using ESM pattern
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

(async () => {
  // Create uploads directory if it doesn't exist
  const uploadsDir = join(process.cwd(), 'public/uploads');
  try {
    await mkdir(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory');
  } catch (err) {
    console.error('Error creating uploads directory:', err);
  }

  // Open database connection
  const db = await open({
    filename: './data.db',
    driver: sqlite3.Database
  });
  
  console.log('🔄 Creating database tables...');
  
  // Create users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // Create images table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL,
      original_filename TEXT NOT NULL,
      size INTEGER NOT NULL,
      width INTEGER,
      height INTEGER,
      mime_type TEXT NOT NULL,
      description TEXT,
      user_id INTEGER NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);
  
  // Create tags table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    )
  `);
  
  // Create image_tags join table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS image_tags (
      image_id INTEGER NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (image_id, tag_id),
      FOREIGN KEY (image_id) REFERENCES images (id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
    )
  `);
  
  console.log('✅ Database tables created');
  
  // Check if test user exists
  const testUser = await db.get('SELECT * FROM users WHERE email = ?', ['test@example.com']);
  
  if (!testUser) {
    // Create test user
    const hashedPassword = await bcrypt.hash('password', 10);
    await db.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      ['Test User', 'test@example.com', hashedPassword]
    );
    console.log('✅ Created test user: test@example.com (password: password)');
  } else {
    console.log('ℹ️ Test user already exists');
  }
  
  // Create some sample tags
  const sampleTags = ['event', 'meeting', 'charity', 'social', 'group', 'fundraiser'];
  
  for (const tag of sampleTags) {
    try {
      await db.run('INSERT INTO tags (name) VALUES (?)', [tag]);
    } catch (error) {
      console.log(error)
    }
  }
  
  console.log('✅ Sample tags created');
  console.log('✅ Database initialization complete!');
  
  await db.close();
})().catch(err => {
  console.error('Error initializing database:', err);
  process.exit(1);
});