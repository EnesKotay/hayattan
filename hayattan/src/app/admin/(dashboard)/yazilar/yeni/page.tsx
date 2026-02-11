import { prisma } from "@/lib/db";
import { createYazi } from "../../../actions";
import { YaziForm } from "@/components/admin/YaziForm";

export default async function YeniYaziPage() {
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Yeni yazı ekle
        </h1>
        <p className="mt-1 text-sm text-muted">
          Aşağıdaki alanları doldurup &quot;Kaydet&quot; butonuna tıklayın. Zorunlu alanlar * ile işaretlidir. Altta &quot;Önizle&quot; ile kaydetmeden nasıl görüneceğini görebilirsiniz.
        </p>
      </div>

      <YaziForm
        action={createYazi}
        yazar={yazarlar}
        kategoriler={kategoriler}
      />
    </div>
  );
}
