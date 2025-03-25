import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { getImageById, getImageTags, deleteImage } from "@/lib/db";
import fs from 'fs';
import path from 'path';

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
      url: `/uploads/${image.filename}`, // Use local path
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
    
    // Delete the image file from local filesystem
    try {
      const filePath = path.join(process.cwd(), 'public/uploads', image.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error("Error deleting local file:", err);
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