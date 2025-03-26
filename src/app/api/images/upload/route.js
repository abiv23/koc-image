import { NextResponse } from 'next/server';
import { uploadToS3 } from '@/lib/sThreeStorage'; // Adjust import path

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const s3Url = await uploadToS3(
      buffer, 
      file.name, 
      file.type
    );

    return NextResponse.json({ 
      message: 'Image uploaded successfully', 
      url: s3Url 
    }, { status: 200 });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Upload failed', 
      details: error.message 
    }, { status: 500 });
  }
}