import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import { getImages, getImageTags } from "@/lib/db";
import { getS3Url, isS3Configured } from "@/lib/sThreeStorage";

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
    
    // Fetch tags for each image
    const imagesWithTags = await Promise.all(
      images.map(async (image) => {
        const tags = await getImageTags(image.id);
        return {
          ...image,
          url: getImageUrl(image.filename),
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
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  }
}