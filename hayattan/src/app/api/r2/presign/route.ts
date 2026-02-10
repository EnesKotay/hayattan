import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "@/lib/r2";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.role || !["ADMIN", "AUTHOR"].includes(session.user.role)) {
        return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { filename, contentType, size } = await req.json();

    if (!filename || !contentType) {
        return NextResponse.json({ error: "filename/contentType required" }, { status: 400 });
    }

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

    if (!allowed.has(contentType)) {
        return NextResponse.json({ error: "Unsupported type: " + contentType }, { status: 400 });
    }

    const max = 100 * 1024 * 1024; // 100MB
    if (typeof size === "number" && size > max) {
        return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    const safe = String(filename).replace(/[^a-zA-Z0-9._-]/g, "_");
    const key = `uploads/${Date.now()}_${Math.random().toString(16).slice(2)}_${safe}`;

    const cmd = new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
    });

    const uploadUrl = await getSignedUrl(r2, cmd, { expiresIn: 60 });

    const baseUrl = process.env.R2_PUBLIC_BASE_URL;
    const publicUrl = baseUrl
        ? `${baseUrl}/${key}`
        : `/api/r2/file/${key}`;

    return NextResponse.json({ key, uploadUrl, publicUrl });
}
