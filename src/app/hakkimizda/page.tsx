import type { Metadata } from "next";
import { getHakkimizdaContent } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "Hakkımızda | Hayattan.Net",
  description: "Hayattan.Net - Hayatın Engelsiz Tarafı hakkında",
};

export default async function HakkimizdaPage() {
  const content = await getHakkimizdaContent();

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      {/* Kapak Görseli */}
      {content.imageUrl && (
        <div className="mb-10 overflow-hidden rounded-2xl shadow-xl">
          <img
            src={content.imageUrl}
            alt="Hakkımızda"
            className="h-auto w-full object-cover"
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
