"use client";

import { useEffect } from "react";
import type { ReaderEvent } from "@/shared/engagement/reader-metrics";

/** Per-tab, per-article events; only aggregate counts leave the browser. */
export function ReaderTracker({ articleId, readingMinutes }: { articleId: string; readingMinutes: number }) {
  useEffect(() => {
    const storageKey = `reader:v1:${articleId}`;
    let sent = new Set<ReaderEvent>();
    try { sent = new Set(JSON.parse(sessionStorage.getItem(storageKey) ?? "[]")); } catch { /* Storage may be disabled. */ }
    const pending = new Set<ReaderEvent>();
    let activeSeconds = 0;
    let deepest = 0;
    let inFlight = false;
    let retryAt = 0;
    let disposed = false;
    const queue = (event: ReaderEvent) => { if (!sent.has(event)) pending.add(event); };
    const flush = async () => {
      if (inFlight || pending.size === 0 || Date.now() < retryAt) return;
      inFlight = true;
      const events = [...pending];
      events.forEach(event => pending.delete(event));
      try {
        const response = await fetch("/api/engagement/reader", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ articleId, events }), keepalive: true,
        });
        if (!response.ok) throw new Error("Metric rejected");
        events.forEach(event => { sent.add(event); pending.delete(event); });
        try { sessionStorage.setItem(storageKey, JSON.stringify([...sent])); } catch { /* Optional storage. */ }
      } catch { events.forEach(event => pending.add(event)); retryAt = Date.now() + 30000; }
      finally { inFlight = false; if (disposed && pending.size && events.some(event => sent.has(event))) void flush(); }
    };
    const sample = () => {
      if (document.visibilityState !== "visible") return;
      queue("start");
      const content = document.getElementById("article-body");
      if (!content) return;
      const rect = content.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        activeSeconds += 1;
        deepest = Math.max(deepest, Math.min(1, Math.max(0, (window.innerHeight - rect.top) / Math.max(1, rect.height))));
      }
      if (activeSeconds >= 3) {
        if (deepest >= .25) queue("depth25");
        if (deepest >= .5) queue("depth50");
        if (deepest >= .75) queue("depth75");
      }
      if (deepest >= .95 && activeSeconds >= Math.min(60, Math.max(10, readingMinutes * 15))) queue("complete");
      document.querySelectorAll<HTMLElement>("[data-recommendation-group]").forEach(group => {
        const rect = group.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) queue(group.dataset.recommendationGroup === "topic" ? "topic_view" : "author_view");
      });
      void flush();
    };
    const click = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLElement>("a[data-recommendation]");
      if (!link || (event.type === "auxclick" && event.button !== 1)) return;
      queue("start");
      const group = link.dataset.recommendation;
      queue(group === "topic" ? "topic_view" : "author_view");
      queue(group === "topic" ? "topic_click" : "author_click");
      void flush();
    };
    const hide = () => { if (document.visibilityState === "hidden") void flush(); };
    const timer = window.setInterval(sample, 1000);
    document.addEventListener("click", click);
    document.addEventListener("auxclick", click);
    document.addEventListener("visibilitychange", hide);
    return () => {
      disposed = true;
      clearInterval(timer);
      document.removeEventListener("click", click);
      document.removeEventListener("auxclick", click);
      document.removeEventListener("visibilitychange", hide);
      void flush();
    };
  }, [articleId, readingMinutes]);
  return null;
}
