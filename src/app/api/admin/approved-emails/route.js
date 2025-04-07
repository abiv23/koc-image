// src/app/api/admin/approved-emails/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { addApprovedEmail, removeApprovedEmail, getApprovedEmails, bulkAddApprovedEmails } from "@/lib/db.mjs";


// Helper to check if user is an admin
async function isAdmin(userEmail) {
    
    // Check specific admin emails
    const adminEmails = ['abiv23@gmail.com'];
    if (adminEmails.includes(userEmail?.toLowerCase())) {
        return true;
    }

    // Not an admin
    return false;
}

// GET - List all approved emails
export async function GET(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const isUserAdmin = await isAdmin(session.user.email);
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get the approved emails
    const result = await getApprovedEmails();
    
    if (!result.success) {
      return NextResponse.json({ error: "Failed to get approved emails" }, { status: 500 });
    }
    
    return NextResponse.json({ emails: result.emails });
    
  } catch (error) {
    console.error("Error fetching approved emails:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST - Add a new approved email
export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const isUserAdmin = await isAdmin(session.user.email);
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    
    // Add the email
    const result = await addApprovedEmail(email, parseInt(session.user.id));
    
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    
    return NextResponse.json({ 
      message: result.message,
      id: result.id
    });
    
  } catch (error) {
    console.error("Error adding approved email:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE - Remove an approved email
export async function DELETE(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const isUserAdmin = await isAdmin(session.user.email);
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }
    
    // Remove the email
    const result = await removeApprovedEmail(email);
    
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    
    return NextResponse.json({ message: result.message });
    
  } catch (error) {
    console.error("Error removing approved email:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT - Bulk add approved emails
export async function PUT(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const isUserAdmin = await isAdmin(session.user.email);
    if (!isUserAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { emails } = await request.json();
    
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: "Valid email array is required" }, { status: 400 });
    }
    
    // Bulk add the emails
    const result = await bulkAddApprovedEmails(emails, parseInt(session.user.id));
    
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    
    return NextResponse.json({ 
      message: "Emails processed successfully",
      results: result.results,
      totalProcessed: result.totalProcessed
    });
    
  } catch (error) {
    console.error("Error bulk adding approved emails:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}