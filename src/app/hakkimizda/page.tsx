import type { Metadata } from "next";
import Image from "next/image";
import { getHakkimizdaContent } from "@/app/admin/actions";
import { normalizeImageUrl } from "@/lib/image";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description: "Hayattan.Net’in yayın yaklaşımı, değerleri ve Hayatın Engelsiz Tarafı anlayışı hakkında bilgi edinin.",
  alternates: { canonical: "/hakkimizda" },
};

export default async function HakkimizdaPage() {
  const content = await getHakkimizdaContent();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      {/* Kapak Görseli */}
      {content.imageUrl && (
        <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-2xl shadow-xl">
          {/* Sabit en-boy oranı, görsel yüklenmeden önce yeri ayırıp CLS'i önlüyor */}
          <Image
            src={normalizeImageUrl(content.imageUrl) ?? content.imageUrl}
            alt="Hayattan.Net ekibi"
            fill
            priority
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
          />
        </div>
      )}

      <h1 className="mb-10 text-center font-serif text-4xl font-bold text-foreground md:text-5xl">
        HAKKIMIZDA
      </h1>

      <div className="prose prose-lg max-w-none space-y-6 text-foreground/90">
        <section className="space-y-4">
          <h2 className="font-serif text-2xl font-bold text-primary">{content.mainTitle}</h2>
          <div dangerouslySetInnerHTML={{ __html: content.mainContent }} />
        </section>

        <section className="space-y-4 mt-8">
          <h2 className="font-serif text-2xl font-bold text-primary">{content.detailsTitle}</h2>
          <div dangerouslySetInnerHTML={{ __html: content.detailsContent }} />
        </section>

        <section className="space-y-4 mt-8 rounded-lg border border-primary/20 bg-primary-light p-6">
          <h2 className="font-serif text-2xl font-bold text-primary">{content.rulesTitle}</h2>
          <div dangerouslySetInnerHTML={{ __html: content.rulesContent }} />
        </section>

        <div className="mt-12 text-center">
          <p className="font-serif text-xl font-bold text-primary">Hayatın Engelsiz Tarafı</p>
        </div>
      </div>
    </div>
  );
}
