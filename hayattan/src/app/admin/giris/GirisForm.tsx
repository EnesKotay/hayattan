"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

export default function GirisForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);

    try {
      if (!requiresTwoFactor) {
        const challengeRes = await fetch("/api/auth/2fa/challenge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const challengeData = await challengeRes.json();
        if (!challengeRes.ok) {
          setError(challengeData?.error || "Giris dogrulanamadi.");
          setLoading(false);
          return;
        }

        if (challengeData?.requiresTwoFactor) {
          setRequiresTwoFactor(true);
          setChallengeToken(challengeData.challengeToken || "");
          setInfo("Dogrulama kodu e-posta adresinize gonderildi.");
          setLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        twoFactorCode: requiresTwoFactor ? twoFactorCode : undefined,
        challengeToken: requiresTwoFactor ? challengeToken : undefined,
        redirect: false,
      });

      setLoading(false);

      if (result?.error) {
        setError(
          requiresTwoFactor
            ? "Dogrulama kodu gecersiz veya suresi dolmus."
            : "E-posta veya sifre hatali. Lutfen tekrar deneyin."
        );
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setLoading(false);
      setError("Beklenmeyen bir hata olustu.");
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#e5e5dc] bg-white p-8 shadow-lg">
        <h1 className="font-serif text-2xl font-bold text-foreground">Yonetim paneline giris</h1>
        <p className="mt-2 text-sm text-muted">
          E-posta ve sifrenizi girin. 2FA aktifse giris kodu ikinci adimda istenir.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {info && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {info}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              E-posta adresiniz
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={requiresTwoFactor}
              placeholder="ornek@email.com"
              className="mt-1.5 w-full rounded-lg border border-[#ddd] px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-50"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Sifreniz
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={requiresTwoFactor}
              placeholder="********"
              className="mt-1.5 w-full rounded-lg border border-[#ddd] px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-50"
            />
          </div>

          {requiresTwoFactor && (
            <div>
              <label htmlFor="twoFactorCode" className="block text-sm font-medium text-foreground">
                Dogrulama kodu
              </label>
              <input
                id="twoFactorCode"
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                required
                inputMode="numeric"
                maxLength={6}
                placeholder="6 haneli kod"
                className="mt-1.5 w-full rounded-lg border border-[#ddd] px-4 py-2.5 tracking-[0.3em] text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (requiresTwoFactor && twoFactorCode.length !== 6)}
            className="w-full rounded-lg bg-primary py-3 font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
          >
            {loading
              ? "Kontrol ediliyor..."
              : requiresTwoFactor
                ? "Kodu dogrula ve giris yap"
                : "Giris yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
