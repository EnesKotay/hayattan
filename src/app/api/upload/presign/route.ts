import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import crypto from "crypto";

export const runtime = "nodejs";

/**
 * SECURE Upload Presign Endpoint
 * 1. Validates session server-side
 * 2. Creates HMAC signed request to Worker
 * 3. Returns presigned URL from Worker
 */
export async function POST(req: Request) {
    try {
        // 1. SERVER-SIDE SESSION VALIDATION
        const session = await auth();
        if (!session?.user?.role || !["ADMIN", "AUTHOR"].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. PARSE AND VALIDATE REQUEST
        const { fileName, fileType, fileSize } = await req.json();
        
        if (!fileName || !fileType || !fileSize) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = [
            "image/jpeg", "image/png", "image/webp", "image/avif", "image/gif",
            "video/mp4", "audio/mpeg", "audio/mp3", "audio/wav"
        ];

        if (!allowedTypes.includes(fileType)) {
            return NextResponse.json({ 
                error: "Unsupported file type: " + fileType 
            }, { status: 400 });
        }

        // Validate file size (100MB max)
        const maxSize = 100 * 1024 * 1024;
        if (fileSize > maxSize) {
            return NextResponse.json({ 
                error: "File too large (max 100MB)" 
            }, { status: 400 });
        }

        // 3. CREATE SIGNED REQUEST TO WORKER
        const workerPayload = {
            fileName: fileName.replace(/[^a-zA-Z0-9._-]/g, "_"), // Sanitize
            fileType,
            fileSize,
            userId: session.user.id,
            timestamp: Date.now()
        };

        // HMAC signature for Worker authentication
        const secret = process.env.AUTH_SECRET!;
        const signature = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(workerPayload))
            .digest('hex');

        // 4. REQUEST PRESIGNED URL FROM WORKER
        const workerUrl = process.env.CLOUDFLARE_WORKER_URL || 
                         'https://hayattan-upload-worker.your-subdomain.workers.dev';

        const workerResponse = await fetch(`${workerUrl}/presign`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Signature': signature,
            },
            body: JSON.stringify(workerPayload)
        });

        if (!workerResponse.ok) {
            const errorText = await workerResponse.text();
            throw new Error(`Worker error: ${workerResponse.status} - ${errorText}`);
        }

        const workerData = await workerResponse.json();

        if (!workerData.success) {
            throw new Error(workerData.error || 'Worker presign failed');
        }

        // 5. RETURN PRESIGNED URL TO CLIENT
        return NextResponse.json({
            success: true,
            presignedUrl: workerData.presignedUrl,
            publicUrl: workerData.publicUrl,
            key: workerData.key,
            expiresIn: workerData.expiresIn || 300 // 5 minutes
        });

    } catch (error: any) {
        console.error("Presign error:", error);
        return NextResponse.json({ 
            error: "Presign failed: " + error.message 
        }, { status: 500 });
    }
}