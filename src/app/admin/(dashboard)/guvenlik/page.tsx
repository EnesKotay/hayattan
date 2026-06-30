import { getRecentSecurityLogs, type SecurityEventType } from "@/lib/security-logger";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Icons } from "@/components/admin/Icons";
import { AdminFilters } from "@/components/admin/AdminFilters";

const EVENT_LABELS: Record<string, string> = {
  failed_login: "Hatalı Giriş",
  successful_login: "Başarılı Giriş",
  rate_limit_exceeded: "Hız Sınırı Aşıldı",
  suspicious_activity: "Şüpheli İşlem",
  unauthorized_access: "Yetkisiz Erişim",
  password_change: "Şifre Değişikliği",
  admin_access: "Admin Erişimi",
  data_modification: "Veri Değişikliği",
  data_deletion: "Veri Silme",
};

const EVENT_BADGE_STYLES: Record<string, string> = {
  failed_login: "bg-red-100 text-red-700",
  successful_login: "bg-green-100 text-green-700",
  rate_limit_exceeded: "bg-orange-100 text-orange-700",
  suspicious_activity: "bg-purple-100 text-purple-700",
  unauthorized_access: "bg-red-100 text-red-700",
  password_change: "bg-blue-100 text-blue-700",
  admin_access: "bg-gray-100 text-gray-700",
  data_modification: "bg-yellow-100 text-yellow-700",
  data_deletion: "bg-red-100 text-red-700",
};

export default async function SecurityLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ olay?: string }>;
}) {
  const params = await searchParams;
  const olay = params.olay as SecurityEventType | undefined;

  const logs = await getRecentSecurityLogs(200, olay || undefined);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-gray-900">Güvenlik Günlüğü</h1>
          <p className="mt-1 text-gray-500 text-sm">
            Sistemdeki son güvenlik olaylarını ve giriş denemelerini takip edin.
          </p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icons.ShieldCheck className="h-6 w-6" />
        </div>
      </div>

      <AdminFilters
        filters={[
          {
            type: "select",
            name: "olay",
            label: "Olay Tipi",
            options: [
              { label: "Tüm Olaylar", value: "" },
              { label: "Hatalı Giriş", value: "failed_login" },
              { label: "Başarılı Giriş", value: "successful_login" },
              { label: "Yetkisiz Erişim", value: "unauthorized_access" },
              { label: "Hız Sınırı Aşıldı", value: "rate_limit_exceeded" },
              { label: "Şüpheli İşlem", value: "suspicious_activity" },
              { label: "Şifre Değişikliği", value: "password_change" },
              { label: "Admin Erişimi", value: "admin_access" },
              { label: "Veri Değişikliği", value: "data_modification" },
              { label: "Veri Silme", value: "data_deletion" },
            ],
          },
        ]}
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 font-semibold text-gray-900 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Zaman</th>
                <th className="px-6 py-4">Olay</th>
                <th className="px-6 py-4">IP Adresi</th>
                <th className="px-6 py-4">Detay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                    {olay ? "Bu olay tipinde kayıt bulunamadı." : "Henüz bir güvenlik kaydı bulunmuyor."}
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                      {format(new Date(log.createdAt), "d MMMM HH:mm:ss", { locale: tr })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-bold ${
                          EVENT_BADGE_STYLES[log.eventType] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {EVENT_LABELS[log.eventType] ?? log.eventType}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 font-mono text-gray-600">
                      {log.ipAddress || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
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
        {logs.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-3 text-xs text-gray-500">
            {logs.length} kayıt gösteriliyor
            {olay && ` (${EVENT_LABELS[olay] ?? olay} filtresi aktif)`}
          </div>
        )}
      </div>
    </div>
  );
}
