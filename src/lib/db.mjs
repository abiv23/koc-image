import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

// This ensures we reuse the same connection across requests
let db = null;

export async function getDb() {
  if (db) return db;
  
  // Open the database
  db = await open({
    filename: './data.db', // This will create the DB in the project root
    driver: sqlite3.Database
  });
  
  // Initialize the database with our tables if they don't exist
  await initDb(db);
  
  return db;
}

async function initDb(db) {
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
  
  // Check if the default admin user exists, if not create it
  const adminUser = await db.get('SELECT * FROM users WHERE email = ?', ['admin@example.com']);
  
  if (!adminUser) {
    await db.run(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      ['Admin User', 'admin@example.com', '$2a$10$tLH42ClDEoCgqkGFRxCKbu8uFLvbcMxcZZJnmH76j31vGGUy2wuyq'] // "password" hashed
    );
  }
}

// Helper functions for common database operations

// Users
export async function getUserByEmail(email) {
  const db = await getDb();
  return db.get('SELECT * FROM users WHERE email = ?', [email]);
}

export async function getUserById(id) {
  const db = await getDb();
  return db.get('SELECT * FROM users WHERE id = ?', [id]);
}

export async function createUser(name, email, hashedPassword) {
  const db = await getDb();
  const result = await db.run(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, hashedPassword]
  );
  return result.lastID;
}

// Images
export async function saveImage(imageData) {
  const db = await getDb();
  const { filename, originalFilename, size, width, height, mimeType, description, userId } = imageData;
  
  const result = await db.run(
    `INSERT INTO images 
     (filename, original_filename, size, width, height, mime_type, description, user_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [filename, originalFilename, size, width, height, mimeType, description, userId]
  );
  
  return result.lastID;
}

export async function getImagesByUserId(userId) {
  const db = await getDb();
  return db.all('SELECT * FROM images WHERE user_id = ? ORDER BY created_at DESC', [userId]);
}

export async function getImageById(id) {
  const db = await getDb();
  return db.get('SELECT * FROM images WHERE id = ?', [id]);
}

// Tags
export async function addTagToImage(imageId, tagName) {
  const db = await getDb();
  
  // First, ensure the tag exists
  let tag = await db.get('SELECT * FROM tags WHERE name = ?', [tagName]);
  
  if (!tag) {
    // Create the tag if it doesn't exist
    const result = await db.run('INSERT INTO tags (name) VALUES (?)', [tagName]);
    tag = { id: result.lastID, name: tagName };
  }
  
  // Then add the tag to the image
  await db.run(
    'INSERT OR IGNORE INTO image_tags (image_id, tag_id) VALUES (?, ?)',
    [imageId, tag.id]
  );
  
  return tag;
}

export async function getImageTags(imageId) {
  const db = await getDb();
  return db.all(`
    SELECT t.* FROM tags t
    JOIN image_tags it ON t.id = it.tag_id
    WHERE it.image_id = ?
  `, [imageId]);
}