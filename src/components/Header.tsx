import Link from "next/link";
import { MobileMenu } from "./MobileMenu";
import { SearchWithSuggestions } from "./Search/SearchWithSuggestions";
import { ThemeSelector } from "./ThemeSelector";
import { Logo } from "./Logo";

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

export function Header({ navItems = defaultNavItems }: { navItems?: NavItem[] }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container relative mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex-shrink-0">
          <Logo size="md" showTagline={false} centered={false} />
        </div>


        <nav className="hidden md:flex md:items-center md:gap-6" aria-label="Ana navigasyon">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex md:items-center md:gap-2 md:w-64">
          <SearchWithSuggestions />
          <ThemeSelector />
        </div>

        <MobileMenu navItems={navItems} />
      </div>
    </header>
  );
}
