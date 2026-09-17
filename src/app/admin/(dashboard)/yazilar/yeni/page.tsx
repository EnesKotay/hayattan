import { repository } from "@/backend/modules/data/repository";
import { createYazi } from "@/backend/modules/articles/actions";
import { YaziForm } from "@/frontend/admin/articles/YaziForm";
import { auth } from "@/backend/modules/auth/auth";

export default async function YeniYaziPage() {
  const session = await auth();
  const [yazarlar, kategoriler] = await Promise.all([
    repository.yazar.findMany({
      where: session?.user?.role === "ADMIN" ? undefined : { id: session?.user?.id },
      orderBy: [
        { sortOrder: "asc" },
        { yazilar: { _count: "desc" } },
        { name: "asc" }
      ] as any
    }),
    repository.kategori.findMany({ orderBy: { name: "asc" } }),
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
