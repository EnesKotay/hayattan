import { NextResponse } from "next/server";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "@/lib/r2";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        // Authentication check
        const session = await auth();
        if (!session?.user?.role || !["ADMIN", "AUTHOR"].includes(session.user.role)) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        const { fileName, fileType, fileSize } = await req.json();
        
        if (!fileName || !fileType || !fileSize) {
            return NextResponse.json({ error: "Eksik parametreler" }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = [
            "image/jpeg",
            "image/png", 
            "image/webp",
            "image/avif",
            "image/gif",
            "video/mp4",
            "audio/mpeg",
            "audio/mp3",
            "audio/wav",
        ];

        if (!allowedTypes.includes(fileType)) {
            return NextResponse.json({ error: "Desteklenmeyen dosya türü: " + fileType }, { status: 400 });
        }

        // Validate file size (100MB max for presigned)
        const maxSize = 100 * 1024 * 1024;
        if (fileSize > maxSize) {
            return NextResponse.json({ error: "Dosya çok büyük (max 100MB)" }, { status: 400 });
        }

        // Generate safe filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(16).slice(2);
        const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
        const key = `uploads/${timestamp}_${randomId}_${safeName}`;

        // Create presigned PUT URL
        const putCommand = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: key,
            ContentType: fileType,
            CacheControl: "public, max-age=31536000, immutable",
        });

        const presignedUrl = await getSignedUrl(r2, putCommand, { 
            expiresIn: 300 // 5 minutes
        });

        // Generate public URL
        const publicUrl = process.env.R2_PUBLIC_BASE_URL
            ? `${process.env.R2_PUBLIC_BASE_URL}/${key}`
            : null;

        if (!publicUrl) {
            return NextResponse.json({ error: "R2_PUBLIC_BASE_URL ayarlanmamış" }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            presignedUrl,
            publicUrl,
            key,
            expiresIn: 300
        });

    } catch (error: any) {
        console.error("R2 presign error:", error);
        return NextResponse.json({ 
            error: "Presign hatası: " + error.message 
        }, { status: 500 });
    }
}