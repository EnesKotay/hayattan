import Link from "next/link";
import { createPage } from "../../../actions";
import { PageForm } from "@/components/admin/PageForm";

export default function YeniSayfaPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Yeni sayfa ekle</h1>
        <p className="mt-1 text-sm text-muted">
          Başlık ve içerik girin. &quot;Menüde göster&quot; işaretlerseniz sayfa üst menüde listelenir.
        </p>
      </div>
      <PageForm action={createPage} />
    </div>
  );
}
