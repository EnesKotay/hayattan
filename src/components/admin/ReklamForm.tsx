"use client";

import { useState } from "react";
import Link from "next/link";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { AdSlot } from "@/components/AdSlot";
import { saveAllAdSlots } from "@/app/admin/actions";
import type { AdSlotContent } from "@/lib/ad-slots";
import { Icons } from "./Icons";

const SLOT_LABELS: Record<string, string> = {
  "top-banner": "Logo altı",
  "mid-banner": "Slider altı",
  "rectangle-ad": "Son yazılar altı",
  "bottom-banner": "Sayfa altı",
  "yazi-top": "Yazı sayfası üst",
  "yazi-bottom": "Yazı sayfası alt",
  "yazilar-top": "Yazılar listesi üst",
  "yazilar-mid": "Yazılar listesi orta",
};

const CATEGORIES = [
  { id: "all", label: "Tümü" },
  { id: "home", label: "Ana sayfa", keys: ["top-banner", "mid-banner", "rectangle-ad", "bottom-banner"] },
  { id: "post", label: "Yazı sayfası", keys: ["yazi-top", "yazi-bottom"] },
  { id: "list", label: "Liste", keys: ["yazilar-top", "yazilar-mid"] },
];

const PRESETS = [
  { label: "Tam en", w: "100%", h: "110px" },
  { label: "Banner", w: "728px", h: "90px" },
  { label: "Kare", w: "500px", h: "400px" },
  { label: "Sidebar", w: "300px", h: "600px" },
];

type DeviceType = "mobile" | "tablet" | "desktop";

function getAspectRatio(w: string, h: string): string {
  const nw = parseFloat(w);
  const nh = parseFloat(h);
  if (isNaN(nw) || isNaN(nh) || nw === 0 || nh === 0 || w.includes("%") || h.includes("%")) return "—";
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const r = gcd(nw, nh);
  return `${nw / r}:${nh / r}`;
}

type ReklamFormProps = {
  initialAds: Record<string, AdSlotContent | null>;
};

