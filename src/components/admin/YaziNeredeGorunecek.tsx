"use client";

import { useEffect, useState, useRef } from "react";

type Kategori = { id: string; name: string; slug?: string };

type YaziNeredeGorunecekProps = {
  formRef: React.RefObject<HTMLFormElement | null>;
  kategoriler: Kategori[];
};

type Madde = {
  id: string;
  label: string;
  path: string;
  aktif: boolean;
  nedenPasif?: string; // Görünmeme sebebi (kısa)
  grup: "anasayfa" | "listeler" | "tekil" | "diger";
};

function useFormValues(formRef: React.RefObject<HTMLFormElement | null>, kategoriler: Kategori[]) {
  const [values, setValues] = useState({
    published: false,
    showInSlider: false,
    kategoriIds: [] as string[],
  });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const read = () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const publishedInput = form.querySelector<HTMLInputElement>('input[name="publishedAt"]');
        const publishedVal = publishedInput?.value?.trim() ?? "";
        const published = Boolean(publishedVal === "now" || (publishedVal && publishedVal !== ""));
        const showInSlider = form.querySelector<HTMLInputElement>('input[name="showInSlider"]')?.checked ?? false;
        const kategoriIds = Array.from(form.querySelectorAll<HTMLInputElement>('input[name="kategoriIds"]:checked')).map(
          (el) => el.value
        );
        setValues({ published, showInSlider, kategoriIds });
      });
    };

    read();
    form.addEventListener("change", read);
    form.addEventListener("input", read);
    return () => {
      form.removeEventListener("change", read);
      form.removeEventListener("input", read);
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [formRef, kategoriler.length]);

  return values;
}

const GRUP_BASLIK: Record<Madde["grup"], string> = {
  anasayfa: "Ana sayfa",
  listeler: "Liste sayfaları",
  tekil: "Bu yazının sayfası",
  diger: "Diğer",
};

