import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateYazi } from "../../../actions";
import { YaziForm } from "@/components/admin/YaziForm";

export default async function YaziDuzenlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const yazi = await prisma.yazi.findUnique({
    where: { id },
    include: {
      author: true,
      kategoriler: true,
    },
  });

  if (!yazi) notFound();

  const [yazarlar, kategoriler] = await Promise.all([
    prisma.yazar.findMany({
      orderBy: [
        { sortOrder: "asc" },
        { yazilar: { _count: "desc" } },
        { name: "asc" }
      ] as any
    }),
    prisma.kategori.findMany({ orderBy: { name: "asc" } }),
  ]);

  async function handleSubmit(formData: FormData) {
    "use server";
    await updateYazi(id, formData);
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Yazıyı düzenle
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href={`/admin/yazilar/${id}/preview`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-[#ddd] bg-white px-4 py-2.5 text-sm font-medium text-foreground hover:bg-[#f9f9f6]"
            >
              <span aria-hidden>👁️</span>
              Kaydedilmiş hali (yeni sekme)
            </a>
            {yazi.publishedAt && (
              <Link
                href={`/yazilar/${yazi.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-[#ddd] bg-white px-3 py-2 text-sm font-medium text-foreground hover:bg-[#f9f9f6]"
              >
                Sitede gör →
              </Link>
            )}
          </div>
        </div>
        <p className="mt-2 text-sm text-muted">
          Formda &quot;Önizle (formdaki hali)&quot; ile kaydetmeden anlık önizleme; üstteki link ile kaydedilmiş hali yeni sekmede açın.
        </p>
      </div>

      <YaziForm
        action={handleSubmit}
        yazar={yazarlar}
        kategoriler={kategoriler}
        defaultValues={{
          id: yazi.id,
          title: yazi.title,
          slug: yazi.slug,
          excerpt: yazi.excerpt ?? undefined,
          content: yazi.content,
          featuredImage: yazi.featuredImage ?? undefined,
          showInSlider: yazi.showInSlider,
          authorId: yazi.authorId,
          kategoriIds: yazi.kategoriler.map((k) => k.id),
          publishedAt: yazi.publishedAt,
          metaDescription: yazi.metaDescription ?? undefined,
          metaKeywords: yazi.metaKeywords ?? undefined,
          ogImage: yazi.ogImage ?? undefined,
          imageAlt: yazi.imageAlt ?? undefined,
        }}
        isEdit
      />
    </div>
  );
}
