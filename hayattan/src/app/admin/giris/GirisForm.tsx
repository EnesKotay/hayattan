"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function GirisForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";
  const resetSuccess = searchParams.get("resetSuccess");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("E-posta veya şifre hatalı. Lütfen tekrar deneyin.");
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#e5e5dc] bg-white p-8 shadow-lg">
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Yönetim paneline giriş
        </h1>
        <p className="mt-2 text-sm text-muted">
          Site içeriklerini yönetmek için e-posta ve şifrenizi girin. Giriş yaptıktan sonra yazı, yazar ve kategori ekleyebilir veya düzenleyebilirsiniz.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
          {resetSuccess && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
              Şifreniz başarıyla sıfırlandı. Yeni şifrenizle giriş yapabilirsiniz.
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground"
            >
              E-posta adresiniz
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ornek@email.com"
              className="mt-1.5 w-full rounded-lg border border-[#ddd] px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-foreground"
            >
              Şifreniz
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-lg border border-[#ddd] px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="mt-2 text-right">
              <Link
                href="/admin/giris/sifremi-unuttum"
                className="text-xs font-medium text-primary hover:underline"
              >
                Şifremi unuttum
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-3 font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {loading ? "Giriş yapılıyor..." : "Giriş yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
