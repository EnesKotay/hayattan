import { S3Client } from "@aws-sdk/client-s3";
import https from "https";

// SSL sorunları için custom agent
const httpsAgent = new https.Agent({
    rejectUnauthorized: false, // Geçici SSL bypass
    secureProtocol: 'TLSv1_2_method', // TLS 1.2 zorla
});

export const r2 = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
    // SSL sorunları için custom configuration
    requestHandler: {
        httpsAgent: httpsAgent,
    } as any,
});
