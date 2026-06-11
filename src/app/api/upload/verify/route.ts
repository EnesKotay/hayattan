import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { r2 } from "@/lib/r2";
import { HeadObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

/**
 * Verify upload completed successfully
 * Prevents DB pollution from failed uploads
 */
export async function POST(req: Request) {
    try {
        // 1. SESSION VALIDATION
        const session = await auth();
        if (!session?.user?.role || !["ADMIN", "AUTHOR"].includes(session.user.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. PARSE REQUEST
        const { key } = await req.json();
        
        if (!key || typeof key !== 'string') {
            return NextResponse.json({ error: "Invalid key" }, { status: 400 });
        }

        // 3. VERIFY OBJECT EXISTS IN R2
        try {
            const headCommand = new HeadObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME!,
                Key: key
            });

            const result = await r2.send(headCommand);

            // Check if object exists and has content
            const verified = result.ContentLength && result.ContentLength > 0;

            return NextResponse.json({
                verified,
                size: result.ContentLength,
                contentType: result.ContentType,
                lastModified: result.LastModified,
                etag: result.ETag
            });

        } catch (r2Error: any) {
            // Object doesn't exist or other R2 error
            console.error('R2 verification error:', r2Error);
            
            return NextResponse.json({
                verified: false,
                error: 'Object not found in R2'
            });
        }

    } catch (error: any) {
        console.error("Upload verification error:", error);
        return NextResponse.json({ 
            verified: false,
            error: "Verification failed: " + error.message 
        }, { status: 500 });
    }
}