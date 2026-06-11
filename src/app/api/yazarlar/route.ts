import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { titleCase } from "@/lib/text-case";

export const dynamic = "force-dynamic";

/** GET /api/yazarlar — Tüm yazarları listele (admin veya public) */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const ayrilmis = searchParams.get("ayrilmis"); // "1" = sadece ayrılmış, "0" = sadece aktif, yok = hepsi

  const where: Prisma.YazarWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { slug: { contains: q, mode: "insensitive" } },
    ];
  }
  if (ayrilmis === "1") where.ayrilmis = true;
  else if (ayrilmis === "0") where.ayrilmis = false;

  const yazarlar = await prisma.yazar.findMany({
    where: Object.keys(where).length ? where : undefined,
    orderBy: [
      { sortOrder: "asc" },
      { yazilar: { _count: "desc" } },
      { name: "asc" }
    ] as any,
    include: { _count: { select: { yazilar: true } } },
  });

  return NextResponse.json(yazarlar);
}

/** POST /api/yazarlar — Yeni yazar (sadece admin/yazar) */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.role || !["ADMIN", "AUTHOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  let body: { name: string; slug?: string; email?: string; photo?: string; biyografi?: string; misafir?: boolean; ayrilmis?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const name = titleCase((body.name ?? "").trim());
  if (!name) return NextResponse.json({ error: "Ad Soyad gerekli" }, { status: 400 });

  const slugify = (t: string) =>
    t
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  let slug = (body.slug ?? "").trim() || slugify(name);
  slug = slugify(slug);
  let counter = 1;
  while (await prisma.yazar.findUnique({ where: { slug } })) {
    slug = `${slugify(name)}-${counter}`;
    counter++;
  }

  const yazar = await prisma.yazar.create({
    data: {
      name,
      slug,
      email: (body.email ?? "").trim() || null,
      photo: (body.photo ?? "").trim() || null,
      biyografi: (body.biyografi ?? "").trim() || null,
      misafir: !!body.misafir,
      ayrilmis: !!body.ayrilmis,
    },
  });

  return NextResponse.json(yazar);
}
