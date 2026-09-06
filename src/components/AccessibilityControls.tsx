"use client";

import Link from "next/link";
import { useAccessibility, type FontSizePreference } from "@/components/providers/AccessibilityProvider";

type AccessibilityControlsProps = {
  variant?: "panel" | "inline";
};

const FONT_OPTIONS: { value: FontSizePreference; label: string }[] = [
  { value: "md", label: "A" },
  { value: "lg", label: "A+" },
  { value: "xl", label: "A++" },
];

export function AccessibilityControls({ variant = "panel" }: AccessibilityControlsProps) {
  const { settings, isReady, setFontSize, setContrast, setReadingMode, setMotion, resetSettings } = useAccessibility();

  if (!isReady) {
    return <div className={variant === "panel" ? "h-32" : "h-24"} aria-hidden />;
  }

  const compact = variant === "inline";

  return (
    <section
      className={compact ? "space-y-4" : "space-y-4 border-t border-border px-4 pt-4"}
      aria-label="Okuma ve erişilebilirlik ayarları"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">Okuma Ayarları</p>
          <p className="mt-1 text-xs text-muted">Yazı boyutu, kontrast ve disleksi dostu görünüm.</p>
        </div>
        <button
          type="button"
          onClick={resetSettings}
          className="min-h-11 rounded-full border border-border px-3 py-1 text-[11px] font-semibold text-muted transition-colors hover:border-primary hover:text-primary"
        >
          Sıfırla
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm font-medium text-foreground">Yazı Boyutu</span>
          <div className="flex items-center rounded-full border border-border bg-muted-bg/60 p-1">
            {FONT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFontSize(option.value)}
                aria-label={option.value === "md" ? "Normal yazı boyutu" : option.value === "lg" ? "Büyük yazı boyutu" : "En büyük yazı boyutu"}
                aria-pressed={settings.fontSize === option.value}
                className={`min-h-11 min-w-11 rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
                  settings.fontSize === option.value
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted-bg/40 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Yüksek Kontrast</p>
            <p className="text-xs text-muted">Renk farklarını güçlendirir.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-label="Yüksek kontrast"
            aria-checked={settings.contrast === "high"}
            onClick={() => setContrast(settings.contrast === "high" ? "normal" : "high")}
            className={`relative h-11 w-12 shrink-0 rounded-full transition-colors ${
              settings.contrast === "high" ? "bg-primary" : "bg-border"
            }`}
          >
            <span
              className={`absolute left-0 top-3 h-5 w-5 rounded-full bg-white transition-transform ${
                settings.contrast === "high" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted-bg/40 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Disleksi Dostu Mod</p>
            <p className="text-xs text-muted">Harf ve satır aralığını artırır.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-label="Disleksi dostu mod"
            aria-checked={settings.readingMode === "dyslexia"}
            onClick={() => setReadingMode(settings.readingMode === "dyslexia" ? "default" : "dyslexia")}
            className={`relative h-11 w-12 shrink-0 rounded-full transition-colors ${
              settings.readingMode === "dyslexia" ? "bg-primary" : "bg-border"
            }`}
          >
            <span
              className={`absolute left-0 top-3 h-5 w-5 rounded-full bg-white transition-transform ${
                settings.readingMode === "dyslexia" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted-bg/40 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Hareketi Azalt</p>
            <p className="text-xs text-muted">Geçiş ve hareket efektlerini kapatır.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-label="Hareket efektlerini azalt"
            aria-checked={settings.motion === "reduced"}
            onClick={() => setMotion(settings.motion === "reduced" ? "normal" : "reduced")}
            className={`relative h-11 w-12 shrink-0 rounded-full transition-colors ${
              settings.motion === "reduced" ? "bg-primary" : "bg-border"
            }`}
          >
            <span
              className={`absolute left-0 top-3 h-5 w-5 rounded-full bg-white transition-transform ${
                settings.motion === "reduced" ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <p className="text-xs leading-relaxed text-muted">
        Klavye ile gezinme ve görünür odak halkaları sitede varsayılan olarak aktiftir.
      </p>
      <Link href="/erisilebilirlik" className="inline-flex text-xs font-semibold text-primary hover:underline">
        Erişilebilirlik özellikleri ve geri bildirim
      </Link>
    </section>
  );
}
