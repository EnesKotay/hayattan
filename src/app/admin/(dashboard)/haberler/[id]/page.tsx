import { notFound, redirect } from "next/navigation";
import { repository } from "@/backend/modules/data/repository";
import { updateHaber } from "@/backend/modules/news/actions";
import { HaberForm } from "@/frontend/admin/news/HaberForm";
import { requireAdminPage } from "@/backend/modules/auth/admin-guard";

export default async function HaberDuzenlePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    await requireAdminPage();
    const { id } = await params;
    const haber = await repository.haber.findUnique({
        where: { id },
    });

    if (!haber) notFound();

    async function handleSubmit(formData: FormData) {
        "use server";
        await updateHaber(id, formData);
        redirect("/admin/haberler");
    }

    return (
        <div className="space-y-8">
            <div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <h1 className="font-serif text-2xl font-bold text-foreground">
                        Haberi Düzenle
                    </h1>
                </div>
                <p className="mt-1 text-sm text-muted">
                    Mevcut haberi düzenleyin.
                </p>
            </div>

            <HaberForm
                action={handleSubmit}
                defaultValues={{
                    id: haber.id,
                    title: haber.title,
                    excerpt: haber.excerpt ?? undefined,
                    imageUrl: haber.imageUrl ?? undefined,
                    link: haber.link ?? undefined,
                    authorName: haber.authorName ?? undefined,
                    sortOrder: haber.sortOrder,
                    publishedAt: haber.publishedAt,
                }}
                isEdit
            />
        </div>
    );
}
