// src/lib/knightValidation.js
import crypto from 'crypto';

// Valid Knight numbers that are eligible for registration
const validKnightNumbers = new Set([
  '5522805', // Your knight number
  // add additional knight numbers once you get them here
]);

// Knight numbers that have already been registered
// In a real app, this should be fetched from the database
const usedKnightNumbers = new Set([
  // Initially empty, will be populated from database checks
]);

/**
 * Hash a knight number with a salt for secure storage
 * @param {string} knightNumber - The knight number to hash
 * @returns {string} The hashed knight number
 */
export function hashKnightNumber(knightNumber) {
  // In production, you would use a secure environment variable for the salt
  const salt = process.env.KNIGHT_NUMBER_SALT || 'koC_ph0t0_sh4r1ng_salt';
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
 * Checks if a knight number has already been used for registration
 * @param {string} knightNumber - The knight number to check
 * @returns {boolean} Whether the knight number has been used
 */
export function isKnightNumberAlreadyUsed(knightNumber) {
  return usedKnightNumbers.has(knightNumber);
}

/**
 * Marks a knight number as used after successful registration
 * @param {string} knightNumber - The knight number to mark as used
 */
export function markKnightNumberAsUsed(knightNumber) {
  if (isValidKnightNumberFormat(knightNumber)) {
    usedKnightNumbers.add(knightNumber);
    return true;
  }
  return false;
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
  
  // Check if already used (in-memory check, database check is also done separately)
  if (isKnightNumberAlreadyUsed(knightNumber)) {
    return {
      isValid: false,
      reason: 'This Knight number has already been registered. Each Knight number can only be used for one account.'
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

/**
 * Removes a knight number from the valid set (admin function)
 * @param {string} knightNumber - The knight number to remove
 * @returns {boolean} Whether the removal was successful
 */
export function removeValidKnightNumber(knightNumber) {
  return validKnightNumbers.delete(knightNumber);
}

/**
 * Gets all valid knight numbers (admin function)
 * @returns {Array} Array of all valid knight numbers
 */
export function getAllValidKnightNumbers() {
  return Array.from(validKnightNumbers);
}

/**
 * Gets all used knight numbers (admin function)
 * @returns {Array} Array of all used knight numbers
 */
export function getAllUsedKnightNumbers() {
  return Array.from(usedKnightNumbers);
}

/**
 * Synchronizes the in-memory used numbers set with the database
 * @param {Array} usedNumbers - Array of knight numbers that are already used
 */
export function syncUsedKnightNumbers(usedNumbers) {
  // Clear and repopulate the set
  usedKnightNumbers.clear();
  
  if (Array.isArray(usedNumbers)) {
    usedNumbers.forEach(number => {
      if (number && typeof number === 'string') {
        usedKnightNumbers.add(number);
      }
    });
  }
  
  return usedKnightNumbers.size;
}