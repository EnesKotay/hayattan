import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session) {
    return new NextResponse("Yetkisiz", { status: 401 });
  }

  const aboneler = await (prisma as any).newsletterSubscriber.findMany({
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

  const csv = rows.map((row) => row.map((cell: string) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bulten-aboneleri-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
