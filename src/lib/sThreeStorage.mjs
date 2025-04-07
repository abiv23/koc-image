import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';

// Initialize S3 client - using a function to ensure fresh credentials
const getS3Client = () => {
  console.log(`Creating S3 client with region: ${process.env.AWS_REGION}`);
  return new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  });
};

/**
 * Uploads a file to S3
 * @param {Buffer} buffer - The file buffer
 * @param {string} originalName - The original filename
 * @param {string} contentType - The MIME type of the file
 * @returns {Promise<string>} The URL of the uploaded file
 */
export async function uploadToS3(buffer, originalName, contentType) {
  // Validate input
  if (!buffer) {
    throw new Error('No file buffer provided');
  }

  // Generate a unique filename
  const originalExtension = originalName.split('.').pop();
  const filename = `${uuidv4()}.${originalExtension}`;

  console.log(`Starting S3 upload: ${filename}, type: ${contentType}, size: ${buffer.length} bytes`);
  console.log(`AWS Config - Bucket: ${process.env.AWS_BUCKET_NAME}, Region: ${process.env.AWS_REGION}`);
  
  // Set parameters for S3 upload
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filename,
    Body: buffer,
    ContentType: contentType
  };

  try {
    // Create a new S3 client for each operation
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    
    console.log("S3 client created, sending upload command");
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    console.log("S3 upload command completed successfully");
    
    // Return the URL for the uploaded file
    const s3Url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
    console.log("Generated S3 URL:", s3Url);
    return s3Url;
  } catch (error) {
    console.error("S3 upload error:", error);
    // Extract AWS-specific error details
    const errorDetails = {
      message: error.message,
      code: error.Code || error.code,
      requestId: error.$metadata?.requestId,
      region: error.$metadata?.region || process.env.AWS_REGION,
      statusCode: error.$metadata?.httpStatusCode
    };
    console.error("S3 error details:", JSON.stringify(errorDetails));
    
    throw new Error(`S3 upload failed: ${error.message}`);
  }
}

/**
 * Deletes a file from S3
 * @param {string} filename - The filename to delete from S3
 * @returns {Promise<boolean>} Success status
 */
export async function deleteFromS3(filename) {
  console.log(`Attempting to delete file from S3: ${filename}`);
  
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filename
  };

  try {
    const s3Client = getS3Client();
    const result = await s3Client.send(new DeleteObjectCommand(params));
    console.log("S3 delete successful:", result);
    return true;
  } catch (error) {
    console.error("Error deleting from S3:", error);
    throw new Error(`Failed to delete file from S3: ${error.message}`);
  }
}

/**
 * Generates a pre-signed URL for temporarily accessing a private S3 object
 * @param {string} filename - The filename in S3
 * @param {number} expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns {Promise<string>} The pre-signed URL
 */
export async function getSignedS3Url(filename, expiresIn = 3600) {
  console.log(`Generating signed URL for: ${filename} with expiry: ${expiresIn}s`);
  
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filename
  };

  try {
    const s3Client = getS3Client();
    const command = new GetObjectCommand(params);
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    console.log(`Generated signed URL with length: ${signedUrl.length} chars`);
    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new Error(`Failed to generate signed URL: ${error.message}`);
  }
}

/**
 * Builds the S3 URL for a file (direct, not signed)
 * @param {string} filename - The filename in S3
 * @returns {string} The full S3 URL
 * @deprecated Use getSignedS3Url instead for secure access
 */
export function getS3Url(filename) {
  const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
  console.log(`Generated direct S3 URL: ${url}`);
  return url;
}

/**
 * Helper function to determine if we should use S3 or local storage
 * @returns {boolean} True if S3 is properly configured
 */
export function isS3Configured() {
  // Force true in production environment
  if (process.env.NODE_ENV === 'production') {
    console.log("Production environment detected, forcing S3 configuration to true");
    return true;
  }
  
  const hasBucket = !!process.env.AWS_BUCKET_NAME;
  const hasRegion = !!process.env.AWS_REGION;
  const hasAccessKey = !!process.env.AWS_ACCESS_KEY_ID;
  const hasSecretKey = !!process.env.AWS_SECRET_ACCESS_KEY;
  
  const isConfigured = hasBucket && hasRegion && hasAccessKey && hasSecretKey;
  
  console.log(`S3 configuration check: ${isConfigured ? 'Complete' : 'Incomplete'}`);
  
  if (!isConfigured) {
    console.warn(`S3 configuration missing: ` +
      `Bucket=${hasBucket}, ` +
      `Region=${hasRegion}, ` +
      `AccessKey=${hasAccessKey ? 'Yes' : 'No'}, ` +
      `SecretKey=${hasSecretKey ? 'Yes' : 'No'}`);
  }
  
  return isConfigured;
}

// Add these functions to your sThreeStorage.mjs file

/**
 * Gets the list of authorized emails from S3
 * @returns {Promise<string[]>} List of authorized emails
 */
export async function getAuthorizedEmailsFromS3() {
  // S3 file key for approved emails
  const s3Key = process.env.APPROVED_EMAILS_S3_KEY || 'config/approved-emails.txt';
  
  console.log(`Fetching authorized emails from S3: ${s3Key}`);
  
  try {
    // Create S3 client
    const s3Client = getS3Client();
    
    // Get the file from S3
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key
    };
    
    const command = new GetObjectCommand(params);
    const response = await s3Client.send(command);
    
    // Read the response stream
    const chunks = [];
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }
    
    // Convert to string
    const buffer = Buffer.concat(chunks);
    const content = buffer.toString('utf8');
    
    // Parse the content (each email on a new line)
    const emails = content
      .split(/\r?\n/)
      .map(email => email.trim().toLowerCase())
      .filter(email => email && email.length > 0); // Remove empty lines
    
    console.log(`Found ${emails.length} authorized emails in S3`);
    
    return emails;
  } catch (error) {
    console.error('Error fetching authorized emails from S3:', error);
    
    // Return empty array in case of error
    return [];
  }
}

/**
 * Updates the list of authorized emails in S3
 * @param {string[]} emails - List of authorized emails
 * @returns {Promise<boolean>} Success status
 */
export async function updateAuthorizedEmailsInS3(emails) {
  // S3 file key for approved emails
  const s3Key = process.env.APPROVED_EMAILS_S3_KEY || 'config/approved-emails.txt';
  
  console.log(`Updating authorized emails in S3: ${s3Key}`);
  
  try {
    // Normalize emails
    const normalizedEmails = [...new Set(
      emails
        .map(email => email.trim().toLowerCase())
        .filter(email => email && email.length > 0)
    )].sort();
    
    // Create content (each email on a new line)
    const content = normalizedEmails.join('\n');
    
    // Create S3 client
    const s3Client = getS3Client();
    
    // Upload to S3
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: s3Key,
      Body: content,
      ContentType: 'text/plain'
    };
    
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    
    console.log(`Successfully updated ${normalizedEmails.length} authorized emails in S3`);
    
    return true;
  } catch (error) {
    console.error('Error updating authorized emails in S3:', error);
    return false;
  }
}