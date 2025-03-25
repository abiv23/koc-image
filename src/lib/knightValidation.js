// src/lib/knightValidation.js
import crypto from 'crypto';

// Valid Knight numbers (in a real application, this could be a much larger list)
const validKnightNumbers = new Set([
  '5522805', // Your knight number
]);

/**
 * Hash a knight number with a salt for secure storage
 * @param {string} knightNumber - The knight number to hash
 * @returns {string} The hashed knight number
 */
export function hashKnightNumber(knightNumber) {
  // In production, you would use a secure environment variable for the salt
  const salt = 'koC_ph0t0_sh4r1ng_salt';
  return crypto.createHash('sha256').update(knightNumber + salt).digest('hex');
}

/**
 * Validates if a knight number format is correct
 * @param {string} knightNumber - The knight number to validate
 * @returns {boolean} Whether the format is valid
 */
export function isValidKnightNumberFormat(knightNumber) {
  return /^\d{7}$/.test(knightNumber);
}

/**
 * Validates if a knight number is in the valid set
 * @param {string} knightNumber - The knight number to validate
 * @returns {boolean} Whether the knight number is in our valid set
 */
export function isKnightNumberInValidSet(knightNumber) {
  return validKnightNumbers.has(knightNumber);
}

/**
 * Comprehensive Knight number validation that checks format and membership
 * @param {string} knightNumber - The knight number to validate
 * @returns {Object} Validation result with isValid flag and reason if invalid
 */
export function validateKnightNumber(knightNumber) {
  // Check format
  if (!knightNumber) {
    return { 
      isValid: false, 
      reason: 'Knight number is required'
    };
  }
  
  if (!isValidKnightNumberFormat(knightNumber)) {
    return { 
      isValid: false, 
      reason: 'Invalid format. Knight number must be 7 digits.'
    };
  }
  
  // Check if in valid set
  if (!isKnightNumberInValidSet(knightNumber)) {
    return { 
      isValid: false, 
      reason: 'Knight number not recognized. Please ensure you are using your current membership number.'
    };
  }
  
  // If we got here, the knight number is valid
  return { 
    isValid: true,
    knightNumberHash: hashKnightNumber(knightNumber)
  };
}

/**
 * Adds a new valid knight number to the set (admin function)
 * @param {string} knightNumber - The knight number to add
 * @returns {boolean} Whether the addition was successful
 */
export function addValidKnightNumber(knightNumber) {
  if (!isValidKnightNumberFormat(knightNumber)) {
    return false;
  }
  
  validKnightNumbers.add(knightNumber);
  return true;
}