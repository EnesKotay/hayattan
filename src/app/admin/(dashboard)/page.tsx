import { auth } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/db";

import { DashboardCard, type Card } from "@/components/admin/DashboardCard";
import { DashboardStats, type StatItem } from "@/components/admin/DashboardStats";
import { DashboardQuickActions, type QuickAction } from "@/components/admin/DashboardQuickActions";
import { RecentActivity } from "@/components/admin/RecentActivity";

export default async function AdminDashboardPage() {
  const session = await auth();
  const [yaziCount, yazarCount, kategoriCount, haberCount, sonYazilar, sonHaberler] =
    await Promise.all([
      prisma.yazi.count(),
      prisma.yazar.count(),
      prisma.kategori.count(),
      prisma.haber.count(),
      prisma.yazi.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          publishedAt: true,
          createdAt: true,
          author: { select: { name: true } },
        },
      }),
      prisma.haber.findMany({
        take: 3,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          createdAt: true,
        },
      }),
    ]);

  // Taslak sayısı
  const taslakCount = await prisma.yazi.count({
    where: { publishedAt: null },
  });

  // Bugün yayınlanan
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bugunYayinlanan = await prisma.yazi.count({
    where: {
      publishedAt: {
        gte: today,
      },
    },
  });

  const stats: StatItem[] = [
    {
      label: "Toplam Yazı",
      value: yaziCount,
      icon: "Article",
      color: "text-blue-600",
      bg: "bg-blue-50",
      trend: bugunYayinlanan > 0 ? `+${bugunYayinlanan} bugün` : null,
      trendUp: true,
    },
    {
      label: "Manşet Haber",
      value: haberCount,
      icon: "News",
      color: "text-orange-600",
      bg: "bg-orange-50",
      trend: null,
      trendUp: true,
    },
    {
      label: "Aktif Yazar",
      value: yazarCount,
      icon: "User",
      color: "text-green-600",
      bg: "bg-green-50",
      trend: null,
      trendUp: true,
    },
    {
      label: "Taslaklar",
      value: taslakCount,
      icon: "Tag",
      color: "text-purple-600",
      bg: "bg-purple-50",
      trend: null,
      trendUp: false,
    },
  ];

  const quickActions: QuickAction[] = [
    {
      href: "/admin/yazilar/yeni",
      label: "Yeni Yazı",
      icon: "Article",
      gradient: "from-blue-500 to-blue-600",
      description: "Köşe yazısı veya makale oluştur",
    },
    {
      href: "/admin/haberler/yeni",
      label: "Yeni Haber",
      icon: "News",
      gradient: "from-orange-500 to-orange-600",
      description: "Manşet haberlerini yönet",
    },
    {
      href: "/admin/reklam",
      label: "Reklam Yönetimi",
      icon: "Ad",
      gradient: "from-purple-500 to-purple-600",
      description: "Reklam alanlarını düzenle",
    },
  ];

  const cards: Card[] = [
    {
      href: "/admin/haberler",
      title: "Haberler & Manşet",
      count: haberCount,
      description: "Ana sayfa slider'ındaki özel haberleri yönetin.",
      icon: "News",
      color: "orange",
    },
    {
      href: "/admin/yazilar",
      title: "Tüm Yazılar",
      count: yaziCount,
      description: "Köşe yazıları ve makaleleri yönetin.",
      icon: "Article",
      color: "blue",
    },
    {
      href: "/admin/yazarlar",
      title: "Yazarlar",
      count: yazarCount,
      description: "Yazar listesi ve profil ayarları.",
      icon: "User",
      color: "green",
    },
    {
      href: "/admin/kategoriler",
      title: "Kategoriler",
      count: kategoriCount,
      description: "İçerik kategorilerini düzenleyin.",
      icon: "Tag",
      color: "purple",
    },
    {
      href: "/admin/reklam",
      title: "Reklamlar",
      count: null,
      description: "Site geneli reklam alanları ve boyutları.",
      icon: "Ad",
      color: "pink",
    },
    {
      href: "/admin/hakkimizda",
      title: "Hakkımızda",
      count: null,
      description: "Hakkımızda sayfası ve yayın kuralları.",
      icon: "Info",
      color: "cyan",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Üst Karşılama */}
      <div className="animate-fade-in-up">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-serif text-4xl font-bold text-gray-900">
              Merhaba, {session?.user?.name?.split(" ")[0] ?? "Yönetici"} 👋
            </h1>
            <p className="mt-2 text-gray-500">
              Hayattan.Net için içerik üretmeye hazır mısınız?
            </p>
          </div>
        </div>
      </div>

      {/* Hızlı Aksiyonlar */}
      <DashboardQuickActions actions={quickActions} />

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Orta: Yönetim Kartları */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-serif text-2xl font-bold text-gray-900">Hızlı Erişim</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {cards.map((card, index) => (
              <div
                key={card.href}
                className="stagger-item"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <DashboardCard {...card} />
              </div>
            ))}
          </div>
        </div>

        {/* Sağ: Son Aktiviteler */}
        <RecentActivity yazilar={sonYazilar} haberler={sonHaberler} />
      </div>
    </div>
  );
}
