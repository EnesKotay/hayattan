import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Hayattan.Net — Hayatın Engelsiz Tarafı",
    short_name: "Hayattan.Net",
    description: "Kültür, Edebiyat, Sanat ve Engelsiz Yaşam Dergisi",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#8b1538",
    orientation: "portrait-primary",
    scope: "/",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["news", "lifestyle", "culture", "books"],
    lang: "tr",
  };
}
