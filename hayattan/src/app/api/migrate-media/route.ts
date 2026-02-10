import { NextResponse } from "next/server";
import { r2 } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";

export async function POST() {
  try {
    const uploadsDir = join(process.cwd(), "public", "uploads");
    
    // Check if uploads directory exists
    try {
      await stat(uploadsDir);
    } catch {
      return NextResponse.json({
        success: false,
        message: "public/uploads directory not found"
      }, { status: 404 });
    }

    const files = await readdir(uploadsDir);
    const uploadedFiles: string[] = [];
    const errors: string[] = [];

    for (const file of files) {
      try {
        const filePath = join(uploadsDir, file);
        const fileBuffer = await readFile(filePath);
        
        // Determine content type
        const ext = file.split('.').pop()?.toLowerCase();
        let contentType = 'application/octet-stream';
        
        switch (ext) {
          case 'jpg':
          case 'jpeg':
            contentType = 'image/jpeg';
            break;
          case 'png':
            contentType = 'image/png';
            break;
          case 'gif':
            contentType = 'image/gif';
            break;
          case 'webp':
            contentType = 'image/webp';
            break;
          case 'mp4':
            contentType = 'video/mp4';
            break;
          case 'mp3':
            contentType = 'audio/mpeg';
            break;
          case 'pdf':
            contentType = 'application/pdf';
            break;
        }

        // Upload to R2
        const command = new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: `uploads/${file}`,
          Body: fileBuffer,
          ContentType: contentType,
        });

        await r2.send(command);
        uploadedFiles.push(file);
        
      } catch (error) {
        console.error(`Error uploading ${file}:`, error);
        errors.push(`${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `${uploadedFiles.length} files uploaded to R2`,
      data: {
        uploaded: uploadedFiles,
        errors: errors,
        total: files.length
      }
    });

  } catch (error) {
    console.error("Media migration error:", error);
    
    return NextResponse.json({
      success: false,
      message: "Media migration failed",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}