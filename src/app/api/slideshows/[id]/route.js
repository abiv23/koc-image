// src/app/api/slideshows/[id]/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { query } from "@/lib/db";
import { isS3Configured, getSignedS3Url } from "@/lib/sThreeStorage";

// Helper function to get the URL for an image
async function getImageUrl(filename) {
  if (isS3Configured()) {
    try {
      return await getSignedS3Url(filename, 3600); // 1 hour expiry
    } catch (error) {
      console.error(`Error getting signed URL for ${filename}:`, error);
      return `/uploads/${filename}`;
    }
  } else {
    return `/uploads/${filename}`;
  }
}

// Get a specific slideshow with its photos
export async function GET(request, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const slideshowId = params.id;
    
    // Get slideshow details
    const slideshowResult = await query(
      `SELECT s.*, u.name AS creator_name
       FROM slideshows s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = $1`,
      [slideshowId]
    );
    
    if (slideshowResult.rows.length === 0) {
      return NextResponse.json({ error: "Slideshow not found" }, { status: 404 });
    }
    
    const slideshow = slideshowResult.rows[0];
    
    // Check if user has access (owner or public slideshow)
    if (slideshow.user_id !== userId && !slideshow.is_public) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    
    // Get photos in the slideshow
    const photosResult = await query(
      `SELECT i.*, sp.position
       FROM slideshow_photos sp
       JOIN images i ON sp.image_id = i.id
       WHERE sp.slideshow_id = $1
       ORDER BY sp.position`,
      [slideshowId]
    );
    
    // Add URLs and other details to photos
    const photos = await Promise.all(
      photosResult.rows.map(async (photo) => {
        // Get image URL
        const url = await getImageUrl(photo.filename);
        
        // Get tags for the image
        const tagsResult = await query(
          `SELECT t.name
           FROM image_tags it
           JOIN tags t ON it.tag_id = t.id
           WHERE it.image_id = $1`,
          [photo.id]
        );
        
        return {
          ...photo,
          url,
          tags: tagsResult.rows.map(tag => tag.name),
          isOwner: photo.user_id === userId
        };
      })
    );
    
    return NextResponse.json({
      slideshow: {
        ...slideshow,
        isOwner: slideshow.user_id === userId,
        photos
      }
    });
  } catch (error) {
    console.error("Error fetching slideshow:", error);
    return NextResponse.json({ 
      error: "Failed to fetch slideshow", 
      details: error.message 
    }, { status: 500 });
  }
}

// Update a slideshow
export async function PUT(request, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const slideshowId = params.id;
    const { title, description, isPublic } = await request.json();
    
    // Validate input
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
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
    
    // Update the slideshow
    await query(
      `UPDATE slideshows 
       SET title = $1, description = $2, is_public = $3, updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [title, description, isPublic, slideshowId]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: "Slideshow updated successfully" 
    });
  } catch (error) {
    console.error("Error updating slideshow:", error);
    return NextResponse.json({ 
      error: "Failed to update slideshow", 
      details: error.message 
    }, { status: 500 });
  }
}

// Delete a slideshow
export async function DELETE(request, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const slideshowId = params.id;
    
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
      return NextResponse.json({ error: "You can only delete your own slideshows" }, { status: 403 });
    }
    
    // Delete the slideshow (cascade will delete slideshow_photos entries)
    await query(
      `DELETE FROM slideshows WHERE id = $1`,
      [slideshowId]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: "Slideshow deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting slideshow:", error);
    return NextResponse.json({ 
      error: "Failed to delete slideshow", 
      details: error.message 
    }, { status: 500 });
  }
}