"use client";

import { useEffect, useMemo, useState } from "react";
import { AdSlot } from "@/components/AdSlot";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { saveAdSlot, saveAllAdSlots } from "@/app/admin/actions";
import {
  AD_SLOT_KEYS,
  isAdSlotLive,
  type AdSlotAlign,
  type AdSlotContent,
  type AdSlotCreative,
} from "@/lib/ad-slots";
import { Icons } from "./Icons";
import { useToast } from "./ToastProvider";

type SlotId = (typeof AD_SLOT_KEYS)[number];
type EditorDevice = "desktop" | "mobile";
type MainView = "placements" | "performance";
type AdMetrics = { impressions: number; clicks: number };

const SLOT_META: Record<SlotId, { label: string; description: string; group: string; order: number }> = {
  "top-banner": { label: "Üst reklam", description: "Logo ile manşet arasında", group: "Ana sayfa", order: 1 },
  "mid-banner": { label: "Manşet sonrası", description: "Manşet sliderının hemen altında", group: "Ana sayfa", order: 2 },
  "rectangle-ad": { label: "İçerik arası", description: "Son yazılar bölümünün altında", group: "Ana sayfa", order: 3 },
  "bottom-banner": { label: "Alt reklam", description: "Footer'dan hemen önce", group: "Ana sayfa", order: 4 },
  "yazi-top": { label: "İçerik öncesi", description: "Kapak görseli ile yazı metni arasında", group: "Yazı detay sayfası", order: 1 },
  "yazi-bottom": { label: "İçerik sonrası", description: "Yazı metninin sonunda", group: "Yazı detay sayfası", order: 2 },
  "yazilar-top": { label: "Liste başlangıcı", description: "Filtrelerin altında, ilk yazıdan önce", group: "Yazılar listesi", order: 1 },
  "yazilar-mid": { label: "Liste içi", description: "Yazı kartlarının arasında", group: "Yazılar listesi", order: 2 },
};

const SLOT_GROUPS = ["Ana sayfa", "Yazı detay sayfası", "Yazılar listesi"];

const PAGE_MAPS: Record<string, Array<{ label: string; slotId?: SlotId }>> = {
  "Ana sayfa": [
    { label: "Logo ve menü" },
    { label: "Reklam 1", slotId: "top-banner" },
    { label: "Manşet sliderı" },
    { label: "Reklam 2", slotId: "mid-banner" },
    { label: "Son yazılar" },
    { label: "Reklam 3", slotId: "rectangle-ad" },
    { label: "Diğer içerikler" },
    { label: "Reklam 4", slotId: "bottom-banner" },
    { label: "Footer" },
  ],
  "Yazı detay sayfası": [
    { label: "Başlık ve kapak görseli" },
    { label: "Reklam 1", slotId: "yazi-top" },
    { label: "Yazı metni" },
    { label: "Reklam 2", slotId: "yazi-bottom" },
    { label: "Benzer yazılar" },
  ],
  "Yazılar listesi": [
    { label: "Başlık ve filtreler" },
    { label: "Reklam 1", slotId: "yazilar-top" },
    { label: "Yazı kartları" },
    { label: "Reklam 2", slotId: "yazilar-mid" },
    { label: "Diğer yazı kartları" },
  ],
};

const PRESETS = [
  { label: "Tam genişlik", width: "100%", height: "110px" },
  { label: "Yatay", width: "728px", height: "90px" },
  { label: "Kare", width: "500px", height: "400px" },
  { label: "Dikey", width: "300px", height: "600px" },
];

const EMPTY_CREATIVE: AdSlotCreative = { type: "image", content: "", width: "", height: "", href: "" };
const EMPTY_SLOT: AdSlotContent = { ...EMPTY_CREATIVE, isActive: true, align: "center", mobile: null };

type ReklamFormProps = {
  initialAds: Record<string, AdSlotContent | null>;
  initialMetrics: Record<string, AdMetrics>;
  previewPostPath: string;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("tr-TR").format(value);
}

