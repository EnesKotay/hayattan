import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.role || !["ADMIN", "AUTHOR"].includes(session.user.role)) {
            return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 });
        }

        // File type validation
        const allowed = new Set([
            "image/jpeg",
            "image/png", 
            "image/webp",
            "image/avif",
            "image/gif",
            "video/mp4",
            "audio/mpeg",
            "audio/mp3",
            "audio/wav",
        ]);

        if (!allowed.has(file.type)) {
            return NextResponse.json({ error: "Desteklenmeyen dosya türü: " + file.type }, { status: 400 });
        }

        // Size validation (100MB)
        const maxSize = 100 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json({ error: "Dosya çok büyük (max 100MB)" }, { status: 400 });
        }

        // Generate safe filename
        const safe = String(file.name).replace(/[^a-zA-Z0-9._-]/g, "_");
        const key = `uploads/${Date.now()}_${Math.random().toString(16).slice(2)}_${safe}`;

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Upload to R2
        const command = new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: key,
            Body: buffer,
            ContentType: file.type,
            CacheControl: "public, max-age=31536000, immutable",
        });

        await r2.send(command);

        // Generate public URL
        const publicUrl = process.env.R2_PUBLIC_BASE_URL
            ? `${process.env.R2_PUBLIC_BASE_URL}/${key}`
            : null;

        if (!publicUrl) {
            return NextResponse.json({ error: "R2_PUBLIC_BASE_URL not configured" }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true,
            url: publicUrl,
            key: key 
        });

    } catch (error: any) {
        console.error('R2 upload error:', error);
        return NextResponse.json({ 
            error: "Upload failed: " + error.message 
        }, { status: 500 });
    }
}