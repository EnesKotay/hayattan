"use client";

import { isExternalImageUrl, isValidImageSrc } from "@/lib/image";
import Image from "next/image";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

type Yazar = {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  photo: string | null;
};

type YazarlarBolumuProps = {
  yazarlar: Yazar[];
  title?: string;
  allLinkLabel?: string;
  allLinkHref?: string;
};

export function YazarlarBolumu({
  yazarlar,
  title = "Köşe Yazarlarımız",
  allLinkLabel = "Tüm Yazarları Gör",
  allLinkHref = "/yazarlar",
}: YazarlarBolumuProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  if (!yazarlar || yazarlar.length === 0) return null;

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Kart genişliği + gap
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="bg-gradient-to-b from-transparent to-muted-bg/30 py-16">
      <div className="container mx-auto px-4">
        {/* Başlık ve Kontroller */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <span className="mb-2 block font-sans text-sm font-bold uppercase tracking-wider text-primary">
              Kalemlerimiz
            </span>
            <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
              {title}
            </h2>
          </div>

          <div className="hidden gap-3 md:flex">
            <button
              onClick={() => scroll("left")}
              disabled={!showLeftArrow}
              className={`flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background shadow-sm transition-all hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 ${!showLeftArrow ? "cursor-not-allowed opacity-30" : ""
                }`}
              aria-label="Sola kaydır"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!showRightArrow}
              className={`flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background shadow-sm transition-all hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30 ${!showRightArrow ? "cursor-not-allowed opacity-30" : ""
                }`}
              aria-label="Sağa kaydır"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Yazarlar Slider */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="scrollbar-hide -mx-4 flex gap-6 overflow-x-auto px-4 pb-8 md:mx-0 md:px-0"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {yazarlar.map((yazar) => (
            <Link
              key={yazar.id}
              href={`/yazarlar/${yazar.slug}`}
              className="group relative flex h-[340px] w-[280px] flex-none snap-start flex-col items-center justify-center rounded-2xl border border-border bg-background p-6 text-center shadow-sm transition-all hover:-translate-y-2 hover:border-primary/20 hover:shadow-xl"
            >
              {/* Dekoratif Arkaplan */}
              <div className="absolute top-0 h-24 w-full rounded-t-2xl bg-gradient-to-br from-muted-bg to-transparent opacity-50 transition-opacity group-hover:from-primary/5" />

              {/* Fotoğraf */}
              <div className="relative mb-6">
                <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-background shadow-md transition-all group-hover:scale-105 group-hover:border-primary/20 group-hover:shadow-lg">
                  {yazar.photo && isValidImageSrc(yazar.photo) ? (
                    <Image
                      src={yazar.photo}
                      alt={yazar.name}
                      fill
                      className="object-cover"
                      sizes="128px"
                      unoptimized={isExternalImageUrl(yazar.photo)}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary-light text-3xl font-bold text-primary">
                      {yazar.name.charAt(0)}
                    </div>
                  )}
                </div>
                {/* İkon */}
                <div className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-md opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:-translate-y-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
              </div>

              {/* İsim ve Bilgi */}
              <div className="relative z-10 w-full px-2">
                <h3 className="font-serif text-xl font-bold text-foreground transition-colors group-hover:text-primary">
                  {yazar.name}
                </h3>
                <div className="my-3 mx-auto h-0.5 w-12 bg-border transition-all group-hover:w-20 group-hover:bg-primary/40" />
                <span className="inline-block rounded-full bg-muted-bg px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted transition-colors group-hover:bg-primary-light group-hover:text-primary">
                  Köşe Yazarı
                </span>
                <p className="mt-4 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Yazılarını Oku →
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Alt Link (Mobil ve genel) */}
        <div className="mt-6 text-center md:hidden">
          <Link
            href={allLinkHref}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-primary shadow-sm ring-1 ring-border transition-colors active:bg-muted-bg"
          >
            {allLinkLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
