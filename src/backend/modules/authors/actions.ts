"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, requireAdmin, slugify } from "@/backend/modules/admin/context";
import { titleCase } from "@/backend/modules/content/text-case";

// YAZAR – benzersiz slug
async function generateUniqueYazarSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await db.yazar.findUnique({ where: { slug } });
    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// YAZAR
export async function createYazar(formData: FormData) {
  await requireAdmin();
  const name = titleCase((formData.get("name") as string)?.trim() ?? "");
  const rawSlug = (formData.get("slug") as string)?.trim() || slugify(name);
  const slug = await generateUniqueYazarSlug(slugify(rawSlug) || slugify(name) || "yazar");
  const email = (formData.get("email") as string)?.trim() || null;
  const photo = (formData.get("photo") as string)?.trim() || null;
  const biyografi = (formData.get("biyografi") as string)?.trim() || null;
  const misafir = formData.get("misafir") === "on";
  const ayrilmis = formData.get("ayrilmis") === "on";
  const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;

  if (!name) {
    revalidatePath("/admin/yazarlar");
    redirect("/admin/yazarlar/yeni?error=name");
  }

  await db.yazar.create({
    data: {
      name,
      slug,
      email: email || null,
      photo: photo || null,
      biyografi: biyografi || null,
      misafir,
      ayrilmis,
      sortOrder,
    },
  });
  revalidatePath("/");
  revalidatePath("/yazarlar");
  revalidatePath("/eski-yazilar");
  revalidatePath("/admin/yazarlar");
  revalidatePath("/sitemap.xml");
  redirect("/admin/yazarlar?success=1");
}

export async function updateYazar(id: string, formData: FormData) {
  await requireAdmin();
  const name = titleCase((formData.get("name") as string)?.trim() ?? "");
  let slug = (formData.get("slug") as string)?.trim() ?? "";
  slug = slugify(slug) || slugify(name);
  const email = (formData.get("email") as string)?.trim() || null;
  const photo = (formData.get("photo") as string)?.trim() || null;
  const biyografi = (formData.get("biyografi") as string)?.trim() || null;
  const misafir = formData.get("misafir") === "on";
  const ayrilmis = formData.get("ayrilmis") === "on";
  const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;

  if (!name || !slug) {
    revalidatePath("/admin/yazarlar/" + id);
    redirect("/admin/yazarlar/" + id + "?error=1");
  }

  const existingSlug = await db.yazar.findFirst({
    where: { slug, id: { not: id } },
  });
  if (existingSlug) {
    revalidatePath("/admin/yazarlar/" + id);
    redirect("/admin/yazarlar/" + id + "?error=slug");
  }

  try {
    await db.$executeRaw`
      UPDATE "Yazar"
      SET name = ${name}, slug = ${slug}, email = ${email}, photo = ${photo}, biyografi = ${biyografi},
          misafir = ${misafir}, ayrilmis = ${ayrilmis}, "sortOrder" = ${sortOrder}, "updatedAt" = now()
      WHERE id = ${id}
    `;
  } catch (err) {
    console.error("updateYazar error:", err);
    revalidatePath("/admin/yazarlar/" + id);
    redirect("/admin/yazarlar/" + id + "?error=1");
  }
  revalidatePath("/");
  revalidatePath("/yazarlar");
  revalidatePath("/eski-yazilar");
  revalidatePath("/admin/yazarlar");
  revalidatePath("/sitemap.xml");
  redirect("/admin/yazarlar?success=1");
}

export async function deleteYazar(id: string) {
  await requireAdmin();
  // Önce bu yazara ait tüm yazıları sil (foreign key), sonra yazarı sil
  await db.$transaction(async (tx: typeof db) => {
    await tx.yazi.deleteMany({ where: { authorId: id } });
    await tx.yazar.delete({ where: { id } });
  });
  revalidatePath("/");
  revalidatePath("/yazilar");
  revalidatePath("/yazarlar");
  revalidatePath("/eski-yazilar");
  revalidatePath("/admin/yazilar");
  revalidatePath("/admin/yazarlar");
  revalidatePath("/sitemap.xml");
  redirect("/admin/yazarlar?deleted=1");
}
