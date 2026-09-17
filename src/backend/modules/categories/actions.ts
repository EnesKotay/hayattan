"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, requireAdmin, slugify } from "@/backend/modules/admin/context";
import { titleCase } from "@/backend/modules/content/text-case";

// KATEGORİ
export async function createKategori(formData: FormData) {
  await requireAdmin();
  const name = titleCase((formData.get("name") as string)?.trim() ?? "");
  const slug = (formData.get("slug") as string)?.trim() || slugify(name);
  const description = formData.get("description") as string | null;

  await db.kategori.create({
    data: {
      name,
      slug,
      description: description || null,
    },
  });
  revalidatePath("/");
  revalidatePath("/kategoriler");
  revalidatePath("/admin/kategoriler");
  revalidatePath("/sitemap.xml");
  redirect("/admin/kategoriler?success=1");
}

export async function updateKategori(id: string, formData: FormData) {
  await requireAdmin();
  const name = titleCase((formData.get("name") as string)?.trim() ?? "");
  const slug = (formData.get("slug") as string)?.trim() ?? "";
  const description = formData.get("description") as string | null;

  await db.kategori.update({
    where: { id },
    data: {
      name,
      slug,
      description: description || null,
    },
  });
  revalidatePath("/");
  revalidatePath("/kategoriler");
  revalidatePath("/admin/kategoriler");
  revalidatePath("/sitemap.xml");
  redirect("/admin/kategoriler?success=1");
}

export async function deleteKategori(id: string) {
  await requireAdmin();
  await db.kategori.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/kategoriler");
  revalidatePath("/admin/kategoriler");
  revalidatePath("/sitemap.xml");
  redirect("/admin/kategoriler?deleted=1");
}
/** Ana sayfadaki altı konu, editörün seçtiği sırayla saklanır. */
export async function saveHomeCategories(formData: FormData) {
  await requireAdmin();
  const ids = Array.from({ length: 6 }, (_, index) => formData.get(`homeCategory${index}`))
    .filter((id): id is string => typeof id === "string" && id.length > 0);
  const uniqueIds = [...new Set(ids)];
  const categories = await db.kategori.findMany({ where: { id: { in: uniqueIds } }, select: { id: true } });
  if (categories.length !== uniqueIds.length) {
    redirect("/admin/kategoriler?error=" + encodeURIComponent("Seçilen kategori bulunamadı. Listeyi yenileyin."));
  }
  await db.siteSetting.upsert({
    where: { key: "home-category-ids" },
    create: { key: "home-category-ids", value: JSON.stringify(uniqueIds) },
    update: { value: JSON.stringify(uniqueIds) },
  });
  revalidatePath("/");
  revalidatePath("/admin/kategoriler");
  redirect("/admin/kategoriler?success=1");
}
