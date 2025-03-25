# KoC PhotoShare App

A photo management application built for Knights of Columbus councils to easily upload, store, and share photos from council events and activities.

## Features

- **User Authentication**: Secure signup and login system
- **Photo Upload**: Drag-and-drop interface for easy uploading
- **Tagging System**: Organize photos with customizable tags
- **Image Resizing**: Resize photos for different use cases
- **Gallery View**: Browse photos with search and filter capabilities
- **SQLite Database**: Simple, file-based data storage

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Authentication**: NextAuth.js
- **Database**: SQLite
- **Image Processing**: Sharp
- **UI Components**: Lucide React icons

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/koc-photoshare.git
cd koc-photoshare
```

2. Install dependencies
```bash
npm install
```

3. Initialize the database
```bash
npm run init-db
```

4. Create a `.env.local` file in the project root with:
```
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

5. Start the development server
```bash
npm run dev
```

6. Open your browser and navigate to http://localhost:3000

### Default Test User

A test user is created during database initialization:
- Email: test@example.com
- Password: password

## Project Structure

```
photo-upload/
├── public/
│   └── uploads/       # Stored image files
├── scripts/
│   └── init-db.js     # Database initialization script
├── src/
│   ├── app/           # Next.js app router pages
│   ├── components/    # React components
│   ├── lib/           # Utility functions
│   │   └── db.js      # Database connection and queries
│   └── middleware.js  # Authentication middleware
├── data.db            # SQLite database file
├── next.config.js     # Next.js configuration
└── package.json       # Project dependencies
```

## Database Schema

### Users
- id: Primary key
- name: User's full name
- email: Unique email address
- password: Hashed password
- created_at: Timestamp

### Images
- id: Primary key
- filename: Stored filename
- original_filename: Original uploaded filename
- size: File size in bytes
- width: Image width in pixels
- height: Image height in pixels
- mime_type: File content type
- description: User-provided description
- user_id: Foreign key to users table
- created_at: Timestamp

### Tags
- id: Primary key
- name: Unique tag name

### Image_Tags (Join Table)
- image_id: Foreign key to images table
- tag_id: Foreign key to tags table

## Usage Flows

### Upload Flow
1. Navigate to the upload page
2. Drag and drop or select photos
3. Add descriptions and tags
4. Submit to save images to the database

### Gallery Flow
1. Browse all uploaded images in the grid view
2. Search by filename, description, or tags
3. Filter images by specific tags
4. Click on images to view full details

### Image Detail Flow
1. View full-size image
2. See metadata like dimensions and upload date
3. Download original or resized versions
4. Delete images if needed

## Future Enhancements

- AWS S3 integration for cloud storage
- Image albums and collections
- User roles and permissions
- Sharing options with public/private settings
- Image editing capabilities

## License

[MIT](LICENSE)

## Acknowledgments

- Knights of Columbus for the inspiration
- Next.js team for the excellent framework
- All contributors to the open source libraries used in this project