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
} as const;

type RateLimitType = keyof typeof RATE_LIMITS;

/**
 * Check rate limit for a given identifier (IP, user ID, etc.)
 */
export async function checkRateLimit(
    identifier: string,
    type: RateLimitType = "api"
): Promise<RateLimitResult> {
    // If KV is not configured, allow all requests (dev mode)
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
        // Only warn in production, silent in development
        if (process.env.NODE_ENV === "production") {
            console.warn("⚠️  Rate limiting disabled: KV not configured");
        }
        return {
            success: true,
            limit: RATE_LIMITS[type].maxAttempts,
            remaining: RATE_LIMITS[type].maxAttempts,
            reset: Date.now() + RATE_LIMITS[type].windowMs,
            blocked: false,
        };
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
