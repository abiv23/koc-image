// src/app/api/images/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import { getImages, getImageTags } from "@/lib/db";
import { isS3Configured, getSignedS3Url } from "@/lib/sThreeStorage";

/**
 * Get the URL for an image based on the environment
 * @param {string} filename - The image filename
 * @returns {Promise<string>} - The URL to access the image
 */
async function getImageUrl(filename) {
  if (isS3Configured()) {
    try {
      // Use signed URL for S3 images with 1 hour expiry
      return await getSignedS3Url(filename, 3600);
    } catch (error) {
      console.error(`Error getting signed URL for ${filename}:`, error);
      // Fallback to direct URL if signing fails
      return `/uploads/${filename}`;
    }
  } else {
    // Local path for development
    return `/uploads/${filename}`;
  }
}

export async function GET(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");
    const tag = searchParams.get("tag");
    
    // Get images with pagination and tag filtering
    const { images, total } = await getImages(limit, offset, tag);
    
    // Fetch tags for each image and generate signed URLs
    const imagesWithTags = await Promise.all(
      images.map(async (image) => {
        const tags = await getImageTags(image.id);
        
        let imageUrl;
        try {
          imageUrl = await getImageUrl(image.filename);
        } catch (error) {
          console.error(`Failed to get URL for image ${image.id}:`, error);
          imageUrl = `/uploads/${image.filename}`; // Fallback
        }
        
        return {
          ...image,
          url: imageUrl,
          tags: tags.map(t => t.name)
        };
      })
    );
    
    return NextResponse.json({
      images: imagesWithTags,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + images.length < total
      }
    });
    
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json({ 
      error: "Failed to fetch images", 
      details: error.message 
    }, { status: 500 });
  }
}