import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteYazar } from "@/app/admin/actions";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminFilters } from "@/components/admin/AdminFilters";

export default async function AdminYazarlarPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; deleted?: string; error?: string; q?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const tumu = await prisma.yazar.findMany({
    where: q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }] } : undefined,
    orderBy: [
      { sortOrder: "asc" },
      { yazilar: { _count: "desc" } },
      { name: "asc" }
    ],
    include: { _count: { select: { yazilar: true } } },
  });
  // Şirketten ayrılmış (eski) yazarlar bu listede görünmez; sadece Eski Yazılar sayfasında listelenir
  const yazarlar = tumu.filter((y) => !(y as { ayrilmis?: boolean }).ayrilmis);

  return (
    <div className="space-y-6">
      <AdminFeedback initialSuccess={params.success} initialDeleted={params.deleted} initialError={params.error} />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Tüm Yazarlar
          </h1>
          <p className="mt-1 text-sm text-muted">
            Yazar ekleyebilir, düzenleyebilir veya silebilirsiniz. Yazı eklerken bu listeden yazar seçersiniz. Misafir yazarlar mavi etiketle işaretlidir.
          </p>
        </div>
        <Link
          href="/admin/yazarlar/yeni"
          className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          + Yeni yazar ekle
        </Link>
      </div>

      <AdminFilters
        filters={[
          {
            type: "search",
            name: "q",
            label: "Ara",
            placeholder: "İsim veya slug ile ara...",
          },
        ]}
      />

      {yazarlar.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#ddd] bg-white p-12 text-center">
          <p className="text-muted">
            Henüz hiç yazar yok.
          </p>
          <p className="mt-1 text-sm text-muted">
            Yazı ekleyebilmek için önce en az bir yazar eklemeniz gerekir.
          </p>
          <Link
            href="/admin/yazarlar/yeni"
            className="mt-4 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
          >
            Yeni yazar ekle
          </Link>
        </div>
      ) : (
        <>
          {/* Mobil Kart Görünümü */}
          <div className="space-y-3 md:hidden">
            {yazarlar.map((yazar) => (
              <div
                key={yazar.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-foreground">{yazar.name}</p>
                    <p className="mt-0.5 text-xs text-muted">{yazar.email ?? "—"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {yazar.misafir && (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">Misafir</span>
                    )}
                    <span className="text-xs text-muted">{yazar._count.yazilar} yazı</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3">
                  <Link
                    href={`/yazarlar/${yazar.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    Sitede gör
                  </Link>
                  <Link
                    href={`/admin/yazarlar/${yazar.id}`}
                    className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                  >
                    Düzenle
                  </Link>
                  <form
                    action={deleteYazar.bind(null, yazar.id)}
                    method="post"
                    className="inline ml-auto"
                  >
                    <DeleteConfirmButton
                      confirmMessage={`"${yazar.name}" yazarını silmek istediğinize emin misiniz? Bu yazara ait ${yazar._count.yazilar} yazı da silinecektir. Bu işlem geri alınamaz.`}
                      className="inline-flex items-center gap-1 rounded-md bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                    >
                      Sil
                    </DeleteConfirmButton>
                  </form>
                </div>
              </div>
            ))}
          </div>

          {/* Masaüstü Tablo Görünümü */}
          <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 font-semibold text-foreground">Ad Soyad</th>
                    <th className="px-4 py-3 font-semibold text-foreground">E-posta</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Tür</th>
                    <th className="px-4 py-3 font-semibold text-foreground">Yazı sayısı</th>
                    <th className="px-4 py-3 font-semibold text-foreground">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {yazarlar.map((yazar) => (
                    <tr key={yazar.id} className="border-b border-[#eee] last:border-0">
                      <td className="px-4 py-3 font-medium text-foreground">{yazar.name}</td>
                      <td className="px-4 py-3 text-muted">{yazar.email ?? "—"}</td>
                      <td className="px-4 py-3">
                        {yazar.misafir ? (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">Misafir yazar</span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-muted">{yazar._count.yazilar} yazı</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Link
                            href={`/yazarlar/${yazar.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary hover:underline"
                          >
                            Sitede gör
                          </Link>
                          <span className="text-[#ccc]">|</span>
                          <Link
                            href={`/admin/yazarlar/${yazar.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            Düzenle
                          </Link>
                          <span className="text-[#ccc]">|</span>
                          <form
                            action={deleteYazar.bind(null, yazar.id)}
                            method="post"
                            className="inline"
                          >
                            <DeleteConfirmButton
                              confirmMessage={`"${yazar.name}" yazarını silmek istediğinize emin misiniz? Bu yazara ait ${yazar._count.yazilar} yazı da silinecektir. Bu işlem geri alınamaz.`}
                              className="font-medium text-red-600 hover:underline"
                            >
                              Sil
                            </DeleteConfirmButton>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
