"use client";

import Link from "next/link";
import { MobileMenu } from "./MobileMenu";
import { SearchWithSuggestions } from "./Search/SearchWithSuggestions";
import { ThemeSelector } from "./ThemeSelector";
import { Logo } from "./Logo";
import { getMenuItems } from "@/app/admin/actions";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type NavItem = { href: string; label: string; icon?: any };

const defaultNavItems: NavItem[] = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/yazarlar", label: "Yazarlar" },
  { href: "/misafir-yazarlar", label: "Misafir Yazıları" },
  { href: "/yazilar", label: "Yazılar" },
  { href: "/kategoriler", label: "Kategoriler" },
  { href: "/fotografhane", label: "Fotoğrafhane" },
  { href: "/iletisim", label: "İletişim" },
  { href: "/arsiv", label: "Arşiv" },
  { href: "/eski-yazilar", label: "Eski Yazılar" },
  { href: "/bakis-dergisi", label: "Bakış Dergisi" },
  { href: "/hakkimizda", label: "Hakkımızda" },
];

export function Header({ navItems: propNavItems }: { navItems?: NavItem[] }) {
  const [navItems, setNavItems] = useState<NavItem[]>(propNavItems || defaultNavItems);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    if (!propNavItems) {
      getMenuItems().then(items => {
        if (items && items.length > 0) setNavItems(items);
      }).catch(() => { });
    }
  }, [propNavItems]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ease-in-out ${
        isScrolled
          ? "backdrop-blur-md bg-background/85 shadow-[0_4px_20px_rgba(0,0,0,0.07)]"
          : "bg-background"
      }`}
    >
      {/* Top row: Logo + Search + Theme */}
      <div className={`border-b border-border/50 transition-all duration-300 ${isScrolled ? "py-2" : "py-3"}`}>
        <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
          <motion.div
            animate={{ scale: isScrolled ? 0.9 : 1 }}
            transition={{ duration: 0.35, ease: "circOut" }}
            className="flex-shrink-0"
          >
            <Logo size="md" showTagline={false} centered={false} iconScale={isScrolled ? 0.85 : 0.95} />
          </motion.div>

          {/* Desktop: search + theme */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="w-[220px] xl:w-[260px]">
              <SearchWithSuggestions />
            </div>
            <div className="h-5 w-px bg-border/40" />
            <ThemeSelector />
          </div>

          {/* Tablet (md–lg): search + theme + hamburger */}
          <div className="hidden md:flex lg:hidden items-center gap-3">
            <div className="w-[180px]">
              <SearchWithSuggestions />
            </div>
            <ThemeSelector />
            <MobileMenu navItems={navItems} />
          </div>

          {/* Mobile (< md): theme + hamburger */}
          <div className="flex md:hidden items-center gap-3">
            <ThemeSelector />
            <MobileMenu navItems={navItems} />
          </div>
        </div>
      </div>

      {/* Bottom row: Nav links (lg+ only) */}
      <nav
        className="hidden lg:block border-b border-border/30"
        aria-label="Ana navigasyon"
        onMouseLeave={() => setHoveredItem(null)}
      >
        <div className="container mx-auto px-4 md:px-6">
          <ul className="flex items-center justify-center">
            {navItems.map((item, index) => (
              <li key={item.href} className="flex items-center">
                {index > 0 && (
                  <span className="text-border/60 text-[10px] select-none mx-0.5">·</span>
                )}
                <Link
                  href={item.href}
                  prefetch={false}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  className="relative px-2.5 xl:px-3 py-2.5 text-[11px] xl:text-[12.5px] font-bold uppercase tracking-[0.07em] text-foreground/70 hover:text-primary transition-colors whitespace-nowrap block"
                >
                  {item.label}
                  {hoveredItem === item.href && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-1 left-1 right-1 h-[2px] bg-primary rounded-full"
                      initial={{ opacity: 0, scaleX: 0.5 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );
}
