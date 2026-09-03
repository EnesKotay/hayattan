"use client";

import Link from "next/link";
import { useState, useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { SearchWithSuggestions } from "./Search/SearchWithSuggestions";
import { ThemeSelector } from "./ThemeSelector";
import { AccessibilityControls } from "./AccessibilityControls";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  Squares2X2Icon,
  EnvelopeIcon,
  InformationCircleIcon,
  ArchiveBoxIcon,
  ClockIcon,
  BookOpenIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

type NavItem = { href: string; label: string; icon?: ReactNode };

const defaultNavItems: NavItem[] = [
  { href: "/", label: "Ana Sayfa", icon: <HomeIcon className="w-5 h-5" /> },
  { href: "/yazarlar", label: "Yazarlar", icon: <UsersIcon className="w-5 h-5" /> },
  { href: "/misafir-yazarlar", label: "Misafir Yazıları", icon: <UsersIcon className="w-5 h-5" /> },
  { href: "/yazilar", label: "Yazılar", icon: <DocumentTextIcon className="w-5 h-5" /> },
  { href: "/kategoriler", label: "Kategoriler", icon: <Squares2X2Icon className="w-5 h-5" /> },
  { href: "/fotografhane", label: "Fotoğrafhane", icon: <BookOpenIcon className="w-5 h-5" /> },
  { href: "/iletisim", label: "İletişim", icon: <EnvelopeIcon className="w-5 h-5" /> },
  { href: "/hakkimizda", label: "Hakkımızda", icon: <InformationCircleIcon className="w-5 h-5" /> },
  { href: "/arsiv", label: "Arşiv", icon: <ArchiveBoxIcon className="w-5 h-5" /> },
  { href: "/eski-yazilar", label: "Eski Yazılar", icon: <ClockIcon className="w-5 h-5" /> },
  { href: "/bakis-dergisi", label: "Bakış Dergisi", icon: <BookOpenIcon className="w-5 h-5" /> },
];

const socialLinks = [
  {
    href: "https://www.facebook.com/Hayattan.Net2020",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    label: "Facebook"
  },
  {
    href: "https://twitter.com/HayattanNet",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    label: "Twitter"
  },
  {
    href: "https://www.instagram.com/hayattannet/",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    label: "Instagram"
  },
  {
    href: "https://www.youtube.com/channel/UCO44ksBz7R6TYV7fCA6u0Gw",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    label: "YouTube"
  },
];

export function MobileMenu({ navItems: propNavItems }: { navItems?: NavItem[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const navItems = propNavItems || defaultNavItems;
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  return (
    <div className="lg:hidden">
      {/* Menü Butonu */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative z-[60] flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${isOpen ? "border-primary bg-primary text-white" : "border-border bg-muted-bg/70 text-foreground hover:bg-muted-bg"
          }`}
        aria-label={isOpen ? "Menüyü kapat" : "Menüyü aç"}
        aria-expanded={isOpen}
      >
        <div className="relative h-6 w-6">
          <motion.span
            animate={isOpen ? { rotate: 45, y: 0, width: "1.25rem" } : { rotate: 0, y: -6, width: "1.5rem" }}
            className="absolute left-1/2 top-1/2 h-0.5 -translate-x-1/2 bg-current"
          />
          <motion.span
            animate={isOpen ? { opacity: 0, x: -20 } : { opacity: 1, x: "-50%" }}
            className="absolute left-1/2 top-1/2 h-0.5 w-6 bg-current"
          />
          <motion.span
            animate={isOpen ? { rotate: -45, y: 0, width: "1.25rem" } : { rotate: 0, y: 6, width: "1.5rem" }}
            className="absolute left-1/2 top-1/2 h-0.5 -translate-x-1/2 bg-current"
          />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay - Modern Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Menü Paneli - Premium Design */}
            <motion.nav
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="fixed right-0 top-0 z-50 flex h-[100dvh] w-full max-w-[360px] flex-col border-l border-border bg-background/96 p-5 shadow-premium-xl backdrop-blur-xl"
              aria-label="Mobil navigasyon"
            >
              <div className="mt-14 flex flex-1 flex-col gap-7 overflow-y-auto px-1 py-4 scrollbar-hide">
                {/* Logo or Title Placeholder in Menu */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-1 flex items-center gap-3"
                >
                  <div className="h-8 w-1 bg-primary rounded-full" />
                  <span className="font-serif text-xl font-bold tracking-tight text-foreground">Hayattan.Net</span>
                </motion.div>

                {/* Arama Bölümü - Premium Input Look */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="flex flex-col gap-4"
                >
                  <span className="ml-1 text-xs font-semibold text-muted">Keşfet</span>
                  <div className="relative rounded-xl">
                    <div className="overflow-hidden rounded-xl bg-background">
                      <SearchWithSuggestions />
                    </div>
                  </div>
                </motion.div>

                {/* Navigasyon Linkleri - Staggered Entry */}
                <div className="flex flex-col gap-3">
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="ml-1 text-xs font-semibold text-muted"
                  >
                    Menü
                  </motion.span>
                  <ul className="flex flex-col gap-2">
                    {navItems.map((item, i) => (
                      <motion.li
                        key={item.href}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.25 + i * 0.04, ease: [0.23, 1, 0.32, 1] }}
                      >
                        <Link
                          href={item.href}
                          prefetch={false}
                          onClick={() => setIsOpen(false)}
                          aria-current={isActive(item.href) ? "page" : undefined}
                          className={`group relative flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold ${isActive(item.href) ? "bg-primary-light text-primary" : "text-foreground/80 hover:bg-muted-bg hover:text-primary"}`}
                        >
                          <span className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background group-hover:border-primary/20 group-hover:text-primary">
                            {item.icon || <ArrowRightIcon className="w-5 h-5" />}
                          </span>
                          <span className="relative flex-1 font-sans">{item.label}</span>
                          <ArrowRightIcon className="relative h-4 w-4 text-muted group-hover:text-primary" />
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Alt Bölüm: Tema & Sosyal Medya */}
                <div className="mt-auto space-y-7 border-t border-border pt-6">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-4 px-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-semibold text-muted">Görünüm</span>
                        <span className="text-sm font-semibold text-foreground/70">Koyu / Açık</span>
                      </div>
                      <ThemeSelector variant="inline" />
                    </div>
                    <AccessibilityControls variant="inline" />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-col gap-5 pb-6"
                  >
                    <span className="ml-2 text-xs font-semibold text-muted">Sosyal medya</span>
                    <div className="flex justify-between gap-3 px-1">
                      {socialLinks.map((social, i) => (
                        <motion.a
                          key={social.label}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.45 + i * 0.04, duration: 0.16 }}
                          className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted-bg/50 text-muted hover:border-primary hover:bg-primary hover:text-white"
                          aria-label={social.label}
                        >
                          {social.icon}
                        </motion.a>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
