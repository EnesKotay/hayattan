import { auth } from "@/lib/auth";
import Link from "next/link";
import { prisma } from "@/lib/db";

import { DashboardCard, type Card } from "@/components/admin/DashboardCard";
import { DashboardStats, type StatItem } from "@/components/admin/DashboardStats";
import { DashboardQuickActions, type QuickAction } from "@/components/admin/DashboardQuickActions";
import { RecentActivity } from "@/components/admin/RecentActivity";
import {
  FEEDBACK_DOWN_PREFIX,
  FEEDBACK_UP_PREFIX,
  SHARE_COUNT_PREFIX,
  parseCounter,
} from "@/lib/engagement";

function formatNumber(value: number) {
  return new Intl.NumberFormat("tr-TR").format(value);
}

export default async function AdminDashboardPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const [
    yaziCount,
    yazarCount,
    kategoriCount,
    haberCount,
    sonYazilar,
    sonHaberler,
    viewsAggregate,
    newsletterCount,
    engagementRows,
    enCokOkunanlar,
  ] =
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
      prisma.yazi.aggregate({ _sum: { viewCount: true } }),
      prisma.newsletterSubscriber.count({ where: { active: true } }),
      prisma.siteSetting.findMany({
        where: {
          OR: [
            { key: { startsWith: SHARE_COUNT_PREFIX } },
            { key: { startsWith: FEEDBACK_UP_PREFIX } },
            { key: { startsWith: FEEDBACK_DOWN_PREFIX } },
          ],
        },
        select: { key: true, value: true },
      }),
      prisma.yazi.findMany({
        where: { publishedAt: { lte: new Date() } },
        orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          viewCount: true,
          publishedAt: true,
          author: { select: { name: true } },
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

  const totalViews = viewsAggregate._sum.viewCount ?? 0;
  const shareCount = engagementRows
    .filter((row) => row.key.startsWith(SHARE_COUNT_PREFIX))
    .reduce((total, row) => total + parseCounter(row.value), 0);
  const positiveFeedback = engagementRows
    .filter((row) => row.key.startsWith(FEEDBACK_UP_PREFIX))
    .reduce((total, row) => total + parseCounter(row.value), 0);
  const improvementSignals = engagementRows
    .filter((row) => row.key.startsWith(FEEDBACK_DOWN_PREFIX))
    .reduce((total, row) => total + parseCounter(row.value), 0);

  const stats: StatItem[] = [
    {
      label: "Toplam Yazı",
      value: yaziCount,
      icon: "Article",
      color: "text-blue-600",
      bg: "bg-blue-50",
      trend: taslakCount > 0 ? `${taslakCount} taslak` : bugunYayinlanan > 0 ? `+${bugunYayinlanan} bugün` : null,
      trendUp: true,
    },
    ...(isAdmin ? [{
      label: "Toplam Okunma",
      value: totalViews,
      icon: "Eye" as const,
      color: "text-green-600",
      bg: "bg-green-50",
      trend: bugunYayinlanan > 0 ? `+${bugunYayinlanan} bugün` : null,
      trendUp: true,
    }] : []),
    {
      label: "Paylaşım",
      value: shareCount,
      icon: "Link",
      color: "text-orange-600",
      bg: "bg-orange-50",
      trend: positiveFeedback > 0 ? `${positiveFeedback} olumlu` : null,
      trendUp: true,
    },
    {
      label: "Bülten",
      value: newsletterCount,
      icon: "User",
      color: "text-purple-600",
      bg: "bg-purple-50",
      trend: improvementSignals > 0 ? `${improvementSignals} geliştirme` : null,
      trendUp: true,
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

      <DashboardStats stats={stats} />

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

          {isAdmin && (
            <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-gray-900">Performans Özeti</h2>
                  <p className="mt-1 text-sm text-gray-500">Okurların en çok açtığı son yayınlanmış yazılar.</p>
                </div>
                <Link href="/admin/istatistik" className="text-sm font-semibold text-primary hover:underline">
                  Detaylar →
                </Link>
              </div>
              <div className="mt-5 divide-y divide-gray-100">
                {enCokOkunanlar.map((yazi, index) => (
                  <Link
                    key={yazi.id}
                    href={`/admin/yazilar/${yazi.id}`}
                    className="flex items-center justify-between gap-4 py-3 transition-colors hover:bg-gray-50"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                        {index + 1}
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-gray-900">{yazi.title}</h3>
                        <p className="mt-1 text-xs text-gray-500">
                          {yazi.author.name}
                          {yazi.publishedAt && <> · {new Date(yazi.publishedAt).toLocaleDateString("tr-TR")}</>}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-sm font-bold tabular-nums text-gray-900">{formatNumber(yazi.viewCount)}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sağ: Son Aktiviteler */}
        <RecentActivity yazilar={sonYazilar} haberler={sonHaberler} />
      </div>
    </div>
  );
}
