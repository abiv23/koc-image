import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';

// Create a PostgreSQL connection pool
let pool;

// Get the database connection
function getPool() {
  if (!pool) {
    // Initialize the connection pool using the correct env variable
    pool = new Pool({
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
  }
  return pool;
}

// Helper function to run SQL queries
async function query(text, params) {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

export async function initDb() {
  try {
    // Create users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Create images table
    await query(`
      CREATE TABLE IF NOT EXISTS images (
        id SERIAL PRIMARY KEY,
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
    await query(`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL
      )
    `);
    
    // Create image_tags join table
    await query(`
      CREATE TABLE IF NOT EXISTS image_tags (
        image_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (image_id, tag_id),
        FOREIGN KEY (image_id) REFERENCES images (id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE
      )
    `);
    
    // Check if the default test user exists, if not create it
    const existingUser = await query(
      'SELECT * FROM users WHERE email = $1', 
      ['test@example.com']
    );
    
    if (existingUser.rows.length === 0) {
      const hashedPassword = await bcrypt.hash('password', 10);
      await query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3)',
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
        await query('INSERT INTO tags (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [tag]);
      } catch (error) {
        console.log('Error creating tag:', error);
      }
    }
    
    console.log('✅ Database initialization complete!');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Users
export async function getUserByEmail(email) {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

export async function getUserById(id) {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
}

export async function createUser(name, email, hashedPassword) {
  const result = await query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
    [name, email, hashedPassword]
  );
  return result.rows[0].id;
}

// Images
export async function saveImage(imageData) {
  const { filename, originalFilename, size, width, height, mimeType, description, userId } = imageData;
  
  const result = await query(
    `INSERT INTO images 
     (filename, original_filename, size, width, height, mime_type, description, user_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id`,
    [filename, originalFilename, size, width, height, mimeType, description, userId]
  );
  
  return result.rows[0].id;
}

export async function getImagesByUserId(userId) {
  const result = await query(
    'SELECT * FROM images WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

export async function getImageById(id) {
  const result = await query('SELECT * FROM images WHERE id = $1', [id]);
  return result.rows[0];
}

// Tags
export async function addTagToImage(imageId, tagName) {
  // First, ensure the tag exists
  let tag;
  const existingTag = await query('SELECT * FROM tags WHERE name = $1', [tagName]);
  
  if (existingTag.rows.length === 0) {
    // Create the tag if it doesn't exist
    const result = await query(
      'INSERT INTO tags (name) VALUES ($1) RETURNING id, name',
      [tagName]
    );
    tag = result.rows[0];
  } else {
    tag = existingTag.rows[0];
  }
  
  // Then add the tag to the image (if not already exists)
  try {
    await query(
      'INSERT INTO image_tags (image_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [imageId, tag.id]
    );
  } catch (error) {
    console.error('Error adding tag to image:', error);
  }
  
  return tag;
}

export async function getImageTags(imageId) {
  const result = await query(`
    SELECT t.* FROM tags t
    JOIN image_tags it ON t.id = it.tag_id
    WHERE it.image_id = $1
  `, [imageId]);
  return result.rows;
}

// Images with pagination and tag filtering
export async function getImages(limit, offset, tag = null) {
  let images;
  let total;
  
  if (tag) {
    // Get images with a specific tag
    images = await query(`
      SELECT i.* FROM images i
      JOIN image_tags it ON i.id = it.image_id
      JOIN tags t ON it.tag_id = t.id
      WHERE t.name = $1
      ORDER BY i.created_at DESC
      LIMIT $2 OFFSET $3
    `, [tag, limit, offset]);
    
    const totalResult = await query(`
      SELECT COUNT(*) as count FROM images i
      JOIN image_tags it ON i.id = it.image_id
      JOIN tags t ON it.tag_id = t.id
      WHERE t.name = $1
    `, [tag]);
    
    total = totalResult.rows[0].count;
  } else {
    // Get all images
    images = await query(`
      SELECT * FROM images
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    
    const totalResult = await query('SELECT COUNT(*) as count FROM images');
    total = totalResult.rows[0].count;
  }
  
  return { images: images.rows, total: parseInt(total) };
}

// Delete an image
export async function deleteImage(id) {
  // First delete from image_tags (should cascade, but being explicit)
  await query('DELETE FROM image_tags WHERE image_id = $1', [id]);
  
  // Then delete the image
  await query('DELETE FROM images WHERE id = $1', [id]);
  
  return true;
}