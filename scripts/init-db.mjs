// Add to your src/lib/db.mjs file's initDb function or create a separate function

import { initDb, updateUsersTableWithKnightNumberHash, updateUsersTableWithAdminFlag, setUserAsAdmin, query } from '../src/lib/db.mjs';
import { initApprovedEmailsTable } from '../src/lib/emailValidation.mjs';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { createRequire } from 'module';
import bcrypt from 'bcryptjs';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// For __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a require function
const require = createRequire(import.meta.url);

async function initSlideshowTables() {
  try {
    console.log('🔄 Initializing slideshow tables...');
    
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
    
    console.log('✅ Created slideshows table');
    
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
    
    console.log('✅ Created slideshow_photos table');
    
    return true;
  } catch (error) {
    console.error('Error initializing slideshow tables:', error);
    return false;
  }
}

(async () => {
  console.log('🔄 Initializing database...');
  
  try {
    // Create uploads directory if it doesn't exist (for local development)
    const uploadsDir = join(dirname(__dirname), 'public/uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
      console.log('✅ Created uploads directory for local development at:', uploadsDir);
    } catch (err) {
      console.error('Error creating uploads directory:', err);
    }
    
    // Check if PostgreSQL connection string is available
    if (!process.env.POSTGRES_URL && !process.env.DATABASE_URL) {
      throw new Error("Neither POSTGRES_URL nor DATABASE_URL environment variable is set. Please add one to your .env.local file.");
    }
    
    console.log('🔄 Connecting to database...');
    
    // Initialize the database tables
    await initDb();
    
    // Update users table with knight_number_hash column if needed
    await updateUsersTableWithKnightNumberHash();
    
    // Update users table with is_admin column if needed
    await updateUsersTableWithAdminFlag();
    
    // Initialize approved emails table
    await initApprovedEmailsTable();
    
    // Initialize slideshow tables
    await initSlideshowTables();
    
    // Set specific admin user - abiv23@gmail.com
    console.log('🔄 Setting abiv23@gmail.com as admin...');
    
    // Check if admin user exists
    const adminEmail = 'abiv23@gmail.com';
    const adminUserResult = await query('SELECT id FROM users WHERE email = $1', [adminEmail]);
    
    if (adminUserResult.rows.length > 0) {
      // Admin user exists, set as admin
      const adminUserId = adminUserResult.rows[0].id;
      await setUserAsAdmin(adminUserId);
      console.log(`✅ User ${adminEmail} set as admin`);
    } else {
      // Admin user doesn't exist, create it
      console.log(`🔄 Admin user ${adminEmail} not found, creating...`);
      
      // Create admin user with secure password
      const hashedPassword = await bcrypt.hash('adminPassword', 10); // You should use a secure password
      
      const insertResult = await query(
        'INSERT INTO users (name, email, password, is_admin) VALUES ($1, $2, $3, $4) RETURNING id',
        ['Admin User', adminEmail, hashedPassword, true]
      );
      
      console.log(`✅ Created admin user: ${adminEmail} (password: adminPassword)`);
    }
    
    // Remove admin privileges from test@example.com if it exists
    const testUserResult = await query('SELECT id FROM users WHERE email = $1', ['test@example.com']);
    if (testUserResult.rows.length > 0) {
      const testUserId = testUserResult.rows[0].id;
      await query('UPDATE users SET is_admin = FALSE WHERE id = $1', [testUserId]);
      console.log('✅ Removed admin privileges from test@example.com');
    }
    
    console.log('✅ Database initialization complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
})();