"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

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
    if (value) searchParams.set(key, value);
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
    "w-full min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary";

  return (
    <div className="rounded-2xl border border-border/40 bg-background/80 p-4 shadow-sm backdrop-blur-sm sm:p-5">
      {/* Arama + Filtreler tek satırda (masaüstü) */}
      <form action="/yazilar" method="get" className="space-y-4">
        <input type="hidden" name="sayfa" value="1" />
        {aktifKategori && <input type="hidden" name="kategori" value={aktifKategori} />}
        {aktifYazar && <input type="hidden" name="yazar" value={aktifYazar} />}
        {siralama && siralama !== "son" && <input type="hidden" name="siralama" value={siralama} />}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Arama */}
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="search"
              name="ara"
              defaultValue={arama}
              placeholder="Başlık veya özet ara..."
              className={`${selectClass} w-full pl-9`}
              aria-label="Ara"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Ara
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          {/* Kategori dropdown */}
          <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
            <label htmlFor="yazilar-kategori" className="shrink-0 text-xs font-medium uppercase tracking-wider text-muted sm:text-[11px]">
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

          {/* Yazar dropdown */}
          <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
            <label htmlFor="yazilar-yazar" className="shrink-0 text-xs font-medium uppercase tracking-wider text-muted sm:text-[11px]">
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

          {/* Sıralama - pill'ler */}
          <div className="flex items-center gap-2">
            <span className="shrink-0 text-xs font-medium uppercase tracking-wider text-muted sm:text-[11px]">
              Sıra
            </span>
            <div className="flex flex-wrap gap-1 rounded-lg border border-border/60 bg-muted-bg/50 p-0.5">
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
                  className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${siralama === opt.value
                      ? "bg-primary text-white shadow-sm"
                      : "text-muted-foreground hover:bg-background hover:text-foreground"
                    }`}
                >
                  {opt.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
