"use client";

import Link from "next/link";
import { MobileMenu } from "./MobileMenu";
import { SearchWithSuggestions } from "./Search/SearchWithSuggestions";
import { ThemeSelector } from "./ThemeSelector";
import { Logo } from "./Logo";
import { getMenuItems } from "@/app/admin/actions";
import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

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

export function Header({ navItems: propNavItems }: { navItems?: NavItem[] }) {
  const [navItems, setNavItems] = useState<NavItem[]>(propNavItems || defaultNavItems);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    if (!propNavItems) {
      getMenuItems().then(items => setNavItems(items)).catch(() => { });
    }
  }, [propNavItems]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ease-in-out ${isScrolled ? "glass border-b border-primary/10 shadow-lg py-2" : "bg-background border-b border-border py-4"
        }`}
    >
      <div className="container relative mx-auto flex items-center justify-between px-4">
        <motion.div
          animate={{ scale: isScrolled ? 0.8 : 0.9 }}
          transition={{ duration: 0.4 }}
          className="flex-shrink-0"
        >
          <Logo size="md" showTagline={false} centered={false} iconScale={0.8} />
        </motion.div>

        <nav
          className="hidden lg:flex lg:items-center lg:gap-0.5 xl:gap-1 relative"
          aria-label="Ana navigasyon"
          onMouseLeave={() => setHoveredItem(null)}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHoveredItem(item.href)}
              className="group relative px-3 py-2 text-xs xl:text-sm font-bold uppercase tracking-[0.1em] text-foreground/80 transition-colors hover:text-primary whitespace-nowrap z-10"
            >
              <span className="relative z-10">{item.label}</span>
              {hoveredItem === item.href && (
                <motion.div
                  layoutId="nav-hover"
                  className="absolute inset-x-0 inset-y-1 z-0 rounded-full bg-primary/5 shadow-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30
                  }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* DateTime is now part of the right utilities for better spacing */}

        <div className="hidden md:flex md:items-center md:gap-4 xl:gap-8 justify-end">
          <div className="flex-1 min-w-[140px] xl:min-w-[180px]">
            <SearchWithSuggestions />
          </div>
          <div className="h-4 w-[1px] bg-border/60" />
          <ThemeSelector />
        </div>

        <div className="lg:hidden">
          <MobileMenu navItems={navItems} />
        </div>
      </div>
    </header>
  );
}
