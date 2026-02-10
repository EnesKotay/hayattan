"use client";

import { useState, useEffect } from "react";
import { Icons } from "@/components/admin/Icons";

const AYLAR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const GUNLER = ["Pts", "Sal", "Çar", "Per", "Cum", "Cts", "Paz"];

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

type YayimlaSectionProps = {
  /** Mevcut yayın tarihi (sunucudan string olarak gelebilir) */
  defaultValue?: Date | string | null;
};

function parseDefaultDate(v: Date | string | null | undefined): Date | null {
  if (v == null) return null;
  const d = typeof v === "string" ? new Date(v) : v;
  return isNaN(d.getTime()) ? null : d;
}

export function YayimlaSection({ defaultValue = null }: YayimlaSectionProps) {
  const [now, setNow] = useState(new Date());

  // İstemci tarafında "şimdi"yi güncelle (SSR uyumsuzluğunu önlemek için)
  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 60000); // Her dakika güncelle
    return () => clearInterval(interval);
  }, []);

  const parsedDefault = parseDefaultDate(defaultValue);

  // Varsayılan mod: Eğer tarih varsa ve geçmişteyse "now" (zaten yayınlanmış),
  // gelecekteyse "scheduled". Yoksa "draft".
  const initialMode = parsedDefault
    ? (parsedDefault.getTime() <= now.getTime() ? "now" : "scheduled")
    : "draft";

  const [mode, setMode] = useState<"draft" | "now" | "scheduled">(initialMode);

  const [date, setDate] = useState(() => {
    if (parsedDefault) return new Date(parsedDefault);
    const d = new Date();
    d.setMinutes(d.getMinutes() + 30); // Varsayılan olarak 30 dk sonrası
    return d;
  });

  // Takvim ayı state'i
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(date.getFullYear(), date.getMonth(), 1));

  // Tarih parçaları
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();

  function updateDate(newDate: Date) {
    setDate(newDate);
    // Takvim ayını da güncelle eğer yıl/ay değiştiyse
    if (newDate.getMonth() !== calendarMonth.getMonth() || newDate.getFullYear() !== calendarMonth.getFullYear()) {
      setCalendarMonth(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
    }
  }

  function setSimdi() {
    const n = new Date();
    updateDate(n);
    // Kullanıcı "tarih ve saat" seçeneğinde kalmak istiyorsa ama saati şimdiye çekmek istiyorsa modu değiştirmiyoruz.
    // Ancak sadece saati güncellemek yeterli.
  }

  const formValue =
    mode === "draft"
      ? ""
      : mode === "now"
        ? "now" // Backend "now" stringini algılayıp o anki saati kullanacak
        : date.toISOString();

  // Takvim mantığı
  const firstDayOfWeek = (new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), 1).getDay() + 6) % 7; // 0 = Pzt
  const daysInMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 0).getDate();
  const calendarDays: (number | null)[] = Array(firstDayOfWeek).fill(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);

  const isSelected = (d: number) =>
    mode === "scheduled" &&
    day === d &&
    month === calendarMonth.getMonth() &&
    year === calendarMonth.getFullYear();

  const isToday = (d: number) => {
    const t = new Date();
    return (
      d === t.getDate() &&
      calendarMonth.getMonth() === t.getMonth() &&
      calendarMonth.getFullYear() === t.getFullYear()
    );
  };

  const inputBase =
    "rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-foreground transition-all hover:border-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50/50 px-5 py-4">
        <h3 className="font-semibold text-gray-900">Yayımla</h3>
        {mode === "scheduled" && (
          <button
            type="button"
            onClick={setSimdi}
            className="group flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-100"
          >
            <Icons.Refresh className="h-3 w-3" />
            Şu an
          </button>
        )}
      </div>
      <input type="hidden" name="publishedAt" value={formValue} />

      <div className="space-y-4 p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          {[
            { id: "draft" as const, label: "Taslak", desc: "Yayında değil", icon: Icons.FileEdit },
            { id: "now" as const, label: "Hemen", desc: "Anında yayınla", icon: Icons.CheckCircle },
            { id: "scheduled" as const, label: "Zamanla", desc: "İleri tarih", icon: Icons.Calendar },
          ].map((opt) => {
            const Icon = opt.icon;
            return (
              <label
                key={opt.id}
                className={`relative flex flex-1 cursor-pointer flex-col gap-1 rounded-xl border-2 p-4 transition-all ${mode === opt.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }`}
              >
                <input
                  type="radio"
                  name="publishMode"
                  checked={mode === opt.id}
                  onChange={() => setMode(opt.id)}
                  className="sr-only"
                />
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`h-4 w-4 ${mode === opt.id ? "text-primary" : "text-gray-500"}`} />
                  <span className={`text-sm font-bold ${mode === opt.id ? "text-primary" : "text-gray-700"}`}>{opt.label}</span>
                </div>
                <span className="text-xs text-gray-500">{opt.desc}</span>
                {mode === opt.id && (
                  <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary ring-4 ring-primary/10" />
                )}
              </label>
            )
          })}
        </div>
      </div>

      {mode === "scheduled" && (
        <div className="animate-fade-in border-t border-gray-200 bg-gray-50/50 p-5">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Sol: Saat ve Tarih Inputları */}
            <div className="space-y-5">
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Saat</label>
                <div className="flex items-center gap-2 rounded-lg bg-white p-1.5 shadow-sm ring-1 ring-gray-200">
                  <select
                    value={hour}
                    onChange={(e) => updateDate(new Date(year, month, day, Number(e.target.value), minute))}
                    className="h-10 w-full appearance-none rounded-md bg-transparent text-center font-mono text-lg font-medium outline-none transition-colors hover:bg-gray-50 focus:bg-gray-100"
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{pad2(i)}</option>
                    ))}
                  </select>
                  <span className="text-gray-300 font-light text-2xl">:</span>
                  <select
                    value={minute}
                    onChange={(e) => updateDate(new Date(year, month, day, hour, Number(e.target.value)))}
                    className="h-10 w-full appearance-none rounded-md bg-transparent text-center font-mono text-lg font-medium outline-none transition-colors hover:bg-gray-50 focus:bg-gray-100"
                  >
                    {Array.from({ length: 60 }, (_, i) => (
                      <option key={i} value={i}>{pad2(i)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Tarih</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={day}
                    onChange={(e) => updateDate(new Date(year, month, Number(e.target.value) || 1, hour, minute))}
                    className={`w-16 text-center text-lg font-medium ${inputBase}`}
                    placeholder="Gün"
                  />
                  <select
                    value={month}
                    onChange={(e) => updateDate(new Date(year, Number(e.target.value), day, hour, minute))}
                    className={`flex-1 text-base font-medium ${inputBase}`}
                  >
                    {AYLAR.map((ad, i) => (
                      <option key={ad} value={i}>{ad}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={2020}
                    max={2035}
                    value={year}
                    onChange={(e) => updateDate(new Date(Number(e.target.value) || year, month, day, hour, minute))}
                    className={`w-24 text-center text-lg font-medium ${inputBase}`}
                    placeholder="Yıl"
                  />
                </div>
              </div>
            </div>

            {/* Sağ: Takvim */}
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-semibold text-gray-900">
                  {AYLAR[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))}
                    className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <Icons.ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))}
                    className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <Icons.ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mb-2 grid grid-cols-7 text-center">
                {GUNLER.map((g) => (
                  <div key={g} className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    {g}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((calDay, i) =>
                  calDay === null ? (
                    <div key={`empty-${i}`} />
                  ) : (
                    <button
                      key={calDay}
                      type="button"
                      onClick={() => updateDate(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth(), calDay, hour, minute))}
                      className={`
                        aspect-square rounded-md flex items-center justify-center text-sm transition-all
                        ${isSelected(calDay)
                          ? "bg-primary font-bold text-white shadow-md ring-2 ring-primary/20"
                          : isToday(calDay)
                            ? "bg-blue-50 font-bold text-blue-600 ring-1 ring-inset ring-blue-100"
                            : "text-gray-700 hover:bg-gray-100"
                        }
                      `}
                    >
                      {calDay}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
