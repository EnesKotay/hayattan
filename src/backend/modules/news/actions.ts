"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, requireAdmin } from "@/backend/modules/admin/context";
import { titleCase } from "@/backend/modules/content/text-case";
import { sanitizeText, sanitizeUrl } from "@/backend/security/sanitize";

export async function createHaber(formData: FormData) {
  await requireAdmin();
  const title = titleCase(sanitizeText((formData.get("title") as string)?.trim() ?? ""));
  const excerptRaw = (formData.get("excerpt") as string)?.trim() || null;
  const excerpt = excerptRaw ? sanitizeText(excerptRaw) : null;
  const imageUrlRaw = (formData.get("imageUrl") as string)?.trim() || null;
  const imageUrl = imageUrlRaw ? (sanitizeUrl(imageUrlRaw) ?? null) : null;
  const linkRaw = (formData.get("link") as string)?.trim() || null;
  const link = linkRaw ? (sanitizeUrl(linkRaw) ?? null) : null;
  const authorName = titleCase(sanitizeText((formData.get("authorName") as string)?.trim() || ""));
  const sortOrder = parseInt(String(formData.get("sortOrder") ?? "0"), 10) || 0;
  const publishedAtRaw = (formData.get("publishedAt") as string)?.trim();
  const publishedAt = publishedAtRaw === "now" || publishedAtRaw === "on" || publishedAtRaw === "1" ? new Date() : null;

  await db.haber.create({
    data: { title, excerpt, imageUrl, link, authorName: authorName || null, sortOrder, publishedAt },
  });
  revalidatePath("/");
  revalidatePath("/admin/haberler");
  redirect("/admin/haberler?success=1");
}

export async function updateHaber(id: string, formData: FormData) {
  await requireAdmin();
  const title = titleCase(sanitizeText((formData.get("title") as string)?.trim() ?? ""));
  const excerptRaw = (formData.get("excerpt") as string)?.trim() || null;
  const excerpt = excerptRaw ? sanitizeText(excerptRaw) : null;
  const imageUrlRaw = (formData.get("imageUrl") as string)?.trim() || null;
  const imageUrl = imageUrlRaw ? (sanitizeUrl(imageUrlRaw) ?? null) : null;
  const linkRaw = (formData.get("link") as string)?.trim() || null;
  const link = linkRaw ? (sanitizeUrl(linkRaw) ?? null) : null;
  const authorNameRaw = (formData.get("authorName") as string)?.trim() || null;
  const authorName = authorNameRaw ? titleCase(sanitizeText(authorNameRaw)) : null;
  const sortOrder = parseInt(String(formData.get("sortOrder") ?? "0"), 10) || 0;
  const publishedAtRaw = (formData.get("publishedAt") as string)?.trim();
  const publishedAt = publishedAtRaw === "now" || publishedAtRaw === "on" || publishedAtRaw === "1" ? new Date() : null;

  await db.haber.update({
    where: { id },
    data: { title, excerpt, imageUrl, link, authorName, sortOrder, publishedAt },
  });
  revalidatePath("/");
  revalidatePath("/admin/haberler");
  redirect("/admin/haberler?success=1");
}

export async function deleteHaber(id: string) {
  await requireAdmin();
  await db.haber.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/haberler");
  redirect("/admin/haberler?deleted=1");
}
