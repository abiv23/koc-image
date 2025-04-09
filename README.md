# Knights of Columbus Photo Sharing Application

A custom-built photo management application for Knights of Columbus council activities and events. This application allows council members to upload, organize, and share photos while ensuring proper membership verification.

## Features

- **Secure Authentication**: Login and registration with approved email validation
- **Admin Portal**: Manage approved emails for registration 
- **Photo Management**: Upload, browse, and organize council event photos
- **Image Optimization**: Automatic resizing and processing of uploaded images
- **Tag Organization**: Categorize photos with tags for easy discovery
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Secure Image Access**: S3 signed URLs ensure only authenticated users can access photos

## Technology Stack

- **Frontend**: React, Next.js 14, TailwindCSS 4
- **Backend**: Next.js API Routes
- **Database**: Neon PostgreSQL (serverless)
- **Authentication**: NextAuth.js with custom email validation
- **Image Storage**: Local storage (development), AWS S3 with signed URLs (production)
- **Styling**: TailwindCSS with custom components

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL (for local development) or Neon PostgreSQL account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/koc-photo-share.git
   cd koc-photo-share
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file in the root directory with the following variables:
   ```
   # NextAuth configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secure-random-string
   
   # Neon PostgreSQL (Replace with your details)
   POSTGRES_URL=postgres://your-postgres-connection-string
   
   # For production with AWS S3 (optional for development)
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your-access-key
   AWS_SECRET_ACCESS_KEY=your-secret-key
   AWS_BUCKET_NAME=your-bucket-name
   ```

4. Initialize the database:
   ```bash
   npm run init-db
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Management

### Backing Up and Resetting the Database

The application includes scripts to manage the database, which can be useful for development and maintenance.

#### Database Backup and Cleanup

To reset the database (removing all data while preserving the structure):

1. Run the backup and cleanup script:
   ```bash
   node scripts/cleanup-db.mjs
   ```

This script:
- First creates a backup of the existing database in `scripts/db-backups/`
- Backup files are stored as JSON with timestamp-based filenames
- Removes all records from all tables
- Resets sequence IDs to start from 1
- Preserves the database structure

After cleanup, reinitialize the database:
```bash
npm run init-db
```

#### Restoring from Backup

To restore data from a backup:

1. Create a restore script (not included by default)
2. Reference a specific backup file from the `scripts/db-backups/` directory
3. Run the restore script

Example restoration script:
```javascript
// scripts/restore-db.mjs
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function restoreFromBackup(backupFileName) {
  const backupPath = path.join(__dirname, 'db-backups', backupFileName);
  const backupData = JSON.parse(await fs.readFile(backupPath, 'utf8'));
  
  // Implement restoration logic here
  console.log(`Restoring from backup: ${backupPath}`);
}

// Usage: node scripts/restore-db.mjs database-backup-2023-07-15T12-34-56-789Z.json
const backupFileName = process.argv[2];
if (!backupFileName) {
  console.error('Please provide a backup filename');
  process.exit(1);
}

restoreFromBackup(backupFileName);
```

## Admin Functionality

This application includes an admin panel for managing approved emails that are allowed to register for an account.

### Admin Users

- Admin users can access the admin panel at `/admin/approved-emails`
- By default, `abiv23@gmail.com` is set as an admin
- You can make other users admins by updating the database directly

### Approved Email Management

The admin panel allows administrators to:
- Add new approved email addresses
- View all currently approved emails
- Search for specific emails
- Remove emails from the approved list

### Email-Based Registration

- Only users with emails in the approved list can register for an account
- When a user registers, their email is marked as "used" in the approved list
- This prevents multiple accounts being created with the same approved email

## Secure Image Handling with S3

This application implements secure image storage and access using AWS S3 and signed URLs:

### How It Works
1. **Upload Process**: Images are uploaded to S3 with private ACLs
2. **Database Storage**: Image metadata and locations are stored in PostgreSQL
3. **Secure Access**: Images are served via time-limited presigned URLs
4. **Expiration**: By default, signed URLs expire after 1 hour

### Configuration
For S3 storage, ensure your bucket has the appropriate CORS settings:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["https://your-production-domain.com", "http://localhost:3000"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

S3 permissions for your IAM user should include:
- `s3:PutObject`
- `s3:GetObject`
- `s3:DeleteObject`

## Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository

2. Connect your repository to Vercel:
   - Create a new project on Vercel
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

3. Set up AWS S3 bucket for production image storage:
   - Create an S3 bucket in your AWS account with private objects
   - Set appropriate CORS and access policies
   - Add the AWS environment variables to your Vercel project

### Production Considerations

- The application uses local file storage in development but requires S3 for production
- Ensure your database connection strings and API keys are properly set as environment variables
- Set up appropriate CORS settings for your S3 bucket
- Consider using a CDN like CloudFront for better performance

## Project Structure

```
├── public/           # Static files and uploaded images (dev only)
├── scripts/          # Database initialization scripts
├── src/
│   ├── app/          # Next.js app router pages
│   │   ├── admin/    # Admin pages and routes
│   │   ├── api/      # API routes
│   │   └── ...       # Page routes
│   ├── components/   # React components
│   ├── lib/          # Utility functions and database helpers
│   │   ├── db.mjs              # Database operations
│   │   ├── emailValidation.mjs # Email validation for registration
│   │   └── sThreeStorage.mjs   # S3 storage with signed URLs
│   └── styles/       # Global styles
├── .env.local        # Environment variables (not in repo)
└── ...               # Config files
```

## Authentication Flow

1. User registers with email and password
2. Application validates email against approved list
3. Upon validation, account is created
4. User can log in with email and password
5. All image uploads and actions require authentication

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add some feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

## Acknowledgements

- Knights of Columbus for their community service
- Next.js team for the amazing framework
- Vercel for hosting infrastructure
- Neon for serverless PostgreSQL
