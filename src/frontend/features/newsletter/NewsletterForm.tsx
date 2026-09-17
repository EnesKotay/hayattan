"use client";

import { useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "warning" | "error">("idle");
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
        setStatus(data.emailSent ? "success" : "warning");
        setMessage(data.message ?? data.warning ?? "Aboneliğiniz kaydedildi.");
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
      <h3 className="mb-2 font-serif text-lg font-bold tracking-tight">Bülten</h3>
      <p className="mb-4 text-sm leading-relaxed text-muted">
        Yeni yazılarımızdan haberdar olmak için abone olun.
      </p>
      {status === "success" || status === "warning" ? (
        <p className={"rounded-lg px-4 py-3 text-sm " + (status === "success" ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-amber-500/10 text-amber-700 dark:text-amber-400")}>
          {message}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-posta adresiniz"
            required
            className="min-h-11 w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="min-h-11 shrink-0 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {status === "loading" ? "Kaydediliyor..." : "Abone Ol"}
          </button>
          {status === "error" && (
            <p className="text-[13px] text-red-500 sm:col-span-2">{message}</p>
          )}
        </form>
      )}
    </div>
  );
}
