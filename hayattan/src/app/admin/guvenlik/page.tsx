import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { auth } from "@/lib/auth";
import { getRecentSecurityLogs } from "@/lib/security-logger";
import { isTwoFactorEnabled } from "@/lib/two-factor";
import { updateTwoFactorStatus } from "./actions";

type SecurityPageProps = {
  searchParams?: Promise<{ event?: string }>;
};

type SecurityLogEntry = {
  id: string;
  eventType: string;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: unknown;
  createdAt: Date;
};

const EVENT_LABELS: Record<string, string> = {
  failed_login: "Hatali giris",
  successful_login: "Basarili giris",
  rate_limit_exceeded: "Hiz siniri",
  suspicious_activity: "Supheli aktivite",
  unauthorized_access: "Yetkisiz erisim",
  password_change: "Sifre degisikligi",
  two_factor_challenge: "2FA kod gonderimi",
  two_factor_success: "2FA basarili",
  two_factor_failed: "2FA hatali",
};

function getBadgeClasses(type: string) {
  if (type === "failed_login" || type === "unauthorized_access" || type === "two_factor_failed") {
    return "bg-rose-50 text-rose-700 border-rose-200";
  }
  if (type === "successful_login" || type === "two_factor_success") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  if (type === "rate_limit_exceeded" || type === "suspicious_activity") {
    return "bg-amber-50 text-amber-700 border-amber-200";
  }
  return "bg-slate-50 text-slate-700 border-slate-200";
}

export default async function SecurityLogsPage({ searchParams }: SecurityPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const selectedEvent = resolvedParams?.event || "all";
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const [logsRaw, twoFactorEnabled] = await Promise.all([
    getRecentSecurityLogs(200),
    isTwoFactorEnabled(session.user.id),
  ]);
  const logs = logsRaw as SecurityLogEntry[];

  const last24hCutoff = new Date();
  last24hCutoff.setHours(last24hCutoff.getHours() - 24);
  const recentLogs = logs.filter((log) => new Date(log.createdAt).getTime() >= last24hCutoff.getTime());

  const filteredLogs = selectedEvent === "all" ? logs : logs.filter((log) => log.eventType === selectedEvent);

  const failedCount = recentLogs.filter((log) => log.eventType === "failed_login").length;
  const blockedCount = recentLogs.filter((log) => log.eventType === "rate_limit_exceeded").length;
  const twoFactorFailures = recentLogs.filter((log) => log.eventType === "two_factor_failed").length;
  const successfulCount = recentLogs.filter((log) => log.eventType === "successful_login").length;

  const events = Array.from(new Set(logs.map((log) => log.eventType))).sort();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 px-6 py-8 text-white shadow-xl">
        <h1 className="font-serif text-3xl font-bold">Guvenlik Merkezi</h1>
        <p className="mt-2 text-sm text-slate-200">
          Giris guvenligi, 2FA durumu ve denetim kayitlarini tek yerden yonet.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-slate-500">Son 24s hatali giris</p>
          <p className="mt-1 text-3xl font-bold text-rose-700">{failedCount}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-slate-500">Rate limit olaylari</p>
          <p className="mt-1 text-3xl font-bold text-amber-700">{blockedCount}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-slate-500">2FA hatali deneme</p>
          <p className="mt-1 text-3xl font-bold text-rose-700">{twoFactorFailures}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-slate-500">Son 24s basarili giris</p>
          <p className="mt-1 text-3xl font-bold text-emerald-700">{successfulCount}</p>
        </article>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl font-semibold text-slate-900">Iki asamali dogrulama (2FA)</h2>
            <p className="mt-1 text-sm text-slate-500">
              Giris sirasinda e-posta ile 6 haneli tek kullanimlik kod zorunlulugu.
            </p>
          </div>
          <form action={updateTwoFactorStatus}>
            <input type="hidden" name="enabled" value={twoFactorEnabled ? "0" : "1"} />
            <button
              type="submit"
              className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${twoFactorEnabled ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
            >
              {twoFactorEnabled ? "2FA Kapat" : "2FA Ac"}
            </button>
          </form>
        </div>
        <div className="mt-4 inline-flex rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
          Durum: {twoFactorEnabled ? "Aktif" : "Pasif"}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-serif text-xl font-semibold text-slate-900">Audit Log</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/guvenlik"
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${selectedEvent === "all" ? "border-primary bg-primary/10 text-primary" : "border-slate-200 text-slate-600"}`}
            >
              Tum olaylar
            </Link>
            {events.map((event) => (
              <Link
                key={event}
                href={`/admin/guvenlik?event=${event}`}
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${selectedEvent === event ? "border-primary bg-primary/10 text-primary" : "border-slate-200 text-slate-600"}`}
              >
                {EVENT_LABELS[event] || event}
              </Link>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-2 py-3">Zaman</th>
                <th className="px-2 py-3">Olay</th>
                <th className="px-2 py-3">IP</th>
                <th className="px-2 py-3">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-2 py-10 text-center text-slate-500">
                    Bu filtre icin log kaydi bulunmuyor.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap px-2 py-3 text-slate-600">
                      {format(new Date(log.createdAt), "d MMMM HH:mm:ss", { locale: tr })}
                    </td>
                    <td className="px-2 py-3">
                      <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${getBadgeClasses(log.eventType)}`}>
                        {EVENT_LABELS[log.eventType] || log.eventType}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-2 py-3 font-mono text-xs text-slate-600">
                      {log.ipAddress || "-"}
                    </td>
                    <td className="max-w-md truncate px-2 py-3 text-slate-600">
                      {log.metadata && typeof log.metadata === "object"
                        ? JSON.stringify(log.metadata)
                        : log.userAgent || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
