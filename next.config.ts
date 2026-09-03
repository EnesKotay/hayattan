import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
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
            value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
