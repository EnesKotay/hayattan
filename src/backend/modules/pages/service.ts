"use server";

import { randomUUID } from "crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { db, requireAdmin, slugify } from "@/backend/modules/admin/context";
import { sanitizeText, sanitizeUrl } from "@/backend/security/sanitize";
import { titleCase } from "@/backend/modules/content/text-case";

export async function createPage(formData: FormData) {
  await requireAdmin();
  const title = titleCase(sanitizeText((formData.get("title") as string)?.trim() ?? ""));
  const slug = (formData.get("slug") as string)?.trim() || slugify(title) || "sayfa";
  const content = (formData.get("content") as string)?.trim() || "<p></p>";
  const featuredImageRaw = (formData.get("featuredImage") as string)?.trim() || null;
  const featuredImage = featuredImageRaw ? (sanitizeUrl(featuredImageRaw) ?? (featuredImageRaw.startsWith("/") ? featuredImageRaw : null)) : null;
  const showInMenu = formData.get("showInMenu") === "on";
  const menuOrder = parseInt(String(formData.get("menuOrder") ?? "0"), 10) || 0;
  const publishedAtRaw = (formData.get("publishedAt") as string)?.trim();
  const publishedAt = publishedAtRaw === "on" || publishedAtRaw === "1" ? new Date() : null;

  const id = randomUUID();
  await db.$executeRaw`
    INSERT INTO "Page" (id, title, slug, content, "featuredImage", "showInMenu", "menuOrder", "publishedAt", "createdAt", "updatedAt")
    VALUES (${id}, ${title}, ${slug}, ${content}, ${featuredImage}, ${showInMenu}, ${menuOrder}, ${publishedAt}, now(), now())
  `;
  revalidateTag("menu-items", { expire: 0 });
  revalidatePath("/");
  revalidatePath("/sayfa");
  revalidatePath("/admin/sayfalar");
  redirect("/admin/sayfalar?success=1");
}

export async function updatePage(id: string, formData: FormData) {
  await requireAdmin();
  const title = titleCase(sanitizeText((formData.get("title") as string)?.trim() ?? ""));
  const slug = (formData.get("slug") as string)?.trim() ?? "";
  const content = (formData.get("content") as string)?.trim() || "<p></p>";
  const featuredImageRaw = (formData.get("featuredImage") as string)?.trim() || null;
  const featuredImage = featuredImageRaw ? (sanitizeUrl(featuredImageRaw) ?? (featuredImageRaw.startsWith("/") ? featuredImageRaw : null)) : null;
  const showInMenu = formData.get("showInMenu") === "on";
  const menuOrder = parseInt(String(formData.get("menuOrder") ?? "0"), 10) || 0;
  const publishedAtRaw = (formData.get("publishedAt") as string)?.trim();
  const publishedAt = publishedAtRaw === "on" || publishedAtRaw === "1" ? new Date() : null;

  await db.$executeRaw`
    UPDATE "Page"
    SET title = ${title}, slug = ${slug}, content = ${content}, "featuredImage" = ${featuredImage},
        "showInMenu" = ${showInMenu}, "menuOrder" = ${menuOrder}, "publishedAt" = ${publishedAt}, "updatedAt" = now()
    WHERE id = ${id}
  `;
  revalidateTag("menu-items", { expire: 0 });
  revalidatePath("/");
  revalidatePath("/sayfa");
  revalidatePath("/admin/sayfalar");
  redirect("/admin/sayfalar?success=1");
}

export async function deletePage(id: string) {
  await requireAdmin();
  await db.$executeRaw`DELETE FROM "Page" WHERE id = ${id}`;
  revalidateTag("menu-items", { expire: 0 });
  revalidatePath("/");
  revalidatePath("/sayfa");
  revalidatePath("/admin/sayfalar");
  redirect("/admin/sayfalar?deleted=1");
}
export async function getPageBySlug(slug: string) {
  const rows = await db.$queryRaw<
    { id: string; title: string; slug: string; content: string; featuredImage: string | null; showInMenu: boolean; menuOrder: number; publishedAt: Date | null }[]
  >`SELECT id, title, slug, content, "featuredImage", "showInMenu", "menuOrder", "publishedAt"
    FROM "Page" WHERE slug = ${slug} AND "publishedAt" IS NOT NULL LIMIT 1`;
  return rows[0] ?? null;
}
