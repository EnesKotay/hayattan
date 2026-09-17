"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Kategori = { name: string; slug: string };
type Yazar = { name: string; slug: string };

const SIRALAMA_OPTIONS = [
  { value: "son", label: "En son" },
  { value: "eski", label: "En eski" },
  { value: "okunan", label: "Çok okunan" },
] as const;

type YazilarFiltreProps = {
  kategoriler: Kategori[];
  yazarlar: Yazar[];
  aktifKategori?: string;
  aktifYazar?: string;
  arama?: string;
  siralama?: string;
};

function buildYazilarUrl(params: Record<string, string>) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (!value) return;
    if (key === "sayfa" && value === "1") return;
    searchParams.set(key, value);
  });
  const q = searchParams.toString();
  return q ? `/yazilar?${q}` : "/yazilar";
}

export function YazilarFiltre({
  kategoriler,
  yazarlar,
  aktifKategori,
  aktifYazar,
  arama = "",
  siralama = "son",
}: YazilarFiltreProps) {
  const router = useRouter();
  const hasActiveFilters = Boolean(aktifKategori || aktifYazar || arama?.trim() || siralama !== "son");
  const [mobileOpen, setMobileOpen] = useState(hasActiveFilters);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    const params: Record<string, string> = {
      sayfa: "1",
      ...(aktifKategori && { kategori: aktifKategori }),
      ...(aktifYazar && { yazar: aktifYazar }),
      ...(siralama && siralama !== "son" && { siralama }),
      ...(arama?.trim() && { ara: arama.trim() }),
    };
    if (name === "kategori") {
      if (value) params.kategori = value;
      else delete params.kategori;
    } else if (name === "yazar") {
      if (value) params.yazar = value;
      else delete params.yazar;
    }
    const url = buildYazilarUrl(params);
    router.push(url);
  };

  const selectClass =
    "h-11 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  const filterPanel = (
    <form action="/yazilar" method="get" className="space-y-4">
      <input type="hidden" name="sayfa" value="1" />
      {aktifKategori && <input type="hidden" name="kategori" value={aktifKategori} />}
      {aktifYazar && <input type="hidden" name="yazar" value={aktifYazar} />}
      {siralama && siralama !== "son" && <input type="hidden" name="siralama" value={siralama} />}

      <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_auto] lg:items-center">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="search"
            name="ara"
            defaultValue={arama}
            placeholder="Başlık veya özet ara..."
            className={`${selectClass} pl-9`}
            aria-label="Yazılarda ara"
          />
        </div>
        <button
          type="submit"
          className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          Ara
        </button>
      </div>

      <div className="grid gap-3 xl:grid-cols-[minmax(180px,240px)_minmax(180px,260px)_auto_auto] xl:items-end">
        <div>
          <label htmlFor="yazilar-kategori" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-muted">
            Kategori
          </label>
          <select
            id="yazilar-kategori"
            name="kategori"
            value={aktifKategori ?? ""}
            onChange={handleFilterChange}
            className={selectClass}
            aria-label="Kategori seçin"
          >
            <option value="">Tümü</option>
            {kategoriler.map((k) => (
              <option key={k.slug} value={k.slug}>
                {k.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="yazilar-yazar" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-muted">
            Yazar
          </label>
          <select
            id="yazilar-yazar"
            name="yazar"
            value={aktifYazar ?? ""}
            onChange={handleFilterChange}
            className={selectClass}
            aria-label="Yazar seçin"
          >
            <option value="">Tümü</option>
            {yazarlar.map((y) => (
              <option key={y.slug} value={y.slug}>
                {y.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-muted">
            Sıra
          </span>
          <div className="grid grid-cols-3 rounded-lg border border-border/60 bg-muted-bg/50 p-1">
            {SIRALAMA_OPTIONS.map((opt) => (
              <Link
                key={opt.value}
                href={buildYazilarUrl({
                  ...(opt.value !== "son" && { siralama: opt.value }),
                  ...(aktifKategori && { kategori: aktifKategori }),
                  ...(aktifYazar && { yazar: aktifYazar }),
                  sayfa: "1",
                  ...(arama?.trim() && { ara: arama.trim() }),
                })}
                className={`whitespace-nowrap rounded-md px-3 py-2 text-center text-xs font-semibold transition-colors ${
                  siralama === opt.value
                    ? "bg-primary text-white shadow-sm"
                    : "text-muted hover:bg-background hover:text-foreground"
                }`}
              >
                {opt.label}
              </Link>
            ))}
          </div>
        </div>

        {hasActiveFilters && (
          <Link
            href="/yazilar"
            className="flex h-11 items-center justify-center rounded-lg border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted-bg"
          >
            Temizle
          </Link>
        )}
      </div>
    </form>
  );

  return (
    <section className="rounded-2xl border border-border/50 bg-background/90 p-4 shadow-sm backdrop-blur-sm sm:p-5">
      <div className="flex items-center justify-between gap-3 md:hidden">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Arama ve filtreler</h2>
          <p className="text-xs text-muted">
            {hasActiveFilters ? "Filtreler uygulanıyor" : "Yazıları daraltın"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen((open) => !open)}
          className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground"
          aria-expanded={mobileOpen}
          aria-controls="yazilar-filtre-panel"
        >
          {mobileOpen ? "Kapat" : "Filtrele"}
        </button>
      </div>

      <div id="yazilar-filtre-panel" className={`${mobileOpen ? "mt-4 block" : "hidden"} md:block`}>
        {filterPanel}
      </div>
    </section>
  );
}
