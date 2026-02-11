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

        <nav className="hidden lg:flex lg:items-center lg:gap-5 xl:gap-8" aria-label="Ana navigasyon">
          {navItems.map((item) => (
            <motion.div
              key={item.href}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Link
                href={item.href}
                className="group relative px-2 py-1 text-xs xl:text-sm font-bold tracking-tight text-foreground/70 transition-colors hover:text-primary whitespace-nowrap"
              >
                {item.label}
                <motion.span
                  className="absolute -bottom-1 left-0 h-0.5 bg-primary rounded-full shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </motion.div>
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
