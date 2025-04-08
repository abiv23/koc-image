import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import { query } from "@/lib/db";

// Create a new slideshow
export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { title, description, photoIds, isPublic = false } = await request.json();
    
    // Validate request
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    
    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      return NextResponse.json({ error: "At least one photo is required" }, { status: 400 });
    }

    // Begin transaction
    await query('BEGIN');
    
    try {
      // Create slideshow
      const result = await query(
        `INSERT INTO slideshows 
         (title, description, user_id, is_public) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id`,
        [title, description, userId, isPublic]
      );
      
      const slideshowId = result.rows[0].id;
      
      // Add photos to slideshow with positions
      for (let i = 0; i < photoIds.length; i++) {
        await query(
          `INSERT INTO slideshow_photos 
           (slideshow_id, image_id, position) 
           VALUES ($1, $2, $3)`,
          [slideshowId, photoIds[i], i]
        );
      }
      
      // Commit transaction
      await query('COMMIT');
      
      return NextResponse.json({ 
        success: true, 
        slideshowId,
        message: "Slideshow created successfully" 
      });
    } catch (error) {
      // Rollback transaction on error
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error("Error creating slideshow:", error);
    return NextResponse.json({ 
      error: "Failed to create slideshow", 
      details: error.message 
    }, { status: 500 });
  }
}

// Get all slideshows for the current user
export async function GET(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { searchParams } = new URL(request.url);
    const includePublic = searchParams.get("includePublic") === "true";
    
    let slideshowQuery;
    let queryParams = [userId];
    
    if (includePublic) {
      // Get user's slideshows and public slideshows from others
      slideshowQuery = `
        SELECT s.*, u.name AS creator_name, 
          (SELECT COUNT(*) FROM slideshow_photos WHERE slideshow_id = s.id) AS photo_count
        FROM slideshows s
        JOIN users u ON s.user_id = u.id
        WHERE s.user_id = $1 OR s.is_public = TRUE
        ORDER BY s.updated_at DESC
      `;
    } else {
      // Get only user's slideshows
      slideshowQuery = `
        SELECT s.*, u.name AS creator_name, 
          (SELECT COUNT(*) FROM slideshow_photos WHERE slideshow_id = s.id) AS photo_count
        FROM slideshows s
        JOIN users u ON s.user_id = u.id
        WHERE s.user_id = $1
        ORDER BY s.updated_at DESC
      `;
    }
    
    const result = await query(slideshowQuery, queryParams);
    
    // Get thumbnail for each slideshow (first photo)
    const slideshowsWithThumbnails = await Promise.all(
      result.rows.map(async (slideshow) => {
        // Get the first photo of the slideshow
        const photoResult = await query(
          `SELECT i.id, i.filename 
           FROM slideshow_photos sp
           JOIN images i ON sp.image_id = i.id
           WHERE sp.slideshow_id = $1
           ORDER BY sp.position
           LIMIT 1`,
          [slideshow.id]
        );
        
        let thumbnailUrl = null;
        if (photoResult.rows.length > 0) {
          // Use thumbnail_url if available, otherwise use the main filename
          thumbnailUrl = photoResult.rows[0].thumbnail_url || photoResult.rows[0].filename;
        }
        
        return {
          ...slideshow,
          thumbnailUrl,
          isOwner: slideshow.user_id === userId
        };
      })
    );
    
    return NextResponse.json({ slideshows: slideshowsWithThumbnails });
  } catch (error) {
    console.error("Error fetching slideshows:", error);
    return NextResponse.json({ 
      error: "Failed to fetch slideshows", 
      details: error.message 
    }, { status: 500 });
  }
}