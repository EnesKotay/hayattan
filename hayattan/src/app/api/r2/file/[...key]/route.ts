import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2";

export const runtime = "nodejs";

/**
 * R2 dosya proxy'si — R2'deki dosyaları kendi sunucumuz üzerinden sunar.
 * Range header desteği ile video seek (ileri/geri sarma) çalışır.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ key: string[] }> }
) {
    try {
        const resolvedParams = await params;
        const keyParts = resolvedParams.key || [];

        if (keyParts.length === 0) {
            return NextResponse.json({ error: "Dosya yolu belirtilmedi" }, { status: 400 });
        }

        const key = keyParts.join("/");

        // Güvenlik: path traversal önle
        if (key.includes("..")) {
            return NextResponse.json({ error: "Geçersiz dosya yolu" }, { status: 400 });
        }

        const bucket = process.env.R2_BUCKET_NAME!;
        const rangeHeader = request.headers.get("range");

        // Range isteklerinde önce dosya boyutunu öğren
        if (rangeHeader) {
            // Dosya bilgilerini al
            const headCommand = new HeadObjectCommand({ Bucket: bucket, Key: key });
            const headResponse = await r2.send(headCommand);
            const totalSize = headResponse.ContentLength || 0;
            const contentType = headResponse.ContentType || "application/octet-stream";

            // Range parse: "bytes=0-" veya "bytes=0-1023"
            const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
            if (!match) {
                return new NextResponse("Invalid Range", { status: 416 });
            }

            const start = parseInt(match[1], 10);
            const end = match[2] ? parseInt(match[2], 10) : totalSize - 1;

            if (start >= totalSize || end >= totalSize) {
                return new NextResponse("Range Not Satisfiable", {
                    status: 416,
                    headers: { "Content-Range": `bytes */${totalSize}` },
                });
            }

            // R2'den sadece istenen aralığı çek
            const getCommand = new GetObjectCommand({
                Bucket: bucket,
                Key: key,
                Range: `bytes=${start}-${end}`,
            });
            const getResponse = await r2.send(getCommand);

            if (!getResponse.Body) {
                return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 });
            }

            const bytes = await getResponse.Body.transformToByteArray();

            return new NextResponse(Buffer.from(bytes), {
                status: 206,
                headers: {
                    "Content-Type": contentType,
                    "Content-Length": String(end - start + 1),
                    "Content-Range": `bytes ${start}-${end}/${totalSize}`,
                    "Accept-Ranges": "bytes",
                    "Cache-Control": "public, max-age=31536000, immutable",
                },
            });
        }

        // Normal istek (Range yok) — tüm dosyayı döndür
        const command = new GetObjectCommand({ Bucket: bucket, Key: key });
        const response = await r2.send(command);

        if (!response.Body) {
            return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 });
        }

        const bytes = await response.Body.transformToByteArray();

        return new NextResponse(Buffer.from(bytes), {
            status: 200,
            headers: {
                "Content-Type": response.ContentType || "application/octet-stream",
                "Content-Length": String(response.ContentLength || bytes.length),
                "Accept-Ranges": "bytes",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        });

    } catch (error: any) {
        if (error.name === "NoSuchKey") {
            return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 });
        }
        console.error("R2 proxy error:", error);
        return NextResponse.json({ error: "Dosya yüklenemedi" }, { status: 500 });
    }
}
