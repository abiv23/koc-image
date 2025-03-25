import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { getDb, getImageTags } from "@/lib/db";

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
    
    // Get database connection
    const db = await getDb();
    
    let images;
    let total;
    
    if (tag) {
      // Get images with a specific tag
      images = await db.all(`
        SELECT i.* FROM images i
        JOIN image_tags it ON i.id = it.image_id
        JOIN tags t ON it.tag_id = t.id
        WHERE t.name = ?
        ORDER BY i.created_at DESC
        LIMIT ? OFFSET ?
      `, [tag, limit, offset]);
      
      const totalResult = await db.get(`
        SELECT COUNT(*) as count FROM images i
        JOIN image_tags it ON i.id = it.image_id
        JOIN tags t ON it.tag_id = t.id
        WHERE t.name = ?
      `, [tag]);
      
      total = totalResult.count;
    } else {
      // Get all images
      images = await db.all(`
        SELECT * FROM images
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `, [limit, offset]);
      
      const totalResult = await db.get('SELECT COUNT(*) as count FROM images');
      total = totalResult.count;
    }
    
    // Fetch tags for each image
    const imagesWithTags = await Promise.all(
      images.map(async (image) => {
        const tags = await getImageTags(image.id);
        return {
          ...image,
          url: `/uploads/${image.filename}`,
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