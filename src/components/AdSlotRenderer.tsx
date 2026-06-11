"use client";

import { useEffect, useRef } from "react";

/** Reklam HTML'ini (AdSense vb.) render eder; script etiketlerini çalıştırır */
export function AdSlotRenderer({ html }: { html: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !html) return;

    el.innerHTML = html;
    const scripts = el.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      if (oldScript.textContent) newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [html]);

  return <div ref={containerRef} className="min-h-[50px] w-full" />;
}
