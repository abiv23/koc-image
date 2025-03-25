import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { saveImage, addTagToImage } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { mkdir } from "fs/promises";

// Utility to ensure uploads directory exists for local development
const ensureUploadsDir = async () => {
  const uploadsDir = path.join(process.cwd(), "public/uploads");
  try {
    await mkdir(uploadsDir, { recursive: true });
  } catch (error) {
    console.error("Error creating uploads directory:", error);
  }
  return uploadsDir;
};

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get form data
    const formData = await request.formData();
    const file = formData.get("file");
    const description = formData.get("description") || "";
    const tags = formData.get("tags") ? formData.get("tags").split(",").map(tag => tag.trim()) : [];
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Get file details
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Process the image with sharp to get dimensions
    const imageInfo = await sharp(buffer).metadata();
    
    // Create a unique filename
    const originalFilename = file.name;
    const fileExtension = originalFilename.split('.').pop();
    const filename = `${uuidv4()}.${fileExtension}`;
    
    // Save file to local uploads directory
    const uploadsDir = await ensureUploadsDir();
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);
    
    // In local development, use a local URL
    const url = `/uploads/${filename}`;
    
    // Save file metadata to database
    const imageData = {
      filename,
      originalFilename,
      size: file.size,
      width: imageInfo.width,
      height: imageInfo.height,
      mimeType: file.type,
      description,
      userId: parseInt(session.user.id)
    };
    
    const imageId = await saveImage(imageData);
    
    // Add tags to the image
    const imageTags = [];
    for (const tag of tags) {
      if (tag) {
        const savedTag = await addTagToImage(imageId, tag);
        imageTags.push(savedTag);
      }
    }
    
    return NextResponse.json({
      success: true,
      image: {
        id: imageId,
        ...imageData,
        url,
        tags: imageTags
      }
    });
    
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}