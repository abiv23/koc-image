// src/app/api/images/upload/route.js
export async function POST(request) {
    try {
      // Check authentication
      const session = await getServerSession(authOptions);
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
  
      // Get form data
      const formData = await request.formData();
      const file = formData.get("file");
      const description = formData.get("description") || "";
      const tags = formData.get("tags") ? formData.get("tags").split(",").map(tag => tag.trim()) : [];
      
      if (!file) {
        return NextResponse.json({ error: "No file provided" }, { status: 400 });
      }
  
      // Get file details
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Process the image with sharp to get dimensions
      const imageInfo = await sharp(buffer).metadata();
      
      // Create a unique filename
      const originalFilename = file.name;
      const fileExtension = path.extname(originalFilename).toLowerCase();
      const filename = `${uuidv4()}${fileExtension}`;
      
      // Force S3 in production environment
      let url;
      if (process.env.NODE_ENV === 'production' || isS3Configured()) {
        // Always use S3 in production
        console.log("Uploading to S3...");
        url = await uploadToS3(buffer, filename, file.type);
        console.log(`File uploaded to S3: ${url}`);
      } else {
        // Only use local storage in development
        console.log("Saving locally for development...");
        const uploadsDir = path.join(process.cwd(), "public/uploads");
        await mkdir(uploadsDir, { recursive: true });
        const filePath = path.join(uploadsDir, filename);
        fs.writeFileSync(filePath, buffer);
        url = `/uploads/${filename}`;
        console.log(`File saved locally: ${url}`);
      }
      
      // Save file metadata to database
      const imageData = {
        filename,
        originalFilename,
        size: file.size,
        width: imageInfo.width,
        height: imageInfo.height,
        mimeType: file.type,
        description,
        userId: parseInt(session.user.id)
      };
      
      const imageId = await saveImage(imageData);
      
      // Add tags to the image
      const imageTags = [];
      for (const tag of tags) {
        if (tag) {
          const savedTag = await addTagToImage(imageId, tag);
          imageTags.push(savedTag);
        }
      }
      
      // Get the URL with proper signing for S3
      const finalUrl = process.env.NODE_ENV === 'production' || isS3Configured() 
        ? await getSignedS3Url(filename) 
        : url;
      
      return NextResponse.json({
        success: true,
        image: {
          id: imageId,
          ...imageData,
          url: finalUrl,
          tags: imageTags
        }
      });
      
    } catch (error) {
      console.error("Error uploading image:", error);
      return NextResponse.json({ 
        error: "Failed to upload image", 
        details: error.message 
      }, { status: 500 });
    }
  }