export function YaziNeredeGorunecek({ formRef, kategoriler }: YaziNeredeGorunecekProps) {
  const { published, showInSlider, kategoriIds } = useFormValues(formRef, kategoriler);
  const seciliKategoriler = kategoriler.filter((k) => kategoriIds.includes(k.id));
  const bakisSecili =
    seciliKategoriler.some(
      (k) =>
        k.slug === "bakis" ||
        k.slug === "bakis-dergisi" ||
        k.name.toLowerCase().includes("bakış") ||
        k.name.toLowerCase().includes("bakis")
    );

  const maddeler: Madde[] = [
    {
      id: "anasayfa-son",
      label: "Son yazılar bölümü",
      path: "/",
      grup: "anasayfa",
      aktif: published,
      nedenPasif: published ? undefined : "Yayımlayın",
    },
    {
      id: "anasayfa-slider",
      label: "Slider (öne çıkan)",
      path: "/",
      grup: "anasayfa",
      aktif: published && showInSlider,
      nedenPasif: !published ? "Yayımlayın" : !showInSlider ? "“Slider'da göster” işaretleyin" : undefined,
    },
    {
      id: "yazilar-listesi",
      label: "Yazılar listesi",
      path: "/yazilar",
      grup: "listeler",
      aktif: published,
      nedenPasif: published ? undefined : "Yayımlayın",
    },
    {
      id: "kategori-sayfalari",
      label: seciliKategoriler.length ? `Kategori: ${seciliKategoriler.map((k) => k.name).join(", ")}` : "Kategori sayfaları",
      path: seciliKategoriler.length ? seciliKategoriler.map((k) => `/kategoriler/${k.slug ?? k.id}`).join(", ") : "—",
      grup: "listeler",
      aktif: published && seciliKategoriler.length > 0,
      nedenPasif: !published ? "Yayımlayın" : seciliKategoriler.length === 0 ? "En az bir kategori seçin" : undefined,
    },
    {
      id: "bakis-dergisi",
      label: "Bakış Dergisi",
      path: "/bakis-dergisi",
      grup: "listeler",
      aktif: published && bakisSecili,
      nedenPasif: !published ? "Yayımlayın" : !bakisSecili ? "“Bakış” kategorisini seçin" : undefined,
    },
    {
      id: "arsiv",
      label: "Arşiv (tarih listesi)",
      path: "/arsiv",
      grup: "listeler",
      aktif: published,
      nedenPasif: published ? undefined : "Yayımlayın",
    },
    {
      id: "arama",
      label: "Arama sonuçları",
      path: "Site içi arama",
      grup: "listeler",
      aktif: published,
      nedenPasif: published ? undefined : "Yayımlayın",
    },
    {
      id: "detay",
      label: "Yazı detay sayfası",
      path: "/yazilar/[slug]",
      grup: "tekil",
      aktif: published,
      nedenPasif: published ? undefined : "Yayımlayın",
    },
    {
      id: "eski-yazilar",
      label: "Eski yazılar",
      path: "/eski-yazilar",
      grup: "diger",
      aktif: published,
      nedenPasif: published ? undefined : "Yayımlayın",
    },
  ];

  const gruplar = (["anasayfa", "listeler", "tekil", "diger"] as const).map((g) => ({
    grup: g,
    baslik: GRUP_BASLIK[g],
    items: maddeler.filter((m) => m.grup === g),
  }));

  return (
    <div className="rounded-xl border border-[#e5e5dc] bg-[#fafaf8] shadow-sm overflow-hidden">
      {/* Üst: Başlık ve kısa açıklama */}
      <div className="border-b border-[#e5e5dc] bg-white px-5 py-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <span aria-hidden className="text-[1.1em] opacity-80">📍</span>
          Bu yazı nerede görünecek?
        </h3>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Aşağıdaki liste, <strong>Yayımla</strong>, <strong>Slider'da göster</strong> ve <strong>Kategoriler</strong> seçimlerinize göre otomatik güncellenir. Yeşil tikli satırlar, yazının sitede listeleneceği yerlerdir.
        </p>
      </div>

      <div className="p-5 space-y-5">
        {/* Taslak uyarısı */}
        {!published && (
          <div
            className="rounded-lg border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-900"
            role="alert"
          >
            <p className="font-medium text-amber-800">Şu an taslak</p>
            <p className="mt-1 text-amber-700">
              Yazıyı <strong>Yayımla</strong> bölümünden yayımlayana kadar sadece admin panelindeki Yazılar listesinde görünür; sitede hiçbir sayfada çıkmaz.
            </p>
          </div>
        )}

        {/* Gruplara göre listeler */}
        {gruplar.map(
          ({ grup, baslik, items }) =>
            items.length > 0 && (
              <div key={grup}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">{baslik}</p>
                <ul className="space-y-1.5" role="list">
                  {items.map((m) => (
                    <li
                      key={m.id}
                      className={`flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        m.aktif ? "bg-primary/10 text-foreground" : "bg-white/80 text-muted"
                      }`}
                    >
                      <span
                        className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium ${
                          m.aktif ? "border-primary bg-primary text-white" : "border-[#ccc] bg-white text-transparent"
                        }`}
                        aria-hidden
                      >
                        ✓
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="font-medium">{m.label}</span>
                        <span className="ml-1.5 text-muted">· {m.path}</span>
                      </span>
                      {!m.aktif && m.nedenPasif && (
                        <span className="shrink-0 rounded bg-[#eee] px-2 py-0.5 text-xs text-muted">
                          {m.nedenPasif}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )
        )}

        <p className="text-xs text-muted border-t border-[#e5e5dc] pt-4">
          <strong>Not:</strong> Eski yazılar sayfasında sadece &quot;ayrılmış&quot; olarak işaretlenen yazarların yazıları listelenir.
        </p>
      </div>
    </div>
  );
}
