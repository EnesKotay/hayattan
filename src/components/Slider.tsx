"use client";

import Link from "next/link";
import { useAccessibility } from "@/components/providers/AccessibilityProvider";
import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { ArticleImage } from "@/components/ArticleImage";

/** Ana sayfa manşetinde gösterilecek öğe (Haber veya Yazı). */
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

function formatDate(value: Date | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function StoryLink({ item, className, children }: {
  item: SliderItem;
  className?: string;
  children: React.ReactNode;
}) {
  if (item.link.startsWith("http")) {
    return (
      <a href={item.link} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return <Link href={item.link} className={className}>{children}</Link>;
}

const AUTOPLAY_INTERVAL = 5000;
function subscribeMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}


export function Slider({ items, emptyMessage = "Henüz haber yok." }: SliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { settings, isReady } = useAccessibility();
  const systemReducedMotion = useSyncExternalStore(subscribeMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches, () => true);
  const reducedMotion = systemReducedMotion || settings.motion === "reduced";
  const rotationStopped = isPaused || isHovered || reducedMotion || !isReady;
  const [isAnimating, setIsAnimating] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback(
    (index: number) => {
      if (items.length < 2 || index === activeIndex) return;
      setIsAnimating(!reducedMotion);
      setActiveIndex((index + items.length) % items.length);
      setTimeout(() => setIsAnimating(false), 400);
    },
    [activeIndex, reducedMotion, items.length]
  );

  const move = useCallback(
    (direction: -1 | 1) => {
      goTo(activeIndex + direction);
    },
    [activeIndex, goTo]
  );

  // Autoplay
  useEffect(() => {
    if (items.length <= 1 || rotationStopped) return;
    timerRef.current = setInterval(() => move(1), AUTOPLAY_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [items.length, rotationStopped, move]);

  // Touch / swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only horizontal swipes (ignore accidental vertical)
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
      move(dx < 0 ? 1 : -1);
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  if (items.length === 0) {
    return (
      <section className="py-6 md:py-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex min-h-72 items-center justify-center rounded-[18px] border border-dashed border-border bg-muted-bg/60">
            <p className="text-base text-muted">{emptyMessage}</p>
          </div>
        </div>
      </section>
    );
  }

  const lead = items[activeIndex % items.length];
  const sideItems = items.filter((_, index) => index !== activeIndex).slice(0, 2);

  return (
    <section
      className="py-5 md:py-8"
      aria-label="Öne çıkan içerikler"
      aria-roledescription="slayt gösterisi"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsPaused(true);
      }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">Hayattan seçkiler</p>
            <h2 className="mt-1 font-serif text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Öne çıkanlar
            </h2>
          </div>

          {items.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" disabled={reducedMotion}
                onClick={() => setIsPaused(!isPaused)}
                className="min-h-11 rounded-full border border-border px-4 text-sm font-semibold disabled:opacity-60"
                aria-label={reducedMotion || isPaused ? "Otomatik manşet geçişini başlat" : "Otomatik manşet geçişini durdur"}>
                {reducedMotion ? "Hareket kapalı" : isPaused ? "Başlat" : "Duraklat"}
              </button>
              <span className="mr-2 hidden text-sm text-muted sm:inline">
                {activeIndex + 1} / {items.length}
              </span>
              <button
                type="button"
                onClick={() => { setIsPaused(true); move(-1); }}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm hover:border-primary/30 hover:text-primary active:scale-95"
                aria-label="Önceki manşet"
              >
                <span aria-hidden>←</span>
              </button>
              <button
                type="button"
                onClick={() => { setIsPaused(true); move(1); }}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm hover:border-primary/30 hover:text-primary active:scale-95"
                aria-label="Sonraki manşet"
              >
                <span aria-hidden>→</span>
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.8fr)_minmax(280px,0.72fr)]">
          {/* Main lead card with touch support */}
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="min-w-0" aria-live={rotationStopped ? "polite" : "off"} aria-atomic="true"
          >
            <StoryLink
              item={lead}
              className="group relative block min-h-[390px] overflow-hidden rounded-[20px] bg-foreground shadow-premium md:min-h-[510px]"
            >
              <div
                className="absolute inset-0 transition-opacity duration-400"
                style={{ opacity: isAnimating ? 0 : 1 }}
              >
                <ArticleImage
                  src={lead.imageUrl}
                  alt={lead.title}
                  priority
                  sizes="(max-width: 1024px) 100vw, 70vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.025]"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/5" />
              <div
                className="relative flex min-h-[390px] flex-col justify-end max-w-4xl p-5 md:min-h-[510px] md:p-9 lg:p-11 transition-all duration-400"
                style={{ opacity: isAnimating ? 0 : 1, transform: isAnimating ? "translateY(8px)" : "translateY(0)" }}
              >
                <span className="inline-flex self-start rounded-full bg-white/92 px-3 py-1.5 text-sm font-semibold text-primary">
                  Manşet
                </span>
                <h3 className="mt-4 max-w-3xl font-serif text-3xl font-bold leading-[1.12] tracking-tight text-white md:text-5xl">
                  {lead.title}
                </h3>
                {lead.excerpt && (
                  <p className="mt-4 max-w-2xl line-clamp-2 text-base leading-relaxed text-white/82 md:text-lg">
                    {lead.excerpt}
                  </p>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/72">
                  {lead.authorName && <span className="font-semibold text-white">{lead.authorName}</span>}
                  {lead.authorName && lead.publishedAt && <span aria-hidden>•</span>}
                  {lead.publishedAt && <time dateTime={new Date(lead.publishedAt).toISOString()}>{formatDate(lead.publishedAt)}</time>}
                </div>
              </div>

            </StoryLink>
          </div>

          {sideItems.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {sideItems.map((item) => (
                <StoryLink
                  key={item.id}
                  item={item}
                  className="group card grid min-h-[210px] grid-cols-[120px_1fr] overflow-hidden sm:block lg:grid lg:grid-cols-[150px_1fr]"
                >
                  <div className="image-container relative min-h-full bg-muted-bg sm:aspect-[16/9] lg:aspect-auto">
                    <ArticleImage
                      src={item.imageUrl}
                      alt={item.title}
                      sizes="(max-width: 640px) 120px, (max-width: 1024px) 50vw, 150px"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col justify-center p-4 md:p-5">
                    <p className="text-sm font-semibold text-primary">Editörün seçimi</p>
                    <h3 className="mt-2 line-clamp-3 font-serif text-lg font-bold leading-snug text-foreground group-hover:text-primary md:text-xl">
                      {item.title}
                    </h3>
                    <div className="mt-3 text-sm text-muted">
                      {item.authorName || formatDate(item.publishedAt)}
                    </div>
                  </div>
                </StoryLink>
              ))}
            </div>
          )}
        </div>

        {/* Manşet seçimi — tüm ekranlarda erişilebilir düğmeler */}
        {items.length > 1 && (
          <div className="mt-4 flex flex-wrap justify-center gap-1" role="group" aria-label="Manşet seçimi">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-pressed={i === activeIndex}
                aria-label={`${i + 1}. manşet: ${items[i].title}`}
                onClick={() => { setIsPaused(true); goTo(i); }}
                className={`flex h-11 w-11 items-center justify-center rounded-full border text-sm font-semibold ${
                  i === activeIndex
                    ? "bg-primary text-white border-primary"
                    : "border-border hover:bg-primary/10"
                }`}
              >{i + 1}</button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
