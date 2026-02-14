import { auth } from "@/lib/auth";
import { getRecentSecurityLogs } from "@/lib/security-logger";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Icons } from "@/components/admin/Icons";

export default async function SecurityLogsPage() {
    const session = await auth();
    const logs = await getRecentSecurityLogs(100);

    const getEventBadge = (type: string) => {
        switch (type) {
            case "failed_login":
                return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700">Hatalı Giriş</span>;
            case "successful_login":
                return <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-700">Başarılı Giriş</span>;
            case "rate_limit_exceeded":
                return <span className="rounded-full bg-orange-100 px-2 py-1 text-xs font-bold text-orange-700">Hız Sınırı Aşıldı</span>;
            case "suspicious_activity":
                return <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-bold text-purple-700">Şüpheli İşlem</span>;
            case "unauthorized_access":
                return <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700">Yetkisiz Erişim</span>;
            default:
                return <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-bold text-gray-700">{type}</span>;
        }
    };

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
                                        Henüz bir güvenlik kaydı bulunmuyor.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log: any) => (
                                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="whitespace-nowrap px-6 py-4 text-gray-600">
                                            {format(new Date(log.createdAt), "d MMMM HH:mm:ss", { locale: tr })}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getEventBadge(log.eventType)}
                                        </td>
                                        <td className="whitespace-nowrap px-6 py-4 font-mono text-gray-600">
                                            {log.ipAddress || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                                            {log.metadata && typeof log.metadata === 'object' ? (
                                                JSON.stringify(log.metadata)
                                            ) : (
                                                log.userAgent || "-"
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
