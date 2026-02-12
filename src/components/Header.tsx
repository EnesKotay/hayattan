"use client";

import Link from "next/link";

import { MobileMenu } from "./MobileMenu";
import { SearchWithSuggestions } from "./Search/SearchWithSuggestions";
import { ThemeSelector } from "./ThemeSelector";
import { Logo } from "./Logo";
import { getMenuItems } from "@/app/admin/actions";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  HomeIcon,
  UsersIcon,
  DocumentTextIcon,
  Squares2X2Icon,
  EnvelopeIcon,
  InformationCircleIcon,
  ArchiveBoxIcon,
  ClockIcon,
  PhotoIcon,
  UserPlusIcon,
  BookOpenIcon
} from "@heroicons/react/24/outline";

type NavItem = { href: string; label: string; icon?: any };

const defaultNavItems: NavItem[] = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/yazarlar", label: "Yazarlar" },
  { href: "/yazilar", label: "Yazılar" },
  { href: "/kategoriler", label: "Kategoriler" },
  { href: "/bakis-dergisi", label: "Bakış Dergisi" },
  { href: "/iletisim", label: "İletişim", icon: EnvelopeIcon },
  { href: "/hakkimizda", label: "Hakkımızda", icon: InformationCircleIcon },
  { href: "/arsiv", label: "Arşiv", icon: ArchiveBoxIcon },
  { href: "/eski-yazilar", label: "Eski Yazılar", icon: ClockIcon },
  { href: "/fotografhane", label: "Fotoğrafhane", icon: PhotoIcon },
  { href: "/misafir-yazarlar", label: "Misafir Yazıları", icon: UserPlusIcon },
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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-500 ease-in-out ${isScrolled
        ? "backdrop-blur-md bg-background/80 border-b border-primary/10 shadow-[0_8px_32px_rgba(0,0,0,0.05)] py-2"
        : "bg-background border-b border-border/50 py-4"
        }`}
    >
      <div className="container relative mx-auto flex items-center justify-between px-4">
        <motion.div
          animate={{ scale: isScrolled ? 0.85 : 1 }}
          transition={{ duration: 0.4, ease: "circOut" }}
          className="flex-shrink-0"
        >
          <Logo size="md" showTagline={false} centered={false} iconScale={isScrolled ? 0.8 : 0.9} />
        </motion.div>

        <nav
          className="hidden lg:flex lg:items-center lg:gap-1 xl:gap-2 relative ml-8"
          aria-label="Ana navigasyon"
          onMouseLeave={() => setHoveredItem(null)}
        >
          <div className="flex items-center">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                onMouseEnter={() => setHoveredItem(item.href)}
                className="group relative px-2 py-2 text-[11px] xl:text-[13px] font-bold uppercase tracking-[0.05em] text-foreground/80 transition-colors hover:text-primary whitespace-nowrap z-10"
              >
                <span className="relative z-10">{item.label}</span>
                {hoveredItem === item.href && (
                  <motion.div
                    layoutId="nav-hover"
                    className="absolute inset-x-0 inset-y-1 z-0 rounded-full bg-primary/5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>
        </nav>

        <div className="hidden md:flex md:items-center md:gap-4 xl:gap-6 justify-end flex-1 max-w-md ml-auto">
          <div className="w-full max-w-[200px] xl:max-w-[240px] opacity-90 hover:opacity-100 transition-opacity">
            <SearchWithSuggestions />
          </div>
          <div className="h-6 w-px bg-border/40" />
          <ThemeSelector />
        </div>

        <div className="lg:hidden flex items-center gap-3">
          <ThemeSelector />
          <MobileMenu navItems={navItems} />
        </div>
      </div>
    </header>
  );
}
