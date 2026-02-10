"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LABELS: Record<string, string> = {
  admin: "Ana Sayfa",
  haberler: "Haberler",
  yazilar: "Yazılar",
  yazarlar: "Yazarlar",
  kategoriler: "Kategoriler",
  sayfalar: "Sayfalar",
  "menu-sirasi": "Menü sırası",
  reklam: "Reklam",
  "bakis-dergisi": "Bakış Dergisi",
  profil: "Profil",
  yeni: "Yeni ekle",
  giris: "Giriş",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.replace(/^\/admin\/?/, "").split("/").filter(Boolean);

  if (segments.length === 0) {
    return (
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <span className="font-medium text-foreground">Ana Sayfa</span>
      </nav>
    );
  }

  const items: { href: string; label: string }[] = [{ href: "/admin", label: "Ana Sayfa" }];
  let acc = "/admin";
  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    acc += `/${seg}`;
    const label = LABELS[seg] ?? (seg === "yeni" ? (LABELS[segments[i - 1]] ? "Yeni " + LABELS[segments[i - 1]].toLowerCase().replace(/lar$/, "") : "Yeni") : "Düzenle");
    items.push({ href: acc, label: i === segments.length - 1 && seg !== "yeni" && /^[a-z0-9-]+$/i.test(seg) ? "Düzenle" : label });
  }

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-muted">
      {items.map((item, i) => (
        <span key={item.href} className="flex items-center gap-1">
          {i > 0 && <span className="text-[#ccc]">/</span>}
          {i === items.length - 1 ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <Link href={item.href} className="hover:text-primary hover:underline">
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
