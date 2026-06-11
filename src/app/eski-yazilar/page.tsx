import { EskiYazilarArsivi } from "@/components/EskiYazilarArsivi";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Eski Yazılar | Hayattan.Net",
  description: "Hayattan.Net - Yayın ekibinden ayrılmış yazarlarımızın arşivi",
};

export default async function EskiYazilarPage({
  searchParams,
}: {
  searchParams: Promise<{ sayfa?: string }>;
}) {
  const { sayfa = "1" } = await searchParams;

  return <EskiYazilarArsivi currentPage={parseInt(sayfa, 10) || 1} />;
}
