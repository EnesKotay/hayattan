import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { updatePage } from "../../../actions";
import { PageForm } from "@/components/admin/PageForm";

type PageRow = { id: string; title: string; slug: string; content: string; featuredImage: string | null; showInMenu: boolean; menuOrder: number; publishedAt: Date | null };

export default async function SayfaDuzenlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let page: PageRow | null = null;
  try {
    const rows = await prisma.$queryRaw<PageRow[]>`
      SELECT id, title, slug, content, "featuredImage", "showInMenu", "menuOrder", "publishedAt"
      FROM "Page" WHERE id = ${id} LIMIT 1
    `;
    page = rows[0] ?? null;
  } catch {
    // Tablo yoksa veya hata
  }
  if (!page) notFound();

  async function handleSubmit(formData: FormData) {
    "use server";
    await updatePage(id, formData);
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-serif text-2xl font-bold text-foreground">Sayfayı düzenle</h1>
          <Link
            href={`/sayfa/${page.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-[#ddd] bg-white px-3 py-2 text-sm font-medium text-foreground hover:bg-[#f9f9f6]"
          >
            Sitede görüntüle →
          </Link>
        </div>
        <p className="mt-1 text-sm text-muted">
          Değişiklikleri yaptıktan sonra &quot;Güncelle&quot; butonuna tıklayın.
        </p>
      </div>
      <PageForm
        action={handleSubmit}
        defaultValues={{
          title: page.title,
          slug: page.slug,
          content: page.content,
          featuredImage: page.featuredImage ?? undefined,
          showInMenu: page.showInMenu,
          menuOrder: page.menuOrder,
          publishedAt: page.publishedAt,
        }}
        isEdit
      />
    </div>
  );
}
