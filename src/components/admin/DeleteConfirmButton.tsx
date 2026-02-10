"use client";

import { ReactNode } from "react";

export function DeleteConfirmButton({
  confirmMessage,
  children = "Sil",
  className,
}: {
  confirmMessage: string;
  children?: ReactNode;
  className?: string;
}) {
  function handleClick(e: React.MouseEvent<HTMLButtonElement>) {
    if (!confirm(confirmMessage)) {
      e.preventDefault();
    }
  }

  return (
    <button type="submit" className={className} onClick={handleClick}>
      {children}
    </button>
  );
}
