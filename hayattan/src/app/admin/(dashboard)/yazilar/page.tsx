import Link from "next/link";
import { prisma } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { deleteYazi } from "../../actions";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { Icons } from "@/components/admin/Icons";

const YAZILAR_PER_PAGE = 20;

function paginationUrl(page: number, params: { durum?: string; yazar?: string; q?: string }) {
  const search = new URLSearchParams();
  if (page > 1) search.set("sayfa", String(page));
  if (params.durum) search.set("durum", params.durum);
  if (params.yazar) search.set("yazar", params.yazar);
  if (params.q?.trim()) search.set("q", params.q.trim());
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

export default async function AdminYazilarPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; deleted?: string; error?: string; sayfa?: string; durum?: string; yazar?: string; q?: string }>;
}) {
  const params = await searchParams;
  const durum = params.durum ?? "";
  const yazarId = params.yazar ?? "";
  const q = (params.q ?? "").trim();
  const sayfa = Math.max(1, parseInt(params.sayfa ?? "1", 10) || 1);
  const skip = (sayfa - 1) * YAZILAR_PER_PAGE;

  const where: Prisma.YaziWhereInput = {};
  if (durum === "yayinda") where.publishedAt = { not: null };
  if (durum === "taslak") where.publishedAt = null;
  if (yazarId) where.authorId = yazarId;
  if (q) where.title = { contains: q, mode: "insensitive" };

  const [yazilar, totalCount, yazarlar, yayindaCount, taslakCount, toplamOkunma] = await Promise.all([
    prisma.yazi.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: YAZILAR_PER_PAGE,
      include: {
        author: { select: { name: true } },
      },
    }),
    prisma.yazi.count({ where }),
    prisma.yazar.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
    prisma.yazi.count({ where: { publishedAt: { not: null } } }),
    prisma.yazi.count({ where: { publishedAt: null } }),
    prisma.yazi.aggregate({ where: { publishedAt: { not: null } }, _sum: { viewCount: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / YAZILAR_PER_PAGE));
  const paginationParams = { durum, yazar: yazarId, q };

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-blue-50 to-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Icons.Article className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-600">Toplam Yazı</p>
              <p className="text-2xl font-bold text-gray-900">{yayindaCount + taslakCount}</p>
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
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 font-semibold text-gray-700">Başlık</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Yazar</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Tarih</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Durum</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-center" title="Kaç kez okundu">Okunma</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {yazilar.map((yazi) => (
                  <tr
                    key={yazi.id}
                    className="group hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/yazilar/${yazi.id}`}
                        className="font-medium text-gray-900 hover:text-primary transition-colors line-clamp-2"
                      >
                        {yazi.title}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {yazi.author.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-gray-700">{yazi.author.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      <div className="text-xs">
                        {yazi.publishedAt ? (
                          <>
                            <div className="font-medium text-gray-700">
                              {formatDate(yazi.publishedAt)}
                            </div>
                            <div className="text-gray-500">Yayınlandı</div>
                          </>
                        ) : (
                          <>
                            <div className="font-medium text-gray-700">
                              {formatDate(yazi.createdAt)}
                            </div>
                            <div className="text-gray-500">Oluşturuldu</div>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${yazi.publishedAt
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                          }`}
                      >
                        {yazi.publishedAt ? (
                          <>
                            <Icons.CheckCircle className="h-3 w-3" />
                            Yayında
                          </>
                        ) : (
                          <>
                            <Icons.Tag className="h-3 w-3" />
                            Taslak
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="inline-flex items-center justify-center gap-1.5 text-gray-600" title="Okunma sayısı">
                        <Icons.Eye className="h-4 w-4 text-gray-400" />
                        <span className="font-medium tabular-nums">{yazi.viewCount}</span>
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/yazilar/${yazi.id}/preview`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                          title="Önizleme"
                        >
                          <Icons.Magazine className="h-3.5 w-3.5" />
                          Önizle
                        </Link>
                        <Link
                          href={`/admin/yazilar/${yazi.id}`}
                          className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                        >
                          <Icons.Article className="h-3.5 w-3.5" />
                          Düzenle
                        </Link>
                        <form action={deleteYazi.bind(null, yazi.id)} className="inline">
                          <DeleteConfirmButton
                            confirmMessage="Bu yazıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
                            className="inline-flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                          />
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {yazilar.length > 0 && totalPages > 1 && (
        <nav
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
          aria-label="Sayfa navigasyonu"
        >
          <p className="text-sm text-gray-600">
            <strong className="font-semibold text-gray-900">{totalCount}</strong> yazı içinden{" "}
            <strong className="font-semibold text-gray-900">{sayfa}</strong> / {totalPages} sayfa
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {sayfa > 1 ? (
              <Link
                href={paginationUrl(sayfa - 1, paginationParams)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Önceki
              </Link>
            ) : (
              <span className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-400">
                ← Önceki
              </span>
            )}
            <span className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || (p >= sayfa - 2 && p <= sayfa + 2))
                .reduce<number[]>((acc, p) => (acc.length && acc[acc.length - 1] !== p - 1 ? [...acc, -1, p] : [...acc, p]), [])
                .map((p) =>
                  p === -1 ? (
                    <span key="ellipsis" className="px-1 text-gray-400">…</span>
                  ) : (
                    <Link
                      key={p}
                      href={paginationUrl(p, paginationParams)}
                      className={`min-w-[2.25rem] rounded-lg px-3 py-2 text-center text-sm font-medium transition-colors ${p === sayfa
                        ? "bg-primary text-white shadow-sm"
                        : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                    >
                      {p}
                    </Link>
                  )
                )}
            </span>
            {sayfa < totalPages ? (
              <Link
                href={paginationUrl(sayfa + 1, paginationParams)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Sonraki →
              </Link>
            ) : (
              <span className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-400">
                Sonraki →
              </span>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
