"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin/giris" })}
      className="rounded-lg border border-[#ddd] bg-white px-3 py-2 text-sm text-foreground transition-colors hover:bg-[#f9f9f6]"
    >
      Çıkış Yap
    </button>
  );
}
