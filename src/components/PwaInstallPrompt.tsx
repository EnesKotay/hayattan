"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    // iOS tespiti (iOS Safari'de beforeinstallprompt olmadığı için özel yönlendirme yapılır)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone;

    if (isIosDevice && !isStandalone) {
      const hasDismissed = localStorage.getItem("pwa_ios_dismissed");
      if (!hasDismissed) {
        setIsIos(true);
        setShowPrompt(true);
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      const hasDismissed = localStorage.getItem("pwa_prompt_dismissed");
      if (!hasDismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  async function handleInstallClick() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setShowPrompt(false);
    if (isIos) {
      localStorage.setItem("pwa_ios_dismissed", "true");
    } else {
      localStorage.setItem("pwa_prompt_dismissed", "true");
    }
  }

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-fade-in-up">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-white p-4 shadow-xl ring-1 ring-black/5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-hover font-serif text-xl font-bold text-white shadow-md">
            H
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Hayattan.Net Uygulaması</h4>
            <p className="text-xs text-gray-600">
              {isIos
                ? 'Safari menüsünden "Ana Ekrana Ekle" diyerek telefonunuza yükleyin.'
                : "Hızlı erişim için telefonunuza yükleyin."}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!isIos && deferredPrompt && (
            <button
              type="button"
              onClick={handleInstallClick}
              className="rounded-lg bg-primary px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-primary-hover transition-colors"
            >
              Yükle
            </button>
          )}
          <button
            type="button"
            onClick={handleDismiss}
            className="rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
