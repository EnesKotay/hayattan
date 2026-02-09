import { NextResponse } from "next/server";
import { readdir, stat, unlink } from "fs/promises";
import path from "path";
import { list, del } from "@vercel/blob";
import { auth } from "@/lib/auth";

const UPLOAD_DIR = "public/uploads";

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.role || !["ADMIN", "AUTHOR"].includes(session.user.role)) {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
        }

        // Vercel Blob (Production)
        if (process.env.BLOB_READ_WRITE_TOKEN) {
            try {
                const { blobs } = await list({ prefix: "uploads/" });
                const files = blobs.map((blob) => ({
                    url: blob.url,
                    name: blob.pathname.replace("uploads/", ""),
                    size: blob.size,
                    type: "unknown", // Blob doesn't always return mime type in list
                    date: blob.uploadedAt,
                }));
                return NextResponse.json({ files });
            } catch (blobError) {
                console.error("Blob list error:", blobError);
                return NextResponse.json({ error: "Blob listelenemedi." }, { status: 500 });
            }
        }

        // Local Storage (Development)
        try {
            const dir = path.join(process.cwd(), UPLOAD_DIR);

            // Directory check - create if not exists
            try {
                await stat(dir);
            } catch {
                return NextResponse.json({ files: [] });
            }

            const filenames = await readdir(dir);

            const files = await Promise.all(
                filenames.map(async (name) => {
                    const filePath = path.join(dir, name);
                    try {
                        const stats = await stat(filePath);
                        if (stats.isDirectory()) return null;

                        // Basic type guessing
                        const ext = path.extname(name).toLowerCase();
                        let type = "application/octet-stream";
                        if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) type = "image/" + ext.substring(1);
                        else if ([".mp4", ".webm", ".mov"].includes(ext)) type = "video/" + ext.substring(1);
                        else if ([".mp3", ".wav", ".ogg"].includes(ext)) type = "audio/" + ext.substring(1);

                        return {
                            url: `/api/uploads/${name}`,
                            name: name,
                            size: stats.size,
                            type: type,
                            date: stats.mtime,
                        };
                    } catch (e) {
                        return null;
                    }
                })
            );

            // Filter nulls and sort by date (newest first)
            const sortedFiles = files
                .filter((f): f is NonNullable<typeof f> => f !== null)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            return NextResponse.json({ files: sortedFiles });
        } catch (fsError) {
            console.error("File system error:", fsError);
            return NextResponse.json({ error: "Dosyalar okunamadı." }, { status: 500 });
        }

    } catch (e) {
        console.error("Media list error:", e);
        return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
    }

}

export async function DELETE(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.role || !["ADMIN", "AUTHOR"].includes(session.user.role)) {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
        }

        const body = await request.json();
        const { url, filename } = body;

        if (!url && !filename) {
            return NextResponse.json({ error: "URL veya dosya adı gerekli." }, { status: 400 });
        }

        // Vercel Blob (Production)
        if (process.env.BLOB_READ_WRITE_TOKEN) {
            if (!url) {
                return NextResponse.json({ error: "Blob silmek için URL gereklidir." }, { status: 400 });
            }
            try {
                await del(url);
                return NextResponse.json({ success: true });
            } catch (blobError) {
                console.error("Blob delete error:", blobError);
                return NextResponse.json({ error: "Blob silinemedi." }, { status: 500 });
            }
        }

        // Local Storage (Development)
        try {
            const fileToDelete = filename || path.basename(url);
            const filePath = path.join(process.cwd(), UPLOAD_DIR, fileToDelete);

            // Security check: ensure path is within UPLOAD_DIR
            const resolvedPath = path.resolve(filePath);
            const uploadDir = path.resolve(path.join(process.cwd(), UPLOAD_DIR));
            if (!resolvedPath.startsWith(uploadDir)) {
                return NextResponse.json({ error: "Geçersiz dosya yolu." }, { status: 400 });
            }

            await unlink(filePath);
            return NextResponse.json({ success: true });
        } catch (fsError) {
            console.error("File delete error:", fsError);
            return NextResponse.json({ error: "Dosya silinemedi veya bulunamadı." }, { status: 500 });
        }

    } catch (e) {
        console.error("Delete error:", e);
        return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
    }
}
