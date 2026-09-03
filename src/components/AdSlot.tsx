"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { AdSlotAlign, AdSlotContent, AdSlotCreative, AdMetricType } from "@/lib/ad-slots";
import { isAdSlotLive } from "@/lib/ad-slots";
import { AdSlotRenderer } from "./AdSlotRenderer";

type AdSlotProps = {
  slotId?: string;
  size?: "leaderboard" | "rectangle" | "skyscraper" | "mobile" | "banner";
  content?: AdSlotContent | null;
  className?: string;
  showPlaceholder?: boolean;
  forceDevice?: "desktop" | "mobile";
};

const alignClasses: Record<AdSlotAlign, string> = {
  left: "flex justify-start",
  center: "flex justify-center",
  right: "flex justify-end",
};

const sizeStyles = {
  leaderboard: "h-[96px] w-full max-w-[970px] mx-auto",
  rectangle: "h-[260px] w-full max-w-[640px] mx-auto",
  skyscraper: "h-[600px] w-full max-w-[300px]",
  mobile: "h-[96px] w-full max-w-full mx-auto",
  banner: "h-[132px] w-full max-w-[970px] mx-auto",
};

function convertToPx(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const normalizedValue = value.toLowerCase().trim();
  if (normalizedValue.endsWith("cm")) {
    const amount = parseFloat(normalizedValue);
    return !isNaN(amount) ? String(Math.round(amount * 37.8)) + "px" : value;
  }
  if (normalizedValue.endsWith("mm")) {
    const amount = parseFloat(normalizedValue);
    return !isNaN(amount) ? String(Math.round(amount * 3.78)) + "px" : value;
  }
  return value;
}

function sendAdMetric(slotId: string, event: AdMetricType) {
  void fetch("/api/ads/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slotId, event }),
    keepalive: true,
  }).catch(() => undefined);
}

function subscribeToMobileViewport(onChange: () => void) {
  const mediaQuery = window.matchMedia("(max-width: 639px)");
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
}

function getMobileViewportSnapshot() {
  return window.matchMedia("(max-width: 639px)").matches;
}

function AdCreative({ creative }: { creative: AdSlotCreative }) {
  if (creative.type === "html") return <AdSlotRenderer html={creative.content} />;

  if (creative.type === "text") {
    return <div className="flex h-full w-full items-center justify-center bg-transparent p-3 text-center text-sm text-foreground">{creative.content}</div>;
  }

  const image = (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={creative.content} alt="Reklam" className="h-full w-full object-cover" />
  );

  if (!creative.href) return <div className="flex h-full w-full items-center justify-center">{image}</div>;

  return (
    <a href={creative.href} target="_blank" rel="noopener noreferrer sponsored" className="relative flex h-full w-full items-center justify-center">
      {image}
    </a>
  );
}

export function AdSlot({
  slotId,
  size = "leaderboard",
  content,
  className = "",
  showPlaceholder = false,
  forceDevice,
}: AdSlotProps) {
  const viewportIsMobile = useSyncExternalStore(
    subscribeToMobileViewport,
    getMobileViewportSnapshot,
    () => false
  );
  const isMobile = forceDevice ? forceDevice === "mobile" : viewportIsMobile;
  const [scheduleTime, setScheduleTime] = useState(() => Date.now());
  const impressionSent = useRef(false);
  const showSlots = process.env.NEXT_PUBLIC_SHOW_AD_SLOTS !== "false";
  const anchorId = slotId ? "ad-slot-" + slotId : undefined;

  useEffect(() => {
    const now = Date.now();
    const nextBoundary = [content?.startAt, content?.endAt]
      .map((value) => value ? new Date(value).getTime() : 0)
      .filter((value) => Number.isFinite(value) && value > now)
      .sort((first, second) => first - second)[0];

    if (!nextBoundary) return;
    const timeout = window.setTimeout(
      () => setScheduleTime(Date.now()),
      Math.min(nextBoundary - now + 100, 2_147_000_000)
    );
    return () => window.clearTimeout(timeout);
  }, [content?.endAt, content?.startAt, scheduleTime]);

  const isLive = isAdSlotLive(content, new Date(scheduleTime));
  const creative = isMobile && content?.mobile?.content?.trim() ? content.mobile : content;

  useEffect(() => {
    if (!showPlaceholder && showSlots && isLive && creative?.content?.trim() && slotId && !impressionSent.current) {
      impressionSent.current = true;
      sendAdMetric(slotId, "impression");
    }
  }, [creative, isLive, showPlaceholder, showSlots, slotId]);

  if (!showSlots || (!isLive && !showPlaceholder) || (!creative?.content?.trim() && !showPlaceholder)) {
    return <span id={anchorId} className="block scroll-mt-36" aria-hidden />;
  }

  const align = content?.align === "left" || content?.align === "right" ? content.align : "center";
  const customStyle: React.CSSProperties = {};
  if (creative?.width) customStyle.width = convertToPx(creative.width);
  if (creative?.height) customStyle.height = convertToPx(creative.height);
  if (creative?.width || creative?.height) customStyle.maxWidth = "none";

  if (!creative?.content?.trim() && showPlaceholder) {
    return (
      <div id={anchorId} className={alignClasses[align] + " scroll-mt-36"}>
        <aside className={"flex min-h-[110px] w-full items-center justify-center rounded-md border-2 border-dashed border-primary/30 bg-primary-light/20 " + className}>
          <div className="p-4 text-center">
            <p className="text-sm font-bold text-primary">Reklam alanı boş</p>
            <p className="mt-1 text-xs text-muted">{slotId}</p>
          </div>
        </aside>
      </div>
    );
  }

  if (!creative) return null;

  return (
    <div id={anchorId} className={alignClasses[align] + " scroll-mt-36"}>
      <aside
        className={"relative overflow-hidden rounded-xl border border-border/70 bg-muted-bg/45 p-1 " + (!creative.width && !creative.height ? sizeStyles[size] : "") + " " + className}
        style={customStyle}
        aria-label="Reklam alanı"
        onClick={() => {
          if (!showPlaceholder && slotId && (creative.type === "html" || creative.href)) {
            sendAdMetric(slotId, "click");
          }
        }}
      >
        <span className="pointer-events-none absolute left-2 top-2 z-10 rounded bg-background/85 px-2 py-1 text-xs font-medium text-muted backdrop-blur-sm">
          Reklam
        </span>
        <div className="h-full w-full overflow-hidden rounded-lg">
          <AdCreative creative={creative} />
        </div>
      </aside>
    </div>
  );
}
