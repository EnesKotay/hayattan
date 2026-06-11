import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bülten Aboneleri | Admin",
};

export default async function AdminBultenPage() {
  const aboneler = await (prisma as any).newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  const aktif = aboneler.filter((a: { active: boolean }) => a.active).length;
  const pasif = aboneler.length - aktif;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Bülten Aboneleri</h1>
        <p className="mt-1 text-sm text-muted">
          Toplam {aboneler.length} abone — {aktif} aktif, {pasif} pasif
        </p>
      </div>

      {aboneler.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#ddd] bg-white p-12 text-center">
          <p className="text-muted">Henüz hiç bülten abonesi yok.</p>
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
                  <tr key={abone.id} className="border-b border-[#eee] last:border-0">
                    <td className="px-4 py-3 font-medium text-foreground">{abone.email}</td>
                    <td className="px-4 py-3">
                      {abone.active ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          Aktif
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
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
        </div>
      )}
    </div>
  );
}
