"use client";

import { useEffect, useState, Suspense } from "react";

export function ReadingProgress() {
  return (
    <Suspense fallback={null}>
      <ReadingProgressContent />
    </Suspense>
  );
}

function ReadingProgressContent() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const main = document.getElementById("main-content");
    if (!main) return;

    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      const total = scrollHeight - clientHeight;
      setProgress(total > 0 ? Math.min((scrollTop / total) * 100, 100) : 0);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (progress < 2) return null;

  return (
    <div
      className="fixed left-0 right-0 top-0 z-50 h-0.5 bg-primary/20"
      role="presentation"
    >
      <div
        className="h-full bg-primary transition-[width] duration-150"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}
