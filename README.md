# KoC PhotoShare Application

A photo management application for Knights of Columbus council activities and events.

## Features

- User authentication
- Photo upload and management
- Tag-based organization
- Responsive design for all devices
- Automatic image processing

## Technology Stack

- **Frontend**: React, NextJS, TailwindCSS
- **Backend**: NextJS API Routes
- **Database**: Vercel Postgres
- **Storage**: Vercel Blob Storage
- **Authentication**: NextAuth.js
- **Deployment**: Vercel

## Deployment Instructions

### 1. Set up Vercel Account

If you don't have one already, create a Vercel account at [vercel.com](https://vercel.com).

### 2. Install Vercel CLI

```bash
npm install -g vercel
```

### 3. Set up Vercel Postgres

1. From your Vercel dashboard, create a new Postgres database:
   - Go to "Storage" > "Create new" > "Postgres"
   - Follow the setup wizard to create your database
   - Note the connection details for the next steps

2. Connect your database to your project.

### 4. Set up Vercel Blob Storage

1. From your Vercel dashboard, navigate to "Storage" > "Create new" > "Blob Storage"
2. Follow the setup instructions
3. Create a new "Read & Write" token for your application

### 5. Clone this repository

```bash
git clone <repository-url>
cd photo-upload
```

### 6. Configure Environment Variables

Create a `.env.local` file in the root of your project:

```env
# NextAuth configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secure-random-string

# Vercel Postgres (Copy these from Vercel Dashboard)
POSTGRES_URL=your-postgres-url
POSTGRES_PRISMA_URL=your-prisma-url
POSTGRES_URL_NON_POOLING=your-non-pooling-url
POSTGRES_USER=your-username
POSTGRES_HOST=your-host
POSTGRES_PASSWORD=your-password
POSTGRES_DATABASE=your-database

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=your-blob-token
```

### 7. Update vercel.json

Edit the `vercel.json` file to include your production domain and secrets.

### 8. Initialize the Database

Run the database initialization script:

```bash
npm run init-db
```

### 9. Deploy to Vercel

```bash
vercel
```

For production deployment:

```bash
vercel --prod
```

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Run the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser.

## Maintenance

### Updating Dependencies

Regularly update dependencies for security and new features:

```bash
npm update
```

### Database Management

Use the Vercel Dashboard to manage your PostgreSQL database.

### File Storage Management

Use the Vercel Dashboard to manage Blob Storage, including monitoring usage and setting up object lifecycle policies.