"use client";

import { useEffect, useRef } from "react";

/**
 * Yazı sayfası istemci tarafında yüklendiğinde bir kez view sayacını artırır.
 * React Strict Mode'da iki kez mount olmaması için ref kullanır.
 */
export function YaziViewTracker({ slug }: { slug: string }) {
  const sentRef = useRef(false);

  useEffect(() => {
    if (!slug || sentRef.current) return;
    sentRef.current = true;

    fetch(`/api/yazilar/${encodeURIComponent(slug)}/view`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).catch(() => {
      // Sessizce yoksay; sayfa kullanımı etkilenmesin
    });
  }, [slug]);

  return null;
}
