import { NextResponse } from "next/server";
import { readdir, stat, unlink } from "fs/promises";
import path from "path";
import { list, del } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { r2 } from "@/lib/r2";
import { ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";

const UPLOAD_DIR = "public/uploads";

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.role || !["ADMIN", "AUTHOR"].includes(session.user.role)) {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
        }

        // --- 1. Cloudflare R2 (Preferred) ---
        if (process.env.R2_BUCKET_NAME) {
            try {
                const command = new ListObjectsV2Command({
                    Bucket: process.env.R2_BUCKET_NAME,
                    Prefix: "uploads/",
                });

                const { Contents } = await r2.send(command);
                const publicBase = process.env.R2_PUBLIC_BASE_URL || "";

                const files = (Contents || []).map((item) => {
                    const name = item.Key?.replace("uploads/", "") || "unknown";
                    return {
                        url: publicBase ? `${publicBase}/${item.Key}` : `/api/uploads/${name}`,
                        name: name,
                        size: item.Size || 0,
                        type: "unknown",
                        date: item.LastModified || new Date(),
                    };
                }).filter(f => f.name && f.name !== "");

                return NextResponse.json({ files });
            } catch (r2Error) {
                console.error("R2 list error:", r2Error);
                // Fallback to bubble up error or try others
            }
        }

        // --- 2. Vercel Blob (Fallback) ---
        if (process.env.BLOB_READ_WRITE_TOKEN) {
            try {
                const { blobs } = await list({ prefix: "uploads/" });
                const files = blobs.map((blob) => ({
                    url: blob.url,
                    name: blob.pathname.replace("uploads/", ""),
                    size: blob.size,
                    type: "unknown",
                    date: blob.uploadedAt,
                }));
                return NextResponse.json({ files });
            } catch (blobError) {
                console.error("Blob list error:", blobError);
            }
        }

        // --- 3. Local Storage (Fallback/Development) ---
        try {
            const dir = path.join(process.cwd(), UPLOAD_DIR);
            try { await stat(dir); } catch { return NextResponse.json({ files: [] }); }
            const filenames = await readdir(dir);
            const files = await Promise.all(
                filenames.map(async (name) => {
                    const filePath = path.join(dir, name);
                    try {
                        const stats = await stat(filePath);
                        if (stats.isDirectory()) return null;
                        const ext = path.extname(name).toLowerCase();
                        return {
                            url: `/api/uploads/${name}`,
                            name: name,
                            size: stats.size,
                            type: "image/" + ext.substring(1), // Basic guess
                            date: stats.mtime,
                        };
                    } catch { return null; }
                })
            );
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

        // --- 1. Cloudflare R2 (Preferred) ---
        if (process.env.R2_BUCKET_NAME) {
            let key = "";
            if (url) {
                const publicBase = process.env.R2_PUBLIC_BASE_URL;
                if (publicBase && url.startsWith(publicBase)) {
                    key = url.replace(publicBase + "/", "");
                }
            }
            if (!key && filename) {
                key = `uploads/${filename}`;
            }

            if (key) {
                try {
                    await r2.send(new DeleteObjectCommand({
                        Bucket: process.env.R2_BUCKET_NAME,
                        Key: key,
                    }));
                    return NextResponse.json({ success: true });
                } catch (r2Error) {
                    console.error("R2 delete error:", r2Error);
                }
            }
        }

        // --- 2. Vercel Blob (Fallback) ---
        if (process.env.BLOB_READ_WRITE_TOKEN && url && url.includes("public.blob.vercel-storage.com")) {
            try {
                await del(url);
                return NextResponse.json({ success: true });
            } catch (blobError) {
                console.error("Blob delete error:", blobError);
            }
        }

        // --- 3. Local Storage (Fallback) ---
        try {
            const fileToDelete = filename || path.basename(url);
            const filePath = path.join(process.cwd(), UPLOAD_DIR, fileToDelete);
            const resolvedPath = path.resolve(filePath);
            const uploadDir = path.resolve(path.join(process.cwd(), UPLOAD_DIR));
            if (!resolvedPath.startsWith(uploadDir)) {
                return NextResponse.json({ error: "Geçersiz dosya yolu." }, { status: 400 });
            }
            await unlink(filePath);
            return NextResponse.json({ success: true });
        } catch (fsError) {
            console.error("File delete error:", fsError);
            return NextResponse.json({ error: "Dosya silinemedi." }, { status: 500 });
        }
    } catch (e) {
        console.error("Delete error:", e);
        return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
    }
}
