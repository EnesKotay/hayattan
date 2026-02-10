import { NextRequest, NextResponse } from "next/server";
import { stat } from "fs/promises";
import { createReadStream, existsSync } from "fs";
import path from "path";
import { ReadableOptions } from "stream";

// Buffer'ı Node.js stream'e çevirme yardımcı fonksiyonu (NextResponse için)
function streamFile(path: string, options?: ReadableOptions | { start: number; end: number }): ReadableStream {
  const downloadStream = createReadStream(path, options);
  return new ReadableStream({
    start(controller) {
      downloadStream.on("data", (chunk) => controller.enqueue(chunk));
      downloadStream.on("end", () => controller.close());
      downloadStream.on("error", (error) => controller.error(error));
    },
    cancel() {
      downloadStream.destroy();
    },
  });
}

const UPLOAD_DIR = "public/uploads";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const pathArray = resolvedParams.path || [];

    if (!Array.isArray(pathArray) || pathArray.length === 0) {
      return NextResponse.json({ error: "Geçersiz dosya yolu" }, { status: 400 });
    }

    const filename = pathArray.join("/");

    // Güvenlik: path traversal saldırılarını önle
    if (filename.includes("..") || path.isAbsolute(filename)) {
      return NextResponse.json({ error: "Geçersiz dosya yolu" }, { status: 400 });
    }

    // Sadece dosya adını al (path traversal koruması için)
    const safeFilename = path.basename(filename);
    const filePath = path.join(process.cwd(), UPLOAD_DIR, safeFilename);

    // Dosyanın var olup olmadığını kontrol et
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 });
    }

    const stats = await stat(filePath);
    const fileSize = stats.size;

    // Content-Type belirle
    const ext = path.extname(safeFilename).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".mp3": "audio/mpeg",
      ".mp4": "video/mp4",
      ".wav": "audio/wav",
      ".webm": "video/webm",
      ".ogg": "video/ogg",
      ".mov": "video/quicktime",
      ".m4a": "audio/mp4",
    };
    const contentType = contentTypeMap[ext] || "application/octet-stream";

    // Range header (video streaming için kritik)
    const range = request.headers.get("range");

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;

      const fileStream = streamFile(filePath, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize.toString(),
        "Content-Type": contentType,
      };

      return new NextResponse(fileStream, {
        status: 206,
        headers: head,
      });
    } else {
      const head = {
        "Content-Length": fileSize.toString(),
        "Content-Type": contentType,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=0, must-revalidate",
      };
      const fileStream = streamFile(filePath);
      return new NextResponse(fileStream, {
        status: 200,
        headers: head,
      });
    }

  } catch (error) {
    console.error("File serve error:", error);
    return NextResponse.json(
      { error: "Dosya yüklenemedi" },
      { status: 500 }
    );
  }
}
