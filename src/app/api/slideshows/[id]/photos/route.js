// src/app/api/slideshows/[id]/photos/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import { query } from "@/lib/db";

// Add photos to a slideshow
export async function POST(request, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const slideshowId = params.id;
    const { photoIds } = await request.json();
    
    // Validate request
    if (!photoIds || !Array.isArray(photoIds) || photoIds.length === 0) {
      return NextResponse.json({ error: "Photo IDs are required" }, { status: 400 });
    }
    
    // Check if slideshow exists and user owns it
    const slideshowResult = await query(
      `SELECT * FROM slideshows WHERE id = $1`,
      [slideshowId]
    );
    
    if (slideshowResult.rows.length === 0) {
      return NextResponse.json({ error: "Slideshow not found" }, { status: 404 });
    }
    
    const slideshow = slideshowResult.rows[0];
    
    if (slideshow.user_id !== userId) {
      return NextResponse.json({ error: "You can only edit your own slideshows" }, { status: 403 });
    }
    
    // Get the current highest position
    const positionResult = await query(
      `SELECT COALESCE(MAX(position), -1) as max_position 
       FROM slideshow_photos 
       WHERE slideshow_id = $1`,
      [slideshowId]
    );
    
    let nextPosition = positionResult.rows[0].max_position + 1;
    
    // Begin transaction
    await query('BEGIN');
    
    try {
      // Add each photo to the slideshow
      for (const photoId of photoIds) {
        // Check if photo already exists in slideshow
        const existingResult = await query(
          `SELECT * FROM slideshow_photos 
           WHERE slideshow_id = $1 AND image_id = $2`,
          [slideshowId, photoId]
        );
        
        // Skip if already exists
        if (existingResult.rows.length > 0) {
          continue;
        }
        
        // Add photo with next position
        await query(
          `INSERT INTO slideshow_photos (slideshow_id, image_id, position)
           VALUES ($1, $2, $3)`,
          [slideshowId, photoId, nextPosition]
        );
        
        nextPosition++;
      }
      
      // Update slideshow timestamp
      await query(
        `UPDATE slideshows SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [slideshowId]
      );
      
      // Commit transaction
      await query('COMMIT');
      
      return NextResponse.json({ 
        success: true, 
        message: "Photos added to slideshow" 
      });
    } catch (error) {
      // Rollback transaction on error
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error("Error adding photos to slideshow:", error);
    return NextResponse.json({ 
      error: "Failed to add photos", 
      details: error.message 
    }, { status: 500 });
  }
}

// Set the order of photos in a slideshow
export async function PUT(request, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const slideshowId = params.id;
    const { photoOrder } = await request.json();
    
    // Validate request
    if (!photoOrder || !Array.isArray(photoOrder) || photoOrder.length === 0) {
      return NextResponse.json({ error: "Photo order is required" }, { status: 400 });
    }
    
    // Check if slideshow exists and user owns it
    const slideshowResult = await query(
      `SELECT * FROM slideshows WHERE id = $1`,
      [slideshowId]
    );
    
    if (slideshowResult.rows.length === 0) {
      return NextResponse.json({ error: "Slideshow not found" }, { status: 404 });
    }
    
    const slideshow = slideshowResult.rows[0];
    
    if (slideshow.user_id !== userId) {
      return NextResponse.json({ error: "You can only edit your own slideshows" }, { status: 403 });
    }
    
    // Begin transaction
    await query('BEGIN');
    
    try {
      // Update position for each photo
      for (let i = 0; i < photoOrder.length; i++) {
        await query(
          `UPDATE slideshow_photos 
           SET position = $1
           WHERE slideshow_id = $2 AND image_id = $3`,
          [i, slideshowId, photoOrder[i]]
        );
      }
      
      // Update slideshow timestamp
      await query(
        `UPDATE slideshows SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [slideshowId]
      );
      
      // Commit transaction
      await query('COMMIT');
      
      return NextResponse.json({ 
        success: true, 
        message: "Photo order updated" 
      });
    } catch (error) {
      // Rollback transaction on error
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error("Error reordering photos:", error);
    return NextResponse.json({ 
      error: "Failed to update photo order", 
      details: error.message 
    }, { status: 500 });
  }
}