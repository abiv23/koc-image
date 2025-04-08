import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import { getImageTags, query } from "@/lib/db"; // Import query instead of using getImages
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
    const userOnly = searchParams.get("userOnly") === "true";
    const sortOrder = searchParams.get("sortOrder") || "desc"; // "desc" (newest) or "asc" (oldest)
    
    const userId = parseInt(session.user.id);
    
    // Execute images query based on filters
    let images = [];
    let total = 0;
    
    if (tag) {
      // With tag filter
      const queryParams = userOnly ? [tag, userId] : [tag];
      const queryText = `
        SELECT i.* FROM images i
        JOIN image_tags it ON i.id = it.image_id
        JOIN tags t ON it.tag_id = t.id
        WHERE t.name = $1
        ${userOnly ? 'AND i.user_id = $2' : ''}
        ORDER BY i.created_at ${sortOrder === "asc" ? "ASC" : "DESC"}
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
      `;
      
      const imagesResult = await query(queryText, [...queryParams, limit, offset]);
      images = imagesResult.rows;
      
      const countText = `
        SELECT COUNT(*) as count FROM images i
        JOIN image_tags it ON i.id = it.image_id
        JOIN tags t ON it.tag_id = t.id
        WHERE t.name = $1
        ${userOnly ? 'AND i.user_id = $2' : ''}
      `;
      
      const countResult = await query(countText, queryParams);
      total = parseInt(countResult.rows[0].count);
    } else {
      // Without tag filter
      const queryParams = userOnly ? [userId] : [];
      let queryText = `
        SELECT * FROM images
        ${userOnly ? 'WHERE user_id = $1' : ''}
        ORDER BY created_at ${sortOrder === "asc" ? "ASC" : "DESC"}
      `;
      
      // Add pagination parameters
      queryText += userOnly 
        ? ` LIMIT $2 OFFSET $3`
        : ` LIMIT $1 OFFSET $2`;
      
      const finalParams = userOnly
        ? [userId, limit, offset]
        : [limit, offset];
      
      const imagesResult = await query(queryText, finalParams);
      images = imagesResult.rows;
      
      const countText = `
        SELECT COUNT(*) as count FROM images
        ${userOnly ? 'WHERE user_id = $1' : ''}
      `;
      
      const countResult = await query(countText, userOnly ? [userId] : []);
      total = parseInt(countResult.rows[0].count);
    }
    
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