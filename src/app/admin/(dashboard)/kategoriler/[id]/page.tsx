import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateKategori } from "../../../actions";
import { FormField, FormSection } from "@/components/admin/FormField";

export default async function KategoriDuzenlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const kategori = await prisma.kategori.findUnique({ where: { id } });

  if (!kategori) notFound();

  async function handleSubmit(formData: FormData) {
    "use server";
    await updateKategori(id, formData);
    redirect("/admin/kategoriler");
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Kategoriyi düzenle
          </h1>
          <Link
            href={`/kategoriler/${kategori.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-[#ddd] bg-white px-3 py-2 text-sm font-medium text-foreground hover:bg-[#f9f9f6]"
          >
            Sitede gör →
          </Link>
        </div>
        <p className="mt-1 text-sm text-muted">
          Değişiklikleri yaptıktan sonra &quot;Güncelle&quot; butonuna tıklayın.
        </p>
      </div>

      <form action={handleSubmit} className="space-y-6">
        <FormSection title="Kategori bilgileri">
          <FormField label="Kategori adı" required>
            <input
              name="name"
              required
              defaultValue={kategori.name}
              className="w-full rounded-lg border border-[#ddd] px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </FormField>
          <FormField label="Sayfa adresi" help="Kategori sayfasının adres çubuğunda görünecek kısmı." required>
            <input
              name="slug"
              required
              defaultValue={kategori.slug}
              className="w-full rounded-lg border border-[#ddd] px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </FormField>
          <FormField label="Açıklama">
            <textarea
              name="description"
              rows={3}
              defaultValue={kategori.description ?? ""}
              className="w-full rounded-lg border border-[#ddd] px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </FormField>
        </FormSection>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Güncelle
          </button>
          <Link
            href="/admin/kategoriler"
            className="rounded-lg border border-[#ddd] bg-white px-6 py-2.5 font-medium text-foreground transition-colors hover:bg-[#f9f9f6]"
          >
            İptal
          </Link>
        </div>
      </form>
    </div>
  );
}
