import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
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

        // Parse form data
        const formData = await req.formData();
        const file = formData.get("file") as File;
        
        if (!file) {
            return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
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

        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: "Desteklenmeyen dosya türü: " + file.type }, { status: 400 });
        }

        // Validate file size (100MB max)
        const maxSize = 100 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json({ error: "Dosya çok büyük (max 100MB)" }, { status: 400 });
        }

        // Generate safe filename
        const timestamp = Date.now();
        const randomId = Math.random().toString(16).slice(2);
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const key = `uploads/${timestamp}_${randomId}_${safeName}`;

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to R2
        const uploadCommand = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: key,
            Body: buffer,
            ContentType: file.type,
            CacheControl: "public, max-age=31536000, immutable",
        });

        await r2.send(uploadCommand);

        // Generate public URL
        const publicUrl = process.env.R2_PUBLIC_BASE_URL
            ? `${process.env.R2_PUBLIC_BASE_URL}/${key}`
            : null;

        if (!publicUrl) {
            return NextResponse.json({ error: "R2_PUBLIC_BASE_URL ayarlanmamış" }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            url: publicUrl,
            key: key,
            size: file.size,
            type: file.type
        });

    } catch (error: any) {
        console.error("R2 upload error:", error);
        return NextResponse.json({ 
            error: "Upload hatası: " + error.message 
        }, { status: 500 });
    }
}