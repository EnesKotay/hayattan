"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage("Abone oldunuz! Yeni yazılarımızdan haberdar olacaksınız.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Bir hata oluştu.");
      }
    } catch {
      setStatus("error");
      setMessage("Bağlantı hatası. Lütfen tekrar deneyin.");
    }
  }

  return (
    <div>
      <h3 className="mb-4 font-serif text-xl font-bold tracking-tight">Bülten</h3>
      <p className="mb-4 text-sm text-muted/80">
        Yeni yazılarımızdan haberdar olmak için abone olun.
      </p>
      {status === "success" ? (
        <p className="rounded-lg bg-green-500/10 px-4 py-3 text-sm text-green-600 dark:text-green-400">
          {message}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-posta adresiniz"
            required
            className="w-full rounded-lg border border-border bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {status === "loading" ? "Kaydediliyor..." : "Abone Ol"}
          </button>
          {status === "error" && (
            <p className="text-xs text-red-500">{message}</p>
          )}
        </form>
      )}
    </div>
  );
}
