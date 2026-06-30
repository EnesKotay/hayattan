import { prisma } from "@/lib/db";
import Link from "next/link";
import { Icons } from "@/components/admin/Icons";
import { AdminFilters } from "@/components/admin/AdminFilters";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bülten Aboneleri | Admin",
};

export default async function AdminBultenPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; durum?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const durum = params.durum ?? "";

  const where: Record<string, unknown> = {};
  if (q) where.email = { contains: q, mode: "insensitive" };
  if (durum === "aktif") where.active = true;
  if (durum === "pasif") where.active = false;

  const [aboneler, toplamAktif, toplamPasif] = await Promise.all([
    (prisma as any).newsletterSubscriber.findMany({
      where,
      orderBy: { createdAt: "desc" },
    }),
    (prisma as any).newsletterSubscriber.count({ where: { active: true } }),
    (prisma as any).newsletterSubscriber.count({ where: { active: false } }),
  ]);

  const toplam = toplamAktif + toplamPasif;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">Bülten Aboneleri</h1>
          <p className="mt-1 text-sm text-muted">
            Toplam {toplam} abone — {toplamAktif} aktif, {toplamPasif} pasif
          </p>
        </div>
        <Link
          href="/api/admin/bulten-export"
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <Icons.Magazine className="h-4 w-4" />
          CSV İndir
        </Link>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-purple-50 to-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Toplam Abone</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{toplam}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-green-50 to-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Aktif</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{toplamAktif}</p>
        </div>
        <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-4 shadow-sm">
          <p className="text-xs font-medium text-gray-500">Pasif (Çıkmış)</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{toplamPasif}</p>
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
              { label: "Aktif", value: "aktif" },
              { label: "Pasif", value: "pasif" },
            ],
          },
          {
            type: "search",
            name: "q",
            label: "Ara",
            placeholder: "E-posta ara...",
          },
        ]}
      />

      {aboneler.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <Icons.User className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-base font-semibold text-gray-900">
            {q || durum ? "Filtreye uygun abone bulunamadı" : "Henüz hiç bülten abonesi yok"}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 font-semibold text-foreground">E-posta</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Durum</th>
                  <th className="px-4 py-3 font-semibold text-foreground">Kayıt Tarihi</th>
                </tr>
              </thead>
              <tbody>
                {aboneler.map((abone: { id: string; email: string; active: boolean; createdAt: Date }) => (
                  <tr key={abone.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{abone.email}</td>
                    <td className="px-4 py-3">
                      {abone.active ? (
                        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                          Aktif
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                          Pasif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {new Date(abone.createdAt).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-100 px-4 py-3 text-xs text-gray-500">
            {aboneler.length} abone gösteriliyor
            {(q || durum) && ` (toplam ${toplam} içinden)`}
          </div>
        </div>
      )}
    </div>
  );
}
