import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import { uploadToS3, isS3Configured } from '@/lib/sThreeStorage';
import { saveImage, addTagToImage } from '@/lib/db';
import path from 'path';
import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

export async function POST(req) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const formData = await req.formData();
    const file = formData.get('file');
    const description = formData.get('description') || '';
    const tags = formData.get('tags') || '';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate a unique filename
    const originalFilename = file.name;
    const extension = path.extname(originalFilename);
    const filename = `${uuidv4()}${extension}`;

    // Get image dimensions
    let width, height;
    try {
      const metadata = await sharp(buffer).metadata();
      width = metadata.width;
      height = metadata.height;
    } catch (error) {
      console.error('Error getting image metadata:', error);
      // Default dimensions if we can't read metadata
      width = 0;
      height = 0;
    }

    let imageUrl;

    // Upload to S3 or save to local filesystem
    if (isS3Configured()) {
      // S3 upload
      imageUrl = await uploadToS3(buffer, originalFilename, file.type);
    } else {
      // Local filesystem upload (for development)
      const uploadsDir = path.join(process.cwd(), 'public/uploads');
      
      // Ensure uploads directory exists
      try {
        await fs.mkdir(uploadsDir, { recursive: true });
      } catch (err) {
        console.error('Error creating uploads directory:', err);
      }
      
      const filePath = path.join(uploadsDir, filename);
      await fs.writeFile(filePath, buffer);
      imageUrl = `/uploads/${filename}`;
    }

    // Save image record to database
    const imageData = {
      filename: path.basename(imageUrl.split('?')[0]),  // Remove query params for signed URLs
      originalFilename,
      size: buffer.length,
      width,
      height, 
      mimeType: file.type,
      description,
      userId
    };

    // Save to database and get the ID
    const imageId = await saveImage(imageData);

    // Process and add tags if they exist
    if (tags) {
      const tagList = tags.split(',').map(tag => tag.trim()).filter(Boolean);
      
      for (const tag of tagList) {
        await addTagToImage(imageId, tag);
      }
    }

    return NextResponse.json({ 
      success: true,
      message: 'Image uploaded successfully', 
      imageId,
      url: imageUrl 
    }, { status: 200 });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error.message 
    }, { status: 500 });
  }
}