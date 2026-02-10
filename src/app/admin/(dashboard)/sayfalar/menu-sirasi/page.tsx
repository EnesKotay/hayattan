import Link from "next/link";
import { getMenuEntriesForAdmin, setMenuOrder } from "../../../actions";
import { AdminFeedback } from "@/components/admin/AdminFeedback";
import { MenuOrderForm } from "@/components/admin/MenuOrderForm";

export default async function MenuSirasiPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const { success } = await searchParams;
  const entries = await getMenuEntriesForAdmin();

  return (
    <div className="space-y-6">
      <AdminFeedback initialSuccess={success} />
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">Menü sırası</h1>
        <p className="mt-1 text-sm text-muted">
          Üst menüdeki öğelerin sırasını değiştirin. Yukarı / Aşağı ile kaydırıp &quot;Sırayı kaydet&quot; ile uygulayın.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/sayfalar"
          className="rounded-lg border border-[#ddd] bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-[#f9f9f6]"
        >
          ← Sayfalar listesi
        </Link>
      </div>
      <MenuOrderForm initialEntries={entries} saveAction={setMenuOrder} />
    </div>
  );
}
