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

import { motion, AnimatePresence } from "framer-motion";

export function MobileMenu({ navItems = defaultNavItems }: { navItems?: NavItem[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative z-50 flex h-10 w-10 items-center justify-center rounded-full transition-colors ${isOpen ? "text-primary" : "text-foreground hover:bg-muted-bg"
          }`}
        aria-label={isOpen ? "Menüyü kapat" : "Menüyü aç"}
        aria-expanded={isOpen}
      >
        <div className="relative h-6 w-6">
          <motion.span
            animate={isOpen ? { rotate: 45, y: 0 } : { rotate: 0, y: -6 }}
            className="absolute left-1/2 top-1/2 h-0.5 w-6 -translate-x-1/2 bg-current transition-transform"
          />
          <motion.span
            animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
            className="absolute left-1/2 top-1/2 h-0.5 w-6 -translate-x-1/2 bg-current transition-transform"
          />
          <motion.span
            animate={isOpen ? { rotate: -45, y: 0 } : { rotate: 0, y: 6 }}
            className="absolute left-1/2 top-1/2 h-0.5 w-6 -translate-x-1/2 bg-current transition-transform"
          />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 z-50 h-full w-[280px] border-l border-border bg-background p-6 shadow-2xl"
              aria-label="Mobil navigasyon"
            >
              <div className="mt-12 flex flex-col gap-8">
                <div className="flex flex-col gap-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted">Arama</span>
                  <SearchWithSuggestions />
                </div>

                <div className="flex flex-col gap-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted">Menü</span>
                  <ul className="flex flex-col gap-2">
                    {navItems.map((item, i) => (
                      <motion.li
                        key={item.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="block rounded-xl px-4 py-3 text-lg font-medium text-foreground transition-all hover:bg-primary-light hover:text-primary active:scale-95"
                        >
                          {item.label}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="mt-auto flex items-center justify-between border-t border-border pt-6">
                  <span className="text-sm font-medium text-muted">Tema</span>
                  <ThemeSelector variant="inline" />
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
