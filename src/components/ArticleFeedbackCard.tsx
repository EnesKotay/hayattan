"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/components/Toast/ToastProvider";
import type { FeedbackValue } from "@/lib/engagement";

type ArticleFeedbackCardProps = {
  articleId: string;
  title: string;
  initialUpCount: number;
  initialDownCount: number;
};

const STORAGE_PREFIX = "hayattan_article_feedback:";

export function ArticleFeedbackCard({
  articleId,
  title,
  initialUpCount,
  initialDownCount,
}: ArticleFeedbackCardProps) {
  const { addToast } = useToast();
  const [selected, setSelected] = useState<FeedbackValue | null>(null);
  const [upCount, setUpCount] = useState(initialUpCount);
  const [downCount, setDownCount] = useState(initialDownCount);
  const [isReady, setIsReady] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${articleId}`);
      if (raw === "up" || raw === "down") setSelected(raw);
    } finally {
      setIsReady(true);
    }
  }, [articleId]);

  const total = upCount + downCount;
  const upPercent = total > 0 ? Math.round((upCount / total) * 100) : 0;

  async function submitFeedback(value: FeedbackValue) {
    if (selected || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/engagement/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ articleId, value }),
      });

      if (!response.ok) throw new Error("Geri bildirim kaydedilemedi.");

      window.localStorage.setItem(`${STORAGE_PREFIX}${articleId}`, value);
      setSelected(value);
      if (value === "up") setUpCount((prev) => prev + 1);
      if (value === "down") setDownCount((prev) => prev + 1);
      addToast(`"${title}" için geri bildiriminiz alındı.`, "success");
    } catch {
      addToast("Geri bildirim kaydedilirken bir sorun oluştu.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-[28px] border border-border bg-muted-bg/35 p-6 sm:p-8" aria-label="Yazı geri bildirimi">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">Okur Geri Bildirimi</p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-foreground">Bu yazı işinize yaradı mı?</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            Kısa geri bildiriminiz editoryal yönü güçlendirir ve benzer içerikleri daha görünür kılmamıza yardımcı olur.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={!isReady || !!selected || isSubmitting}
            onClick={() => submitFeedback("up")}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition-colors ${
              selected === "up"
                ? "bg-primary text-white"
                : "border border-border bg-background text-foreground hover:border-primary hover:text-primary disabled:opacity-60"
            }`}
          >
            Faydalı Bulduğum
          </button>
          <button
            type="button"
            disabled={!isReady || !!selected || isSubmitting}
            onClick={() => submitFeedback("down")}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition-colors ${
              selected === "down"
                ? "bg-foreground text-background"
                : "border border-border bg-background text-foreground hover:border-foreground disabled:opacity-60"
            }`}
          >
            Daha İyi Olabilir
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <div className="h-3 overflow-hidden rounded-full bg-border">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${upPercent}%` }} />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted">
          <span>{upCount} olumlu geri bildirim</span>
          <span>{downCount} geliştirme sinyali</span>
        </div>
        {selected && (
          <p className="text-sm font-medium text-primary">
            Geri bildiriminiz kaydedildi. Teşekkür ederiz.
          </p>
        )}
      </div>
    </section>
  );
}
