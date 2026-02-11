"use client";

import { isExternalImageUrl, normalizeImageUrl } from "@/lib/image";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";

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
          <div className="relative aspect-[16/9] w-full md:aspect-[16/9]">
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
                        <Image
                          src={normalizeImageUrl(item.imageUrl)!}
                          alt=""
                          fill
                          className="scale-110 object-cover opacity-50 blur-2xl filter"
                          aria-hidden="true"
                        />
                        <Image
                          src={normalizeImageUrl(item.imageUrl)!}
                          alt={item.title}
                          fill
                          className="object-contain transition-transform duration-700 group-hover/card:scale-[1.01]"
                          sizes="(max-width: 768px) 100vw, 1200px"
                          priority={index === 0}
                          onError={() => markImageError(item.id)}
                        />
                      </>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-light to-primary/10 text-primary/40">
                        <span className="font-serif text-4xl">Y</span>
                      </div>
                    )}
                    {/* Modern Gradient Overlay */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.7) 30%, transparent 100%)",
                      }}
                    />
                  </div>

                  {/* İçerik Katmanı - Cinematic & Premium */}
                  <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-6 md:p-12 lg:p-16">
                    <motion.div
                      key={activeIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
                      className="max-w-4xl space-y-4"
                    >
                      {/* Üst Kategori Badge */}
                      <span className="inline-block rounded-full bg-primary px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-lg md:text-xs">
                        {splitTitle(item.title).part1}
                      </span>

                      {/* Başlık */}
                      <h2 className="font-serif text-3xl font-bold leading-[1.1] text-white drop-shadow-2xl md:text-5xl lg:text-6xl">
                        {splitTitle(item.title).part2}
                      </h2>

                      {/* Açıklama ve Yazar */}
                      <div className="flex flex-col gap-6 pt-4 md:flex-row md:items-center">
                        {/* Açıklama */}
                        {item.excerpt && (
                          <div className="relative border-l-2 border-primary/60 pl-6 backdrop-blur-sm">
                            <p className="line-clamp-2 text-sm font-medium text-white/90 md:text-lg md:leading-relaxed italic font-serif">
                              "{item.excerpt}"
                            </p>
                          </div>
                        )}

                        {/* Yazar Bilgisi */}
                        <div className="flex items-center gap-4 text-white/80 md:border-l md:border-white/20 md:pl-8">
                          <div className="h-10 w-10 rounded-full bg-white/10 p-0.5 backdrop-blur-md">
                            <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/20 font-bold text-white text-xs">
                              {item.authorName.charAt(0)}
                            </div>
                          </div>
                          <div className="flex flex-col text-xs md:text-sm">
                            <span className="font-bold text-white tracking-wide">{item.authorName}</span>
                            {item.publishedAt && (
                              <span className="text-white/60">
                                {new Date(item.publishedAt).toLocaleDateString("tr-TR", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
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
