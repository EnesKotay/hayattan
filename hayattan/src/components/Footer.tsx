import Link from "next/link";

const footerLinks = [
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

const socialLinks = [
  { href: "https://www.facebook.com/Hayattan.Net2020", label: "Facebook" },
  { href: "https://twitter.com/HayattanNet", label: "Twitter" },
  {
    href: "https://www.youtube.com/channel/UCO44ksBz7R6TYV7fCA6u0Gw",
    label: "YouTube",
  },
  { href: "https://www.instagram.com/hayattannet/", label: "Instagram" },
];

// ... (existing imports)

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-background pt-20 pb-10 text-foreground overflow-hidden">
      {/* Decorative gradient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="container mx-auto px-4">
        <div className="grid gap-12 md:grid-cols-3 lg:gap-24">
          {/* Kolon 1: Marka & Hakkında */}
          <div className="flex flex-col gap-6">
            <Link
              href="/"
              className="font-serif text-3xl font-bold tracking-tight text-primary hover:opacity-80 transition-opacity"
            >
              Hayattan.Net
            </Link>
            <p className="text-base leading-relaxed text-muted/80 font-sans">
              Hayatın içinden, engelsiz ve samimi haber platformu.
              Güncel gelişmeler, köşe yazıları ve kültürel içerikler ile hayatın tam kalbindeyiz.
            </p>
            <div className="flex gap-5 mt-2">
              {socialLinks.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-muted-bg text-muted transition-all hover:bg-primary hover:text-white hover:-translate-y-1 shadow-sm"
                  aria-label={item.label}
                >
                  <SocialIcon name={item.label} />
                </a>
              ))}
            </div>
          </div>

          {/* Kolon 2: Hızlı Erişim */}
          <div>
            <h3 className="mb-8 font-serif text-xl font-bold tracking-tight">Hızlı Erişim</h3>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-4">
              {footerLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group relative text-sm font-medium text-muted transition-colors hover:text-primary"
                  >
                    {item.label}
                    <span className="absolute -bottom-1 left-0 h-px w-0 bg-primary transition-all group-hover:w-full" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Kolon 3: İletişim */}
          <div>
            <h3 className="mb-8 font-serif text-xl font-bold tracking-tight">İletişim</h3>
            <ul className="space-y-6 text-sm text-muted">
              <li className="flex items-start gap-4 p-4 rounded-2xl bg-muted-bg/50 border border-border/40 transition-colors hover:bg-muted-bg">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">E-Posta</span>
                  <span className="text-foreground font-medium">hayattannet2@gmail.com</span>
                </div>
              </li>
              <li className="flex items-start gap-4 p-4 rounded-2xl bg-muted-bg/50 border border-border/40 transition-colors hover:bg-muted-bg">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Konum</span>
                  <span className="text-foreground font-medium">Kayseri, Türkiye</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 border-t border-border/60 pt-10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-muted/60">
          <p>© {new Date().getFullYear()} Hayattan.Net. Tüm hakları saklıdır.</p>
          <div className="flex gap-8">
            <Link href="/gizlilik" className="hover:text-primary transition-colors">Gizlilik Politikası</Link>
            <Link href="/kullanim-sartlari" className="hover:text-primary transition-colors">Kullanım Şartları</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ name }: { name: string }) {
  const size = 20;
  switch (name) {
    case "Facebook":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case "Twitter":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "YouTube":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case "Instagram":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
        </svg>
      );
    default:
      return null;
  }
}
