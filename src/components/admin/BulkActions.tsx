"use client";

import { useState, useTransition } from "react";
import { bulkUpdateYazilar } from "@/app/admin/actions";
import { useToast } from "@/components/admin/ToastProvider";

type BulkAction = "yayinla" | "taslak" | "sil";

interface BulkActionsProps {
  selectedIds: string[];
  onComplete: () => void;
}

export function BulkActions({ selectedIds, onComplete }: BulkActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null);
  const { success, error: showError } = useToast();

  if (selectedIds.length === 0) return null;

  const ACTION_LABELS: Record<BulkAction, { label: string; confirm: string; color: string }> = {
    yayinla: {
      label: "Yayınla",
      confirm: `${selectedIds.length} yazıyı yayınlamak istediğinize emin misiniz?`,
      color: "bg-green-600 hover:bg-green-700",
    },
    taslak: {
      label: "Taslağa Al",
      confirm: `${selectedIds.length} yazıyı taslağa almak istediğinize emin misiniz?`,
      color: "bg-amber-600 hover:bg-amber-700",
    },
    sil: {
      label: "Sil",
      confirm: `${selectedIds.length} yazıyı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.`,
      color: "bg-red-600 hover:bg-red-700",
    },
  };

  function handleAction(action: BulkAction) {
    if (action === "sil") {
      setConfirmAction(action);
      return;
    }
    executeAction(action);
  }

  function executeAction(action: BulkAction) {
    setConfirmAction(null);
    startTransition(async () => {
      try {
        const result = await bulkUpdateYazilar(selectedIds, action);
        if (result.success) {
          success(
            "İşlem tamamlandı",
            `${result.count} yazı ${action === "yayinla" ? "yayınlandı" : action === "taslak" ? "taslağa alındı" : "silindi"}.`
          );
          onComplete();
        } else {
          showError("Hata", result.error ?? "Bir sorun oluştu.");
        }
      } catch {
        showError("Hata", "İşlem gerçekleştirilemedi.");
      }
    });
  }

  return (
    <>
      <div className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 shadow-sm animate-fade-in-up">
        <span className="text-sm font-semibold text-primary">
          {selectedIds.length} yazı seçili
        </span>
        <div className="h-4 w-px bg-primary/20" />
        <div className="flex items-center gap-2">
          {(Object.keys(ACTION_LABELS) as BulkAction[]).map((action) => (
            <button
              key={action}
              type="button"
              disabled={isPending}
              onClick={() => handleAction(action)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all disabled:opacity-50 ${ACTION_LABELS[action].color}`}
            >
              {isPending ? (
                <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : null}
              {ACTION_LABELS[action].label}
            </button>
          ))}
        </div>
      </div>

      {/* Silme Onay Modalı */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-bold text-gray-900">
              {ACTION_LABELS[confirmAction].label}
            </h3>
            <p className="mb-6 text-sm text-gray-600">
              {ACTION_LABELS[confirmAction].confirm}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={() => executeAction(confirmAction)}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold text-white ${ACTION_LABELS[confirmAction].color}`}
              >
                Evet, {ACTION_LABELS[confirmAction].label}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
