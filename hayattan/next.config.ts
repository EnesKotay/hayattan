import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Experimental: View Transitions API support
  experimental: {
    viewTransition: true,
    serverActions: {
      bodySizeLimit: "100mb",
    },
  },

  // Geliştirme: Turbopack HMR için (localhost + ağ IP'si)
  allowedDevOrigins: ["http://localhost:3000", "http://127.0.0.1:3000", "http://172.31.240.1:3000"],
  // Canlı: X-Powered-By başlığını kaldır
  poweredByHeader: false,
  // Güvenlik başlıkları: canlıda tam, geliştirmede CSP yok (ağ IP ile açınca sayfa düzgün yüklensin)
  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    const securityHeaders: { key: string; value: string }[] = [
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-DNS-Prefetch-Control", value: "on" },
      { key: "X-XSS-Protection", value: "1; mode=block" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
    ];
    if (isProd) {
      securityHeaders.push(
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.google.com *.googletagmanager.com *.google-analytics.com *.googleadservices.com *.doubleclick.net",
            "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
            "font-src 'self' fonts.gstatic.com data:",
            "img-src 'self' data: https: http:",
            "connect-src 'self' *.google-analytics.com *.analytics.google.com *.googletagmanager.com *.r2.cloudflarestorage.com *.r2.dev",
            "frame-src 'self' *.google.com *.doubleclick.net https://www.youtube.com https://www.youtube-nocookie.com",
            "object-src 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "frame-ancestors 'self'",
            // "upgrade-insecure-requests",
          ].join("; "),
        }
      );
    }
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
    // Development modunda optimizasyonu kapat (localhost'ta hızlı test için)
    // Production'da açık kalacak, sadece ImageUpload bileşeninde unoptimized kullanıyoruz
  },
};

export default nextConfig;

