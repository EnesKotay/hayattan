import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateHaber } from "@/app/admin/actions";
import { HaberForm } from "@/components/admin/HaberForm";

export default async function HaberDuzenlePage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const haber = await prisma.haber.findUnique({
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
