// src/app/api/auth/register/route.js
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail, createUserWithKnightNumberHash, isKnightNumberHashUsed } from "@/lib/db";
import { validateKnightNumber, hashKnightNumber } from "@/lib/knightValidation";

export async function POST(request) {
  try {
    const { name, email, password, knightNumber } = await request.json();
    
    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // Knight number validation - first validate format and membership
    const knightValidation = validateKnightNumber(knightNumber);
    if (!knightValidation.isValid) {
      return NextResponse.json({ error: knightValidation.reason }, { status: 400 });
    }
    
    // Get the knight number hash
    const knightNumberHash = knightValidation.knightNumberHash;
    
    // Check if the knight number hash is already used in the database
    const isHashUsed = await isKnightNumberHashUsed(knightNumberHash);
    if (isHashUsed) {
      return NextResponse.json({ 
        error: "This Knight number has already been registered. Each Knight number can only be used for one account." 
      }, { status: 400 });
    }
    
    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user with the knight number hash
    const userId = await createUserWithKnightNumberHash(name, email, hashedPassword, knightNumberHash);
    
    // Return the user (excluding password and knight number)
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
    
    // Handle specific errors
    if (error.message === 'Knight number is already registered') {
      return NextResponse.json({ 
        error: "This Knight number has already been registered. Each Knight number can only be used for one account." 
      }, { status: 400 });
    }
    
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}