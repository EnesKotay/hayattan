"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useToast } from "@/components/Toast/ToastProvider";

type AdminFeedbackProps = {
  initialSuccess?: string | null;
  initialDeleted?: string | null;
  initialError?: string | null;
};

function AdminFeedbackContent({
  initialSuccess = null,
  initialDeleted = null,
  initialError = null,
}: AdminFeedbackProps) {
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  // Sunucu ile aynı ilk render için server'dan gelen değerleri kullan
  const success = initialSuccess ?? searchParams.get("success");
  const deleted = initialDeleted ?? searchParams.get("deleted");
  const error = initialError ?? searchParams.get("error");

  useEffect(() => {
    // Mesaj yoksa hiçbir şey yapma
    if (!success && !deleted && !error) return;

    // Toast göster
    if (success === "1") {
      addToast("Kaydedildi. Değişiklikler sitede görünür.", "success");
    } else if (deleted === "1") {
      addToast("Silindi.", "warning");
    } else if (error) {
      addToast(`Hata: ${decodeURIComponent(error)}`, "error");
    }

    // URL'den parametreleri temizle (kullanıcıya temiz URL göstermek için)
    const t = setTimeout(() => {
      // Sadece parametreleri sil, sayfayı yenileme
      const url = new URL(window.location.href);
      if (url.searchParams.has("success") || url.searchParams.has("deleted") || url.searchParams.has("error")) {
        url.searchParams.delete("success");
        url.searchParams.delete("deleted");
        url.searchParams.delete("error");
        router.replace(url.pathname + url.search);
      }
    }, 500); // 100ms bazen çok hızlı olup toast'un görünmesini engelleyebilir (render cycle), 500ms daha güvenli

    return () => clearTimeout(t);
  }, [success, deleted, error, router, addToast]);

  return null;
}

export function AdminFeedback(props: AdminFeedbackProps) {
  return (
    <Suspense fallback={null}>
      <AdminFeedbackContent {...props} />
    </Suspense>
  );
}
