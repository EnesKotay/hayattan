"use client";

import { isExternalImageUrl } from "@/lib/image";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

/** Ana sayfa haber slider'ında gösterilecek öğe (Haber veya Yazi'den map edilir) */
export type SliderItem = {
  id: string;
  title: string;
  excerpt: string | null;
  imageUrl: string | null;
  link: string;
  authorName: string;
  publishedAt: Date | null;
};

type SliderProps = {
  items: SliderItem[];
  emptyMessage?: string;
};

function splitTitle(title: string): { part1: string; part2: string } {
  const words = title.trim().split(/\s+/);
  if (words.length <= 1) return { part1: "HABER", part2: title };
  const mid = Math.ceil(words.length / 2);
  return {
    part1: words.slice(0, mid).join(" "),
    part2: words.slice(mid).join(" "),
  };
}

export function Slider({ items, emptyMessage = "Henüz haber yok." }: SliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const markImageError = useCallback((id: string) => {
    setImageErrors((prev) => new Set(prev).add(id));
  }, []);

  useEffect(() => {
    if (items.length <= 1) return;
    const id = setTimeout(() => setProgress(0), 0);
    const duration = 5000;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      setProgress(Math.min((elapsed / duration) * 100, 100));
    }, 50);
    return () => {
      clearTimeout(id);
      clearInterval(timer);
    };
  }, [activeIndex, items.length]);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [items.length]);

  const goTo = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex(index);
  };

  const goPrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const goNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % items.length);
  };

  if (items.length === 0) {
    return (
      <section className="bg-muted-bg py-16">
        <div className="container mx-auto px-4">
          <div className="flex aspect-[16/9] w-full items-center justify-center rounded-2xl border border-border bg-background md:aspect-[2.4/1]">
            <p className="text-muted">{emptyMessage}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full overflow-hidden py-2">
      <div className="container mx-auto px-4">
        <div className="group/card relative overflow-hidden rounded-xl shadow-lg ring-1 ring-black/[0.06] transition-shadow hover:shadow-xl">
          {/* Slider alanı - daha dengeli oranlar (Mobil 16:9, Desktop 2:1) */}
          <div className="relative aspect-[16/9] w-full md:aspect-[2/1]">
            {items.map((item, index) => {
              const isExternal = item.link.startsWith("http");
              const slideClass = `absolute inset-0 block transition-opacity duration-700 ease-out ${index === activeIndex ? "z-10 opacity-100" : "z-0 opacity-0 pointer-events-none"
                }`;
              const inner = (
                <>
                  {/* Arka plan ve Görseller */}
                  <div className="absolute inset-0 overflow-hidden bg-muted-bg">
                    {item.imageUrl && !imageErrors.has(item.id) ? (
                      <>
                        {/* 1. Katman: Bulanık Arka Plan (Dolgu) */}
                        <Image
                          src={item.imageUrl}
                          alt=""
                          fill
                          className="scale-110 object-cover opacity-50 blur-xl filter"
                          aria-hidden="true"
                        />
                        {/* 2. Katman: Net Ön Plan Görseli (Sığdırılmış) */}
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-contain transition-transform duration-700 group-hover/card:scale-[1.02]"
                          sizes="(max-width: 768px) 100vw, 1200px"
                          priority={index === 0}
                          unoptimized={isExternalImageUrl(item.imageUrl)}
                          onError={() => markImageError(item.id)}
                        />
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-light to-primary/10 text-primary/40">
                        <span className="font-serif text-4xl">Y</span>
                      </div>
                    )}
                    {/* Çok katmanlı gradient - daha zengin derinlik */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)",
                      }}
                    />
                  </div>

                  {/* Geçmeli metin katmanları */}
                  <div className="absolute inset-0 flex flex-col justify-between p-3 md:p-4">
                    {/* Üst: Kırmızı banner + Başlık */}
                    <div>
                      <span className="inline-flex items-center gap-1 rounded bg-primary px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white md:px-2.5 md:py-1 md:text-xs">
                        <span className="h-0.5 w-0.5 rounded-full bg-white/80" />
                        {splitTitle(item.title).part1}
                      </span>
                      <h2 className="mt-1 font-serif text-base font-bold leading-tight text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.5)] md:text-lg lg:text-xl">
                        {splitTitle(item.title).part2}
                      </h2>
                    </div>

                    {/* Orta: Sarı şerit */}
                    {item.excerpt && (
                      <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 md:left-4 md:right-4">
                        <p className="line-clamp-2 max-w-2xl rounded-r border-l-4 border-amber-400 bg-amber-400/90 px-3 py-2 text-xs font-medium leading-relaxed text-foreground shadow-sm backdrop-blur-sm md:px-4 md:py-3 md:text-sm">
                          {item.excerpt}
                        </p>
                      </div>
                    )}

                    {/* Alt: Yazar bilgisi */}
                    <div className="flex items-end justify-between gap-2">
                      <div className="rounded border border-white/20 bg-black/40 px-2.5 py-1.5 backdrop-blur-sm md:px-3 md:py-2">
                        <p className="text-[10px] font-bold text-white md:text-xs">{item.authorName}</p>
                        {item.publishedAt && (
                          <p className="text-[9px] text-white/80 md:text-[10px]">
                            {new Date(item.publishedAt).toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              );
              return isExternal ? (
                <a
                  key={item.id}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={slideClass}
                >
                  {inner}
                </a>
              ) : (
                <Link key={item.id} href={item.link} className={slideClass}>
                  {inner}
                </Link>
              );
            })}
          </div>

          {/* Önceki / Sonraki okları */}
          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white/90 backdrop-blur-sm transition-all hover:bg-primary hover:text-white md:left-3 md:p-2"
                aria-label="Önceki slide"
              >
                <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-2 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white/90 backdrop-blur-sm transition-all hover:bg-primary hover:text-white md:right-3 md:p-2"
                aria-label="Sonraki slide"
              >
                <svg className="h-4 w-4 md:h-5 md:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Pagination + progress bar */}
          {items.length > 1 && (
            <div className="absolute bottom-0 left-0 right-0 z-20 p-2 md:p-2.5">
              <div className="flex flex-col items-center gap-1.5">
                <div className="h-0.5 w-full max-w-[180px] overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <nav
                  className="flex items-center gap-1 rounded-full bg-black/50 px-2 py-1.5 backdrop-blur-sm"
                  aria-label="Slider sayfa navigasyonu"
                >
                  {items.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={(e) => goTo(index, e)}
                      className={`rounded-full transition-all duration-300 ${index === activeIndex
                        ? "h-1.5 w-5 bg-primary"
                        : "h-1.5 w-1.5 bg-white/60 hover:bg-white/90"
                        }`}
                      aria-label={`Slide ${index + 1}`}
                      aria-current={index === activeIndex ? "true" : undefined}
                    />
                  ))}
                </nav>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
