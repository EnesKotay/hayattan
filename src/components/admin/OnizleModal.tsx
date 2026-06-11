"use client";

import Image from "next/image";

type OnizleData = {
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  authorName: string;
  kategoriNames: string[];
};

type OnizleModalProps = {
  data: OnizleData | null;
  onClose: () => void;
};

export function OnizleModal({ data, onClose }: OnizleModalProps) {
  if (!data) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Yazı önizlemesi"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="relative my-8 w-full max-w-3xl rounded-lg bg-background shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b-2 border-amber-400 bg-amber-50 px-4 py-3">
          <span className="text-sm font-semibold text-amber-900">
            👁️ CANLI ÖNİZLEME — Formdaki mevcut veri (kaydetmeden)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700"
          >
            Kapat
          </button>
        </div>

        {/* İçerik */}
        <article className="max-h-[80vh] overflow-y-auto px-6 py-8">
          {data.kategoriNames.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {data.kategoriNames.map((name) => (
                <span key={name} className="text-sm font-medium text-primary">
                  {name}
                </span>
              ))}
            </div>
          )}
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            {data.title || "(Başlık yok)"}
          </h1>
          {data.excerpt && (
            <p className="mt-4 text-lg text-muted">{data.excerpt}</p>
          )}
          <div className="mt-4 flex items-center gap-4 text-sm text-muted">
            <span className="font-medium">{data.authorName || "(Yazar seçin)"}</span>
            <span>{new Date().toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>

          {data.featuredImage && (
            <div className="relative mt-8 aspect-video overflow-hidden rounded-lg bg-muted-bg">
              <Image
                src={data.featuredImage}
                alt={data.title || "Kapak"}
                fill
                className="object-cover"
                unoptimized={data.featuredImage.startsWith("http")}
              />
            </div>
          )}

          <div
            className="yazi-icerik mt-6 space-y-4 text-foreground [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-bold [&_p]:leading-relaxed [&_a]:text-primary [&_a]:underline [&_ul]:list-inside [&_ul]:list-disc [&_ol]:list-inside [&_ol]:list-decimal [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted"
            dangerouslySetInnerHTML={{ __html: data.content || "<p></p>" }}
          />
        </article>
      </div>
    </div>
  );
}
