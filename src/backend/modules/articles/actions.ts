"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  db,
  requireAdmin,
  requireAuth,
  slugify,
  type AuthenticatedAdminUser,
} from "@/backend/modules/admin/context";
import { estimateReadingMinutes } from "@/backend/modules/articles/utils";
import { titleCase } from "@/backend/modules/content/text-case";
import { sanitizeHtml, sanitizeText, sanitizeUrl } from "@/backend/security/sanitize";
import { logDataDeletion, logDataModification } from "@/backend/security/security-logger";

// YAZI
async function generateUniqueSlug(baseSlug: string, ignoreId?: string) {
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await db.yazi.findUnique({ where: { slug } });
    if (!existing || (ignoreId && existing.id === ignoreId)) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

async function assertCanManageYazi(user: AuthenticatedAdminUser, yaziId: string) {
  const yazi = await db.yazi.findUnique({
    where: { id: yaziId },
    select: { id: true, authorId: true },
  });
  if (!yazi) throw new Error("Yazı bulunamadı");
  if (user.role !== "ADMIN" && yazi.authorId !== user.id) {
    throw new Error("Bu yazıyı yönetme yetkiniz yok");
  }
  return yazi as { id: string; authorId: string };
}

async function upsertEtiketler(etiketlerRaw: string): Promise<string[]> {
  const names = etiketlerRaw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (names.length === 0) return [];
  const ids: string[] = [];
  for (const name of names) {
    const etiketSlug = slugify(name);
    const etiket = await db.etiket.upsert({
      where: { slug: etiketSlug },
      update: {},
      create: { name: sanitizeText(name), slug: etiketSlug },
    });
    ids.push(etiket.id);
  }
  return ids;
}

export async function createYazi(formData: FormData) {
  const currentUser = await requireAuth();
  const rawTitle = formData.get("title") as string;
  const title = titleCase(sanitizeText(rawTitle || ""));
  const rawSlug = (formData.get("slug") as string) || slugify(title);
  const slug = await generateUniqueSlug(sanitizeText(rawSlug));
  const excerpt = formData.get("excerpt") as string | null;
  const rawContent = formData.get("content") as string;
  const content = rawContent ? sanitizeHtml(rawContent) : "<p></p>";
  const requestedAuthorId = formData.get("authorId") as string;
  const authorId = currentUser.role === "ADMIN" ? requestedAuthorId : currentUser.id;
  const kategoriIds = formData.getAll("kategoriIds") as string[];
  const etiketlerRaw = (formData.get("etiketler") as string) || "";
  const publishedAtRaw = (formData.get("publishedAt") as string) || "";
  const publishedAt =
    publishedAtRaw === ""
      ? null
      : publishedAtRaw === "now"
        ? new Date()
        : new Date(publishedAtRaw);
  const featuredImageRaw = (formData.get("featuredImage") as string) || null;
  const featuredImage = featuredImageRaw
    ? (featuredImageRaw.startsWith("/") ? featuredImageRaw : (sanitizeUrl(featuredImageRaw) ?? null))
    : null;
  const pdfUrlRaw = (formData.get("pdfUrl") as string) || null;
  const pdfUrl = pdfUrlRaw ? (sanitizeUrl(pdfUrlRaw) ?? null) : null;
  const showInSlider = formData.get("showInSlider") === "on";

  // SEO fields
  const metaDescriptionRaw = formData.get("metaDescription") as string | null;
  const metaDescription = metaDescriptionRaw ? sanitizeText(metaDescriptionRaw.substring(0, 160)) : null;
  const metaKeywordsRaw = formData.get("metaKeywords") as string | null;
  const metaKeywords = metaKeywordsRaw ? sanitizeText(metaKeywordsRaw) : null;
  const ogImageRaw = formData.get("ogImage") as string | null;
  const ogImage = ogImageRaw ? sanitizeUrl(ogImageRaw) : null;
  const imageAltRaw = formData.get("imageAlt") as string | null;
  const imageAlt = imageAltRaw ? sanitizeText(imageAltRaw) : null;

  if (featuredImage && !imageAlt) {
    throw new Error("Kapak görseli için alt metin zorunludur.");
  }

  const readingMinutes = estimateReadingMinutes(content);
  const etiketIds = await upsertEtiketler(etiketlerRaw);

  await db.yazi.create({
    data: {
      title,
      slug,
      excerpt: excerpt ? sanitizeText(excerpt) : null,
      content,
      authorId,
      featuredImage: featuredImage || null,
      pdfUrl: pdfUrl || null,
      imageAlt: featuredImage ? imageAlt : null,
      showInSlider,
      publishedAt: publishedAt && !isNaN(publishedAt.getTime()) ? publishedAt : null,
      metaDescription,
      metaKeywords,
      ogImage,
      readingMinutes,
      ...(kategoriIds.length > 0 && {
        kategoriler: { connect: kategoriIds.map((id) => ({ id })) },
      }),
      ...(etiketIds.length > 0 && {
        etiketler: { connect: etiketIds.map((id) => ({ id })) },
      }),
    },
  });
  revalidatePath("/");
  revalidatePath("/yazilar");
  revalidatePath("/admin/yazilar");
  revalidatePath("/sitemap.xml");
  redirect("/admin/yazilar?success=1");
}

export async function updateYazi(id: string, formData: FormData) {
  const currentUser = await requireAuth();
  await assertCanManageYazi(currentUser, id);
  const rawTitle = formData.get("title") as string;
  const title = titleCase(sanitizeText(rawTitle || ""));
  const rawSlug = formData.get("slug") as string;
  const slug = await generateUniqueSlug(sanitizeText(rawSlug), id);
  const excerpt = formData.get("excerpt") as string | null;
  const rawContent = formData.get("content") as string;
  const content = rawContent ? sanitizeHtml(rawContent) : "<p></p>";
  const requestedAuthorId = formData.get("authorId") as string;
  const authorId = currentUser.role === "ADMIN" ? requestedAuthorId : currentUser.id;
  const kategoriIds = formData.getAll("kategoriIds") as string[];
  const etiketlerRaw = (formData.get("etiketler") as string) || "";
  const publishedAtRaw = (formData.get("publishedAt") as string) || "";
  const publishedAt =
    publishedAtRaw === ""
      ? null
      : publishedAtRaw === "now"
        ? new Date()
        : new Date(publishedAtRaw);
  const featuredImageRaw = (formData.get("featuredImage") as string) || null;
  const featuredImage = featuredImageRaw
    ? (featuredImageRaw.startsWith("/") ? featuredImageRaw : (sanitizeUrl(featuredImageRaw) ?? null))
    : null;
  const pdfUrlRaw = (formData.get("pdfUrl") as string) || null;
  const pdfUrl = pdfUrlRaw ? (sanitizeUrl(pdfUrlRaw) ?? null) : null;
  const showInSlider = formData.get("showInSlider") === "on";

  // SEO fields
  const metaDescriptionRaw = formData.get("metaDescription") as string | null;
  const metaDescription = metaDescriptionRaw ? sanitizeText(metaDescriptionRaw.substring(0, 160)) : null;
  const metaKeywordsRaw = formData.get("metaKeywords") as string | null;
  const metaKeywords = metaKeywordsRaw ? sanitizeText(metaKeywordsRaw) : null;
  const ogImageRaw = formData.get("ogImage") as string | null;
  const ogImage = ogImageRaw ? sanitizeUrl(ogImageRaw) : null;
  const imageAltRaw = formData.get("imageAlt") as string | null;
  const imageAlt = imageAltRaw ? sanitizeText(imageAltRaw) : null;

  if (featuredImage && !imageAlt) {
    throw new Error("Kapak görseli için alt metin zorunludur.");
  }

  const readingMinutes = estimateReadingMinutes(content);
  const etiketIds = await upsertEtiketler(etiketlerRaw);

  await db.yazi.update({
    where: { id },
    data: {
      title,
      slug,
      excerpt: excerpt ? sanitizeText(excerpt) : null,
      content,
      author: { connect: { id: authorId } },
      featuredImage: featuredImage || null,
      pdfUrl: pdfUrl || null,
      imageAlt: featuredImage ? imageAlt : null,
      showInSlider,
      publishedAt: publishedAt && !isNaN(publishedAt.getTime()) ? publishedAt : null,
      metaDescription,
      metaKeywords,
      ogImage,
      readingMinutes,
      kategoriler: {
        set: [],
        ...(kategoriIds.length > 0 && {
          connect: kategoriIds.map((k) => ({ id: k })),
        }),
      },
      etiketler: {
        set: [],
        ...(etiketIds.length > 0 && {
          connect: etiketIds.map((id) => ({ id })),
        }),
      },
    },
  });
  revalidatePath("/");
  revalidatePath("/yazilar");
  revalidatePath(`/yazilar/${slug}`);
  revalidatePath("/admin/yazilar");
  revalidatePath("/sitemap.xml");
  redirect("/admin/yazilar?success=1");
}

export async function deleteYazi(id: string) {
  const currentUser = await requireAuth();
  await assertCanManageYazi(currentUser, id);
  await db.yazi.delete({ where: { id } });
  await logDataDeletion(currentUser.id, "yazi", id);
  revalidatePath("/");
  revalidatePath("/yazilar");
  revalidatePath("/admin/yazilar");
  revalidatePath("/sitemap.xml");
  redirect("/admin/yazilar?deleted=1");
}

export async function bulkUpdateYazilar(
  ids: string[],
  action: "yayinla" | "taslak" | "sil"
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const admin = await requireAdmin();
    if (!ids.length) return { success: false, count: 0, error: "Hiç yazı seçilmedi." };
    if (ids.length > 100) return { success: false, count: 0, error: "En fazla 100 yazı seçilebilir." };

    let count = 0;
    if (action === "yayinla") {
      const result = await db.yazi.updateMany({
        where: { id: { in: ids }, publishedAt: null },
        data: { publishedAt: new Date() },
      });
      count = result.count;
      await logDataModification(admin.id, "update", "yazi_bulk_yayinla", `${ids.length} yazi`);
    } else if (action === "taslak") {
      const result = await db.yazi.updateMany({
        where: { id: { in: ids } },
        data: { publishedAt: null },
      });
      count = result.count;
      await logDataModification(admin.id, "update", "yazi_bulk_taslak", `${ids.length} yazi`);
    } else if (action === "sil") {
      const result = await db.yazi.deleteMany({ where: { id: { in: ids } } });
      count = result.count;
      await logDataDeletion(admin.id, "yazi_bulk_sil", `${ids.length} yazi`);
    }

    revalidatePath("/");
    revalidatePath("/yazilar");
    revalidatePath("/admin/yazilar");
    revalidatePath("/sitemap.xml");
    return { success: true, count };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    return { success: false, count: 0, error: message };
  }
}


export async function duplicateYazi(id: string) {
  const currentUser = await requireAuth();
  await assertCanManageYazi(currentUser, id);
  const original = await db.yazi.findUnique({
    where: { id },
    include: { kategoriler: true },
  });

  if (!original) throw new Error("Yazı bulunamadı");

  const newTitle = `Kopya: ${original.title}`;
  const newSlug = `${original.slug}-kopya-${Date.now().toString().slice(-4)}`;

  await db.yazi.create({
    data: {
      title: newTitle,
      slug: newSlug,
      excerpt: original.excerpt,
      content: original.content,
      authorId: original.authorId,
      featuredImage: original.featuredImage,
      imageAlt: original.imageAlt,
      showInSlider: false,
      publishedAt: null,
      metaDescription: original.metaDescription,
      metaKeywords: original.metaKeywords,
      ogImage: original.ogImage,
      kategoriler: {
        connect: original.kategoriler.map((k: { id: string }) => ({ id: k.id })),
      },
    },
  });

  revalidatePath("/admin/yazilar");
  redirect("/admin/yazilar?success=1");
}
