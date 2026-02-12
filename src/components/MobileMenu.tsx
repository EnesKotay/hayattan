"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { SearchWithSuggestions } from "./Search/SearchWithSuggestions";
import { ThemeSelector } from "./ThemeSelector";
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

type NavItem = { href: string; label: string; icon?: React.ReactNode };

const defaultNavItems: NavItem[] = [
  { href: "/", label: "Ana Sayfa", icon: <HomeIcon className="w-5 h-5" /> },
  { href: "/yazarlar", label: "Yazarlar", icon: <UsersIcon className="w-5 h-5" /> },
  { href: "/yazilar", label: "Yazılar", icon: <DocumentTextIcon className="w-5 h-5" /> },
  { href: "/kategoriler", label: "Kategoriler", icon: <Squares2X2Icon className="w-5 h-5" /> },
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
  const navItems = propNavItems || defaultNavItems;

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
        className={`relative z-[60] flex h-12 w-12 items-center justify-center rounded-full transition-all duration-500 ${isOpen ? "bg-primary text-white shadow-[0_8px_24px_rgba(var(--primary-rgb),0.3)] rotate-180" : "bg-muted-bg/80 text-foreground hover:bg-muted-bg/60 border border-border/40"
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
              className="fixed inset-0 z-50 bg-background/60 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            />

            {/* Menü Paneli - Premium Design */}
            <motion.nav
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 32, stiffness: 280 }}
              className="fixed right-0 top-0 z-50 h-[100dvh] w-full max-w-[340px] bg-background/80 backdrop-blur-[32px] border-l border-white/10 p-6 flex flex-col shadow-[-20px_0_60px_rgba(0,0,0,0.15)] ring-1 ring-black/5"
              aria-label="Mobil navigasyon"
            >
              <div className="mt-16 flex flex-col flex-1 gap-10 overflow-y-auto scrollbar-hide py-4 px-1">
                {/* Logo or Title Placeholder in Menu */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3 mb-2"
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
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/70 ml-1">Keşfet</span>
                  <div className="relative group p-[1px] rounded-2xl bg-gradient-to-br from-primary/20 to-transparent">
                    <div className="bg-background/40 backdrop-blur-sm rounded-[15px] overflow-hidden">
                      <SearchWithSuggestions />
                    </div>
                  </div>
                </motion.div>

                {/* Navigasyon Linkleri - Staggered Entry */}
                <div className="flex flex-col gap-5">
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/70 ml-1"
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
                          className="group relative flex items-center gap-4 rounded-2xl px-4 py-3.5 text-[15px] font-bold text-foreground/80 transition-all hover:text-primary active:scale-[0.97]"
                        >
                          {/* Animated background on hover */}
                          <div className="absolute inset-0 rounded-2xl bg-primary/0 opacity-0 transition-all duration-300 group-hover:bg-primary/5 group-hover:opacity-100" />

                          <span className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-muted-bg/60 border border-border/40 group-hover:border-primary/20 group-hover:text-primary transition-all duration-300">
                            {item.icon || <ArrowRightIcon className="w-5 h-5" />}
                          </span>
                          <span className="relative flex-1 tracking-tight font-sans">{item.label}</span>
                          <ArrowRightIcon className="relative w-4 h-4 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-60 group-hover:translate-x-0 group-hover:text-primary" />
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Alt Bölüm: Tema & Sosyal Medya */}
                <div className="mt-auto pt-8 border-t border-border/20 space-y-10">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center justify-between px-2"
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted/60">Görünüm</span>
                      <span className="text-xs font-bold text-foreground/70">Karanlık / Aydınlık</span>
                    </div>
                    <ThemeSelector variant="inline" />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-col gap-5 pb-6"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted/60 ml-2">Sosyal Medya</span>
                    <div className="flex justify-between gap-3 px-1">
                      {socialLinks.map((social, i) => (
                        <motion.a
                          key={social.label}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.8 + i * 0.08, type: "spring", damping: 15 }}
                          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted-bg/40 border border-border/30 text-muted/80 transition-all duration-300 hover:bg-primary hover:text-white hover:border-primary hover:-translate-y-1.5 hover:shadow-[0_10px_20px_rgba(var(--primary-rgb),0.15)]"
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
