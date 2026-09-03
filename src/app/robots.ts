import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          // Sitedeki tüm görseller R2 proxy'si üzerinden sunuluyor. Genel
          // "Disallow: /api/" kuralı bunları da kapatıyordu; sonuçta Google
          // hiçbir yazı görselini indiremiyor, Görseller ve zengin sonuçlarda
          // görünemiyorduk. Daha uzun eşleşme kazandığı için bu iki Allow,
          // aşağıdaki Disallow'u geçersiz kılıyor.
          "/api/r2/file/",
          "/api/og",
        ],
        disallow: ["/api/", "/admin", "/admin/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
