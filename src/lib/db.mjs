import pkg from 'pg';
const { Pool } = pkg;
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

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

// Helper function to run SQL queries - moved before any other functions that use it
export async function query(text, params) {
  const client = await getPool().connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
}

// Helper function to hash an email (moved from emailValidation to avoid circular dependency)
export function hashEmail(email) {
  const salt = process.env.EMAIL_SALT || 'koc_photo_sharing_salt';
  return crypto.createHash('sha256').update(email.toLowerCase() + salt).digest('hex');
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
        knight_number_hash TEXT UNIQUE,
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

    // Create slideshows table
    await query(`
      CREATE TABLE IF NOT EXISTS slideshows (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        user_id INTEGER NOT NULL,
        is_public BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Create slideshow_photos junction table
    await query(`
      CREATE TABLE IF NOT EXISTS slideshow_photos (
        slideshow_id INTEGER NOT NULL,
        image_id INTEGER NOT NULL,
        position INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (slideshow_id, image_id),
        FOREIGN KEY (slideshow_id) REFERENCES slideshows (id) ON DELETE CASCADE,
        FOREIGN KEY (image_id) REFERENCES images (id) ON DELETE CASCADE
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

export async function updateUsersTableWithKnightNumberHash() {
  try {
    // Check if knight_number_hash column exists
    const checkColumnResult = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'knight_number_hash'
    `);
    
    // If column doesn't exist, add it
    if (checkColumnResult.rows.length === 0) {
      await query(`
        ALTER TABLE users 
        ADD COLUMN knight_number_hash TEXT UNIQUE
      `);
      console.log('✅ Added knight_number_hash column to users table');
    }
  } catch (error) {
    console.error('Error updating users table:', error);
    throw error;
  }
}

export async function updateUsersTableWithAdminFlag() {
  try {
    // Check if is_admin column exists
    const checkColumnResult = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'is_admin'
    `);
    
    // If column doesn't exist, add it
    if (checkColumnResult.rows.length === 0) {
      await query(`
        ALTER TABLE users 
        ADD COLUMN is_admin BOOLEAN DEFAULT FALSE
      `);
      console.log('✅ Added is_admin column to users table');
    }
  } catch (error) {
    console.error('Error updating users table with admin flag:', error);
    throw error;
  }
}

/**
 * Set a user as admin
 * @param {number} userId - The user ID to set as admin
 * @returns {Promise<boolean>} Success status
 */
export async function setUserAsAdmin(userId) {
  try {
    await query('UPDATE users SET is_admin = TRUE WHERE id = $1', [userId]);
    return true;
  } catch (error) {
    console.error('Error setting user as admin:', error);
    return false;
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

// Legacy function kept for backward compatibility
export async function isKnightNumberHashUsed(knightNumberHash) {
  console.warn('isKnightNumberHashUsed is deprecated. Use isEmailHashUsed instead.');
  return false;
}

// Get authorized emails from the database
export async function getAuthorizedEmailsFromDb() {
  try {
    // Check if the approved_emails table exists
    const tableExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'approved_emails'
      )
    `);
    
    if (!tableExists.rows[0].exists) {
      console.warn('approved_emails table does not exist in the database');
      return [];
    }
    
    // Get all approved emails
    const result = await query('SELECT email FROM approved_emails WHERE is_active = true');
    return result.rows.map(row => row.email.toLowerCase().trim());
  } catch (error) {
    console.error('Error fetching authorized emails from database:', error);
    return [];
  }
}

// Keep the old function for backward compatibility
export async function createUserWithKnightNumberHash(name, email, hashedPassword, knightNumberHash) {
  console.warn('createUserWithKnightNumberHash is deprecated. Use createUserWithEmailHash instead.');
  return createUserWithEmailHash(name, email, hashedPassword, hashEmail(email));
}

// Functions for managing approved emails
export async function addApprovedEmail(email, addedBy = null) {
  try {
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if email already exists
    const existingEmail = await query(
      'SELECT * FROM approved_emails WHERE email = $1',
      [normalizedEmail]
    );
    
    if (existingEmail.rows.length > 0) {
      // If it exists but was inactive, reactivate it
      if (!existingEmail.rows[0].is_active) {
        await query(
          'UPDATE approved_emails SET is_active = TRUE, added_by = $1 WHERE email = $2',
          [addedBy, normalizedEmail]
        );
        return { success: true, message: 'Email reactivated', id: existingEmail.rows[0].id };
      }
      
      // Already exists and active
      return { success: false, message: 'Email already approved' };
    }
    
    // Add new email
    const result = await query(
      'INSERT INTO approved_emails (email, added_by) VALUES ($1, $2) RETURNING id',
      [normalizedEmail, addedBy]
    );
    
    return { success: true, message: 'Email approved', id: result.rows[0].id };
  } catch (error) {
    console.error('Error adding approved email:', error);
    return { success: false, message: 'Database error' };
  }
}

export async function removeApprovedEmail(email) {
  try {
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();
    
    // Set as inactive rather than deleting
    const result = await query(
      'UPDATE approved_emails SET is_active = FALSE WHERE email = $1',
      [normalizedEmail]
    );
    
    if (result.rowCount === 0) {
      return { success: false, message: 'Email not found' };
    }
    
    return { success: true, message: 'Email removed from approved list' };
  } catch (error) {
    console.error('Error removing approved email:', error);
    return { success: false, message: 'Database error' };
  }
}

export async function getApprovedEmails() {
  try {
    const result = await query(
      'SELECT email, created_at, added_by FROM approved_emails WHERE is_active = TRUE ORDER BY created_at DESC'
    );
    
    return { success: true, emails: result.rows };
  } catch (error) {
    console.error('Error getting approved emails:', error);
    return { success: false, emails: [] };
  }
}

export async function bulkAddApprovedEmails(emails, addedBy = null) {
  const client = await getPool().connect();
  
  try {
    await client.query('BEGIN');
    
    // Normalize emails
    const normalizedEmails = emails.map(email => email.toLowerCase().trim())
      .filter(email => email && email.length > 0);
    
    // Track results
    const results = {
      added: 0,
      reactivated: 0,
      alreadyExists: 0,
      failed: 0
    };
    
    // Process each email
    for (const email of normalizedEmails) {
      try {
        // Check if email already exists
        const existingEmail = await client.query(
          'SELECT * FROM approved_emails WHERE email = $1',
          [email]
        );
        
        if (existingEmail.rows.length > 0) {
          // If it exists but was inactive, reactivate it
          if (!existingEmail.rows[0].is_active) {
            await client.query(
              'UPDATE approved_emails SET is_active = TRUE, added_by = $1 WHERE email = $2',
              [addedBy, email]
            );
            results.reactivated++;
          } else {
            // Already exists and active
            results.alreadyExists++;
          }
        } else {
          // Add new email
          await client.query(
            'INSERT INTO approved_emails (email, added_by) VALUES ($1, $2)',
            [email, addedBy]
          );
          results.added++;
        }
      } catch (error) {
        console.error(`Error processing email ${email}:`, error);
        results.failed++;
      }
    }
    
    await client.query('COMMIT');
    
    return { 
      success: true, 
      results,
      totalProcessed: normalizedEmails.length
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error in bulk adding approved emails:', error);
    return { success: false, message: 'Database error' };
  } finally {
    client.release();
  }
}

// Images
export async function saveImage(imageData) {
  const { 
    filename, 
    originalFilename, 
    size, 
    width, 
    height, 
    mimeType, 
    description, 
    userId   // This was previously mismatched with the parameter name in API
  } = imageData;
  
  // Fix the parameter name mismatch (user_id vs userId)
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

/**
 * Check if a user is an admin
 * @param {number} userId - The user ID to check
 * @returns {Promise<boolean>} Whether the user is an admin
 */
export async function isUserAdmin(userId) {
  try {
    const result = await query('SELECT is_admin FROM users WHERE id = $1', [userId]);
    return result.rows.length > 0 && result.rows[0].is_admin === true;
  } catch (error) {
    console.error('Error checking if user is admin:', error);
    return false;
  }
}

/**
 * Get a list of all admin users
 * @returns {Promise<Array>} Array of admin users
 */
export async function getAdminUsers() {
  try {
    const result = await query('SELECT id, name, email FROM users WHERE is_admin = TRUE');
    return result.rows;
  } catch (error) {
    console.error('Error getting admin users:', error);
    return [];
  }
}
