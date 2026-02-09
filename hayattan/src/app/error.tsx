"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <h1 className="font-serif text-2xl font-bold text-foreground">
        Bir hata oluştu
      </h1>
      <p className="mt-4 text-center text-muted">
        İşleminiz şu an gerçekleştirilemedi. Lütfen tekrar deneyin veya ana sayfaya dönün.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-hover"
        >
          Tekrar dene
        </button>
        <Link
          href="/"
          className="rounded-lg border border-border bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted-bg"
        >
          Ana sayfa
        </Link>
      </div>
    </div>
  );
}
