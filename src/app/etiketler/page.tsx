import Link from "next/link";
import { prisma } from "@/lib/db";
import { SiteBreadcrumb } from "@/components/SiteBreadcrumb";

export const revalidate = 60;

export const metadata = {
  title: "Etiketler | Hayattan.Net",
  description: "Hayattan.Net - Tüm etiketler",
};

export default async function EtiketlerPage() {
  const etiketler = await (prisma as any).etiket.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { yazilar: true } },
    },
  });

  const breadcrumbItems = [
    { href: "/", label: "Ana Sayfa" },
    { href: "/etiketler", label: "Etiketler" },
  ];

  return (
    <div className="min-h-screen bg-muted-bg/30 pb-20 pt-10">
      <div className="container mx-auto px-4">
        <SiteBreadcrumb items={breadcrumbItems} />

        <div className="mb-10 mt-4 text-center">
          <h1 className="mb-4 font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Etiketler
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-muted">
            İlgilendiğiniz konuları etiketler aracılığıyla keşfedin.
          </p>
        </div>

        {etiketler.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background p-16 text-center">
            <p className="text-muted">Henüz etiket eklenmemiş.</p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-3">
            {etiketler.map((etiket: { id: string; name: string; slug: string; _count: { yazilar: number } }) => (
              <Link
                key={etiket.id}
                href={`/etiketler/${etiket.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:border-primary hover:bg-primary hover:text-white shadow-xs"
              >
                <span>{etiket.name}</span>
                <span className="rounded-full bg-muted-bg px-2 py-0.5 text-xs text-muted group-hover:bg-white/20">
                  {etiket._count.yazilar}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
