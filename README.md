# Knights of Columbus Photo Sharing Application

A custom-built photo management application for Knights of Columbus council activities and events. This application allows council members to upload, organize, and share photos while ensuring proper membership verification.

## Features

- **Secure Authentication**: Login and registration with Knights of Columbus membership verification
- **Photo Management**: Upload, browse, and organize council event photos
- **Image Optimization**: Automatic resizing and processing of uploaded images
- **Tag Organization**: Categorize photos with tags for easy discovery
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

- **Frontend**: React, Next.js 14, TailwindCSS 4
- **Backend**: Next.js API Routes
- **Database**: Neon PostgreSQL (serverless)
- **Authentication**: NextAuth.js with custom KoC membership validation
- **Image Storage**: Local storage (development), AWS S3 (production)
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

## Knight Membership Verification

The application implements a secure membership verification system:

- Validates Knight membership numbers during registration
- Does not store actual membership numbers in the database
- Securely hashes and stores identifiers to prevent duplicate registrations
- Allows only one account per membership number

To add or update valid Knight numbers for registration, edit the `src/lib/knightValidation.js` file:

```javascript
const validKnightNumbers = new Set([
  '5522805', // Your knight number
  '1234567', // Add more numbers here
]);
```

## Deployment

### Deploying to Vercel

1. Push your code to a GitHub repository

2. Connect your repository to Vercel:
   - Create a new project on Vercel
   - Import your GitHub repository
   - Configure environment variables
   - Deploy

3. Set up AWS S3 bucket for production image storage:
   - Create an S3 bucket in your AWS account
   - Set appropriate CORS and access policies
   - Add the AWS environment variables to your Vercel project

### Production Considerations

- The application uses local file storage in development but requires S3 or another cloud storage solution for production
- Ensure your database connection strings and API keys are properly set as environment variables
- Set up appropriate CORS settings for your S3 bucket

## Project Structure

```
├── public/           # Static files and uploaded images (dev only)
├── scripts/          # Database initialization scripts
├── src/
│   ├── app/          # Next.js app router pages
│   │   ├── api/      # API routes
│   │   └── ...       # Page routes
│   ├── components/   # React components
│   ├── lib/          # Utility functions and database helpers
│   └── styles/       # Global styles
├── .env.local        # Environment variables (not in repo)
└── ...               # Config files
```

## Authentication Flow

1. User registers with email, password, and Knight number
2. Application validates Knight number against approved list
3. Upon validation, account is created (without storing Knight number)
4. User can log in with email and password
5. All image uploads and actions require authentication

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "Add some feature"`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Knights of Columbus for their community service
- Next.js team for the amazing framework
- Vercel for hosting infrastructure
- Neon for serverless PostgreSQL