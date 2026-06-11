import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";

// Security logging helper - uses dynamic import to avoid Edge runtime issues
async function logRateLimitSafely(identifier: string, limitType: string, ipAddress?: string) {
  try {
    // Dynamic import to avoid Edge runtime issues with Prisma
    const { logRateLimitExceeded } = await import("@/lib/security-logger");
    // Non-blocking - don't await
    logRateLimitExceeded(identifier, limitType, ipAddress).catch((err) => {
      console.error("Failed to log rate limit event:", err);
    });
  } catch (error) {
    // Silently fail - logging shouldn't break the app
    console.error("Failed to import security logger:", error);
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limit for admin login endpoint
  if (pathname === "/admin/giris" && request.method === "POST") {
    const identifier = getClientIdentifier(request);
    const rateLimit = await checkRateLimit(identifier, "login");

    if (!rateLimit.success) {
      // Log but don't block on it
      logRateLimitSafely(identifier, "login", identifier);

      return new NextResponse(
        JSON.stringify({
          error: rateLimit.blocked
            ? "Çok fazla başarısız giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin."
            : "Çok fazla istek. Lütfen bekleyip tekrar deneyin.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil((rateLimit.reset - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
            "X-RateLimit-Reset": String(rateLimit.reset),
          },
        }
      );
    }

    // Add rate limit headers to successful requests
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(rateLimit.limit));
    response.headers.set("X-RateLimit-Remaining", String(rateLimit.remaining));
    response.headers.set("X-RateLimit-Reset", String(rateLimit.reset));
    return response;
  }

  // Rate limit for admin panel (general protection)
  if (pathname.startsWith("/admin") && pathname !== "/admin/giris") {
    const identifier = getClientIdentifier(request);
    const rateLimit = await checkRateLimit(identifier, "admin");

    if (!rateLimit.success) {
      logRateLimitSafely(identifier, "admin", identifier);
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  }

  // Rate limit for API endpoints
  if (pathname.startsWith("/api")) {
    const identifier = getClientIdentifier(request);
    const rateLimit = await checkRateLimit(identifier, "api");

    if (!rateLimit.success) {
      logRateLimitSafely(identifier, "api", identifier);
      return new NextResponse("Too Many Requests", { status: 429 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};

