import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteHaber } from "../../actions";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { Haber } from "@prisma/client";

export default async function AdminHaberlerPage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string; deleted?: string; error?: string }>;
}) {
    const params = await searchParams;

    const haberler = await prisma.haber.findMany({
        orderBy: { sortOrder: "asc" },
    });

    return (
        <div className="space-y-6">
            <AdminFeedback initialSuccess={params.success} initialDeleted={params.deleted} initialError={params.error} />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-foreground">
                        Haberler (Slider)
                    </h1>
                    <p className="mt-1 text-sm text-muted">
                        Ana sayfa manşet alanında gösterilen haberleri buradan yönetebilirsiniz. Sıralama küçükten büyüğe (0, 1, 2...) yapılır.
                    </p>
                </div>
                <Link
                    href="/admin/haberler/yeni"
                    className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
                >
                    + Yeni haber ekle
                </Link>
            </div>

            {haberler.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[#ddd] bg-white p-12 text-center">
                    <p className="text-muted">
                        Henüz hiç haber yok.
                    </p>
                    <p className="mt-1 text-sm text-muted">
                        Slider'a haber eklemek için yukarıdaki &quot;Yeni haber ekle&quot; butonuna tıklayın.
                    </p>
                    <Link
                        href="/admin/haberler/yeni"
                        className="mt-4 inline-block rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
                    >
                        Yeni haber ekle
                    </Link>
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-4 py-3 font-semibold text-foreground">Sıra</th>
                                    <th className="px-4 py-3 font-semibold text-foreground">Başlık</th>
                                    <th className="px-4 py-3 font-semibold text-foreground">Yazar (Görünen)</th>
                                    <th className="px-4 py-3 font-semibold text-foreground">Durum</th>
                                    <th className="px-4 py-3 font-semibold text-foreground">İşlem</th>
                                </tr>
                            </thead>
                            <tbody>
                                {haberler.map((haber: Haber) => (
                                    <tr key={haber.id} className="border-b border-[#eee] last:border-0 hover:bg-gray-50/50">
                                        <td className="px-4 py-3 font-medium text-foreground">{haber.sortOrder}</td>
                                        <td className="px-4 py-3 font-medium text-foreground">{haber.title}</td>
                                        <td className="px-4 py-3 text-muted">{haber.authorName || "—"}</td>
                                        <td className="px-4 py-3">
                                            <span
                                                className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${haber.publishedAt
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-amber-100 text-amber-800"
                                                    }`}
                                            >
                                                {haber.publishedAt ? "Yayında" : "Taslak"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex flex-wrap gap-2">
                                                <Link
                                                    href={`/admin/haberler/${haber.id}`}
                                                    className="font-medium text-primary hover:underline"
                                                >
                                                    Düzenle
                                                </Link>
                                                <span className="text-gray-300">|</span>
                                                <form action={deleteHaber.bind(null, haber.id)} className="inline">
                                                    <DeleteConfirmButton
                                                        confirmMessage="Bu haberi silmek istediğinize emin misiniz?"
                                                        className="font-medium text-red-600 hover:underline"
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
