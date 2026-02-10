import { S3Client } from "@aws-sdk/client-s3";

// PRODUCTION SECURE R2 CLIENT - No SSL bypass!
export const r2 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    // Production-ready configuration
    forcePathStyle: false,
    useAccelerateEndpoint: false,
});
