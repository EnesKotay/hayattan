import { getAdMetrics, getAdPreviewPostPath, getAdSlots } from "../../actions";
import { ReklamForm } from "@/components/admin/ReklamForm";

export default async function ReklamPage() {
  const adSlots = await getAdSlots();
  const adMetrics = await getAdMetrics();
  const previewPostPath = await getAdPreviewPostPath();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-gray-900">Reklam Yönetimi</h1>
        <p className="mt-1 text-sm text-gray-500">Bir alan seçin, içeriğini düzenleyin ve değişiklikleri kaydedin.</p>
      </div>
      <ReklamForm initialAds={adSlots} initialMetrics={adMetrics} previewPostPath={previewPostPath} />
    </div>
  );
}
