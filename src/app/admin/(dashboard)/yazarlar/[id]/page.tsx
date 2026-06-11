import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { updateYazar } from "@/app/admin/actions";
import { FormField, FormSection } from "@/components/admin/FormField";
import { ImageUpload } from "@/components/admin/ImageUpload";

export default async function YazarDuzenlePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const searchParamsRes = await searchParams;
  const error = searchParamsRes.error;
  const yazar = await prisma.yazar.findUnique({ where: { id } });

  if (!yazar) notFound();

  async function handleSubmit(formData: FormData) {
    "use server";
    await updateYazar(id, formData);
    redirect("/admin/yazarlar");
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-serif text-2xl font-bold text-foreground">
            Yazarı düzenle
          </h1>
          <Link
            href={`/yazarlar/${yazar.slug}`}
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

      {error === "1" && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          Güncelleme sırasında bir hata oluştu. Lütfen tekrar deneyin.
        </div>
      )}
      {error === "slug" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Bu sayfa adresi (slug) başka bir yazar tarafından kullanılıyor. Farklı bir adres girin.
        </div>
      )}

      <form action={handleSubmit} className="space-y-6">
        <FormSection title="Temel bilgiler">
          <FormField label="Ad Soyad" required>
            <input
              name="name"
              required
              defaultValue={yazar.name}
              className="w-full rounded-lg border border-[#ddd] px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </FormField>
          <FormField label="Sayfa adresi" help="Yazar sayfasının adres çubuğunda görünecek kısmı." required>
            <input
              name="slug"
              required
              defaultValue={yazar.slug}
              className="w-full rounded-lg border border-[#ddd] px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </FormField>
          <FormField label="E-posta">
            <input
              name="email"
              type="email"
              defaultValue={yazar.email ?? ""}
              className="w-full rounded-lg border border-[#ddd] px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </FormField>
          <FormField label="Sıralama" help="Yazarın listedeki sırası (küçük sayı üste çıkar).">
            <input
              name="sortOrder"
              type="number"
              defaultValue={yazar.sortOrder}
              className="w-full rounded-lg border border-[#ddd] px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </FormField>
        </FormSection>

        <FormSection title="Profil">
          <FormField label="Misafir yazar" help="İşaretli ise misafir yazarlar bölümünde listelenir.">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="misafir"
                defaultChecked={yazar.misafir}
                className="h-4 w-4 rounded border-[#ccc] text-primary focus:ring-primary"
              />
              <span className="text-sm text-foreground">Misafir yazar</span>
            </label>
          </FormField>
          <FormField label="Eski yazar (şirketten ayrılmış)" help="İşaretli ise bu yazarın yazıları sadece Eski Yazılar sayfasında listelenir; ana yazarlar bölümünde görünmez.">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                name="ayrilmis"
                defaultChecked={Boolean((yazar as { ayrilmis?: boolean }).ayrilmis)}
                className="h-4 w-4 rounded border-[#ccc] text-primary focus:ring-primary"
              />
              <span className="text-sm text-foreground">Şirketten ayrılmış / eski yazar</span>
            </label>
          </FormField>
          <div className="space-y-1.5">
            <ImageUpload name="photo" defaultValue={yazar.photo} label="Fotoğraf" help="Dosya seçerek yükleyin veya URL girin." />
          </div>
          <FormField label="Kısa biyografi">
            <textarea
              name="biyografi"
              rows={4}
              defaultValue={yazar.biyografi ?? ""}
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
            href="/admin/yazarlar"
            className="rounded-lg border border-[#ddd] bg-white px-6 py-2.5 font-medium text-foreground transition-colors hover:bg-[#f9f9f6]"
          >
            İptal
          </Link>
        </div>
      </form>
    </div>
  );
}
