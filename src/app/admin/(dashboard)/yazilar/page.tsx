import Link from "next/link";
import { prisma, runInBatches } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { Prisma } from "@prisma/client";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { Icons } from "@/components/admin/Icons";
import { BulkActionsWrapper } from "@/components/admin/BulkActionsWrapper";

const YAZILAR_PER_PAGE = 20;

function paginationUrl(page: number, params: { durum?: string; yazar?: string; q?: string; siralama?: string }) {
  const search = new URLSearchParams();
  if (page > 1) search.set("sayfa", String(page));
  if (params.durum) search.set("durum", params.durum);
  if (params.yazar) search.set("yazar", params.yazar);
  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.siralama && params.siralama !== "createdAt-desc") search.set("siralama", params.siralama);
  const q = search.toString();
  return q ? `/admin/yazilar?${q}` : "/admin/yazilar";
}

function formatDate(date: Date | null): string {
  if (!date) return "—";
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(date).toLocaleDateString('tr-TR', options);
}

const SIRALAMA_OPTIONS: Record<string, Prisma.YaziOrderByWithRelationInput[]> = {
  "createdAt-desc": [{ createdAt: "desc" }],
  "publishedAt-desc": [{ publishedAt: { sort: "desc", nulls: "last" } }],
  "viewCount-desc": [{ viewCount: "desc" }, { createdAt: "desc" }],
  "title-asc": [{ title: "asc" }],
};

function getYaziDurum(yazi: { publishedAt: Date | null }): "yayinda" | "planli" | "taslak" {
  if (!yazi.publishedAt) return "taslak";
  if (yazi.publishedAt > new Date()) return "planli";
  return "yayinda";
}

