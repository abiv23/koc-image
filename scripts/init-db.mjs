// scripts/init-db.mjs

import { initDb, updateUsersTableWithKnightNumberHash } from '../src/lib/db.mjs';
import { mkdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { createRequire } from 'module';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// For __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create a require function
const require = createRequire(import.meta.url);

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
    
    console.log('✅ Database initialization complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing database:', err);
    process.exit(1);
  }
})();