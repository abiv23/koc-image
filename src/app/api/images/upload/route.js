// src/app/api/images/upload/route.js
export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Authentication successful");

    // Get form data
    try {
      const formData = await request.formData();
      const file = formData.get("file");
      const description = formData.get("description") || "";
      const tags = formData.get("tags") ? formData.get("tags").split(",").map(tag => tag.trim()) : [];
      
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }

      console.log("File received:", file.name, "Size:", file.size);
      
      // Get file details
      console.log("Reading file buffer");
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Test direct S3 upload before doing any other processing
      console.log("Testing direct S3 upload");
      const testFilename = `test-${Date.now()}.txt`;
      const testContent = "Hello World";
      const testBuffer = Buffer.from(testContent);
      
      try {
        const testUrl = await uploadToS3(testBuffer, testFilename, 'text/plain');
        console.log("Test S3 upload successful:", testUrl);
      } catch (testError) {
        console.error("Test S3 upload failed:", testError);
        return NextResponse.json({ 
          error: "S3 test upload failed", 
          details: testError.message 
        }, { status: 500 });
      }
      
      // If we got here, S3 is working correctly
      // Now attempt to upload the real file
      try {
        const originalFilename = file.name;
        const fileExtension = path.extname(originalFilename).toLowerCase();
        const filename = `${uuidv4()}${fileExtension}`;
        
        console.log("Uploading actual file to S3...");
        const url = await uploadToS3(buffer, filename, file.type);
        console.log("Actual file uploaded to S3:", url);
        
        // Return success without database operations for now
        return NextResponse.json({
          success: true,
          message: "File uploaded to S3 successfully",
          url: url
        });
      } catch (uploadError) {
        console.error("Real file upload failed:", uploadError);
        return NextResponse.json({
          error: "Failed to upload file to S3",
          details: uploadError.message
        }, { status: 500 });
      }
    } catch (formError) {
      console.error("Form processing error:", formError);
      return NextResponse.json({ 
        error: "Failed to process form data", 
        details: formError.message 
      }, { status: 400 });
    }
  } catch (error) {
    console.error("Unhandled error:", error);
    return NextResponse.json({ 
      error: "Unhandled server error", 
      details: error.message 
    }, { status: 500 });
  }
}