export default async function AdminYazilarPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; deleted?: string; error?: string; sayfa?: string; durum?: string; yazar?: string; q?: string; siralama?: string }>;
}) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";
  const params = await searchParams;
  const durum = params.durum ?? "";
  const yazarId = params.yazar ?? "";
  const q = (params.q ?? "").trim();
  const siralama = params.siralama ?? "createdAt-desc";
  const sayfa = Math.max(1, parseInt(params.sayfa ?? "1", 10) || 1);
  const skip = (sayfa - 1) * YAZILAR_PER_PAGE;

  const orderBy = SIRALAMA_OPTIONS[siralama] ?? SIRALAMA_OPTIONS["createdAt-desc"];

  const now = new Date();
  const where: Prisma.YaziWhereInput = {};
  const ownerWhere: Prisma.YaziWhereInput = isAdmin ? {} : { authorId: session?.user?.id };
  Object.assign(where, ownerWhere);
  if (durum === "yayinda") where.publishedAt = { not: null, lte: now };
  if (durum === "taslak") where.publishedAt = null;
  if (durum === "planli") where.publishedAt = { gt: now };
  if (isAdmin && yazarId) where.authorId = yazarId;
  if (q) where.title = { contains: q, mode: "insensitive" };

  const [yazilar, totalCount, yazarlar, yayindaCount, taslakCount, planliCount, toplamOkunma] = await runInBatches([
    () =>
      prisma.yazi.findMany({
        where,
        orderBy,
        skip,
        take: YAZILAR_PER_PAGE,
        include: {
          author: { select: { name: true } },
        },
      }),
    () => prisma.yazi.count({ where }),
    () =>
      prisma.yazar.findMany({
        where: isAdmin ? undefined : { id: session?.user?.id },
        orderBy: [
          { sortOrder: "asc" },
          { yazilar: { _count: "desc" } },
          { name: "asc" }
        ] as any,
        select: { id: true, name: true }
      }),
    () => prisma.yazi.count({ where: { ...ownerWhere, publishedAt: { not: null, lte: now } } }),
    () => prisma.yazi.count({ where: { ...ownerWhere, publishedAt: null } }),
    () => prisma.yazi.count({ where: { ...ownerWhere, publishedAt: { gt: now } } }),
    () => prisma.yazi.aggregate({ where: { ...ownerWhere, publishedAt: { not: null } }, _sum: { viewCount: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / YAZILAR_PER_PAGE));
  const paginationParams = { durum, yazar: yazarId, q, siralama };

  return (
    <div className="space-y-6">
      <AdminFeedback initialSuccess={params.success} initialDeleted={params.deleted} initialError={params.error} />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Yazılar
          </h1>
          <p className="mt-1 text-sm text-muted">
            Tüm yazılarınızı buradan yönetebilirsiniz.
          </p>
        </div>
        <Link
          href="/admin/yazilar/yeni"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md"
        >
          <Icons.Article className="h-5 w-5" />
          Yeni Yazı Ekle
        </Link>
      </div>

      {/* İstatistik Kartları */}
      <div className={`grid gap-4 sm:grid-cols-2 ${isAdmin ? "xl:grid-cols-5" : "lg:grid-cols-4"}`}>
        <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Icons.Article className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600">Toplam Yazı</p>
              <p className="text-2xl font-bold text-gray-900">{yayindaCount + taslakCount + planliCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-green-50 to-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <Icons.CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600">Yayında</p>
              <p className="text-2xl font-bold text-gray-900">{yayindaCount}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Icons.Tag className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600">Taslak</p>
              <p className="text-2xl font-bold text-gray-900">{taslakCount}</p>
            </div>
          </div>
        </div>
        {planliCount > 0 && (
          <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Icons.Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Planlandı</p>
                <p className="text-2xl font-bold text-gray-900">{planliCount}</p>
              </div>
            </div>
          </div>
        )}
        {isAdmin && (
          <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-violet-50 to-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100">
                <Icons.Eye className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-600">Toplam Okunma</p>
                <p className="text-2xl font-bold text-gray-900">{toplamOkunma._sum.viewCount ?? 0}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filtreler */}
      <AdminFilters
        filters={[
          {
            type: "select",
            name: "durum",
            label: "Durum",
            options: [
              { label: "Tümü", value: "" },
              { label: "Yayında", value: "yayinda" },
              { label: "Planlandı", value: "planli" },
              { label: "Taslak", value: "taslak" },
            ],
          },
          {
            type: "select",
            name: "yazar",
            label: "Yazar",
            options: [
              { label: "Tüm yazarlar", value: "" },
              ...yazarlar.map((y) => ({ label: y.name, value: y.id })),
            ],
          },
          {
            type: "select",
            name: "siralama",
            label: "Sıralama",
            options: [
              { label: "En yeni eklenen", value: "createdAt-desc" },
              { label: "Yayın tarihi (yeni)", value: "publishedAt-desc" },
              ...(isAdmin ? [{ label: "En çok okunan", value: "viewCount-desc" }] : []),
              { label: "Başlık (A-Z)", value: "title-asc" },
            ],
          },
          {
            type: "search",
            name: "q",
            label: "Ara",
            placeholder: "Başlıkta ara...",
          },
        ]}
      />

      {/* Liste veya Boş Durum */}
      {yazilar.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Icons.Article className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {q || durum || yazarId ? "Filtreye uygun yazı bulunamadı" : "Henüz hiç yazı yok"}
          </p>
          <p className="mt-1 text-sm text-gray-600">
            {q || durum || yazarId ? "Farklı filtreler deneyin veya yeni yazı ekleyin." : "İlk yazınızı oluşturarak başlayın."}
          </p>
          {!q && !durum && !yazarId && (
            <Link
              href="/admin/yazilar/yeni"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-hover"
            >
              <Icons.Article className="h-5 w-5" />
              Yeni Yazı Ekle
            </Link>
          )}
        </div>
      ) : (
        <BulkActionsWrapper
          yazilar={yazilar.map((y) => ({
            id: y.id,
            title: y.title,
            authorName: y.author.name,
            publishedAt: y.publishedAt,
            createdAt: y.createdAt,
            viewCount: y.viewCount,
            slug: y.slug,
          }))}
          isAdmin={isAdmin}
          totalCount={totalCount}
          totalPages={totalPages}
          sayfa={sayfa}
          paginationParams={paginationParams}
        />
      )}
    </div>
  );
}
