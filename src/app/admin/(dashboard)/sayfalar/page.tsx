import Link from "next/link";
import { prisma } from "@/lib/db";
import { deletePage } from "../../actions";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { Icons } from "@/components/admin/Icons";

type PageRow = { id: string; title: string; slug: string; showInMenu: boolean; menuOrder: number; publishedAt: Date | null };

export default async function AdminSayfalarPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; deleted?: string; error?: string }>;
}) {
  const params = await searchParams;
  let pages: PageRow[] = [];
  try {
    pages = await prisma.$queryRaw<PageRow[]>`
      SELECT id, title, slug, "showInMenu", "menuOrder", "publishedAt"
      FROM "Page"
      ORDER BY "menuOrder" ASC, title ASC
    `;
  } catch {
    // Tablo yoksa veya hata varsa boş liste
  }

  const menudeGosterilen = pages.filter(p => p.showInMenu).length;
  const yayindaki = pages.filter(p => p.publishedAt).length;
  const taslaklar = pages.filter(p => !p.publishedAt).length;

  return (
    <div className="space-y-6">
      <AdminFeedback initialSuccess={params.success} initialDeleted={params.deleted} initialError={params.error} />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">
            Sayfalar
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Site menüsünde görünecek sayfalarınızı yönetin.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/sayfalar/menu-sirasi"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Icons.Menu className="h-4 w-4" />
            Menü Sırası
          </Link>
          <Link
            href="/admin/sayfalar/yeni"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-hover"
          >
            <Icons.Article className="h-5 w-5" />
            Yeni Sayfa Ekle
          </Link>
        </div>
      </div>

      {/* İstatistikler - Minimal */}
      {pages.length > 0 && (
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Icons.Article className="h-4 w-4" />
            <span><strong className="text-gray-900">{pages.length}</strong> toplam sayfa</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Icons.CheckCircle className="h-4 w-4" />
            <span><strong className="text-gray-900">{yayindaki}</strong> yayında</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Icons.Menu className="h-4 w-4" />
            <span><strong className="text-gray-900">{menudeGosterilen}</strong> menüde gösteriliyor</span>
          </div>
          {taslaklar > 0 && (
            <div className="flex items-center gap-2 text-gray-600">
              <Icons.Tag className="h-4 w-4" />
              <span><strong className="text-gray-900">{taslaklar}</strong> taslak</span>
            </div>
          )}
        </div>
      )}

      {/* İpucu Kutusu */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex gap-3">
          <Icons.Info className="h-5 w-5 shrink-0 text-gray-600 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p>
              <strong className="font-semibold text-gray-900">Menü sırası:</strong> Sayfaların header menüsündeki sırasını{" "}
              <Link href="/admin/sayfalar/menu-sirasi" className="font-medium text-primary hover:underline">
                buradan düzenleyebilirsiniz
              </Link>.
            </p>
          </div>
        </div>
      </div>

      {/* Liste veya Boş Durum */}
      {pages.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Icons.Article className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-900">
            Henüz sayfa yok
          </p>
          <p className="mt-1 text-sm text-gray-600">
            İlk sayfanızı oluşturarak başlayın. Örn: Hakkımızda, İletişim, Gizlilik Politikası
          </p>
          <Link
            href="/admin/sayfalar/yeni"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-hover"
          >
            <Icons.Article className="h-5 w-5" />
            İlk Sayfayı Ekle
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 font-semibold text-gray-700">Başlık</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">URL</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Sıra</th>
                  <th className="px-4 py-3 font-semibold text-gray-700">Durum</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pages.map((page) => (
                  <tr
                    key={page.id}
                    className="group hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/sayfalar/${page.id}`}
                        className="font-medium text-gray-900 hover:text-primary transition-colors"
                      >
                        {page.title}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <code className="rounded bg-gray-100 px-2 py-1 text-xs font-mono text-gray-600">
                        /sayfa/{page.slug}
                      </code>
                    </td>
                    <td className="px-4 py-4">
                      {page.showInMenu ? (
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <Icons.Menu className="h-3.5 w-3.5" />
                          <span className="text-sm font-medium">#{page.menuOrder}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {page.publishedAt ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                            <Icons.CheckCircle className="h-3 w-3" />
                            Yayında
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
                            <Icons.Tag className="h-3 w-3" />
                            Taslak
                          </span>
                        )}
                        {page.showInMenu && (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <Icons.Menu className="h-3 w-3" />
                            Menüde
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {page.publishedAt ? (
                          <Link
                            href={`/sayfa/${page.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                          >
                            <Icons.Magazine className="h-3.5 w-3.5" />
                            Görüntüle
                          </Link>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-3 py-1.5 text-xs text-gray-400" title="Taslak - görüntülenemez">
                            <Icons.Magazine className="h-3.5 w-3.5" />
                            Görüntüle
                          </span>
                        )}
                        <Link
                          href={`/admin/sayfalar/${page.id}`}
                          className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                        >
                          <Icons.Article className="h-3.5 w-3.5" />
                          Düzenle
                        </Link>
                        <form action={deletePage.bind(null, page.id)} className="inline">
                          <DeleteConfirmButton
                            confirmMessage={`"${page.title}" sayfasını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
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
    </div>
  );
}
