import Link from "next/link";
import { prisma } from "@/lib/db";
import { deleteKategori } from "../../actions";
import { DeleteConfirmButton } from "@/components/admin/DeleteConfirmButton";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { Icons } from "@/components/admin/Icons";

export default async function AdminKategorilerPage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string; deleted?: string; error?: string; q?: string }>;
}) {
    const params = await searchParams;
    const q = (params.q ?? "").trim();

    const kategoriler = await prisma.kategori.findMany({
        where: q ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }] } : undefined,
        orderBy: { name: "asc" },
        include: { _count: { select: { yazilar: true } } },
    });

    return (
        <div className="space-y-6">
            <AdminFeedback initialSuccess={params.success} initialDeleted={params.deleted} initialError={params.error} />

            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-serif text-3xl font-bold text-foreground">
                        Kategoriler
                    </h1>
                    <p className="mt-1 text-sm text-gray-600">
                        Yazılarınızı organize etmek için kategoriler oluşturun.
                    </p>
                </div>
                <Link
                    href="/admin/kategoriler/yeni"
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-primary-hover hover:shadow-md"
                >
                    <Icons.Tag className="h-5 w-5" />
                    Yeni Kategori Ekle
                </Link>
            </div>

            {/* Arama */}
            <AdminFilters
                filters={[
                    {
                        type: "search",
                        name: "q",
                        label: "Ara",
                        placeholder: "Kategori adı veya URL'de ara...",
                    },
                ]}
            />

            {/* Liste veya Boş Durum */}
            {kategoriler.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-12 text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                        <Icons.Tag className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                        {q ? "Kategori bulunamadı" : "Henüz kategori yok"}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                        {q
                            ? "Farklı bir arama terimi deneyin."
                            : "Yazılarınızı organize etmek için ilk kategorinizi oluşturun."
                        }
                    </p>
                    {!q && (
                        <Link
                            href="/admin/kategoriler/yeni"
                            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-primary-hover"
                        >
                            <Icons.Tag className="h-5 w-5" />
                            Yeni Kategori Ekle
                        </Link>
                    )}
                </div>
            ) : (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50">
                                    <th className="px-4 py-3 font-semibold text-gray-700">Kategori</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">URL</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700">Yazı Sayısı</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700 text-right">İşlemler</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {kategoriler.map((kategori) => (
                                    <tr
                                        key={kategori.id}
                                        className="group hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-4 py-4">
                                            <Link
                                                href={`/admin/kategoriler/${kategori.id}`}
                                                className="font-semibold text-gray-900 hover:text-primary transition-colors"
                                            >
                                                {kategori.name}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-4">
                                            <code className="rounded bg-gray-100 px-2 py-1 text-xs font-mono text-gray-700">
                                                /{kategori.slug}
                                            </code>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-sm text-gray-700">
                                                {kategori._count.yazilar} yazı
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/kategoriler/${kategori.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200 transition-colors"
                                                    title="Sitede Gör"
                                                >
                                                    <Icons.Magazine className="h-3.5 w-3.5" />
                                                    Görüntüle
                                                </Link>
                                                <Link
                                                    href={`/admin/kategoriler/${kategori.id}`}
                                                    className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                                                >
                                                    <Icons.Tag className="h-3.5 w-3.5" />
                                                    Düzenle
                                                </Link>
                                                <form action={deleteKategori.bind(null, kategori.id)} className="inline">
                                                    <DeleteConfirmButton
                                                        confirmMessage={`"${kategori.name}" kategorisini silmek istediğinize emin misiniz?`}
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
