import Link from "next/link";
import { createKategori } from "../../../actions";
import { FormField, FormSection } from "@/components/admin/FormField";

export default function YeniKategoriPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Yeni kategori ekle
        </h1>
        <p className="mt-1 text-sm text-muted">
          Kategori bilgilerini doldurup &quot;Kaydet&quot; butonuna tıklayın. Zorunlu alanlar * ile işaretlidir.
        </p>
      </div>

      <form action={createKategori} className="space-y-6">
        <FormSection title="Kategori bilgileri">
          <FormField
            label="Kategori adı"
            help="Sitede görünecek kategori adı. Örn: Gündem, Kültür, Spor"
            required
          >
            <input
              name="name"
              required
              placeholder="Örn: Gündem"
              className="w-full rounded-lg border border-[#ddd] px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </FormField>
          <FormField
            label="Sayfa adresi (isteğe bağlı)"
            help="Boş bırakırsanız kategori adından otomatik oluşturulur. Sadece İngilizce harf, rakam ve tire kullanın. Örn: gundem"
          >
            <input
              name="slug"
              placeholder="Boş bırakırsanız otomatik oluşturulur"
              className="w-full rounded-lg border border-[#ddd] px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </FormField>
          <FormField
            label="Açıklama"
            help="Kategori hakkında kısa bir açıklama. İsteğe bağlı."
          >
            <textarea
              name="description"
              rows={3}
              placeholder="Bu kategori hakkında kısa bir açıklama yazın..."
              className="w-full rounded-lg border border-[#ddd] px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </FormField>
        </FormSection>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Kaydet
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
