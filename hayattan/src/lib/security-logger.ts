/**
 * Security Logging Utility
 * Logs security events for monitoring and auditing
 */

import { prisma } from "./db";
import { Prisma } from "@prisma/client";

export type SecurityEventType =
    | "failed_login"
    | "successful_login"
    | "rate_limit_exceeded"
    | "suspicious_activity"
    | "password_change"
    | "admin_access"
    | "data_modification"
    | "data_deletion"
    | "unauthorized_access"
    | "two_factor_challenge"
    | "two_factor_success"
    | "two_factor_failed";

export type SecurityLogData = {
    eventType: SecurityEventType;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Prisma.JsonObject;
};

type SecurityLogModel = {
    create: (args: { data: { eventType: string; userId: string | null; ipAddress: string | null; userAgent: string | null; metadata: Prisma.JsonObject | null } }) => Promise<unknown>;
    findMany: (args: Record<string, unknown>) => Promise<unknown[]>;
};

type DbWithOptionalSecurityLog = typeof prisma & {
    securityLog?: SecurityLogModel;
};

/**
 * Log a security event
 */
export async function logSecurityEvent(data: SecurityLogData): Promise<void> {
    try {
        // Check if SecurityLog model exists - runtime safety check
        const db = prisma as DbWithOptionalSecurityLog;
        if (!db.securityLog) {
            // Fallback to console logging if SecurityLog model doesn't exist yet
            console.warn("[SECURITY]", {
                timestamp: new Date().toISOString(),
                ...data,
            });
            return;
        }

        await db.securityLog.create({
            data: {
                eventType: data.eventType,
                userId: data.userId || null,
                ipAddress: data.ipAddress || null,
                userAgent: data.userAgent || null,
                metadata: data.metadata || null,
            },
        });
    } catch (error) {
        // Don't throw errors for logging failures, just log to console
        console.error("Failed to log security event:", error);
        console.warn("[SECURITY]", {
            timestamp: new Date().toISOString(),
            ...data,
        });
    }
}

/**
 * Log failed login attempt
 */
export async function logFailedLogin(
    email: string,
    ipAddress?: string,
    userAgent?: string
): Promise<void> {
    await logSecurityEvent({
        eventType: "failed_login",
        ipAddress,
        userAgent,
        metadata: { email },
    });
}

/**
 * Log successful login
 */
export async function logSuccessfulLogin(
    userId: string,
    email: string,
    ipAddress?: string,
    userAgent?: string
): Promise<void> {
    await logSecurityEvent({
        eventType: "successful_login",
        userId,
        ipAddress,
        userAgent,
        metadata: { email },
    });
}

/**
 * Log rate limit exceeded
 */
export async function logRateLimitExceeded(
    identifier: string,
    limitType: string,
    ipAddress?: string
): Promise<void> {
    await logSecurityEvent({
        eventType: "rate_limit_exceeded",
        ipAddress,
        metadata: { identifier, limitType },
    });
}

/**
 * Log suspicious activity
 */
export async function logSuspiciousActivity(
    description: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
    metadata?: Record<string, unknown>
): Promise<void> {
    await logSecurityEvent({
        eventType: "suspicious_activity",
        userId,
        ipAddress,
        userAgent,
        metadata: { description, ...metadata },
    });
}

export async function logTwoFactorChallenge(
    userId: string,
    email: string,
    ipAddress?: string,
    userAgent?: string
): Promise<void> {
    await logSecurityEvent({
        eventType: "two_factor_challenge",
        userId,
        ipAddress,
        userAgent,
        metadata: { email },
    });
}

export async function logTwoFactorSuccess(
    userId: string,
    ipAddress?: string,
    userAgent?: string
): Promise<void> {
    await logSecurityEvent({
        eventType: "two_factor_success",
        userId,
        ipAddress,
        userAgent,
    });
}

export async function logTwoFactorFailure(
    userId: string,
    reason: string,
    ipAddress?: string,
    userAgent?: string
): Promise<void> {
    await logSecurityEvent({
        eventType: "two_factor_failed",
        userId,
        ipAddress,
        userAgent,
        metadata: { reason },
    });
}

/**
 * Log password change
 */
export async function logPasswordChange(
    userId: string,
    ipAddress?: string,
    userAgent?: string
): Promise<void> {
    await logSecurityEvent({
        eventType: "password_change",
        userId,
        ipAddress,
        userAgent,
    });
}

/**
 * Log admin panel access
 */
export async function logAdminAccess(
    userId: string,
    path: string,
    ipAddress?: string,
    userAgent?: string
): Promise<void> {
    await logSecurityEvent({
        eventType: "admin_access",
        userId,
        ipAddress,
        userAgent,
        metadata: { path },
    });
}

/**
 * Log data modification (create/update)
 */
export async function logDataModification(
    userId: string,
    action: "create" | "update",
    resourceType: string,
    resourceId?: string,
    ipAddress?: string
): Promise<void> {
    await logSecurityEvent({
        eventType: "data_modification",
        userId,
        ipAddress,
        metadata: { action, resourceType, resourceId },
    });
}

/**
 * Log data deletion
 */
export async function logDataDeletion(
    userId: string,
    resourceType: string,
    resourceId: string,
    ipAddress?: string
): Promise<void> {
    await logSecurityEvent({
        eventType: "data_deletion",
        userId,
        ipAddress,
        metadata: { resourceType, resourceId },
    });
}

/**
 * Get recent security logs (admin use)
 */
export async function getRecentSecurityLogs(limit: number = 100) {
    try {
        const db = prisma as DbWithOptionalSecurityLog;
        if (!db.securityLog) {
            return [];
        }

        return await db.securityLog.findMany({
            take: limit,
            orderBy: { createdAt: "desc" },
        });
    } catch (error) {
        console.error("Failed to fetch security logs:", error);
        return [];
    }
}

/**
 * Get failed login attempts for a specific IP or email
 */
export async function getFailedLoginAttempts(
    identifier: string,
    since: Date = new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
) {
    try {
        const db = prisma as DbWithOptionalSecurityLog;
        if (!db.securityLog) {
            return [];
        }

        return await db.securityLog.findMany({
            where: {
                eventType: "failed_login",
                OR: [
                    { ipAddress: identifier },
                    { metadata: { path: ["email"], equals: identifier } },
                ],
                createdAt: { gte: since },
            },
            orderBy: { createdAt: "desc" },
        });
    } catch (error) {
        console.error("Failed to fetch failed login attempts:", error);
        return [];
    }
}
