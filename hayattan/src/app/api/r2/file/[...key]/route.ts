import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2 } from "@/lib/r2";

export const runtime = "nodejs";

/**
 * R2 dosya proxy'si — R2'deki dosyaları kendi sunucumuz üzerinden sunar.
 * Bu sayede r2.dev rate-limit sorunları yaşanmaz.
 * Örnek: /api/r2/file/uploads/1234_foto.jpg → R2'den "uploads/1234_foto.jpg" dosyasını döndürür
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

        const command = new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME!,
            Key: key,
        });

        const response = await r2.send(command);

        if (!response.Body) {
            return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 });
        }

        // Stream olarak döndür
        const bytes = await response.Body.transformToByteArray();

        return new NextResponse(Buffer.from(bytes), {
            status: 200,
            headers: {
                "Content-Type": response.ContentType || "application/octet-stream",
                "Cache-Control": "public, max-age=31536000, immutable",
                "Content-Length": String(response.ContentLength || bytes.length),
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
