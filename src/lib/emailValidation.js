// src/lib/emailValidation.js
import crypto from 'crypto';

/**
 * Hash an email with a salt for secure storage
 * @param {string} email - The email to hash
 * @returns {string} The hashed email
 */
export function hashEmail(email) {
  // Normalize the email (lowercase)
  const normalizedEmail = email.toLowerCase().trim();
  
  // In production, you would use a secure environment variable for the salt
  const salt = process.env.EMAIL_SALT || 'koC_ph0t0_sh4r1ng_salt';
  return crypto.createHash('sha256').update(normalizedEmail + salt).digest('hex');
}

/**
 * Validates an email against the pre-approved list
 * @param {string} email - The email to validate
 * @returns {Promise<{isValid: boolean, reason?: string, emailHash?: string}>} Validation result
 */
export async function validateEmail(email) {
  if (!email) {
    return { 
      isValid: false, 
      reason: 'Email is required'
    };
  }
  
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { 
      isValid: false, 
      reason: 'Invalid email format'
    };
  }
  
  // Get the authorized emails from env, database, or external source
  const authorizedEmails = await getAuthorizedEmails();
  
  // Normalize the email for comparison
  const normalizedEmail = email.toLowerCase().trim();
  
  // Check if the email is in the authorized list
  if (!authorizedEmails.includes(normalizedEmail)) {
    return { 
      isValid: false, 
      reason: 'This email is not authorized for registration. Please contact your council administrator.'
    };
  }
  
  // If we got here, the email is valid
  return { 
    isValid: true,
    emailHash: hashEmail(email)
  };
}

/**
 * Checks if an email hash is already used for registration
 * @param {string} emailHash - The hashed email to check
 * @returns {Promise<boolean>} Whether the email hash is already used
 */
export async function isEmailHashUsed(emailHash) {
  // This will be implemented in the database module
  // For now, just return a placeholder
  return false;
}

/**
 * Gets the list of authorized emails from the configured source
 * @returns {Promise<string[]>} List of authorized emails
 */
async function getAuthorizedEmails() {
  // Determine which source to use for authorized emails
  const source = process.env.APPROVED_EMAILS_SOURCE || 'env';
  
  switch (source) {
    case 'env':
      return getEmailsFromEnv();
    case 'database':
      return getEmailsFromDatabase();
    case 's3':
      return getEmailsFromS3();
    default:
      console.warn(`Unknown email source: ${source}, falling back to env variables`);
      return getEmailsFromEnv();
  }
}

/**
 * Gets authorized emails from environment variables
 * @returns {Promise<string[]>} List of authorized emails
 */
function getEmailsFromEnv() {
  const emailsString = process.env.APPROVED_EMAILS || '';
  
  if (!emailsString) {
    console.warn('No approved emails found in environment variables');
    return [];
  }
  
  // Split by commas and normalize
  return emailsString
    .split(',')
    .map(email => email.toLowerCase().trim())
    .filter(Boolean);
}

/**
 * Gets authorized emails from the database
 * @returns {Promise<string[]>} List of authorized emails
 */
async function getEmailsFromDatabase() {
  try {
    // This will be implemented with a database query
    // For now, import the db function if available
    const { getAuthorizedEmailsFromDb } = await import('./db.mjs');
    if (typeof getAuthorizedEmailsFromDb === 'function') {
      return getAuthorizedEmailsFromDb();
    }
    
    console.warn('Database function for authorized emails not available');
    return getEmailsFromEnv(); // Fall back to env
  } catch (error) {
    console.error('Error getting authorized emails from database:', error);
    return getEmailsFromEnv(); // Fall back to env
  }
}

/**
 * Gets authorized emails from S3
 * @returns {Promise<string[]>} List of authorized emails
 */
async function getEmailsFromS3() {
  try {
    // This will be implemented with S3
    // For now, try to import the S3 function if available
    const { getAuthorizedEmailsFromS3 } = await import('./sThreeStorage.mjs');
    if (typeof getAuthorizedEmailsFromS3 === 'function') {
      return getAuthorizedEmailsFromS3();
    }
    
    console.warn('S3 function for authorized emails not available');
    return getEmailsFromEnv(); // Fall back to env
  } catch (error) {
    console.error('Error getting authorized emails from S3:', error);
    return getEmailsFromEnv(); // Fall back to env
  }
}