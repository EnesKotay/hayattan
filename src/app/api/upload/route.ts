import { NextResponse } from "next/server";
import { writeFile, mkdir, stat } from "fs/promises";
import path from "path";
import { auth } from "@/lib/auth";
import { r2 } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const UPLOAD_DIR = "public/uploads";
const MAX_SIZE_IMAGE = 10 * 1024 * 1024; // 10MB
const MAX_SIZE_MEDIA = 100 * 1024 * 1024; // 100MB
const ALLOWED_IMAGES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const ALLOWED_AUDIO = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/webm", "audio/mp4", "audio/x-m4a"];
const ALLOWED_VIDEO = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
const ALLOWED = [...ALLOWED_IMAGES, ...ALLOWED_AUDIO, ...ALLOWED_VIDEO];

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.role || !["ADMIN", "AUTHOR"].includes(session.user.role)) {
      return NextResponse.json({ error: "Yetkisiz erişim. Lütfen giriş yapın." }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı." }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Geçersiz dosya formatı." }, { status: 400 });
    }

    if (file.size === 0) {
      return NextResponse.json({ error: "Dosya boş." }, { status: 400 });
    }

    // Dosya tipi kontrolü
    let isValidType = ALLOWED.includes(file.type);
    let isImage = ALLOWED_IMAGES.includes(file.type);

    if (!isValidType && file.name) {
      const ext = path.extname(file.name).toLowerCase();
      if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
        isValidType = true;
        isImage = true;
      } else if ([".mp3", ".wav", ".ogg", ".m4a", ".mp4", ".webm", ".mov"].includes(ext)) {
        isValidType = true;
      }
    }

    if (!isValidType) {
      return NextResponse.json({ error: `Desteklenmeyen dosya tipi: ${file.type || "bilinmiyor"}` }, { status: 400 });
    }

    const maxSize = isImage ? MAX_SIZE_IMAGE : MAX_SIZE_MEDIA;
    if (file.size > maxSize) {
      return NextResponse.json({ error: `Dosya çok büyük. Maksimum: ${maxSize / 1024 / 1024} MB` }, { status: 400 });
    }

    const ext = path.extname(file.name).toLowerCase() || (isImage ? ".jpg" : ".mp4");
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}${ext}`;
    const key = `uploads/${safeName}`;

    // --- 1. Cloudflare R2 (Preferred) ---
    if (process.env.R2_BUCKET_NAME) {
      try {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        await r2.send(new PutObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: key,
          Body: buffer,
          ContentType: file.type,
          CacheControl: "public, max-age=31536000, immutable",
        }));

        const publicUrl = process.env.R2_PUBLIC_BASE_URL
          ? `${process.env.R2_PUBLIC_BASE_URL}/${key}`
          : `/api/uploads/${safeName}`;

        return NextResponse.json({ url: publicUrl });
      } catch (r2Error) {
        console.error("R2 Upload Error:", r2Error);
        return NextResponse.json({ error: "Cloudflare R2 yükleme hatası." }, { status: 500 });
      }
    }

    // --- 2. Local Fallback (Development Only) ---
    try {
      const dir = path.join(process.cwd(), UPLOAD_DIR);
      await mkdir(dir, { recursive: true });
      const filePath = path.join(dir, safeName);
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      return NextResponse.json({ url: `/api/uploads/${safeName}` });
    } catch (fsError) {
      console.error("FS Error:", fsError);
      return NextResponse.json({ error: "Yerel depolama hatası." }, { status: 500 });
    }
  } catch (e) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: "Beklenmeyen bir hata oluştu." }, { status: 500 });
  }
}
