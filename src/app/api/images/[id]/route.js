import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getImageById, getImageTags } from "@/lib/db";

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
      url: `/uploads/${image.filename}`,
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
    const db = await getDb();
    
    // Get the image to check ownership and get filename
    const image = await getImageById(id);
    
    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    
    // Check if the user owns this image
    if (image.user_id !== parseInt(session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Delete the image file
    const filePath = path.join(process.cwd(), "public/uploads", image.filename);
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error("Error deleting file:", err);
      // Continue even if file delete fails
    }
    
    // Delete the image from the database (will cascade to image_tags join table)
    await db.run('DELETE FROM images WHERE id = ?', [id]);
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}