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

  useEffect(() => {
    if (!propNavItems) {
      getMenuItems().then(items => setNavItems(items)).catch(() => { });
    }
  }, [propNavItems]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? "glass h-14" : "bg-background h-16 border-b border-border"
        }`}
    >
      <div className="container relative mx-auto flex h-full items-center justify-between px-4">
        <div className="flex-shrink-0 transition-transform duration-300 transform"
          style={{ scale: isScrolled ? 0.9 : 1 }}>
          <Logo size="md" showTagline={false} centered={false} />
        </div>

        <nav className="hidden lg:flex lg:items-center lg:gap-8" aria-label="Ana navigasyon">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative py-2 text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              {item.label}
              <span className="absolute bottom-0 left-0 h-0.5 w-0 bg-primary transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex md:items-center md:gap-3 md:w-72 justify-end">
          <SearchWithSuggestions />
          <div className="h-6 w-[1px] bg-border mx-1" />
          <ThemeSelector />
        </div>

        <div className="lg:hidden">
          <MobileMenu navItems={navItems} />
        </div>
      </div>
    </header>
  );
}
