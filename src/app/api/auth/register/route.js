// src/app/api/auth/register/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail, createUser } from "@/lib/db.mjs";
import { isEmailApproved, markEmailAsUsed } from "@/lib/emailValidation.mjs"; // Note the .mjs extension

export async function POST(request) {
  try {
    const { name, email, password, knightNumber } = await request.json();
    
    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // Email validation format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }
    
    // Check if email is in the approved list
    const emailApproved = await isEmailApproved(email);
    if (!emailApproved) {
      return NextResponse.json({ 
        error: "This email is not in our approved list. Please contact your council administrator." 
      }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const userId = await createUser(name, email, hashedPassword);
    
    // Mark email as used
    await markEmailAsUsed(email);
    
    // Return the user (excluding password)
    return NextResponse.json({
      user: {
        id: userId,
        name,
        email,
        createdAt: new Date()
      },
      message: "Registration successful! You can now log in."
    }, { status: 201 });
    
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}