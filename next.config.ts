import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

// A nonce-based CSP would force every page to render dynamically. Keep the
// current static/CDN-friendly rendering model and explicitly allow only the
// browser-side services used by the application.
const contentSecurityPolicy = [
  "default-src 'self'",
  [
    "script-src 'self' 'unsafe-inline'",
    isDevelopment ? "'unsafe-eval'" : "",
    "https://www.googletagmanager.com",
    "https://pagead2.googlesyndication.com",
    "https://securepubads.g.doubleclick.net",
    "https://tpc.googlesyndication.com",
  ]
    .filter(Boolean)
    .join(" "),
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "media-src 'self' blob: https:",
  [
    "connect-src 'self'",
    "https://*.google-analytics.com",
    "https://*.analytics.google.com",
    "https://*.googlesyndication.com",
    "https://*.r2.cloudflarestorage.com",
    "https://hayattan-upload-worker.hayattan.workers.dev",
  ].join(" "),
  [
    "frame-src",
    "https://www.youtube.com",
    "https://www.youtube-nocookie.com",
    "https://googleads.g.doubleclick.net",
    "https://tpc.googlesyndication.com",
  ].join(" "),
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDevelopment ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    // Serve originals directly so exhausted Vercel transformation quotas cannot
    // prevent article images and author photos from loading.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "*.fbcdn.net" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "hayattan-upload-worker.hayattan.workers.dev" },
      { protocol: "https", hostname: "pub-*.r2.dev" },
      { protocol: "https", hostname: "hayattan.net" },
      { protocol: "https", hostname: "www.hayattan.net" },
      { protocol: "http", hostname: "hayattan.net" },
      { protocol: "http", hostname: "www.hayattan.net" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
  },
  async redirects() {
    return [
      // www.hayattan.net aynı içeriği 200 ile sunuyordu; iki hostname'de aynı
      // sayfa = yinelenen içerik. Kanonik host olarak www'suz sürümü seçiyoruz.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.hayattan.net" }],
        destination: "https://hayattan.net/:path*",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Origin-Agent-Cluster",
            value: "?1",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "off",
          },
          {
            key: "X-Permitted-Cross-Domain-Policies",
            value: "none",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "0",
          },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, max-age=0",
          },
        ],
      },
      {
        source: "/api/auth/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "private, no-store, max-age=0",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
