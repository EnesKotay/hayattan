import { NextResponse } from "next/server";
import { writeFile, mkdir, stat } from "fs/promises";
import path from "path";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";

const UPLOAD_DIR = "public/uploads";
const MAX_SIZE_IMAGE = 4 * 1024 * 1024; // 4MB
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
      return NextResponse.json({ error: "Dosya bulunamadı. Lütfen bir dosya seçin." }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Geçersiz dosya formatı." }, { status: 400 });
    }

    // Dosya boyutu kontrolü (erken çıkış için)
    if (file.size === 0) {
      return NextResponse.json({ error: "Dosya boş. Lütfen geçerli bir dosya seçin." }, { status: 400 });
    }

    // Dosya tipi kontrolü - eğer type boşsa veya geçersizse, uzantıya göre kontrol et
    let isValidType = ALLOWED.includes(file.type);
    let isImage = ALLOWED_IMAGES.includes(file.type);

    if (!isValidType && file.name) {
      const ext = path.extname(file.name).toLowerCase();
      const imageExts = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
      const audioExts = [".mp3", ".wav", ".ogg", ".m4a"];
      const videoExts = [".mp4", ".webm", ".mov"];

      if (imageExts.includes(ext)) {
        isValidType = true;
        isImage = true;
      } else if (audioExts.includes(ext) || videoExts.includes(ext)) {
        isValidType = true;
        isImage = false;
      }
    }

    if (!isValidType) {
      const fileType = file.type || "bilinmiyor";
      const fileName = file.name || "isimsiz";
      return NextResponse.json(
        {
          error: `Desteklenmeyen dosya tipi: ${fileType}. Dosya: ${fileName}. Resim (JPEG, PNG, GIF, WebP), ses (MP3, WAV, OGG, M4A) veya video (MP4, WebM) yükleyin.`
        },
        { status: 400 }
      );
    }

    const maxSize = isImage ? MAX_SIZE_IMAGE : MAX_SIZE_MEDIA;
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / 1024 / 1024);
      const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
      return NextResponse.json(
        { error: `Dosya çok büyük. ${fileSizeMB} MB (Maksimum: ${maxSizeMB} MB)` },
        { status: 400 }
      );
    }

    const ext = path.extname(file.name).toLowerCase() || (isImage ? ".jpg" : ".mp4");
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).slice(2, 9);
    const safeName = `${timestamp}-${randomStr}${ext}`;

    // Vercel'de Blob kullan (ücretsiz kota), local'de public/uploads
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`uploads/${safeName}`, file, {
          access: "public",
        });
        return NextResponse.json({ url: blob.url });
      } catch (blobError) {
        console.error("Blob upload error:", blobError);
        return NextResponse.json(
          { error: "Dosya yükleme hatası. Lütfen tekrar deneyin." },
          { status: 500 }
        );
      }
    }

    // Local development: public/uploads klasörüne kaydet
    try {
      const dir = path.join(process.cwd(), UPLOAD_DIR);

      await mkdir(dir, { recursive: true });

      const filePath = path.join(dir, safeName);

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Dosyanın gerçekten kaydedildiğini kontrol et
      try {
        const stats = await stat(filePath);
        if (stats.size === 0) {
          throw new Error("Dosya boş olarak kaydedildi");
        }
        if (process.env.NODE_ENV === "development") {
          console.log("File saved successfully:", {
            path: filePath,
            size: stats.size,
            url: `/uploads/${safeName}`,
          });
        }
      } catch (statError) {
        console.error("File verification failed:", statError);
        throw new Error("Dosya kaydedildi ancak doğrulanamadı");
      }

      // Her ortamda (dev/prod) API route üzerinden serve et
      // Çünkü "next start" ile çalışırken runtime'da eklenen static dosyalar sunulmaz.
      const url = `/api/uploads/${safeName}`;



      return NextResponse.json({ url });
    } catch (fsError) {
      console.error("File system error:", fsError);
      const errorDetails = fsError instanceof Error ? fsError.message : String(fsError);
      return NextResponse.json(
        { error: `Dosya kaydedilemedi: ${errorDetails}` },
        { status: 500 }
      );
    }
  } catch (e) {
    console.error("Upload error:", e);
    const errorMessage = e instanceof Error ? e.message : "Yükleme başarısız";
    return NextResponse.json(
      { error: `Beklenmeyen bir hata oluştu: ${errorMessage}` },
      { status: 500 }
    );
  }
}
