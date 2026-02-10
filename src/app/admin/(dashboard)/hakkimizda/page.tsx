import Link from "next/link";
import { getHakkimizdaContent } from "../../actions";
import { HakkimizdaForm } from "@/components/admin/HakkimizdaForm";
import { AdminFeedback } from "@/components/admin/AdminFeedback";

export default async function AdminHakkimizdaPage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string }>;
}) {
    const { success } = await searchParams;
    const content = await getHakkimizdaContent();

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="font-serif text-2xl font-bold text-gray-900">
                        Hakkımızda Sayfası
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        "Hakkımızda" sayfasındaki metinleri buradan yönetebilirsiniz.
                    </p>
                </div>
                <Link
                    href="/hakkimizda"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                >
                    Sitede görüntüle →
                </Link>
            </div>

            <AdminFeedback initialSuccess={success} />

            <HakkimizdaForm defaultValues={content} />
        </div>
    );
}
