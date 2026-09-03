"use client";

import Link from "next/link";
import { MobileMenu } from "./MobileMenu";
import { SearchWithSuggestions } from "./Search/SearchWithSuggestions";
import { ThemeSelector } from "./ThemeSelector";
import { Logo } from "./Logo";
import { NavDropdown } from "./NavDropdown";
import { usePathname } from "next/navigation";

type NavItem = { href: string; label: string };

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
  const navItems = propNavItems?.length ? propNavItems : defaultNavItems;
  const pathname = usePathname();
  const primaryItems = navItems;
  const moreItems: NavItem[] = [];
  const isActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/92 shadow-[0_8px_28px_-24px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      {/* Top row: Logo + Search + Theme */}
      <div className="border-b border-border/60 py-2.5">
        <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
          <div className="shrink-0">
            <Logo size="md" showTagline={false} centered={false} iconScale={0.9} />
          </div>

          {/* Desktop: search + theme */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="w-[240px] xl:w-[300px]">
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
        className="hidden lg:block"
        aria-label="Ana navigasyon"
      >
        <div className="container mx-auto px-4 md:px-6">
          <ul className="flex items-center justify-center gap-1 py-1">
            {primaryItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={`relative block whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive(item.href)
                      ? "bg-primary-light text-primary"
                      : "text-foreground/72 hover:bg-muted-bg hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            {moreItems.length > 0 && (
              <li className="ml-1">
                <NavDropdown label="Diğer" items={moreItems} active={moreItems.some((item) => isActive(item.href))} />
              </li>
            )}
          </ul>
        </div>
      </nav>
    </header>
  );
}
