import type { AdSlotContent, AdSlotAlign } from "@/lib/ad-slots";
import { AdSlotRenderer } from "./AdSlotRenderer";

type AdSlotProps = {
  /** Reklam alanı kimliği */
  slotId?: string;
  /** Boyut: leaderboard, rectangle, skyscraper, mobile */
  size?: "leaderboard" | "rectangle" | "skyscraper" | "mobile" | "banner";
  /** Admin panelden kaydedilen içerik: HTML, metin veya görsel URL */
  content?: AdSlotContent | null;
  /** Ek CSS sınıfları */
  className?: string;
  /** Boş olduğunda placeholder göster (sadece admin panel için) */
  showPlaceholder?: boolean;
};

const alignClasses: Record<AdSlotAlign, string> = {
  left: "flex justify-start",
  center: "flex justify-center",
  right: "flex justify-end",
};

const sizeStyles = {
  leaderboard: "h-[110px] w-full max-w-full mx-auto",
  rectangle: "h-[300px] w-full max-w-full mx-auto",
  skyscraper: "h-[600px] w-full max-w-[300px]",
  mobile: "h-[100px] w-full max-w-full mx-auto",
  banner: "h-[180px] w-full max-w-full mx-auto",
};

/** Santimetre veya milimetreyi piksele çevir (1cm ≈ 38px) */
function convertToPx(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const val = value.toLowerCase().trim();
  if (val.endsWith("cm")) {
    const num = parseFloat(val);
    return !isNaN(num) ? `${Math.round(num * 37.8)}px` : value;
  }
  if (val.endsWith("mm")) {
    const num = parseFloat(val);
    return !isNaN(num) ? `${Math.round(num * 3.78)}px` : value;
  }
  return value;
}

/** Reklam alanı: content varsa (HTML / metin / görsel) gösterir, yoksa placeholder gösterir (admin panelinde). */
export function AdSlot({ slotId, size = "leaderboard", content, className = "", showPlaceholder = false }: AdSlotProps) {
  const showSlots = process.env.NEXT_PUBLIC_SHOW_AD_SLOTS !== "false";
  const sizeClass = sizeStyles[size];
  const align = content?.align === "left" || content?.align === "right" ? content.align : "center";
  const wrapperClass = alignClasses[align];

  // Eğer env variable ile gizlenmişse hiç gösterme
  if (!showSlots) return null;

  // Reklam pasifse ve admin modunda değilsek gösterme
  if (content && content.isActive === false && !showPlaceholder) {
    return null;
  }

  // Eğer content yoksa ve placeholder da istenmediyse hiç gösterme
  if (!content?.content?.trim() && !showPlaceholder) return null;

  // Admin panelde boş reklam alanları için placeholder göster
  if (!content?.content?.trim() && showPlaceholder) {
    const sizeLabels = {
      leaderboard: "728×90 (Leaderboard)",
      rectangle: "300×250 (Rectangle)",
      skyscraper: "160×600 (Skyscraper)",
      mobile: "320×50 (Mobile)",
      banner: "970×100 (Banner)",
    };

    return (
      <div className={wrapperClass}>
        <aside
          className={`overflow-hidden rounded-md border-2 border-dashed border-primary/30 bg-primary-light/20 ${sizeClass} ${className}`}
          aria-label="Reklam alanı (boş)"
        >
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
            <div className="text-sm font-bold text-primary">📢 REKLAM ALANI (BOŞ)</div>
            <div className="text-xs text-muted">
              <strong>ID:</strong> {slotId || "bilinmiyor"}
            </div>
            <div className="text-xs text-muted">
              <strong>Standart Boyut:</strong> {sizeLabels[size]}
            </div>
            <div className="mt-2 text-xs text-muted/70">
              Admin panelinden içerik ekleyebilirsiniz
            </div>
          </div>
        </aside>
      </div>
    );
  }

  // Özel boyut varsa style olarak ekle, yoksa class'tan gelenleri kullan
  const customStyle: React.CSSProperties = { maxWidth: "100%" };
  if (content?.width) customStyle.width = convertToPx(content.width);
  if (content?.height) customStyle.height = convertToPx(content.height);

  // Content varsa göster
  return (
    <div className={wrapperClass}>
      <aside
        className={`overflow-hidden rounded-md ${!content?.width && !content?.height ? sizeClass : ""} ${className}`}
        style={customStyle}
        aria-label="Reklam alanı"
      >
        {content?.type === "html" && <AdSlotRenderer html={content.content} />}
        {content?.type === "text" && (
          <div className="flex h-full w-full items-center justify-center p-3 text-center text-sm text-foreground bg-gray-50">
            {content.content}
          </div>
        )}
        {content?.type === "image" && (
          <a
            href={content.content}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="relative flex h-full w-full items-center justify-center"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={content.content}
              alt="Reklam"
              className="h-full w-full object-cover"
            />
          </a>
        )}
      </aside>
    </div>
  );
}
