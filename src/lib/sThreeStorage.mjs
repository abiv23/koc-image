import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

/**
 * Uploads a file to S3
 * @param {Buffer} buffer - The file buffer
 * @param {string} filename - The filename to use in S3
 * @param {string} contentType - The MIME type of the file
 * @returns {Promise<string>} The URL of the uploaded file
 */
export async function uploadToS3(buffer, filename, contentType) {
  // Set parameters for S3 upload
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filename,
    Body: buffer,
    ContentType: contentType
  };

  try {
    // Upload to S3
    await s3Client.send(new PutObjectCommand(params));
    
    // Return the URL for the uploaded file
    return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload file to S3");
  }
}

/**
 * Deletes a file from S3
 * @param {string} filename - The filename to delete from S3
 * @returns {Promise<boolean>} Success status
 */
export async function deleteFromS3(filename) {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filename
  };

  try {
    await s3Client.send(new DeleteObjectCommand(params));
    return true;
  } catch (error) {
    console.error("Error deleting from S3:", error);
    throw new Error("Failed to delete file from S3");
  }
}

/**
 * Generates a pre-signed URL for temporarily accessing a private S3 object
 * @param {string} filename - The filename in S3
 * @param {number} expiresIn - Expiration time in seconds (default: 3600 = 1 hour)
 * @returns {Promise<string>} The pre-signed URL
 */
export async function getSignedS3Url(filename, expiresIn = 3600) {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filename
  };

  try {
    const command = new GetObjectCommand(params);
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new Error("Failed to generate signed URL");
  }
}

/**
 * Builds the S3 URL for a file
 * @param {string} filename - The filename in S3
 * @returns {string} The full S3 URL
 */
export function getS3Url(filename) {
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
}

/**
 * Helper function to determine if we should use S3 or local storage
 * @returns {boolean} True if S3 is properly configured
 */
export function isS3Configured() {
  return process.env.AWS_BUCKET_NAME && 
         process.env.AWS_REGION && 
         process.env.AWS_ACCESS_KEY_ID && 
         process.env.AWS_SECRET_ACCESS_KEY;
}