import { getAdSlots } from "../../actions";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { ReklamForm } from "@/components/admin/ReklamForm";



export default async function ReklamPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { success } = await searchParams;
  const adSlots = await getAdSlots();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#e8e6e3] bg-white px-6 py-5 shadow-sm">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-[#1a1a1a]">Reklam Alanları</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-[#6b7280]">Her alan için HTML kodu veya görsel ekleyin; boyut ve önizleme aynı sayfada.</p>
      </div>

      <AdminFeedback initialSuccess={success} />

      <ReklamForm initialAds={adSlots} />
    </div>
  );
}
