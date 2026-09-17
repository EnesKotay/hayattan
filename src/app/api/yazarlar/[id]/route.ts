import { NextResponse } from "next/server";
import { repository } from "@/backend/modules/data/repository";
import { auth } from "@/backend/modules/auth/auth";
import { titleCase } from "@/backend/modules/content/text-case";

export const dynamic = "force-dynamic";

const publicAuthorSelect = {
  id: true,
  name: true,
  slug: true,
  photo: true,
  biyografi: true,
  misafir: true,
  ayrilmis: true,
  sortOrder: true,
  _count: { select: { yazilar: true } },
} as const;

/** GET /api/yazarlar/[id] */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const yazar = await repository.yazar.findUnique({
    where: { id },
    select: publicAuthorSelect,
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
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Bu işlem için yönetici yetkisi gerekli" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await repository.yazar.findUnique({ where: { id } });
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

  const yazar = await repository.yazar.update({
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
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Bu işlem için yönetici yetkisi gerekli" }, { status: 403 });
  }

  const { id } = await params;
  const existing = await repository.yazar.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Yazar bulunamadı" }, { status: 404 });

  await repository.$transaction(async (tx) => {
    await tx.yazi.deleteMany({ where: { authorId: id } });
    await tx.yazar.delete({ where: { id } });
  });

  return NextResponse.json({ success: true });
}
