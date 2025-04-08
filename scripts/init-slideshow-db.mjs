// scripts/init-slideshow-db.mjs

import { query } from '../src/lib/db.mjs';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

(async () => {
  console.log('🔄 Initializing slideshow tables...');
  
  try {
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
    
    console.log('✅ Slideshow tables initialization complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error initializing slideshow tables:', err);
    process.exit(1);
  }
})();