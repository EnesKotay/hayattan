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
        const MAX_CHUNK_SIZE = 5 * 1024 * 1024; // 5MB parça limiti

        // Dosya bilgilerini al (Boyut ve tür)
        const headCommand = new HeadObjectCommand({ Bucket: bucket, Key: key });
        const headResponse = await r2.send(headCommand);
        const totalSize = headResponse.ContentLength || 0;
        const contentType = headResponse.ContentType || "application/octet-stream";

        // Range isteği varsa veya dosya büyükse (chunking yapalım)
        let start = 0;
        let end = totalSize - 1;

        if (rangeHeader) {
            const match = rangeHeader.match(/bytes=(\d+)-(\d*)/);
            if (match) {
                start = parseInt(match[1], 10);
                if (match[2]) {
                    end = parseInt(match[2], 10);
                }
            }
        }

        // Eğer istenen aralık 5MB'dan büyükse, chunk boyutunu sınırla
        // Bu sayede Vercel memory/timeout limitlerine takılmadan video stream edilir
        if (end - start + 1 > MAX_CHUNK_SIZE) {
            end = start + MAX_CHUNK_SIZE - 1;
        }

        // Sınır aşımı kontrolü
        if (end >= totalSize) {
            end = totalSize - 1;
        }

        // R2'den belirtilen byte aralığını çek
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

        // 206 Partial Content döndür
        return new NextResponse(Buffer.from(bytes), {
            status: 206, // Partial Content
            headers: {
                "Content-Type": contentType,
                "Content-Length": String(end - start + 1),
                "Content-Range": `bytes ${start}-${end}/${totalSize}`,
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
