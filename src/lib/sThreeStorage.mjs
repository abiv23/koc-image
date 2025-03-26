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
  console.log(`Starting S3 upload process for file: ${filename}, type: ${contentType}`);
  console.log(`Using bucket: ${process.env.AWS_BUCKET_NAME}, region: ${process.env.AWS_REGION}`);
  
  // Validate AWS configuration
  if (!process.env.AWS_BUCKET_NAME) {
    console.error("AWS_BUCKET_NAME is not defined");
    throw new Error("S3 bucket name is not configured");
  }
  
  // Set parameters for S3 upload
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: filename,
    Body: buffer,
    ContentType: contentType
  };

  try {
    // Upload to S3
    console.log("Initializing S3 client...");
    const s3Client = getS3Client();
    
    console.log("Preparing S3 upload command...");
    const command = new PutObjectCommand(params);
    
    console.log("Sending file to S3...");
    const result = await s3Client.send(command);
    console.log("S3 upload successful:", result);
    
    // Return the URL for the uploaded file
    const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${filename}`;
    console.log(`Generated S3 URL: ${fileUrl}`);
    return fileUrl;
  } catch (error) {
    // Extract detailed error information
    const errorDetails = {
      message: error.message,
      code: error.code,
      requestId: error.$metadata?.requestId,
      statusCode: error.$metadata?.httpStatusCode
    };
    
    console.error("Error uploading to S3:", error);
    console.error("Error details:", JSON.stringify(errorDetails));
    throw new Error(`Failed to upload file to S3: ${error.message}`);
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