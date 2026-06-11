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
  },
};

export default nextConfig;
