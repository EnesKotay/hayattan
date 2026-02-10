/**
 * Environment Variables Validator
 * Validates critical environment variables on startup
 */

type EnvValidationResult = {
    valid: boolean;
    errors: string[];
    warnings: string[];
};

const REQUIRED_VARS = [
    "DATABASE_URL",
    "DIRECT_DATABASE_URL",
    "AUTH_SECRET",
    "AUTH_URL",
    "R2_ACCOUNT_ID",
    "R2_ACCESS_KEY_ID",
    "R2_SECRET_ACCESS_KEY",
    "R2_BUCKET_NAME",
    "R2_ENDPOINT",
] as const;

const OPTIONAL_VARS = [
    "NEXT_PUBLIC_SITE_URL",
    "KV_REST_API_URL",
    "KV_REST_API_TOKEN",
    "R2_PUBLIC_BASE_URL",
] as const;

/**
 * Validate environment variables
 */
export function validateEnv(): EnvValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required variables
    for (const varName of REQUIRED_VARS) {
        const value = process.env[varName];
        if (!value) {
            errors.push(`Missing required environment variable: ${varName}`);
        }
    }

    // Validate AUTH_SECRET
    const authSecret = process.env.AUTH_SECRET;
    if (authSecret) {
        if (authSecret.length < 32) {
            errors.push(
                "AUTH_SECRET is too short (minimum 32 characters for security)"
            );
        }

        if (authSecret === "canlıda-benzersiz-32-byte-secret-uretin") {
            errors.push(
                "AUTH_SECRET is using the default example value! Generate a strong secret: openssl rand -base64 32"
            );
        }

        if (authSecret === "test" || authSecret === "development") {
            warnings.push(
                "AUTH_SECRET appears to be a weak test value. Use a strong random value in production."
            );
        }
    }

    // Validate DATABASE_URL format
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && !dbUrl.startsWith("postgresql://")) {
        errors.push("DATABASE_URL must be a PostgreSQL connection string");
    }

    // Check for KV configuration (for rate limiting)
    const kvUrl = process.env.KV_REST_API_URL;
    const kvToken = process.env.KV_REST_API_TOKEN;
    if ((!kvUrl || !kvToken) && process.env.NODE_ENV === "production") {
        warnings.push(
            "KV_REST_API_URL and KV_REST_API_TOKEN are not set. Rate limiting will be disabled."
        );
    }

    // Validate AUTH_URL in production
    if (process.env.NODE_ENV === "production") {
        const authUrl = process.env.AUTH_URL;
        if (authUrl && !authUrl.startsWith("https://")) {
            warnings.push(
                "AUTH_URL should use HTTPS in production for security"
            );
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}

/**
 * Validate and log results
 */
export function validateAndLogEnv(): void {
    const result = validateEnv();

    if (result.errors.length > 0) {
        console.error("❌ Environment validation failed:");
        result.errors.forEach((error) => console.error(`  - ${error}`));
        if (process.env.NODE_ENV === "production") {
            throw new Error("Environment validation failed. Check logs above.");
        }
    }

    if (result.warnings.length > 0) {
        console.warn("⚠️  Environment warnings:");
        result.warnings.forEach((warning) => console.warn(`  - ${warning}`));
    }

    if (result.valid && result.warnings.length === 0 && process.env.NODE_ENV === "development") {
        console.log("✅ Environment variables validated successfully");
    }
}
