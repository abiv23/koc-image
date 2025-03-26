import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
 * @param {string} filename - The filename to use in S3
 * @param {string} contentType - The MIME type of the file
 * @returns {Promise<string>} The URL of the uploaded file
 */
export async function uploadToS3(buffer, filename, contentType) {
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
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
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