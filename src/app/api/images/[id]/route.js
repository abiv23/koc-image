import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { getImageById, getImageTags, deleteImage } from "@/lib/db";
import { getS3Url, deleteFromS3, isS3Configured } from "@/lib/sThreeStorage";
import fs from 'fs';
import path from 'path';

/**
 * Get the URL for an image based on the environment
 * @param {string} filename - The image filename
 * @returns {string} - The URL to access the image
 */
function getImageUrl(filename) {
  if (isS3Configured()) {
    return getS3Url(filename);
  } else {
    return `/uploads/${filename}`; // Local path for development
  }
}

export async function GET(request, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    
    // Get the image from the database
    const image = await getImageById(id);
    
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    
    // Get tags for the image
    const tags = await getImageTags(id);
    
    // Return the image with its tags
    return NextResponse.json({
      ...image,
      url: getImageUrl(image.filename),
      tags: tags.map(t => t.name)
    });
    
  } catch (error) {
    console.error("Error fetching image:", error);
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
  }
}

// DELETE handler to remove an image
export async function DELETE(request, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    
    // Get the image to check ownership and get filename
    const image = await getImageById(id);
    
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    
    // Check if the user owns this image
    if (image.user_id !== parseInt(session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Delete the image file from the appropriate storage
    try {
      if (isS3Configured()) {
        // Delete from S3
        await deleteFromS3(image.filename);
        console.log(`Deleted image from S3: ${image.filename}`);
      } else {
        // Delete from local storage
        const filePath = path.join(process.cwd(), 'public/uploads', image.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`Deleted local image: ${filePath}`);
        }
      }
    } catch (err) {
      console.error("Error deleting file:", err);
      // Continue even if file delete fails
    }
    
    // Delete the image from the database
    await deleteImage(id);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}