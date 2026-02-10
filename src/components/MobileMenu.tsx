"use client";

import Link from "next/link";
import { useState } from "react";
import { SearchWithSuggestions } from "./Search/SearchWithSuggestions";
import { ThemeSelector } from "./ThemeSelector";

type NavItem = { href: string; label: string };

const defaultNavItems: NavItem[] = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/yazarlar", label: "Yazarlar" },
  { href: "/yazilar", label: "Yazılar" },
  { href: "/kategoriler", label: "Kategoriler" },
  { href: "/iletisim", label: "İletişim" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/arsiv", label: "Arşiv" },
  { href: "/eski-yazilar", label: "Eski Yazılar" },
  { href: "/bakis-dergisi", label: "Bakış Dergisi" },
];

export function MobileMenu({ navItems = defaultNavItems }: { navItems?: NavItem[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded p-2 text-foreground hover:bg-muted-bg"
        aria-label={isOpen ? "Menüyü kapat" : "Menüyü aç"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" x2="6" y1="6" y2="18" />
            <line x1="6" x2="18" y1="6" y2="18" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
            role="button"
            tabIndex={-1}
            aria-label="Menüyü kapat"
          />
          <nav
            className="absolute right-4 top-16 z-50 w-[calc(100%-2rem)] max-w-sm rounded-xl border border-border bg-background p-4 shadow-xl"
            aria-label="Mobil navigasyon"
          >
            <div className="mb-4 flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <SearchWithSuggestions />
              </div>
              <ThemeSelector variant="inline" />
            </div>
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="block rounded-lg px-4 py-3.5 text-foreground hover:bg-muted-bg hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </div>
  );
}