export function ReklamForm({ initialAds }: ReklamFormProps) {
  const [ads, setAds] = useState(initialAds);
  const [activeTab, setActiveTab] = useState("all");
  const [previewDevice, setPreviewDevice] = useState<DeviceType>("desktop");
  const [showPreview, setShowPreview] = useState<Record<string, boolean>>({});

  const handleChange = (slotId: string, field: string, value: unknown) => {
    setAds((prev) => {
      const current = prev[slotId] || { type: "html", content: "", width: "", height: "", isActive: true, align: "center" };
      const next = { ...current, [field]: value };
      if (["html", "text", "image"].includes(field)) next.type = field as "html" | "text" | "image";
      return { ...prev, [slotId]: next as AdSlotContent };
    });
  };

  const setPreset = (slotId: string, w: string, h: string) => {
    handleChange(slotId, "width", w);
    handleChange(slotId, "height", h);
  };

  const getPreviewWidth = () => {
    if (previewDevice === "mobile") return "375px";
    if (previewDevice === "tablet") return "768px";
    return "100%";
  };

  const getPreviewWidthLabel = () => {
    if (previewDevice === "mobile") return "375px";
    if (previewDevice === "tablet") return "768px";
    return "Tam genişlik";
  };

  const slots = Object.keys(SLOT_LABELS).filter((id) => {
    if (activeTab === "all") return true;
    const cat = CATEGORIES.find((c) => c.id === activeTab);
    return cat && "keys" in cat && cat.keys && cat.keys.includes(id);
  });

  return (
    <form action={saveAllAdSlots} className="space-y-6 pb-28 max-w-4xl">
      {/* Filtre */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[#e8e6e3] bg-white px-4 py-3 shadow-sm">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveTab(c.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${activeTab === c.id ? "bg-primary text-white shadow-md shadow-primary/20" : "text-[#5a5a5a] hover:bg-[#f5f4f2] hover:text-[#333]"}`}
          >
            {c.label}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-1 rounded-full bg-[#f5f4f2] p-1">
          {(["mobile", "tablet", "desktop"] as DeviceType[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setPreviewDevice(d)}
              className={`rounded-full p-2 transition-all duration-200 ${previewDevice === d ? "bg-white text-primary shadow-sm" : "text-[#888] hover:text-[#555]"}`}
              aria-label={d === "mobile" ? "Mobil önizleme" : d === "tablet" ? "Tablet önizleme" : "Masaüstü önizleme"}
            >
              {d === "mobile" && <Icons.Phone className="h-4 w-4" />}
              {d === "tablet" && <Icons.Tablet className="h-4 w-4" />}
              {d === "desktop" && <Icons.Laptop className="h-4 w-4" />}
            </button>
          ))}
        </span>
      </div>

      {/* Alan kartları */}
      <div className="space-y-5">
        {slots.map((slotId) => {
          const slot = ads[slotId];
          const isActive = slot?.isActive ?? true;
          const isHtml = (slot?.type ?? "html") === "html";

          return (
            <div
              key={slotId}
              className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200 hover:shadow-md ${!isActive ? "opacity-65" : ""} ${isActive ? "border-[#e8e6e3]" : "border-[#e0e0e0]"}`}
            >
              {/* Başlık + aç/kapa */}
              <div className="flex items-center justify-between border-b border-[#f0eeeb] bg-[#fafaf9] px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-500" : "bg-[#c4c4c4]"}`} />
                  <h3 className="font-semibold text-[#2a2a2a]">{SLOT_LABELS[slotId]}</h3>
                </div>
                <label className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-1.5 text-sm text-[#666] shadow-sm ring-1 ring-[#e5e5e0] transition hover:ring-[#ddd]">
                  <span>Açık</span>
                  <input
                    type="checkbox"
                    name={`slot_${slotId}_active`}
                    checked={isActive}
                    onChange={(e) => handleChange(slotId, "isActive", e.target.checked)}
                    className="h-4 w-4 rounded border-[#ccc] text-primary focus:ring-2 focus:ring-primary/30"
                  />
                </label>
              </div>

              <div className="p-5">
                {/* HTML / Görsel seçimi */}
                <div className="mb-4 flex gap-1 rounded-xl bg-[#f5f4f2] p-1">
                  <button
                    type="button"
                    onClick={() => handleChange(slotId, "type", "html")}
                    className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${isHtml ? "bg-white text-primary shadow-sm" : "text-[#666] hover:text-[#333]"}`}
                  >
                    HTML / Script
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChange(slotId, "type", "image")}
                    className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-200 ${!isHtml ? "bg-white text-primary shadow-sm" : "text-[#666] hover:text-[#333]"}`}
                  >
                    Görsel
                  </button>
                </div>

                {/* İçerik */}
                <div className="mb-5">
                  {isHtml ? (
                    <textarea
                      name={`slot_${slotId}_html`}
                      rows={3}
                      value={slot?.type === "html" ? slot.content : ""}
                      onChange={(e) => handleChange(slotId, "content", e.target.value)}
                      className="w-full rounded-xl border border-[#e5e5e0] bg-[#fafaf9] p-3.5 font-mono text-xs outline-none transition placeholder:text-[#999] focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
                      placeholder="Reklam / AdSense kodu yapıştırın..."
                    />
                  ) : (
                    <div className="rounded-xl border border-[#e5e5e0] bg-[#fafaf9] p-3 transition focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10">
                      <ImageUpload
                        name={`slot_${slotId}_image`}
                        defaultValue={slot?.type === "image" ? slot.content : ""}
                        onChange={(url) => handleChange(slotId, "content", url)}
                        label=""
                        help=""
                      />
                    </div>
                  )}
                </div>

                {/* Boyut */}
                <div className="mb-5 flex flex-wrap items-end gap-4">
                  <div className="min-w-[120px]">
                    <label className="mb-1 block text-xs font-medium text-[#666]">Genişlik</label>
                    <input
                      name={`slot_${slotId}_width`}
                      value={slot?.width ?? ""}
                      onChange={(e) => handleChange(slotId, "width", e.target.value)}
                      className="w-full rounded-lg border border-[#e5e5e0] bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                      placeholder="728px veya 100%"
                    />
                  </div>
                  <div className="min-w-[100px]">
                    <label className="mb-1 block text-xs font-medium text-[#666]">Yükseklik</label>
                    <input
                      name={`slot_${slotId}_height`}
                      value={slot?.height ?? ""}
                      onChange={(e) => handleChange(slotId, "height", e.target.value)}
                      className="w-full rounded-lg border border-[#e5e5e0] bg-white px-3 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
                      placeholder="90px"
                    />
                  </div>
                  <div className="flex min-h-[40px] items-center rounded-lg bg-[#f5f4f2] px-3 text-xs font-medium text-[#777]">
                    {getAspectRatio(slot?.width ?? "", slot?.height ?? "")}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setPreset(slotId, p.w, p.h)}
                        className="rounded-lg border border-[#e5e5e0] bg-white px-3 py-1.5 text-xs font-medium text-[#555] transition hover:border-primary/50 hover:text-primary"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hizalama */}
                <div className="mb-5">
                  <label className="mb-2 block text-xs font-medium text-[#666]">Sayfada hizalama</label>
                  <input type="hidden" name={`slot_${slotId}_align`} value={slot?.align ?? "center"} />
                  <div className="flex gap-2">
                    {(["left", "center", "right"] as const).map((align) => {
                      const label = align === "left" ? "Sol" : align === "center" ? "Orta" : "Sağ";
                      const isSelected = (slot?.align ?? "center") === align;
                      return (
                        <button
                          key={align}
                          type="button"
                          onClick={() => handleChange(slotId, "align", align)}
                          className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${isSelected ? "border-primary bg-primary/10 text-primary" : "border-[#e5e5e0] bg-white text-[#555] hover:border-primary/50 hover:text-primary"}`}
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Önizleme */}
                <div className="rounded-xl border border-[#ebeae8] bg-[#f9f9f7] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setShowPreview((p) => ({ ...p, [slotId]: !p[slotId] }))}
                    className="flex w-full items-center justify-between px-4 py-3 text-left text-sm text-[#666] transition hover:bg-[#f5f4f2] hover:text-[#333]"
                  >
                    <span className="flex items-center gap-2">
                      <Icons.Info className="h-4 w-4 text-[#999]" />
                      {showPreview[slotId] ? "Önizlemeyi gizle" : "Önizle"}
                    </span>
                    {showPreview[slotId] && (
                      <span className="rounded-full bg-[#e8e6e3] px-2 py-0.5 text-xs font-medium text-[#666]">
                        {previewDevice === "mobile" ? "Mobil" : previewDevice === "tablet" ? "Tablet" : "Masaüstü"} · {getPreviewWidthLabel()}
                      </span>
                    )}
                  </button>
                  {showPreview[slotId] && (
                    <div className="border-t border-[#ebeae8] bg-[#f0eeeb] p-4">
                      <div className="mx-auto overflow-hidden rounded-lg border border-[#ddd] bg-white shadow-inner" style={{ width: getPreviewWidth(), maxWidth: "100%" }}>
                        {/* Cihaz çerçevesi üst çubuğu */}
                        <div className="flex items-center gap-2 border-b border-[#e5e5e0] bg-[#f5f4f2] px-3 py-2">
                          <div className="flex gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-[#e0e0e0]" />
                            <span className="h-2 w-2 rounded-full bg-[#e0e0e0]" />
                            <span className="h-2 w-2 rounded-full bg-[#e0e0e0]" />
                          </div>
                          <div className="flex-1 rounded-md bg-white px-2 py-1 text-center text-[10px] text-[#999] ring-1 ring-[#e5e5e0]">
                            {getPreviewWidthLabel()} görünüm
                          </div>
                        </div>
                        {/* Reklam alanı */}
                        <div className="p-4 min-h-[120px] bg-[#fafaf9]">
                          <AdSlot content={slot} showPlaceholder={true} slotId={slotId} />
                        </div>
                      </div>
                      {slot?.width && slot?.height && (
                        <p className="mt-2 text-center text-[11px] text-[#888]">
                          Boyut: {slot.width} × {slot.height}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Kaydet */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-[#e8e6e3] bg-white/95 py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-sm">
        <div className="container mx-auto flex max-w-4xl items-center justify-between px-4">
          <Link
            href="/admin"
            className="rounded-lg px-3 py-2 text-sm font-medium text-[#666] transition hover:bg-[#f5f4f2] hover:text-primary"
          >
            ← Panele dön
          </Link>
          <button
            type="submit"
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary-hover hover:shadow-primary/30 active:scale-[0.98]"
          >
            Kaydet
          </button>
        </div>
      </div>
    </form>
  );
}
