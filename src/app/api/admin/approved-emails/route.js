// src/app/api/admin/approved-emails/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { 
  getApprovedEmails, 
  addApprovedEmail, 
  removeApprovedEmail,
  isEmailApproved
} from "@/lib/emailValidation.mjs"; // Note the .mjs extension

// GET handler to fetch all approved emails
export async function GET(request) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    // Get all approved emails
    const approvedEmails = await getApprovedEmails();
    
    return NextResponse.json({ approvedEmails });
  } catch (error) {
    console.error("Error fetching approved emails:", error);
    return NextResponse.json({ error: "Failed to fetch approved emails" }, { status: 500 });
  }
}

// POST handler to add a new approved email
export async function POST(request) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email address is required" }, { status: 400 });
    }
    
    // Validate the email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email address format" }, { status: 400 });
    }
    
    // Check if already approved
    const isAlreadyApproved = await isEmailApproved(email);
    if (isAlreadyApproved) {
      return NextResponse.json({ error: "Email is already approved" }, { status: 400 });
    }
    
    // Add the email to approved list
    const result = await addApprovedEmail(email);
    
    if (!result.success) {
      return NextResponse.json({ error: result.message || "Failed to add email" }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Email ${email} added successfully`,
      id: result.id
    });
  } catch (error) {
    console.error("Error adding approved email:", error);
    return NextResponse.json({ error: "Failed to add email to approved list" }, { status: 500 });
  }
}

// DELETE handler to remove an approved email
export async function DELETE(request) {
  try {
    // Check authentication and admin status
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: "Email ID is required" }, { status: 400 });
    }
    
    // Remove the email from approved list
    const result = await removeApprovedEmail(id);
    
    if (!result.success) {
      return NextResponse.json({ error: result.message || "Failed to remove email" }, { status: 404 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: `Email removed successfully` 
    });
  } catch (error) {
    console.error("Error removing approved email:", error);
    return NextResponse.json({ error: "Failed to remove email from approved list" }, { status: 500 });
  }
}