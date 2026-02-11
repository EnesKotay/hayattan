"use client";

import { isExternalImageUrl, isValidImageSrc, normalizeImageUrl } from "@/lib/image";
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

import { Reveal, StaggerContainer, StaggerItem } from "./Animations/Reveal";

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
    <section className="bg-gradient-to-b from-transparent to-muted-bg/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Başlık ve Kontroller */}
        <div className="mb-12 flex items-end justify-between">
          <Reveal>
            <div>
              <span className="mb-3 block font-sans text-xs font-bold uppercase tracking-[0.2em] text-primary">
                Köşe Yazarlarımız
              </span>
              <h2 className="font-serif text-3xl font-bold text-foreground md:text-5xl">
                {title}
              </h2>
            </div>
          </Reveal>

          <div className="hidden gap-4 md:flex">
            <button
              onClick={() => scroll("left")}
              disabled={!showLeftArrow}
              className={`flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background shadow-premium transition-all hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-30`}
              aria-label="Sola kaydır"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!showRightArrow}
              className={`flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background shadow-premium transition-all hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-30`}
              aria-label="Sağa kaydır"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Yazarlar Slider */}
        <StaggerContainer
          ref={scrollRef}
          onScroll={handleScroll}
          className="scrollbar-hide -mx-4 flex gap-8 overflow-x-auto px-4 pb-12 md:mx-0 md:px-0"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {yazarlar.map((yazar) => (
            <StaggerItem key={yazar.id}>
              <Link
                href={`/yazarlar/${yazar.slug}`}
                className="group card relative flex h-[380px] w-[290px] flex-none snap-start flex-col items-center justify-center p-8 text-center transition-all"
              >
                {/* Dekoratif Arkaplan */}
                <div className="absolute top-0 h-32 w-full rounded-t-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-40 transition-opacity group-hover:opacity-100" />

                {/* Fotoğraf */}
                <div className="relative mb-8">
                  <div className="image-container relative h-36 w-36 overflow-hidden rounded-full border-4 border-background shadow-md group-hover:shadow-premium">
                    {yazar.photo && isValidImageSrc(yazar.photo) ? (
                      <Image
                        src={normalizeImageUrl(yazar.photo)!}
                        alt={yazar.name}
                        fill
                        className="object-cover"
                        sizes="144px"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-primary-light text-4xl font-bold text-primary">
                        {yazar.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  {/* İkon */}
                  <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-lg opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                </div>

                {/* İsim ve Bilgi - Better Typography */}
                <div className="relative z-10 w-full px-2 space-y-4">
                  <h3 className="font-serif text-2xl font-extrabold text-foreground transition-all duration-500 group-hover:text-primary tracking-tight">
                    {yazar.name}
                  </h3>
                  <div className="mx-auto h-[1px] w-12 bg-primary/10 transition-all duration-700 group-hover:w-20 group-hover:bg-primary/30" />
                  <span className="inline-block rounded-full bg-muted-bg/50 px-5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted transition-all duration-500 group-hover:bg-primary-light group-hover:text-primary">
                    {yazar.unvan || "YAZAR"}
                  </span>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerContainer>

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
