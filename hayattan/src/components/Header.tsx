"use client";

import Link from "next/link";
import { MobileMenu } from "./MobileMenu";
import { SearchWithSuggestions } from "./Search/SearchWithSuggestions";
import { ThemeSelector } from "./ThemeSelector";
import { Logo } from "./Logo";
import { DateTimeDisplay } from "./DateTimeDisplay";
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
          animate={{ scale: isScrolled ? 0.9 : 1 }}
          transition={{ duration: 0.4 }}
          className="flex-shrink-0"
        >
          <Logo size="md" showTagline={false} centered={false} />
        </motion.div>

        <nav
          className="hidden lg:flex lg:items-center lg:gap-1 xl:gap-2 relative"
          aria-label="Ana navigasyon"
          onMouseLeave={() => setHoveredItem(null)}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onMouseEnter={() => setHoveredItem(item.href)}
              className="group relative px-4 py-2 text-xs xl:text-sm font-extrabold uppercase tracking-[0.12em] text-foreground/70 transition-colors hover:text-primary whitespace-nowrap z-10"
            >
              <span className="relative z-10">{item.label}</span>
              {hoveredItem === item.href && (
                <motion.div
                  layoutId="nav-hover"
                  className="absolute inset-0 z-0 rounded-full bg-primary/5 shadow-[0_0_20px_rgba(var(--primary-rgb),0.03)]"
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
              {/* Subtle underline for active context - can be expanded later */}
              <motion.span
                className="absolute -bottom-1 left-4 right-4 h-0.5 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                layoutId={`underline-${item.href}`}
              />
            </Link>
          ))}
        </nav>

        <div className="hidden xl:flex flex-1 justify-center px-4">
          <DateTimeDisplay />
        </div>

        <div className="hidden md:flex md:items-center md:gap-3 lg:w-48 xl:w-72 justify-end">
          <div className="flex-1 max-w-[140px] xl:max-w-[180px]">
            <SearchWithSuggestions />
          </div>
          <div className="h-4 w-[1px] bg-border/60 mx-1" />
          <ThemeSelector />
        </div>

        <div className="lg:hidden">
          <MobileMenu navItems={navItems} />
        </div>
      </div>
    </header>
  );
}
