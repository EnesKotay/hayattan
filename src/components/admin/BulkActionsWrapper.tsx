"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BulkActions } from "@/components/admin/BulkActions";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton";
import { Icons } from "@/components/admin/Icons";
import { deleteYazi } from "@/app/admin/actions";

type Yazi = {
  id: string;
  title: string;
  authorName: string;
  publishedAt: Date | null;
  createdAt: Date;
  viewCount: number;
  slug: string;
};

type PaginationParams = {
  durum: string;
  yazar: string;
  q: string;
  siralama: string;
};

function formatDate(date: Date | null): string {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function paginationUrl(
  page: number,
  params: PaginationParams
): string {
  const search = new URLSearchParams();
  if (page > 1) search.set("sayfa", String(page));
  if (params.durum) search.set("durum", params.durum);
  if (params.yazar) search.set("yazar", params.yazar);
  if (params.q?.trim()) search.set("q", params.q.trim());
  if (params.siralama && params.siralama !== "createdAt-desc")
    search.set("siralama", params.siralama);
  const q = search.toString();
  return q ? `/admin/yazilar?${q}` : "/admin/yazilar";
}

function getDurum(publishedAt: Date | null): "yayinda" | "planli" | "taslak" {
  if (!publishedAt) return "taslak";
  if (new Date(publishedAt) > new Date()) return "planli";
  return "yayinda";
}

const DURUM_BADGE: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  yayinda: {
    label: "Yayında",
    className: "bg-green-100 text-green-800",
    icon: <Icons.CheckCircle className="h-3 w-3" />,
  },
  planli: {
    label: "Planlandı",
    className: "bg-blue-100 text-blue-800",
    icon: <Icons.Calendar className="h-3 w-3" />,
  },
  taslak: {
    label: "Taslak",
    className: "bg-amber-100 text-amber-800",
    icon: <Icons.Tag className="h-3 w-3" />,
  },
};

interface BulkActionsWrapperProps {
  yazilar: Yazi[];
  isAdmin: boolean;
  totalCount: number;
  totalPages: number;
  sayfa: number;
  paginationParams: PaginationParams;
}

export function BulkActionsWrapper({
  yazilar,
  isAdmin,
  totalCount,
  totalPages,
  sayfa,
  paginationParams,
}: BulkActionsWrapperProps) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.size === yazilar.length
        ? new Set()
        : new Set(yazilar.map((y) => y.id))
    );
  }, [yazilar]);

  const handleBulkComplete = useCallback(() => {
    setSelectedIds(new Set());
    router.refresh();
  }, [router]);

  const allSelected = selectedIds.size === yazilar.length && yazilar.length > 0;
  const someSelected = selectedIds.size > 0 && selectedIds.size < yazilar.length;

  return (
    <>
      {/* Toplu işlem bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-[73px] z-30">
          <BulkActions
            selectedIds={Array.from(selectedIds)}
            onComplete={handleBulkComplete}
          />
        </div>
      )}

      {/* Mobil Kart Görünümü */}
      <div className="space-y-3 md:hidden">
        {/* Tümünü seç */}
        <label className="flex items-center gap-2 px-1 text-sm font-medium text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={allSelected}
            ref={(el) => { if (el) el.indeterminate = someSelected; }}
            onChange={toggleAll}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20"
          />
          {allSelected ? "Seçimi kaldır" : "Tümünü seç"}
        </label>

        {yazilar.map((yazi) => {
          const durum = getDurum(yazi.publishedAt);
          const badge = DURUM_BADGE[durum];
          const isSelected = selectedIds.has(yazi.id);
          return (
            <div
              key={yazi.id}
              className={`rounded-xl border bg-white p-4 shadow-sm transition-all ${isSelected ? "border-primary/40 ring-1 ring-primary/20" : "border-gray-200"}`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelect(yazi.id)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/admin/yazilar/${yazi.id}`}
                      className="font-medium text-gray-900 hover:text-primary transition-colors line-clamp-2 flex-1"
                    >
                      {yazi.title}
                    </Link>
                    <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${badge.className}`}>
                      {badge.icon}{badge.label}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                    <span>{yazi.authorName}</span>
                    <span>{yazi.publishedAt ? formatDate(yazi.publishedAt) : formatDate(yazi.createdAt)}</span>
                    {isAdmin && (
                      <span className="flex items-center gap-1">
                        <Icons.Eye className="h-3.5 w-3.5 text-gray-400" />
                        {yazi.viewCount}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
                    <Link
                      href={`/admin/yazilar/${yazi.id}/preview`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
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
                    <form action={deleteYazi.bind(null, yazi.id)} className="inline ml-auto">
                      <DeleteConfirmButton
                        confirmMessage="Bu yazıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz."
                        className="inline-flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                      />
                    </form>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Masaüstü Tablo Görünümü */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => { if (el) el.indeterminate = someSelected; }}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                    aria-label="Tümünü seç"
                  />
                </th>
                <th className="px-4 py-3 font-semibold text-gray-700">Başlık</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Yazar</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Tarih</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Durum</th>
                {isAdmin && <th className="px-4 py-3 font-semibold text-gray-700 text-center" title="Kaç kez okundu">Okunma</th>}
                <th className="px-4 py-3 font-semibold text-gray-700 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {yazilar.map((yazi) => {
                const durum = getDurum(yazi.publishedAt);
                const badge = DURUM_BADGE[durum];
                const isSelected = selectedIds.has(yazi.id);
                return (
                  <tr
                    key={yazi.id}
                    className={`group transition-colors ${isSelected ? "bg-primary/5" : "hover:bg-gray-50"}`}
                  >
                    <td className="px-4 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(yazi.id)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary/20"
                        aria-label={`"${yazi.title}" seç`}
                      />
                    </td>
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
                          {yazi.authorName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-gray-700">{yazi.authorName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gray-600">
                      <div className="text-xs">
                        {yazi.publishedAt ? (
                          <>
                            <div className="font-medium text-gray-700">
                              {formatDate(yazi.publishedAt)}
                            </div>
                            <div className="text-gray-500">
                              {durum === "planli" ? "Planlandı" : "Yayınlandı"}
                            </div>
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
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}>
                        {badge.icon}
                        {badge.label}
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center justify-center gap-1.5 text-gray-600" title="Okunma sayısı">
                          <Icons.Eye className="h-4 w-4 text-gray-400" />
                          <span className="font-medium tabular-nums">{yazi.viewCount}</span>
                        </span>
                      </td>
                    )}
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
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
    </>
  );
}
