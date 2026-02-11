"use client";

import { ReactNode, useState, useRef } from "react";
import { ConfirmModal } from "./Modal";

export function DeleteConfirmButton({
  confirmMessage,
  confirmTitle = "Silme Onayı",
  children = "Sil",
  className,
}: {
  confirmMessage: string;
  confirmTitle?: string;
  children?: ReactNode;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function handleButtonClick(e: React.MouseEvent) {
    e.preventDefault();
    setIsOpen(true);
  }

  function handleConfirm() {
    setIsOpen(false);
    // Submit the parent form
    const form = (document.activeElement as any)?.form || formRef.current?.closest('form');
    if (form) {
      form.requestSubmit();
    } else {
      // Fallback if we can't find the form easily
      const closestForm = (document.querySelector('form:has(button:active)') || document.querySelector('form')) as HTMLFormElement | null;
      closestForm?.requestSubmit();
    }
  }

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={handleButtonClick}
      >
        {children}
      </button>

      <ConfirmModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title={confirmTitle}
        description={confirmMessage}
        confirmText="Evet, Sil"
        cancelText="Vazgeç"
        variant="danger"
      />
    </>
  );
}
