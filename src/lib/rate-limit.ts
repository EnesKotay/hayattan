/**
 * Rate Limiting Utility
 * Uses Vercel KV (Upstash Redis) for distributed rate limiting
 */

import { kv } from "@vercel/kv";

export type RateLimitResult = {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number; // timestamp
    blocked: boolean;
};

/**
 * Rate limit configuration
 */
export const RATE_LIMITS = {
    login: {
        maxAttempts: 5,
        windowMs: 15 * 60 * 1000, // 15 minutes
        blockDurationMs: 15 * 60 * 1000, // 15 minutes block after max attempts
    },
    api: {
        maxAttempts: 100,
        windowMs: 60 * 1000, // 1 minute
        blockDurationMs: 5 * 60 * 1000, // 5 minutes block
    },
    admin: {
        maxAttempts: 30,
        windowMs: 60 * 1000, // 1 minute
        blockDurationMs: 10 * 60 * 1000, // 10 minutes block
    },
    newsletter: {
        maxAttempts: 5,
        windowMs: 60 * 60 * 1000, // 1 hour
        blockDurationMs: 60 * 60 * 1000, // 1 hour block
    },
} as const;

type RateLimitType = keyof typeof RATE_LIMITS;

// In-memory fallback store when KV is not configured
type MemoryStoreItem = { count: number; resetAt: number; blockUntil?: number };
const memoryStore = new Map<string, MemoryStoreItem>();

function checkMemoryRateLimit(identifier: string, type: RateLimitType): RateLimitResult {
    const config = RATE_LIMITS[type];
    const now = Date.now();
    const storeKey = `${type}:${identifier}`;

    // Temizlik (eski kayıtları sil)
    if (memoryStore.size > 10000) {
        for (const [k, v] of memoryStore.entries()) {
            if (v.resetAt < now && (!v.blockUntil || v.blockUntil < now)) {
                memoryStore.delete(k);
            }
        }
    }

    const record = memoryStore.get(storeKey);

    if (record?.blockUntil && record.blockUntil > now) {
        return {
            success: false,
            limit: config.maxAttempts,
            remaining: 0,
            reset: record.blockUntil,
            blocked: true,
        };
    }

    if (!record || record.resetAt < now) {
        memoryStore.set(storeKey, { count: 1, resetAt: now + config.windowMs });
        return {
            success: true,
            limit: config.maxAttempts,
            remaining: config.maxAttempts - 1,
            reset: now + config.windowMs,
            blocked: false,
        };
    }

    if (record.count >= config.maxAttempts) {
        const blockUntil = now + config.blockDurationMs;
        record.blockUntil = blockUntil;
        return {
            success: false,
            limit: config.maxAttempts,
            remaining: 0,
            reset: blockUntil,
            blocked: true,
        };
    }

    record.count += 1;
    return {
        success: true,
        limit: config.maxAttempts,
        remaining: config.maxAttempts - record.count,
        reset: record.resetAt,
        blocked: false,
    };
}

/**
 * Check rate limit for a given identifier (IP, user ID, etc.)
 */
export async function checkRateLimit(
    identifier: string,
    type: RateLimitType = "api"
): Promise<RateLimitResult> {
    // If KV is not configured, fallback to memory rate limiter
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
        return checkMemoryRateLimit(identifier, type);
    }

    const config = RATE_LIMITS[type];
    const key = `ratelimit:${type}:${identifier}`;
    const blockKey = `ratelimit:block:${type}:${identifier}`;
    const now = Date.now();

    try {
        // Check if IP is blocked
        const blocked = await kv.get<number>(blockKey);
        if (blocked && blocked > now) {
            return {
                success: false,
                limit: config.maxAttempts,
                remaining: 0,
                reset: blocked,
                blocked: true,
            };
        }

        // Get current attempt count
        const attempts = await kv.get<number>(key);
        const currentAttempts = attempts || 0;

        if (currentAttempts >= config.maxAttempts) {
            // Block the identifier
            const blockUntil = now + config.blockDurationMs;
            await kv.set(blockKey, blockUntil, {
                px: config.blockDurationMs,
            });

            return {
                success: false,
                limit: config.maxAttempts,
                remaining: 0,
                reset: blockUntil,
                blocked: true,
            };
        }

        // Increment attempts
        const newAttempts = currentAttempts + 1;
        if (currentAttempts === 0) {
            await kv.set(key, newAttempts, {
                px: config.windowMs,
            });
        } else {
            await kv.set(key, newAttempts);
        }

        return {
            success: true,
            limit: config.maxAttempts,
            remaining: config.maxAttempts - newAttempts,
            reset: now + config.windowMs,
            blocked: false,
        };
    } catch (error) {
        console.error("Rate limit error:", error);
        // On error, allow the request (fail open)
        return {
            success: true,
            limit: config.maxAttempts,
            remaining: config.maxAttempts,
            reset: now + config.windowMs,
            blocked: false,
        };
    }
}

/**
 * Reset rate limit for an identifier (useful for successful actions)
 */
export async function resetRateLimit(
    identifier: string,
    type: RateLimitType = "api"
): Promise<void> {
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
        return;
    }

    const key = `ratelimit:${type}:${identifier}`;
    try {
        await kv.del(key);
    } catch (error) {
        console.error("Reset rate limit error:", error);
    }
}

/**
 * Get client identifier from request (IP address)
 */
export function getClientIdentifier(request: Request): string {
    // Try to get real IP from headers (Vercel sets these)
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");

    if (forwarded) {
        return forwarded.split(",")[0].trim();
    }

    if (realIp) {
        return realIp;
    }

    // Fallback to a generic identifier
    return "unknown";
}
