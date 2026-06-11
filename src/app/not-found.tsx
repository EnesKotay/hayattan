import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary" aria-hidden>
        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 className="mt-6 font-serif text-4xl font-bold text-foreground md:text-5xl">Sayfa bulunamadı</h1>
      <p className="mt-3 max-w-md text-center text-muted">
        Aradığınız sayfa kaldırılmış, taşınmış veya adresi yanlış olabilir.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="rounded-xl bg-primary px-6 py-3.5 font-semibold text-white shadow-md transition-colors hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Ana sayfaya dön
        </Link>
        <Link
          href="/yazilar"
          className="rounded-xl border border-border bg-background px-6 py-3.5 font-semibold text-foreground transition-colors hover:bg-muted-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Yazılar
        </Link>
        <Link
          href="/kategoriler"
          className="rounded-xl border border-border bg-background px-6 py-3.5 font-semibold text-foreground transition-colors hover:bg-muted-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          Kategoriler
        </Link>
      </div>
      <p className="mt-8 text-sm text-muted">
        Aradığınız içeriği bulmak için{" "}
        <Link href="/yazilar" className="font-medium text-primary hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          yazılar
        </Link>{" "}
        veya{" "}
        <Link href="/kategoriler" className="font-medium text-primary hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          kategoriler
        </Link>{" "}
        sayfasından arama yapabilirsiniz.
      </p>
    </div>
  );
}
