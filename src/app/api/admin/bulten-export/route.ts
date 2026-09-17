import { auth } from "@/backend/modules/auth/auth";
import { repository } from "@/backend/modules/data/repository";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return new NextResponse("Yetkisiz", { status: 401 });
  }

  const aboneler = await (repository as any).newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });

  const rows = [
    ["E-posta", "Durum", "Kayıt Tarihi"],
    ...aboneler.map((a: { email: string; active: boolean; createdAt: Date }) => [
      a.email,
      a.active ? "Aktif" : "Pasif",
      new Date(a.createdAt).toLocaleDateString("tr-TR"),
    ]),
  ];

  const escapeCsvCell = (cell: string) => {
    // Prevent spreadsheet formula execution when an exported CSV is opened.
    const safe = /^[=+\-@]/.test(cell) ? `'${cell}` : cell;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  const csv = rows.map((row) => row.map(escapeCsvCell).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bulten-aboneleri-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "private, no-store, max-age=0",
    },
  });
}
