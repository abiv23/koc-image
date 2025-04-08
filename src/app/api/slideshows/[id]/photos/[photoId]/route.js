// src/app/api/slideshows/[id]/photos/[photoId]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../auth/[...nextauth]/authOptions";
import { query } from "@/lib/db";

// Remove a photo from a slideshow
export async function DELETE(request, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const slideshowId = params.id;
    const photoId = params.photoId;
    
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
      // Get the position of the photo to be removed
      const positionResult = await query(
        `SELECT position FROM slideshow_photos 
         WHERE slideshow_id = $1 AND image_id = $2`,
        [slideshowId, photoId]
      );
      
      if (positionResult.rows.length === 0) {
        await query('ROLLBACK');
        return NextResponse.json({ error: "Photo not found in slideshow" }, { status: 404 });
      }
      
      const removedPosition = positionResult.rows[0].position;
      
      // Remove the photo
      await query(
        `DELETE FROM slideshow_photos 
         WHERE slideshow_id = $1 AND image_id = $2`,
        [slideshowId, photoId]
      );
      
      // Shift positions of photos that come after the removed one
      await query(
        `UPDATE slideshow_photos 
         SET position = position - 1
         WHERE slideshow_id = $1 AND position > $2`,
        [slideshowId, removedPosition]
      );
      
      // Update slideshow timestamp
      await query(
        `UPDATE slideshows SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [slideshowId]
      );
      
      // Commit transaction
      await query('COMMIT');
      
      return NextResponse.json({ 
        success: true, 
        message: "Photo removed from slideshow" 
      });
    } catch (error) {
      // Rollback transaction on error
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error("Error removing photo from slideshow:", error);
    return NextResponse.json({ 
      error: "Failed to remove photo", 
      details: error.message 
    }, { status: 500 });
  }
}