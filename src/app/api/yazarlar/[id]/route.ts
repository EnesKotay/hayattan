import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { titleCase } from "@/lib/text-case";

export const dynamic = "force-dynamic";

/** GET /api/yazarlar/[id] */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const yazar = await prisma.yazar.findUnique({
    where: { id },
    include: { _count: { select: { yazilar: true } } },
  });
  if (!yazar) return NextResponse.json({ error: "Yazar bulunamadı" }, { status: 404 });
  return NextResponse.json(yazar);
}

/** PATCH /api/yazarlar/[id] */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.role || !["ADMIN", "AUTHOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.yazar.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Yazar bulunamadı" }, { status: 404 });

  let body: { name?: string; slug?: string; email?: string; photo?: string; biyografi?: string; misafir?: boolean; ayrilmis?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz JSON" }, { status: 400 });
  }

  const name = titleCase((body.name ?? existing.name).trim());
  const slug = (body.slug ?? existing.slug).trim();
  if (!name || !slug) return NextResponse.json({ error: "Ad ve slug gerekli" }, { status: 400 });

  const yazar = await prisma.yazar.update({
    where: { id },
    data: {
      name,
      slug,
      email: (body.email ?? existing.email ?? "").trim() || null,
      photo: (body.photo ?? existing.photo ?? "").trim() || null,
      biyografi: (body.biyografi ?? existing.biyografi ?? "").trim() || null,
      misafir: body.misafir ?? existing.misafir,
      ayrilmis: body.ayrilmis ?? (existing as { ayrilmis?: boolean }).ayrilmis ?? false,
    },
  });

  return NextResponse.json(yazar);
}

/** DELETE /api/yazarlar/[id] — Önce yazıları siler, sonra yazarı */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.role || !["ADMIN", "AUTHOR"].includes(session.user.role)) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const { id } = await params;
  const existing = await prisma.yazar.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Yazar bulunamadı" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    await tx.yazi.deleteMany({ where: { authorId: id } });
    await tx.yazar.delete({ where: { id } });
  });

  return NextResponse.json({ success: true });
}
