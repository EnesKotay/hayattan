import { EskiYazilarArsivi } from "@/components/EskiYazilarArsivi";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ sayfa?: string }>;
}): Promise<Metadata> {
  const { sayfa } = await searchParams;
  const page = Math.max(1, parseInt(sayfa ?? "1", 10) || 1);
  const pageSuffix = page > 1 ? ` — Sayfa ${page}` : "";
  const canonical = page > 1 ? `/eski-yazilar?sayfa=${page}` : "/eski-yazilar";
  const description = "Hayattan.Net yayın ekibinde daha önce yer alan yazarların yazı arşivi.";

  return {
    title: `Eski Yazılar${pageSuffix}`,
    description,
    alternates: { canonical },
    openGraph: { type: "website", url: canonical, title: `Eski Yazılar${pageSuffix}`, description },
  };
}

export default async function EskiYazilarPage({
  searchParams,
}: {
  searchParams: Promise<{ sayfa?: string }>;
}) {
  const { sayfa = "1" } = await searchParams;

  return <EskiYazilarArsivi currentPage={parseInt(sayfa, 10) || 1} />;
}
