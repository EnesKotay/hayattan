"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { SearchWithSuggestions } from "./Search/SearchWithSuggestions";
import { ThemeSelector } from "./ThemeSelector";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Users,
  FileText,
  Grid,
  Mail,
  Info,
  Archive,
  History,
  BookOpen,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ArrowRight
} from "lucide-react";

type NavItem = { href: string; label: string; icon?: React.ReactNode };

const defaultNavItems: NavItem[] = [
  { href: "/", label: "Ana Sayfa", icon: <Home className="w-5 h-5" /> },
  { href: "/yazarlar", label: "Yazarlar", icon: <Users className="w-5 h-5" /> },
  { href: "/yazilar", label: "Yazılar", icon: <FileText className="w-5 h-5" /> },
  { href: "/kategoriler", label: "Kategoriler", icon: <Grid className="w-5 h-5" /> },
  { href: "/iletisim", label: "İletişim", icon: <Mail className="w-5 h-5" /> },
  { href: "/hakkimizda", label: "Hakkımızda", icon: <Info className="w-5 h-5" /> },
  { href: "/arsiv", label: "Arşiv", icon: <Archive className="w-5 h-5" /> },
  { href: "/eski-yazilar", label: "Eski Yazılar", icon: <History className="w-5 h-5" /> },
  { href: "/bakis-dergisi", label: "Bakış Dergisi", icon: <BookOpen className="w-5 h-5" /> },
];

const socialLinks = [
  { href: "https://www.facebook.com/Hayattan.Net2020", icon: <Facebook className="w-5 h-5" />, label: "Facebook" },
  { href: "https://twitter.com/HayattanNet", icon: <Twitter className="w-5 h-5" />, label: "Twitter" },
  { href: "https://www.instagram.com/hayattannet/", icon: <Instagram className="w-5 h-5" />, label: "Instagram" },
  { href: "https://www.youtube.com/channel/UCO44ksBz7R6TYV7fCA6u0Gw", icon: <Youtube className="w-5 h-5" />, label: "YouTube" },
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
        className={`relative z-[60] flex h-12 w-12 items-center justify-center rounded-full transition-all duration-500 ${isOpen ? "bg-primary text-white shadow-lg rotate-180" : "bg-muted-bg text-foreground hover:bg-muted-bg/80"
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
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            />

            {/* Menü Paneli */}
            <motion.nav
              initial={{ x: "100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.5 }}
              transition={{ type: "spring", damping: 35, stiffness: 350 }}
              className="fixed right-0 top-0 z-50 h-[100dvh] w-full max-w-[300px] bg-background/95 backdrop-blur-2xl border-l border-primary/5 p-6 flex flex-col shadow-[-10px_0_40px_rgba(0,0,0,0.1)]"
              aria-label="Mobil navigasyon"
            >
              <div className="mt-16 flex flex-col flex-1 gap-8 overflow-y-auto scrollbar-hide py-4">


                {/* Arama Bölümü */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col gap-4"
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Arama</span>
                  <div className="relative group">
                    <SearchWithSuggestions />
                  </div>
                </motion.div>

                {/* Navigasyon Linkleri */}
                <div className="flex flex-col gap-4">
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary"
                  >
                    Menü
                  </motion.span>
                  <ul className="flex flex-col gap-1.5">
                    {navItems.map((item, i) => (
                      <motion.li
                        key={item.href}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + i * 0.04, ease: "easeOut" }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className="group flex items-center gap-4 rounded-2xl px-4 py-3 text-base font-semibold text-foreground/80 transition-all hover:bg-primary hover:text-white active:scale-95"
                        >
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted-bg group-hover:bg-white/20 group-hover:text-white transition-colors">
                            {item.icon || <ArrowRight className="w-5 h-5" />}
                          </span>
                          <span className="flex-1 tracking-tight">{item.label}</span>
                          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                {/* Alt Bölüm: Tema & Sosyal Medya */}
                <div className="mt-auto pt-8 border-t border-border/40 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Görünüm</span>
                      <span className="text-sm font-semibold">Koyu / Açık</span>
                    </div>
                    <ThemeSelector variant="inline" />
                  </div>

                  <div className="flex flex-col gap-4 pb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted">Sosyal Medya</span>
                    <div className="flex gap-4">
                      {socialLinks.map((social, i) => (
                        <motion.a
                          key={social.label}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.6 + i * 0.1, type: "spring" }}
                          className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted-bg text-muted transition-all hover:bg-primary hover:text-white hover:-translate-y-1"
                          aria-label={social.label}
                        >
                          {social.icon}
                        </motion.a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
