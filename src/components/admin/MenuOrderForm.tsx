"use client";

import { useState } from "react";
import type { MenuEntryForAdmin } from "@/app/admin/actions";

type MenuOrderFormProps = {
  initialEntries: MenuEntryForAdmin[];
  saveAction: (order: string[]) => Promise<void>;
};

export function MenuOrderForm({ initialEntries, saveAction }: MenuOrderFormProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [saving, setSaving] = useState(false);

  const move = (index: number, dir: "up" | "down") => {
    const next = [...entries];
    const i = dir === "up" ? index - 1 : index + 1;
    if (i < 0 || i >= next.length) return;
    [next[index], next[i]] = [next[i], next[index]];
    setEntries(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveAction(entries.map((e) => e.id));
    } finally {
      setSaving(false);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#ddd] bg-white p-8 text-center text-muted">
        Menüde gösterilecek öğe yok. Önce Sayfalar bölümünden en az bir sayfa ekleyip &quot;Menüde göster&quot; ve &quot;Yayında&quot; işaretleyin.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ul className="space-y-2">
        {entries.map((entry, index) => (
          <li
            key={entry.id}
            className="flex items-center gap-3 rounded-xl border border-[#e5e5dc] bg-white px-4 py-3 shadow-sm"
          >
            <span className="w-8 shrink-0 text-sm font-medium text-muted">{index + 1}.</span>
            <span className="min-w-0 flex-1 font-medium text-foreground">{entry.label}</span>
            <span className="shrink-0 rounded-full bg-[#f0eeeb] px-2 py-0.5 text-xs text-muted">
              {entry.type === "static" ? "Sabit" : "Özel sayfa"}
            </span>
            <div className="flex shrink-0 gap-1">
              <button
                type="button"
                onClick={() => move(index, "up")}
                disabled={index === 0}
                className="rounded-lg border border-[#ddd] bg-white p-2 text-foreground hover:bg-[#f5f4f2] disabled:opacity-40 disabled:hover:bg-white"
                aria-label="Yukarı"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15l-6-6-6 6"/></svg>
              </button>
              <button
                type="button"
                onClick={() => move(index, "down")}
                disabled={index === entries.length - 1}
                className="rounded-lg border border-[#ddd] bg-white p-2 text-foreground hover:bg-[#f5f4f2] disabled:opacity-40 disabled:hover:bg-white"
                aria-label="Aşağı"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60"
        >
          {saving ? "Kaydediliyor…" : "Sırayı kaydet"}
        </button>
      </div>
    </form>
  );
}
