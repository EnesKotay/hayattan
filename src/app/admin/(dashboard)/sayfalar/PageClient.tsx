"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton";
import { Icons } from "@/components/admin/Icons";

type PageRow = {
  id: string;
  title: string;
  slug: string;
  showInMenu: boolean;
  menuOrder: number;
  publishedAt: Date | null;
  deletePage: (id: string) => Promise<void>;
};

export default function AdminSayfalarPageClient({
  pages: initialPages,
  feedback,
}: {
  pages: PageRow[];
  feedback?: { success?: string; deleted?: string; error?: string };
}) {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "published" | "draft" | "menu">("all");

  // Filtreleme ve arama
  const filteredPages = useMemo(() => {
    let result = initialPages;

    // Arama
    if (searchQuery) {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.slug.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Durum filtresi
    if (filterStatus === "published") {
      result = result.filter((p) => p.publishedAt);
    } else if (filterStatus === "draft") {
      result = result.filter((p) => !p.publishedAt);
    } else if (filterStatus === "menu") {
      result = result.filter((p) => p.showInMenu);
    }

    return result;
  }, [initialPages, searchQuery, filterStatus]);

  const menudeGosterilen = initialPages.filter((p) => p.showInMenu).length;
  const yayindaki = initialPages.filter((p) => p.publishedAt).length;
  const taslaklar = initialPages.filter((p) => !p.publishedAt).length;

  return (
    <div className="space-y-6">
      {/* Feedback Messages */}
      {feedback?.success && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-3">
            <Icons.CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-green-800">{feedback.success}</p>
          </div>
        </div>
      )}
      {feedback?.deleted && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-3">
            <Icons.Info className="h-5 w-5 text-blue-600" />
            <p className="text-sm font-medium text-blue-800">{feedback.deleted}</p>
          </div>
        </div>
      )}
      {feedback?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-3">
            <Icons.AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-sm font-medium text-red-800">{feedback.error}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text font-serif text-4xl font-bold text-transparent">
            📄 Sayfalar
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Site menüsünde görünecek sayfalarınızı yönetin ve düzenleyin.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/sayfalar/menu-sirasi"
            className="group inline-flex items-center justify-center gap-2 rounded-lg border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow"
          >
            <Icons.Menu className="h-4 w-4 transition-transform group-hover:scale-110" />
            Menü Sırası
          </Link>
          <Link
            href="/admin/sayfalar/yeni"
            className="group inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-gray-900 to-gray-700 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
          >
            <Icons.Article className="h-5 w-5 transition-transform group-hover:rotate-12" />
            Yeni Sayfa Ekle
          </Link>
        </div>
      </div>

      {/* İstatistik Kartları */}
      {initialPages.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Toplam Sayfalar */}
          <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-purple-50 to-white p-6 shadow-sm transition-all hover:shadow-lg hover:scale-[1.02]">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-purple-100 opacity-50 transition-all group-hover:scale-150"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <Icons.Article className="h-8 w-8 text-purple-600" />
                <span className="text-3xl font-bold text-purple-900">{initialPages.length}</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-purple-700">Toplam Sayfa</p>
              <p className="mt-1 text-xs text-purple-600">Sistemdeki tüm sayfalar</p>
            </div>
          </div>

          {/* Yayındaki */}
          <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-green-50 to-white p-6 shadow-sm transition-all hover:shadow-lg hover:scale-[1.02]">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-green-100 opacity-50 transition-all group-hover:scale-150"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <Icons.CheckCircle className="h-8 w-8 text-green-600" />
                <span className="text-3xl font-bold text-green-900">{yayindaki}</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-green-700">Yayında</p>
              <p className="mt-1 text-xs text-green-600">Aktif ve görünür sayfalar</p>
            </div>
          </div>

          {/* Menüde Gösterilen */}
          <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm transition-all hover:shadow-lg hover:scale-[1.02]">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-100 opacity-50 transition-all group-hover:scale-150"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <Icons.Menu className="h-8 w-8 text-blue-600" />
                <span className="text-3xl font-bold text-blue-900">{menudeGosterilen}</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-blue-700">Menüde</p>
              <p className="mt-1 text-xs text-blue-600">Header menüsünde görünür</p>
            </div>
          </div>

          {/* Taslaklar */}
          <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm transition-all hover:shadow-lg hover:scale-[1.02]">
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-amber-100 opacity-50 transition-all group-hover:scale-150"></div>
            <div className="relative">
              <div className="flex items-center justify-between">
                <Icons.Tag className="h-8 w-8 text-amber-600" />
                <span className="text-3xl font-bold text-amber-900">{taslaklar}</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-amber-700">Taslak</p>
              <p className="mt-1 text-xs text-amber-600">Yayınlanmamış sayfalar</p>
            </div>
          </div>
        </div>
      )}

      {/* Arama ve Filtreler */}
      {initialPages.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Arama */}
            <div className="relative flex-1 max-w-md">
              <Icons.Article className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Sayfa ara... (başlık veya URL)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-500 transition-all focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <Icons.X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filtreler ve Görünüm */}
            <div className="flex items-center gap-2">
              {/* Durum Filtreleri */}
              <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                <button
                  onClick={() => setFilterStatus("all")}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${filterStatus === "all"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  Tümü
                </button>
                <button
                  onClick={() => setFilterStatus("published")}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${filterStatus === "published"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  Yayında
                </button>
                <button
                  onClick={() => setFilterStatus("draft")}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${filterStatus === "draft"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  Taslak
                </button>
                <button
                  onClick={() => setFilterStatus("menu")}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-all ${filterStatus === "menu"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                    }`}
                >
                  Menüde
                </button>
              </div>

              {/* Görünüm Değiştirici */}
              <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-1">
                <button
                  onClick={() => setViewMode("list")}
                  className={`rounded-md px-3 py-1.5 transition-all ${viewMode === "list"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                    }`}
                  title="Liste görünümü"
                >
                  <Icons.TextIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`rounded-md px-3 py-1.5 transition-all ${viewMode === "grid"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                    }`}
                  title="Grid görünümü"
                >
                  <Icons.ImageIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sonuç Sayısı */}
      {initialPages.length > 0 && filteredPages.length !== initialPages.length && (
        <div className="text-sm text-gray-600">
          <strong className="text-gray-900">{filteredPages.length}</strong> sayfa gösteriliyor
          {searchQuery && <span> / "{searchQuery}" araması için</span>}
        </div>
      )}

      {/* Liste veya Boş Durum */}
      {initialPages.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white p-16 text-center">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 h-32 w-32 rounded-full bg-purple-400"></div>
            <div className="absolute bottom-10 right-10 h-40 w-40 rounded-full bg-blue-400"></div>
          </div>
          <div className="relative">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-blue-100 shadow-lg">
              <Icons.Article className="h-12 w-12 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              Henüz sayfa yok
            </p>
            <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
              İlk sayfanızı oluşturarak başlayın. Hakkımızda, İletişim, Gizlilik Politikası gibi statik sayfalar ekleyebilirsiniz.
            </p>
            <Link
              href="/admin/sayfalar/yeni"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-gray-900 to-gray-700 px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
            >
              <Icons.Article className="h-5 w-5" />
              İlk Sayfayı Ekle
            </Link>
          </div>
        </div>
      ) : filteredPages.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <Icons.AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg font-semibold text-gray-900">Sonuç bulunamadı</p>
          <p className="mt-1 text-sm text-gray-600">
            Arama kriterlerinizle eşleşen sayfa bulunamadı. Farklı bir arama deneyin.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setFilterStatus("all");
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Icons.X className="h-4 w-4" />
            Filtreleri Temizle
          </button>
        </div>
      ) : viewMode === "list" ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                  <th className="px-6 py-4 font-bold text-gray-700">Başlık</th>
                  <th className="px-6 py-4 font-bold text-gray-700">URL</th>
                  <th className="px-6 py-4 font-bold text-gray-700">Sıra</th>
                  <th className="px-6 py-4 font-bold text-gray-700">Durum</th>
                  <th className="px-6 py-4 font-bold text-gray-700 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPages.map((page, index) => (
                  <tr
                    key={page.id}
                    className="group hover:bg-gradient-to-r hover:from-gray-50 hover:to-transparent transition-all"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/sayfalar/${page.id}`}
                        className="flex items-center gap-2 font-semibold text-gray-900 hover:text-purple-600 transition-colors"
                      >
                        <Icons.Article className="h-4 w-4 text-gray-400 group-hover:text-purple-500 transition-colors" />
                        {page.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <code className="rounded-md bg-gray-100 px-3 py-1.5 text-xs font-mono text-gray-700 group-hover:bg-purple-50 group-hover:text-purple-800 transition-colors">
                        /sayfa/{page.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      {page.showInMenu ? (
                        <div className="flex items-center gap-2 text-gray-700">
                          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 text-blue-700">
                            <Icons.Menu className="h-3.5 w-3.5" />
                          </div>
                          <span className="text-sm font-bold">#{page.menuOrder}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        {page.publishedAt ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 shadow-sm">
                            <Icons.CheckCircle className="h-3.5 w-3.5" />
                            Yayında
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 shadow-sm">
                            <Icons.Tag className="h-3.5 w-3.5" />
                            Taslak
                          </span>
                        )}
                        {page.showInMenu && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                            <Icons.Menu className="h-3 w-3" />
                            Menü
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {page.publishedAt ? (
                          <Link
                            href={`/sayfa/${page.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-200 hover:shadow"
                          >
                            <Icons.Magazine className="h-4 w-4" />
                            Görüntüle
                          </Link>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-400" title="Taslak - görüntülenemez">
                            <Icons.Magazine className="h-4 w-4" />
                            Görüntüle
                          </span>
                        )}
                        <Link
                          href={`/admin/sayfalar/${page.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-purple-100 px-3 py-2 text-xs font-semibold text-purple-700 shadow-sm transition-all hover:bg-purple-200 hover:shadow"
                        >
                          <Icons.Article className="h-4 w-4" />
                          Düzenle
                        </Link>
                        <form action={page.deletePage.bind(null, page.id)} className="inline">
                          <DeleteConfirmButton
                            confirmMessage={`"${page.title}" sayfasını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 shadow-sm transition-all hover:bg-red-200 hover:shadow"
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
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPages.map((page, index) => (
            <div
              key={page.id}
              className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:scale-[1.02]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Durum Rozeti */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                {page.publishedAt ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700 shadow-sm">
                    <Icons.CheckCircle className="h-3 w-3" />
                    Yayında
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-700 shadow-sm">
                    <Icons.Tag className="h-3 w-3" />
                    Taslak
                  </span>
                )}
                {page.showInMenu && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700 shadow-sm">
                    <Icons.Menu className="h-3 w-3" />
                    #{page.menuOrder}
                  </span>
                )}
              </div>

              {/* İçerik */}
              <div className="mb-4 pr-20">
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-100 to-blue-100">
                  <Icons.Article className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                  {page.title}
                </h3>
                <p className="mt-1 text-xs font-mono text-gray-500">
                  /sayfa/{page.slug}
                </p>
              </div>

              {/* Aksiyonlar */}
              <div className="flex flex-wrap gap-2 border-t border-gray-100 pt-4">
                {page.publishedAt ? (
                  <Link
                    href={`/sayfa/${page.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-700 transition-all hover:bg-gray-200"
                  >
                    <Icons.Magazine className="h-3.5 w-3.5" />
                    Görüntüle
                  </Link>
                ) : (
                  <span className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-400 cursor-not-allowed">
                    <Icons.Magazine className="h-3.5 w-3.5" />
                    Görüntüle
                  </span>
                )}
                <Link
                  href={`/admin/sayfalar/${page.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-purple-100 px-3 py-2 text-xs font-semibold text-purple-700 transition-all hover:bg-purple-200"
                >
                  <Icons.Article className="h-3.5 w-3.5" />
                  Düzenle
                </Link>
                <form action={page.deletePage.bind(null, page.id)} className="flex-1">
                  <DeleteConfirmButton
                    confirmMessage={`"${page.title}" sayfasını silmek istediğinize emin misiniz?`}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-100 px-3 py-2 text-xs font-semibold text-red-700 transition-all hover:bg-red-200"
                  />
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