function getPreviewPath(slotId: SlotId, previewPostPath: string) {
  if (slotId.startsWith("yazi-")) return previewPostPath;
  if (slotId.startsWith("yazilar-")) return "/yazilar";
  return "/";
}

function getStatus(content: AdSlotContent | null | undefined) {
  if (!content?.content?.trim()) return { label: "Boş", className: "bg-gray-100 text-gray-500" };
  if (content.isActive === false) return { label: "Kapalı", className: "bg-gray-100 text-gray-600" };
  const now = new Date();
  if (content.startAt && new Date(content.startAt) > now) return { label: "Planlandı", className: "bg-blue-50 text-blue-700" };
  if (content.endAt && new Date(content.endAt) <= now) return { label: "Süresi doldu", className: "bg-amber-50 text-amber-700" };
  return { label: "Yayında", className: "bg-emerald-50 text-emerald-700" };
}

function toDateTimeInput(value: string | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function fromDateTimeInput(value: string) {
  return value ? new Date(value).toISOString() : undefined;
}

function isValidUrl(value: string, allowRelative = false) {
  if (!value) return true;
  if (allowRelative && value.startsWith("/")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidDimension(value: string | undefined) {
  if (!value) return true;
  return /^(?:auto|0|\d+(?:\.\d+)?(?:px|%|rem|em|vw|vh))$/i.test(value.trim());
}

function validateCreative(creative: AdSlotCreative | null | undefined, label: string) {
  if (!creative?.content?.trim()) return [];
  const errors: string[] = [];
  if (creative.type === "html" && !/<[a-z][\s\S]*>/i.test(creative.content)) {
    errors.push(label + " reklam kodu geçerli bir HTML etiketi içermiyor.");
  }
  if (creative.type === "image" && !isValidUrl(creative.content, true)) {
    errors.push(label + " görsel adresi geçersiz.");
  }
  if (creative.href && !isValidUrl(creative.href)) {
    errors.push(label + " hedef bağlantısı geçersiz.");
  }
  if (!isValidDimension(creative.width)) errors.push(label + " genişliği geçersiz.");
  if (!isValidDimension(creative.height)) errors.push(label + " yüksekliği geçersiz.");
  return errors;
}

function validateSlot(content: AdSlotContent | null | undefined) {
  if (!content) return [];
  const errors = [
    ...validateCreative(content, "Masaüstü"),
    ...validateCreative(content.mobile, "Mobil"),
  ];
  if (content.startAt && Number.isNaN(new Date(content.startAt).getTime())) errors.push("Başlangıç tarihi geçersiz.");
  if (content.endAt && Number.isNaN(new Date(content.endAt).getTime())) errors.push("Bitiş tarihi geçersiz.");
  if (content.startAt && content.endAt && new Date(content.endAt) <= new Date(content.startAt)) {
    errors.push("Bitiş tarihi başlangıç tarihinden sonra olmalıdır.");
  }
  return errors;
}

function appendCreative(formData: FormData, prefix: string, creative: AdSlotCreative | null | undefined) {
  if (!creative) return;
  formData.set(prefix + "_" + creative.type, creative.content);
  formData.set(prefix + "_width", creative.width ?? "");
  formData.set(prefix + "_height", creative.height ?? "");
  formData.set(prefix + "_href", creative.href ?? "");
}

function PageMap({
  group,
  selectedSlotId,
  previewPostPath,
  ads,
  onSelect,
}: {
  group: string;
  selectedSlotId: SlotId;
  previewPostPath: string;
  ads: Record<string, AdSlotContent | null>;
  onSelect: (slotId: SlotId) => void;
}) {
  const previewPath = getPreviewPath(selectedSlotId, previewPostPath);

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="text-base font-bold text-gray-900">{group} yerleşimi</h2>
          <p className="mt-0.5 text-xs text-gray-500">Düzenlemek istediğiniz reklam alanına tıklayın.</p>
        </div>
        <a
          href={previewPath + "#ad-slot-" + selectedSlotId}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:border-primary hover:text-primary"
        >
          <Icons.Eye className="h-4 w-4" />
          Sayfada gör
        </a>
      </div>
      <div className="bg-gradient-to-b from-gray-50 to-gray-100 p-5 sm:p-8">
        <div className="mx-auto max-w-xl overflow-hidden rounded-xl border border-gray-300 bg-white shadow-lg">
          <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
            <span className="ml-2 flex-1 rounded-md bg-white px-3 py-1 text-center font-mono text-[10px] text-gray-400 ring-1 ring-gray-200">
              {previewPath}
            </span>
          </div>
          <div className="space-y-3 p-4 sm:p-6">
            {PAGE_MAPS[group].map((item, index) => {
              if (!item.slotId) {
                return (
                  <div key={item.label + String(index)} className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-4 text-center text-xs font-medium text-gray-400">
                    {item.label}
                  </div>
                );
              }

              const status = validateSlot(ads[item.slotId]).length > 0
                ? { label: "Hatalı", className: "bg-red-50 text-red-700" }
                : getStatus(ads[item.slotId]);
              const isSelected = item.slotId === selectedSlotId;
              const meta = SLOT_META[item.slotId];

              return (
                <button
                  key={item.slotId}
                  type="button"
                  onClick={() => onSelect(item.slotId as SlotId)}
                  className={
                    "group flex w-full items-center gap-3 rounded-xl border-2 px-4 py-4 text-left transition " +
                    (isSelected
                      ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
                      : "border-dashed border-gray-300 bg-white hover:border-primary/50 hover:bg-primary/5")
                  }
                >
                  <span className={"flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold " + (isSelected ? "bg-primary text-white" : "bg-gray-100 text-gray-500 group-hover:bg-primary/10 group-hover:text-primary")}>
                    {meta.order}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className={"block text-sm font-bold " + (isSelected ? "text-primary" : "text-gray-800")}>{meta.label}</span>
                    <span className="mt-0.5 block text-xs text-gray-500">{meta.description}</span>
                  </span>
                  <span className={"rounded-full px-2.5 py-1 text-[10px] font-bold " + status.className}>{status.label}</span>
                  <Icons.ChevronRight className={"h-4 w-4 shrink-0 " + (isSelected ? "text-primary" : "text-gray-300")} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function PerformanceView({
  ads,
  metrics,
}: {
  ads: Record<string, AdSlotContent | null>;
  metrics: Record<string, AdMetrics>;
}) {
  const totalImpressions = AD_SLOT_KEYS.reduce((total, slotId) => total + (metrics[slotId]?.impressions ?? 0), 0);
  const totalClicks = AD_SLOT_KEYS.reduce((total, slotId) => total + (metrics[slotId]?.clicks ?? 0), 0);
  const maximumImpressions = Math.max(1, ...AD_SLOT_KEYS.map((slotId) => metrics[slotId]?.impressions ?? 0));

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-6">
          <h2 className="text-base font-bold text-gray-900">Gösterim dağılımı</h2>
          <p className="mt-1 text-xs text-gray-500">Reklam alanlarının toplam görüntülenme karşılaştırması.</p>
        </div>
        <div className="space-y-5">
          {AD_SLOT_KEYS.map((slotId) => {
            const slotMetrics = metrics[slotId] ?? { impressions: 0, clicks: 0 };
            const width = Math.max(2, (slotMetrics.impressions / maximumImpressions) * 100);
            return (
              <div key={slotId}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{SLOT_META[slotId].label}</p>
                    <p className="text-[11px] text-gray-400">{SLOT_META[slotId].group}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{formatNumber(slotMetrics.impressions)}</p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60" style={{ width: String(width) + "%" }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-bold text-gray-900">Alan performansı</h2>
          <p className="mt-1 text-xs text-gray-500">{formatNumber(totalImpressions)} gösterim · {formatNumber(totalClicks)} tıklama</p>
        </div>
        <div className="divide-y divide-gray-100">
          {AD_SLOT_KEYS.map((slotId) => {
            const slotMetrics = metrics[slotId] ?? { impressions: 0, clicks: 0 };
            const rate = slotMetrics.impressions > 0 ? (slotMetrics.clicks / slotMetrics.impressions) * 100 : 0;
            const status = validateSlot(ads[slotId]).length > 0
              ? { label: "Hatalı", className: "bg-red-50 text-red-700" }
              : getStatus(ads[slotId]);
            return (
              <div key={slotId} className="px-5 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{SLOT_META[slotId].label}</p>
                    <p className="mt-0.5 text-[11px] text-gray-400">{formatNumber(slotMetrics.clicks)} tıklama · %{rate.toFixed(1)} oran</p>
                  </div>
                  <span className={"rounded-full px-2.5 py-1 text-[10px] font-bold " + status.className}>{status.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function ReklamForm({ initialAds, initialMetrics, previewPostPath }: ReklamFormProps) {
  const [ads, setAds] = useState(initialAds);
  const [savedAds, setSavedAds] = useState(initialAds);
  const [mainView, setMainView] = useState<MainView>("placements");
  const [activeGroup, setActiveGroup] = useState(SLOT_GROUPS[0]);
  const [selectedSlotId, setSelectedSlotId] = useState<SlotId>("top-banner");
  const [editorDevice, setEditorDevice] = useState<EditorDevice>("desktop");
  const [showPreview, setShowPreview] = useState(false);
  const [savingMode, setSavingMode] = useState<"slot" | "all" | null>(null);
  const { success, error: showError } = useToast();

  const selectedSlot = ads[selectedSlotId] ?? EMPTY_SLOT;
  const selectedMeta = SLOT_META[selectedSlotId];
  const selectedCreative = editorDevice === "mobile" ? selectedSlot.mobile ?? EMPTY_CREATIVE : selectedSlot;
  const selectedErrors = validateSlot(selectedSlot);
  const dirtySlotIds = useMemo(
    () => AD_SLOT_KEYS.filter((slotId) => JSON.stringify(ads[slotId] ?? null) !== JSON.stringify(savedAds[slotId] ?? null)),
    [ads, savedAds]
  );
  const isDirty = dirtySlotIds.length > 0;
  const isSelectedDirty = dirtySlotIds.includes(selectedSlotId);

  useEffect(() => {
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const warnBeforeNavigation = (event: MouseEvent) => {
      if (!isDirty || !(event.target instanceof Element)) return;
      const anchor = event.target.closest("a");
      if (!anchor || anchor.target === "_blank" || !anchor.href) return;
      if (!window.confirm("Kaydedilmemiş reklam değişiklikleri var. Sayfadan ayrılmak istiyor musunuz?")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    document.addEventListener("click", warnBeforeNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", warnBeforeUnload);
      document.removeEventListener("click", warnBeforeNavigation, true);
    };
  }, [isDirty]);

  const updateSlot = (changes: Partial<AdSlotContent>) => {
    setAds((previous) => ({
      ...previous,
      [selectedSlotId]: { ...(previous[selectedSlotId] ?? EMPTY_SLOT), ...changes },
    }));
  };

  const updateCreative = (changes: Partial<AdSlotCreative>) => {
    setAds((previous) => {
      const currentSlot = previous[selectedSlotId] ?? EMPTY_SLOT;
      if (editorDevice === "mobile") {
        return {
          ...previous,
          [selectedSlotId]: {
            ...currentSlot,
            mobile: { ...(currentSlot.mobile ?? EMPTY_CREATIVE), ...changes },
          },
        };
      }
      return { ...previous, [selectedSlotId]: { ...currentSlot, ...changes } };
    });
  };

  const selectSlot = (slotId: SlotId) => {
    setSelectedSlotId(slotId);
    setActiveGroup(SLOT_META[slotId].group);
    setEditorDevice("desktop");
    setShowPreview(false);
  };

  const selectGroup = (group: string) => {
    const firstSlot = AD_SLOT_KEYS.find((slotId) => SLOT_META[slotId].group === group);
    setActiveGroup(group);
    if (firstSlot) selectSlot(firstSlot);
  };

  const buildFormData = (slotIds: readonly SlotId[]) => {
    const formData = new FormData();
    for (const slotId of slotIds) {
      const slot = ads[slotId];
      if (!slot) continue;
      const prefix = "slot_" + slotId;
      appendCreative(formData, prefix, slot);
      appendCreative(formData, prefix + "_mobile", slot.mobile);
      if (slot.isActive !== false) formData.set(prefix + "_active", "on");
      formData.set(prefix + "_align", slot.align ?? "center");
      formData.set(prefix + "_start_at", slot.startAt ?? "");
      formData.set(prefix + "_end_at", slot.endAt ?? "");
    }
    return formData;
  };

  const saveSelected = async () => {
    if (selectedErrors.length > 0) {
      showError("Alan kaydedilemedi", selectedErrors[0]);
      return;
    }
    setSavingMode("slot");
    try {
      await saveAdSlot(selectedSlotId, buildFormData([selectedSlotId]));
      setSavedAds((previous) => ({ ...previous, [selectedSlotId]: ads[selectedSlotId] ?? null }));
      success("Reklam alanı kaydedildi", selectedMeta.label + " güncellendi.");
    } catch (error) {
      showError("Kaydetme başarısız", error instanceof Error ? error.message : "Lütfen tekrar deneyin.");
    } finally {
      setSavingMode(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const invalidSlotId = AD_SLOT_KEYS.find((slotId) => validateSlot(ads[slotId]).length > 0);
    if (invalidSlotId) {
      selectSlot(invalidSlotId);
      showError("Tüm alanlar kaydedilemedi", validateSlot(ads[invalidSlotId])[0]);
      return;
    }
    setSavingMode("all");
    try {
      await saveAllAdSlots(buildFormData(AD_SLOT_KEYS));
      setSavedAds(ads);
      success("Tüm değişiklikler kaydedildi", String(AD_SLOT_KEYS.length) + " reklam alanı güncellendi.");
    } catch (error) {
      showError("Kaydetme başarısız", error instanceof Error ? error.message : "Lütfen tekrar deneyin.");
    } finally {
      setSavingMode(null);
    }
  };

  const previewContent: AdSlotContent = editorDevice === "mobile" && selectedSlot.mobile
    ? { ...selectedSlot, ...selectedSlot.mobile, mobile: null }
    : selectedSlot;
  const configuredCount = AD_SLOT_KEYS.filter((slotId) => Boolean(ads[slotId]?.content?.trim())).length;
  const liveCount = AD_SLOT_KEYS.filter((slotId) => isAdSlotLive(ads[slotId])).length;
  const plannedCount = AD_SLOT_KEYS.filter((slotId) => {
    const slot = ads[slotId];
    return Boolean(slot?.content?.trim() && slot.isActive !== false && slot.startAt && new Date(slot.startAt) > new Date());
  }).length;
  const issueCount = AD_SLOT_KEYS.filter((slotId) => validateSlot(ads[slotId]).length > 0).length;

  return (
    <form onSubmit={handleSubmit} className={"space-y-5 " + (isDirty ? "pb-24" : "")}>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Dolu alan", value: configuredCount, detail: "Toplam " + String(AD_SLOT_KEYS.length) + " konum", icon: Icons.Ad, tone: "bg-gray-900 text-white" },
          { label: "Yayında", value: liveCount, detail: "Şu anda görünür", icon: Icons.Eye, tone: "bg-emerald-50 text-emerald-700" },
          { label: "Planlanan", value: plannedCount, detail: "Yayın sırası bekliyor", icon: Icons.Calendar, tone: "bg-blue-50 text-blue-700" },
          { label: "Kontrol gerekli", value: issueCount, detail: issueCount > 0 ? "Alanları düzeltin" : "Her şey yolunda", icon: issueCount > 0 ? Icons.AlertTriangle : Icons.CheckCircle, tone: issueCount > 0 ? "bg-red-50 text-red-700" : "bg-gray-50 text-gray-600" },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500">{item.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{item.value}</p>
                  <p className="mt-1 text-[11px] text-gray-400">{item.detail}</p>
                </div>
                <span className={"flex h-9 w-9 items-center justify-center rounded-lg " + item.tone}>
                  <Icon className="h-4 w-4" />
                </span>
              </div>
            </div>
          );
        })}
      </section>

      <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-1.5 shadow-sm">
        <div className="flex min-w-0 flex-1">
          <button
            type="button"
            onClick={() => setMainView("placements")}
            className={"flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition sm:flex-none " + (mainView === "placements" ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800")}
          >
            <Icons.Ad className="h-4 w-4" />
            Yerleşimler
          </button>
          <button
            type="button"
            onClick={() => setMainView("performance")}
            className={"flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition sm:flex-none " + (mainView === "performance" ? "bg-primary text-white shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800")}
          >
            <Icons.Eye className="h-4 w-4" />
            Performans
          </button>
        </div>
        {isDirty && <span className="mr-2 hidden rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 sm:inline">{dirtySlotIds.length} değişiklik kaydedilmedi</span>}
      </div>

      {mainView === "performance" ? (
        <PerformanceView ads={ads} metrics={initialMetrics} />
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-3">
            {SLOT_GROUPS.map((group) => {
              const groupSlots = AD_SLOT_KEYS.filter((slotId) => SLOT_META[slotId].group === group);
              const activeCount = groupSlots.filter((slotId) => isAdSlotLive(ads[slotId])).length;
              return (
                <button
                  key={group}
                  type="button"
                  onClick={() => selectGroup(group)}
                  className={"rounded-xl border p-4 text-left transition " + (activeGroup === group ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/10" : "border-gray-200 bg-white hover:border-primary/40")}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className={"text-sm font-bold " + (activeGroup === group ? "text-primary" : "text-gray-800")}>{group}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">{activeCount} yayında</span>
                  </span>
                  <span className="mt-1 block text-xs text-gray-400">{groupSlots.length} reklam konumu</span>
                </button>
              );
            })}
          </div>

          <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
            <PageMap group={activeGroup} selectedSlotId={selectedSlotId} previewPostPath={previewPostPath} ads={ads} onSelect={selectSlot} />

            <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:sticky lg:top-36">
              <div className="flex flex-col gap-4 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-900">{selectedMeta.label}</h2>
                    {isSelectedDirty && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">Kaydedilmedi</span>}
                  </div>
                  <p className="mt-0.5 text-sm text-gray-500">{selectedMeta.description}</p>
                </div>
                <label className="flex cursor-pointer items-center gap-3 self-start rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 sm:self-auto">
                  <span>{selectedSlot.isActive === false ? "Kapalı" : "Aktif"}</span>
                  <input
                    type="checkbox"
                    checked={selectedSlot.isActive !== false}
                    onChange={(event) => updateSlot({ isActive: event.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </label>
              </div>

          <div className="space-y-6 p-5">
            <div>
              <p className="mb-2 text-sm font-semibold text-gray-800">Cihaz</p>
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-lg bg-gray-100 p-1">
                  <button type="button" onClick={() => setEditorDevice("desktop")} className={"flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium " + (editorDevice === "desktop" ? "bg-white text-primary shadow-sm" : "text-gray-500")}>
                    <Icons.Laptop className="h-4 w-4" /> Masaüstü
                  </button>
                  {selectedSlot.mobile && (
                    <button type="button" onClick={() => setEditorDevice("mobile")} className={"flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium " + (editorDevice === "mobile" ? "bg-white text-primary shadow-sm" : "text-gray-500")}>
                      <Icons.Phone className="h-4 w-4" /> Mobil
                    </button>
                  )}
                </div>
                {!selectedSlot.mobile ? (
                  <button
                    type="button"
                    onClick={() => {
                      updateSlot({ mobile: { ...EMPTY_CREATIVE, type: selectedSlot.type, width: "100%", height: selectedSlot.height } });
                      setEditorDevice("mobile");
                    }}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    + Mobil için farklı reklam ekle
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      updateSlot({ mobile: null });
                      setEditorDevice("desktop");
                    }}
                    className="text-xs font-semibold text-red-600 hover:underline"
                  >
                    Mobil reklamı kaldır
                  </button>
                )}
              </div>
              {!selectedSlot.mobile && <p className="mt-2 text-xs text-gray-500">Mobil cihazlarda masaüstü reklamı kullanılacak.</p>}
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-gray-800">Reklam türü</p>
              <div className="inline-flex rounded-lg bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => updateCreative({ type: "image", content: selectedCreative.type === "image" ? selectedCreative.content : "" })}
                  className={"rounded-md px-4 py-2 text-sm font-medium " + (selectedCreative.type === "image" ? "bg-white text-primary shadow-sm" : "text-gray-500")}
                >
                  Görsel
                </button>
                <button
                  type="button"
                  onClick={() => updateCreative({ type: "html", content: selectedCreative.type === "html" ? selectedCreative.content : "" })}
                  className={"rounded-md px-4 py-2 text-sm font-medium " + (selectedCreative.type !== "image" ? "bg-white text-primary shadow-sm" : "text-gray-500")}
                >
                  Reklam kodu
                </button>
              </div>
            </div>

            {selectedCreative.type === "image" ? (
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-sm font-semibold text-gray-800">Reklam görseli</p>
                  <ImageUpload
                    name={"slot_" + selectedSlotId + "_" + editorDevice + "_editor"}
                    defaultValue={selectedCreative.content}
                    onChange={(url) => updateCreative({ type: "image", content: url })}
                    label=""
                    help="Bir görsel yükleyin veya görsel adresini yapıştırın."
                  />
                </div>
                <label className="block text-sm font-semibold text-gray-800">
                  Tıklanınca açılacak adres
                  <input
                    type="url"
                    value={selectedCreative.href ?? ""}
                    onChange={(event) => updateCreative({ href: event.target.value })}
                    className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    placeholder="https://reklamveren.com"
                  />
                </label>
              </div>
            ) : (
              <div>
                <label htmlFor={"ad-code-" + selectedSlotId + "-" + editorDevice} className="mb-2 block text-sm font-semibold text-gray-800">Reklam kodu</label>
                <textarea
                  id={"ad-code-" + selectedSlotId + "-" + editorDevice}
                  rows={8}
                  value={selectedCreative.content}
                  onChange={(event) => updateCreative({ type: "html", content: event.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 p-3 font-mono text-xs leading-5 outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10"
                  placeholder="AdSense veya reklam sağlayıcınızın kodunu buraya yapıştırın"
                />
                <p className="mt-2 text-xs text-gray-500">Kod kaydedildikten sonra ilgili konumda çalıştırılır.</p>
              </div>
            )}

            {selectedErrors.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-800">Düzeltilmesi gerekenler</p>
                <ul className="mt-2 space-y-1 text-xs text-red-700">
                  {selectedErrors.map((error) => <li key={error}>• {error}</li>)}
                </ul>
              </div>
            )}

            <details className="rounded-lg border border-gray-200 bg-gray-50">
              <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700">
                <span>Gelişmiş ayarlar</span>
                <span className="text-xs font-normal text-gray-400">Boyut, hizalama ve tarih</span>
              </summary>
              <div className="space-y-5 border-t border-gray-200 p-4">
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">Boyut</p>
                  <div className="mb-3 flex flex-wrap gap-2">
                    {PRESETS.map((preset) => (
                      <button key={preset.label} type="button" onClick={() => updateCreative({ width: preset.width, height: preset.height })} className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-primary hover:text-primary">
                        {preset.label}
                      </button>
                    ))}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-medium text-gray-600">
                      Genişlik
                      <input value={selectedCreative.width ?? ""} onChange={(event) => updateCreative({ width: event.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary" placeholder="728px veya 100%" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Yükseklik
                      <input value={selectedCreative.height ?? ""} onChange={(event) => updateCreative({ height: event.target.value })} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary" placeholder="90px" />
                    </label>
                  </div>
                </div>

                {editorDevice === "desktop" && (
                  <div className="border-t border-gray-200 pt-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">Hizalama</p>
                    <div className="flex gap-2">
                      {(["left", "center", "right"] as AdSlotAlign[]).map((align) => (
                        <button key={align} type="button" onClick={() => updateSlot({ align })} className={"rounded-md border px-3 py-1.5 text-xs font-medium " + (selectedSlot.align === align || (!selectedSlot.align && align === "center") ? "border-primary bg-primary/10 text-primary" : "border-gray-300 bg-white text-gray-600")}>
                          {align === "left" ? "Sol" : align === "center" ? "Orta" : "Sağ"}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-500">Yayın planı</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-medium text-gray-600">
                      Başlangıç
                      <input type="datetime-local" value={toDateTimeInput(selectedSlot.startAt)} onChange={(event) => updateSlot({ startAt: fromDateTimeInput(event.target.value) })} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
                    </label>
                    <label className="text-xs font-medium text-gray-600">
                      Bitiş
                      <input type="datetime-local" value={toDateTimeInput(selectedSlot.endAt)} onChange={(event) => updateSlot({ endAt: fromDateTimeInput(event.target.value) })} className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-primary" />
                    </label>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Boş bırakırsanız reklam, aktif olduğu sürece yayında kalır.</p>
                </div>
              </div>
            </details>

            <div className="rounded-lg border border-gray-200">
              <button type="button" onClick={() => setShowPreview((current) => !current)} className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700">
                <span className="flex items-center gap-2"><Icons.Eye className="h-4 w-4" />{showPreview ? "Önizlemeyi kapat" : "Önizle"}</span>
                <span className="text-xs font-normal text-gray-400">{editorDevice === "mobile" ? "Mobil" : "Masaüstü"}</span>
              </button>
              {showPreview && (
                <div className="overflow-x-auto border-t border-gray-200 bg-gray-100 p-4">
                  <div className="mx-auto min-h-32 overflow-hidden rounded-lg border border-gray-300 bg-white p-4" style={{ width: editorDevice === "mobile" ? "375px" : "100%", maxWidth: "100%" }}>
                    <AdSlot content={previewContent} showPlaceholder slotId={selectedSlotId} forceDevice={editorDevice} />
                  </div>
                </div>
              )}
            </div>
          </div>

            </section>
          </div>
        </>
      )}

      {isDirty && (
        <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-4xl -translate-x-1/2 rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-2xl backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 px-1">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-700">
                <Icons.AlertTriangle className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-gray-900">{dirtySlotIds.length} kaydedilmemiş değişiklik</p>
                <p className="text-xs text-gray-500">{issueCount > 0 ? String(issueCount) + " alanda hata var." : "Değişiklikler kaydedilmeye hazır."}</p>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setAds(savedAds);
                  setEditorDevice("desktop");
                  setShowPreview(false);
                }}
                disabled={savingMode !== null}
                className="rounded-lg px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 disabled:opacity-40"
              >
                Vazgeç
              </button>
              {isSelectedDirty && (
                <button
                  type="button"
                  onClick={saveSelected}
                  disabled={savingMode !== null || selectedErrors.length > 0}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {savingMode === "slot" ? "Kaydediliyor..." : "Bu alanı kaydet"}
                </button>
              )}
              <button
                type="submit"
                disabled={savingMode !== null}
                className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-40"
              >
                {savingMode === "all" ? "Kaydediliyor..." : "Tümünü kaydet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
