"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef, startTransition } from "react";

type ThemeValue = "light" | "dark";

const OPTIONS: { value: ThemeValue; label: string; icon: React.ReactNode }[] = [
  {
    value: "light",
    label: "Açık",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    value: "dark",
    label: "Koyu",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    ),
  },
];

type ThemeSelectorProps = {
  variant?: "dropdown" | "inline";
};

export function ThemeSelector({ variant = "dropdown" }: ThemeSelectorProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  if (!mounted) {
    return <div className={variant === "inline" ? "flex gap-1" : "h-10 w-10 shrink-0"} aria-hidden />;
  }

  const current = (theme ?? "light") as ThemeValue;
  const effectiveDark = resolvedTheme === "dark";

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted-bg/50 p-1" role="group" aria-label="Tema seçimi">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => startTransition(() => setTheme(opt.value))}
            title={opt.label}
            aria-pressed={current === opt.value}
            className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
              current === opt.value ? "bg-background text-primary shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            {opt.icon}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Tema seçimi"
        className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-muted-bg hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        {effectiveDark ? OPTIONS[1].icon : OPTIONS[0].icon}
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Tema seçenekleri"
          className="absolute right-0 top-full z-50 mt-2 w-44 rounded-xl border border-border bg-background py-2 shadow-xl"
        >
          {OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="option"
              aria-selected={current === opt.value}
              onClick={() => {
                setTheme(opt.value);
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted-bg focus-visible:bg-muted-bg focus-visible:outline-none"
            >
              <span className="text-muted">{opt.icon}</span>
              <span className="flex-1 font-medium text-foreground">{opt.label}</span>
              {current === opt.value && (
                <svg className="h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
