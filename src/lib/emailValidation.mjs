// src/lib/emailValidation.mjs
import { query } from './db.mjs';

/**
 * Initialize the approved_emails table if it doesn't exist
 */
export async function initApprovedEmailsTable() {
  try {
    // Check if table exists
    const tableCheck = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'approved_emails'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      // Create the table
      await query(`
        CREATE TABLE approved_emails (
          id SERIAL PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          used BOOLEAN DEFAULT FALSE
        );
      `);
      console.log('✅ Created approved_emails table');
    }
    
    return true;
  } catch (error) {
    console.error('Error initializing approved emails table:', error);
    return false;
  }
}

/**
 * Get all approved emails
 * @returns {Promise<Array>} Array of approved emails
 */
export async function getApprovedEmails() {
  try {
    await initApprovedEmailsTable();
    
    const result = await query(`
      SELECT id, email, created_at as "createdAt", used
      FROM approved_emails
      ORDER BY created_at DESC
    `);
    
    return result.rows;
  } catch (error) {
    console.error('Error getting approved emails:', error);
    return [];
  }
}

/**
 * Add an email to the approved list
 * @param {string} email - The email to add
 * @returns {Promise<Object>} Result object with success flag and ID
 */
export async function addApprovedEmail(email) {
  try {
    await initApprovedEmailsTable();
    
    // Normalize the email (lowercase)
    const normalizedEmail = email.toLowerCase().trim();
    
    // Check if email already exists
    const checkResult = await query(`
      SELECT id FROM approved_emails WHERE LOWER(email) = LOWER($1)
    `, [normalizedEmail]);
    
    if (checkResult.rows.length > 0) {
      return {
        success: false,
        message: 'Email is already in the approved list'
      };
    }
    
    // Add the email
    const result = await query(`
      INSERT INTO approved_emails (email)
      VALUES ($1)
      RETURNING id
    `, [normalizedEmail]);
    
    return {
      success: true,
      id: result.rows[0].id
    };
  } catch (error) {
    console.error('Error adding approved email:', error);
    return {
      success: false,
      message: error.message || 'Failed to add email'
    };
  }
}

/**
 * Remove an email from the approved list
 * @param {number} id - The ID of the email to remove
 * @returns {Promise<Object>} Result object with success flag
 */
export async function removeApprovedEmail(id) {
  try {
    await initApprovedEmailsTable();
    
    // Check if email exists
    const checkResult = await query(`
      SELECT id FROM approved_emails WHERE id = $1
    `, [id]);
    
    if (checkResult.rows.length === 0) {
      return {
        success: false,
        message: 'Email not found in the approved list'
      };
    }
    
    // Delete the email
    await query(`
      DELETE FROM approved_emails WHERE id = $1
    `, [id]);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('Error removing approved email:', error);
    return {
      success: false,
      message: error.message || 'Failed to remove email'
    };
  }
}

/**
 * Check if an email is in the approved list
 * @param {string} email - The email to check
 * @returns {Promise<boolean>} Whether the email is approved
 */
export async function isEmailApproved(email) {
  try {
    await initApprovedEmailsTable();
    
    // Normalize the email (lowercase)
    const normalizedEmail = email.toLowerCase().trim();
    
    const result = await query(`
      SELECT id FROM approved_emails WHERE LOWER(email) = LOWER($1)
    `, [normalizedEmail]);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking if email is approved:', error);
    return false;
  }
}

/**
 * Mark an approved email as used during registration
 * @param {string} email - The email to mark as used
 * @returns {Promise<boolean>} Success flag
 */
export async function markEmailAsUsed(email) {
  try {
    await initApprovedEmailsTable();
    
    // Normalize the email (lowercase)
    const normalizedEmail = email.toLowerCase().trim();
    
    const result = await query(`
      UPDATE approved_emails
      SET used = TRUE
      WHERE LOWER(email) = LOWER($1)
      RETURNING id
    `, [normalizedEmail]);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error marking email as used:', error);
    return false;
  }
}