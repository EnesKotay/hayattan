"use server";

import { compare, hash } from "bcryptjs";
import { randomUUID } from "crypto";
import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

// ... existing imports ...

// ... existing code ...


import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { type AdSlotContent, AD_SLOT_KEYS, adSlotKey, parseAdSlotValue, serializeAdSlotContent } from "@/lib/ad-slots";
import { sanitizeHtml, sanitizeAdHtml, sanitizeText, sanitizeUrl } from "@/lib/sanitize";
import { titleCase } from "@/lib/text-case";

// Prisma client tipi bazen oluşturulan modelleri (haber, user, siteSetting) tanımıyor; runtime doğru. Tip hatalarını kaldırmak için:
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

const STATIC_MENU_ENTRIES: Record<string, { label: string; href: string }> = {
  ana_sayfa: { label: "Ana Sayfa", href: "/" },
  yazarlar: { label: "Yazarlar", href: "/yazarlar" },
  misafir_yazarlar: { label: "Misafir Yazıları", href: "/misafir-yazarlar" },
  yazilar: { label: "Yazılar", href: "/yazilar" },
  kategoriler: { label: "Kategoriler", href: "/kategoriler" },
  fotografhane: { label: "Fotoğrafhane", href: "/fotografhane" },
  iletisim: { label: "İletişim", href: "/iletisim" },
  hakkimizda: { label: "Hakkımızda", href: "/hakkimizda" },
  arsiv: { label: "Arşiv", href: "/arsiv" },
  eski_yazilar: { label: "Eski Yazılar", href: "/eski-yazilar" },
  bakis_dergisi: { label: "Bakış Dergisi", href: "/bakis-dergisi" },
};

const STATIC_MENU_KEYS = Object.keys(STATIC_MENU_ENTRIES);
const MENU_ORDER_KEY = "menu_order";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function requireAuth() {
  const session = await auth();
  if (!session?.user?.role || !["ADMIN", "AUTHOR"].includes(session.user.role)) {
    throw new Error("Yetkisiz erişim");
  }
}

// ==========================================
// CACHED DATA FETCHING
// ==========================================

export const getMenuItems = unstable_cache(
  async () => {
    try {
      // 1. Kayıtlı sırayı al
      const orderJson = await db.siteSetting.findUnique({
        where: { key: "menu_order" },
      });
      const order = orderJson?.value ? (JSON.parse(orderJson.value) as string[]) : [];

      // 2. Tüm yayınlanmış sayfaları al (ID ve Slug eşleşmesi için)
      const pages = await db.page.findMany({
        where: { showInMenu: true, publishedAt: { lte: new Date() } },
        select: { id: true, title: true, slug: true },
      });
      const pagesById = new Map<string, { id: string; title: string; slug: string }>(
        (pages as any[]).map((p) => [p.id, p])
      );

      // 3. Sıraya göre listeyi oluştur
      const result: { href: string; label: string }[] = [];
      const seen = new Set<string>();

      // Önce kayıtlı sırayı işle
      for (const id of order) {
        if (seen.has(id)) continue;
        seen.add(id);

        if (id.startsWith("static:")) {
          const key = id.slice(7);
          // Statik menü elemanları (Ana Sayfa vb.)
          const entry = STATIC_MENU_ENTRIES[key];
          if (entry) result.push(entry);
        } else if (id.startsWith("page:")) {
          const pageId = id.slice(5);
          const p = pagesById.get(pageId);
          if (p) result.push({ href: `/sayfa/${p.slug}`, label: p.title });
        }
      }

      // Kayıtlı olmayan ama "menüde göster" denilen yeni sayfaları sona ekle
      for (const [pageId, p] of pagesById) {
        if (!seen.has(`page:${pageId}`)) {
          result.push({ href: `/sayfa/${p.slug}`, label: p.title });
        }
      }

      // Varsayılan (Eğer hiç sıra yoksa)
      if (result.length === 0) {
        return Object.values(STATIC_MENU_ENTRIES);
      }

      return result;
    } catch (error) {
      console.error("Menu fetch error:", error);
      return Object.values(STATIC_MENU_ENTRIES);
    }
  },
  ["menu-items"], // Cache Key
  {
    tags: ["menu-items"], // Revalidation Tag
    revalidate: 3600, // 1 saat (ne olur ne olmaz)
  }
);

export const getAdSlots = unstable_cache(
  async () => {
    try {
      const slots = await db.siteSetting.findMany({
        where: { key: { in: AD_SLOT_KEYS.map((k) => adSlotKey(k)) } },
      });

      const result: Record<string, AdSlotContent | null> = {};

      // Tüm slotları null olarak başlat
      for (const key of AD_SLOT_KEYS) {
        result[key] = null;
      }

      // DB'den gelenleri doldur
      for (const slot of slots) {
        // "ad_slot_header" -> "header"
        const cleanKey = slot.key.replace("ad_slot_", "");
        if (AD_SLOT_KEYS.includes(cleanKey)) {
          result[cleanKey] = parseAdSlotValue(slot.value);
        }
      }

      return result;
    } catch (error) {
      console.error("Ad slots fetch error:", error);
      return {};
    }
  },
  ["ad-slots"],
  {
    tags: ["ad-slots"],
    revalidate: 3600,
  }
);

// ... existing code ...

export async function setMenuOrder(order: string[]) {
  await requireAuth();
  await db.siteSetting.upsert({
    where: { key: "menu_order" },
    update: { value: JSON.stringify(order) },
    create: { key: "menu_order", value: JSON.stringify(order) },
  });
  revalidateTag("menu-items", { expire: 0 }); // Cache'i temizle
  revalidatePath("/");
}

// ... existing code ...



export async function createPage(formData: FormData) {
  await requireAuth();
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
  await requireAuth();
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
  await requireAuth();
  await db.$executeRaw`DELETE FROM "Page" WHERE id = ${id}`;
  revalidateTag("menu-items", { expire: 0 });
  revalidatePath("/");
  revalidatePath("/sayfa");
  revalidatePath("/admin/sayfalar");
  redirect("/admin/sayfalar?deleted=1");
}

export async function saveAllAdSlots(formData: FormData) {
  await requireAuth();
  for (const slotId of AD_SLOT_KEYS) {
    const rawHtml = ((formData.get(`slot_${slotId}_html`) as string) ?? "").trim();
    const html = rawHtml ? sanitizeAdHtml(rawHtml) : "";
    const text = sanitizeText(((formData.get(`slot_${slotId}_text`) as string) ?? "").trim());
    const rawImage = ((formData.get(`slot_${slotId}_image`) as string) ?? "").trim();
    const image = rawImage ? (sanitizeUrl(rawImage) ?? (rawImage.startsWith("/") ? rawImage : "")) : "";
    const width = sanitizeText(((formData.get(`slot_${slotId}_width`) as string) ?? "").trim());
    const height = sanitizeText(((formData.get(`slot_${slotId}_height`) as string) ?? "").trim());
    const isActive = formData.get(`slot_${slotId}_active`) === "on";
    const rawAlign = ((formData.get(`slot_${slotId}_align`) as string) ?? "").trim().toLowerCase();
    const align = rawAlign === "left" || rawAlign === "right" ? rawAlign : "center";

    let content: AdSlotContent | null = null;
    if (html) content = { type: "html", content: html, width, height, isActive, align } satisfies AdSlotContent;
    else if (image) content = { type: "image", content: image, width, height, isActive, align } satisfies AdSlotContent;
    else if (text) content = { type: "text", content: text, width, height, isActive, align } satisfies AdSlotContent;
    const value = serializeAdSlotContent(content);
    const key = adSlotKey(slotId);
    await db.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }
  revalidateTag("ad-slots", { expire: 0 });
  revalidatePath("/");
  revalidatePath("/yazilar");
  revalidatePath("/yazilar/[slug]", "page");
  revalidatePath("/admin/reklam");
  redirect("/admin/reklam?success=1");
}

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

export async function createYazi(formData: FormData) {
  await requireAuth();
  const rawTitle = formData.get("title") as string;
  const title = titleCase(sanitizeText(rawTitle || ""));
  const rawSlug = (formData.get("slug") as string) || slugify(title);
  const slug = await generateUniqueSlug(sanitizeText(rawSlug));
  const excerpt = formData.get("excerpt") as string | null;
  const rawContent = formData.get("content") as string;
  const content = rawContent ? sanitizeHtml(rawContent) : "<p></p>";
  const authorId = formData.get("authorId") as string;
  const kategoriIds = formData.getAll("kategoriIds") as string[];
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

  const yazi = await db.yazi.create({
    data: {
      title,
      slug,
      excerpt: excerpt ? sanitizeText(excerpt) : null,
      content,
      authorId,
      featuredImage: featuredImage || null,
      imageAlt,
      showInSlider,
      publishedAt: publishedAt && !isNaN(publishedAt.getTime()) ? publishedAt : null,
      metaDescription,
      metaKeywords,
      ogImage,
      ...(kategoriIds.length > 0 && {
        kategoriler: { connect: kategoriIds.map((id) => ({ id })) },
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
  await requireAuth();
  const rawTitle = formData.get("title") as string;
  const title = titleCase(sanitizeText(rawTitle || ""));
  const rawSlug = formData.get("slug") as string;
  const slug = await generateUniqueSlug(sanitizeText(rawSlug), id);
  const excerpt = formData.get("excerpt") as string | null;
  const rawContent = formData.get("content") as string;
  const content = rawContent ? sanitizeHtml(rawContent) : "<p></p>";
  const authorId = formData.get("authorId") as string;
  const kategoriIds = formData.getAll("kategoriIds") as string[];
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

  await db.yazi.update({
    where: { id },
    data: {
      title,
      slug,
      excerpt: excerpt ? sanitizeText(excerpt) : null,
      content,
      author: { connect: { id: authorId } },
      featuredImage: featuredImage || null,
      imageAlt,
      showInSlider,
      publishedAt: publishedAt && !isNaN(publishedAt.getTime()) ? publishedAt : null,
      metaDescription,
      metaKeywords,
      ogImage,
      kategoriler: {
        set: [],
        ...(kategoriIds.length > 0 && {
          connect: kategoriIds.map((k) => ({ id: k })),
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
  await requireAuth();
  await db.yazi.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/yazilar");
  revalidatePath("/admin/yazilar");
  revalidatePath("/sitemap.xml");
  redirect("/admin/yazilar?deleted=1");
}

export async function duplicateYazi(id: string) {
  await requireAuth();
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
  await requireAuth();
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
  await requireAuth();
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
  await requireAuth();
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

// KATEGORİ
export async function createKategori(formData: FormData) {
  await requireAuth();
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
  await requireAuth();
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
  await requireAuth();
  await db.kategori.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/kategoriler");
  revalidatePath("/admin/kategoriler");
  revalidatePath("/sitemap.xml");
  redirect("/admin/kategoriler?deleted=1");
}

// Menü sırası – SiteSetting "menu_order" = JSON string[] (öğe id'leri: "static:ana_sayfa" vb. veya "page:uuid")

/** Menüde gösterilecek öğe: id (static:key veya page:uuid) ve görünen adı */
export type MenuEntryForAdmin = { id: string; label: string; type: "static" | "page" };

/** Kayıtlı menü sırasını döndürür; yoksa varsayılan (sabitler + sayfalar). */
export async function getMenuOrder(): Promise<string[]> {
  try {
    const raw = await getSetting(MENU_ORDER_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as string[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    // ignore
  }
  const defaultOrder = [...STATIC_MENU_KEYS.map((k) => `static:${k}`)];
  try {
    const pages = await db.$queryRaw<{ id: string }[]>`
      SELECT id FROM "Page"
      WHERE "showInMenu" = true AND "publishedAt" IS NOT NULL
      ORDER BY "menuOrder" ASC, title ASC
    `;
    pages.forEach((p: { id: string }) => defaultOrder.push(`page:${p.id}`));
  } catch {
    // ignore
  }
  return defaultOrder;
}



/** Admin için menü öğelerini sırayla döndürür (label ile). */
export async function getMenuEntriesForAdmin(): Promise<MenuEntryForAdmin[]> {
  const order = await getMenuOrder();
  const pagesById = new Map<string, { title: string }>();
  try {
    const rows = await db.$queryRaw<{ id: string; title: string }[]>`
      SELECT id, title FROM "Page" WHERE "showInMenu" = true AND "publishedAt" IS NOT NULL
    `;
    rows.forEach((r: { id: string; title: string }) => pagesById.set(r.id, { title: r.title }));
  } catch {
    // ignore
  }
  const result: MenuEntryForAdmin[] = [];
  const seen = new Set<string>();
  for (const id of order) {
    if (seen.has(id)) continue;
    seen.add(id);
    if (id.startsWith("static:")) {
      const key = id.slice(7);
      if (STATIC_MENU_ENTRIES[key]) result.push({ id, label: STATIC_MENU_ENTRIES[key].label, type: "static" });
    } else if (id.startsWith("page:")) {
      const pageId = id.slice(5);
      const p = pagesById.get(pageId);
      if (p) result.push({ id, label: p.title, type: "page" });
    }
  }
  for (const [pageId, p] of pagesById) {
    const id = `page:${pageId}`;
    if (!seen.has(id)) result.push({ id, label: p.title, type: "page" });
  }
  return result;
}

// ÖZEL SAYFA – Admin panelinden eklenen sayfalar (menüde gösterilebilir)



export async function getPageBySlug(slug: string) {
  const rows = await db.$queryRaw<
    { id: string; title: string; slug: string; content: string; featuredImage: string | null; showInMenu: boolean; menuOrder: number; publishedAt: Date | null }[]
  >`SELECT id, title, slug, content, "featuredImage", "showInMenu", "menuOrder", "publishedAt"
    FROM "Page" WHERE slug = ${slug} AND "publishedAt" IS NOT NULL LIMIT 1`;
  return rows[0] ?? null;
}







// HABER – Ana sayfa slider'da gösterilen haberler






// PROFİL – Giriş yapan kullanıcının şifresini değiştirir


// REKLAM AYARLARI (SiteSetting) – HTML, metin veya görsel URL (öncelik: HTML > görsel > metin)
/** Tüm reklam slot içeriklerini getirir (public - sitede göstermek için) */


/** Tek slot içeriğini getirir */




// HABER – Ana sayfa slider'da gösterilen haberler
export async function createHaber(formData: FormData) {
  await requireAuth();
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
  await requireAuth();
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
  await requireAuth();
  await db.haber.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/admin/haberler");
  redirect("/admin/haberler?deleted=1");
}

// PROFİL – Giriş yapan kullanıcının şifresini değiştirir
export async function updatePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN", "AUTHOR"].includes((session.user as { role?: string }).role ?? "")) {
    throw new Error("Yetkisiz erişim");
  }
  const currentPassword = (formData.get("currentPassword") as string) || "";
  const newPassword = (formData.get("newPassword") as string) || "";
  const newPasswordConfirm = (formData.get("newPasswordConfirm") as string) || "";

  if (!currentPassword || !newPassword || !newPasswordConfirm) {
    redirect("/admin/profil?error=eksik");
  }

  if (newPassword !== newPasswordConfirm) {
    redirect("/admin/profil?error=uyusmuyor");
  }

  // Import password validator
  const { validatePassword } = await import("@/lib/password-validator");

  // Validate password strength
  const validation = validatePassword(newPassword);
  if (!validation.valid) {
    // Encode error message for URL
    const errorMsg = encodeURIComponent(validation.errors[0]);
    redirect(`/admin/profil?error=zayif&msg=${errorMsg}`);
  }

  const user = await db.yazar.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });
  if (!user) redirect("/admin/profil?error=bulunamadi");

  const isValid = await compare(currentPassword, user.password || "");
  if (!isValid) redirect("/admin/profil?error=yanlis");

  // Check if new password is same as old password
  const isSameAsOld = await compare(newPassword, user.password || "");
  if (isSameAsOld) {
    redirect("/admin/profil?error=ayni");
  }

  const hashedPassword = await hash(newPassword, 12);
  await db.yazar.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  });

  // Log password change
  const { logPasswordChange } = await import("@/lib/security-logger");
  await logPasswordChange(session.user.id);

  revalidatePath("/admin/profil");
  redirect("/admin/profil?success=1");
}

async function getSetting(key: string): Promise<string> {
  try {
    const row = await db.siteSetting.findUnique({ where: { key } });
    return row?.value ?? "";
  } catch {
    return "";
  }
}

// HAKKIMIZDA SAYFA İÇERİĞİ (SiteSetting)
const HAKKIMIZDA_KEYS = {
  mainTitle: "hakkimizda_main_title",
  mainContent: "hakkimizda_main_content",
  detailsTitle: "hakkimizda_details_title",
  detailsContent: "hakkimizda_details_content",
  rulesTitle: "hakkimizda_rules_title",
  rulesContent: "hakkimizda_rules_content",
} as const;

export type HakkimizdaContent = {
  mainTitle: string;
  mainContent: string;
  detailsTitle: string;
  detailsContent: string;
  rulesTitle: string;
  rulesContent: string;
  imageUrl: string | null;
};

/** Hakkımızda sayfa içeriğini getirir */
export async function getHakkimizdaContent(): Promise<HakkimizdaContent> {
  const [mainTitle, mainContent, detailsTitle, detailsContent, rulesTitle, rulesContent, imageUrl] = await Promise.all([
    getSetting(HAKKIMIZDA_KEYS.mainTitle),
    getSetting(HAKKIMIZDA_KEYS.mainContent),
    getSetting(HAKKIMIZDA_KEYS.detailsTitle),
    getSetting(HAKKIMIZDA_KEYS.detailsContent),
    getSetting(HAKKIMIZDA_KEYS.rulesTitle),
    getSetting(HAKKIMIZDA_KEYS.rulesContent),
    getSetting("hakkimizda_image_url"),
  ]);

  // Varsayılan değerler (eğer veritabanı boşsa)
  return {
    mainTitle: mainTitle || "Hayattan.net Nedir? Sorularına İthafen?",
    mainContent: mainContent || "<p>Hayatın Engelsiz Tarafı can bağıyla, duyguların, fikirlerin ve hayata yansıması...</p>",
    detailsTitle: detailsTitle || "Hayattan.net Sitesi İçin Bilinmesi Gereken Detaylar",
    detailsContent: detailsContent || "<ul><li>Daimî Yazar Kadrosunda bulunan yazarlarımız yol arkadaşlarımızdır.</li></ul>",
    rulesTitle: rulesTitle || "Yayınlanacak Yazılar İçin Uyulması Gereken Bazı Kurallar",
    rulesContent: rulesContent || "<ul><li>Yazılar siyasi ve ideolojik düşünceler içermeyecek.</li></ul>",
    imageUrl: imageUrl || null,
  };
}

/** Hakkımızda içeriğini kaydeder */
export async function saveHakkimizdaContent(formData: FormData) {
  await requireAuth();

  const entries: [string, string][] = [
    [HAKKIMIZDA_KEYS.mainTitle, sanitizeText((formData.get("mainTitle") as string) ?? "")],
    [HAKKIMIZDA_KEYS.mainContent, sanitizeHtml((formData.get("mainContent") as string) ?? "")],
    [HAKKIMIZDA_KEYS.detailsTitle, sanitizeText((formData.get("detailsTitle") as string) ?? "")],
    [HAKKIMIZDA_KEYS.detailsContent, sanitizeHtml((formData.get("detailsContent") as string) ?? "")],
    [HAKKIMIZDA_KEYS.rulesTitle, sanitizeText((formData.get("rulesTitle") as string) ?? "")],
    [HAKKIMIZDA_KEYS.rulesContent, sanitizeHtml((formData.get("rulesContent") as string) ?? "")],
    ["hakkimizda_image_url", (formData.get("imageUrl") as string) ?? ""],
  ];

  for (const [key, value] of entries) {
    await db.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  }

  revalidatePath("/hakkimizda");
  revalidatePath("/admin/hakkimizda");
  redirect("/admin/hakkimizda?success=1");
}



// DASHBOARD ANALYTICS
export type DashboardStats = {
  activity: { date: string; posts: number }[];
  categoryDistribution: { name: string; value: number }[];
};

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAuth();

  // 1. Last 30 days activity (Content creation)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const posts = await db.yazi.findMany({
    where: {
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
    select: {
      createdAt: true,
    },
  });

  // Group by date
  const activityMap = new Map<string, number>();

  // Initialize last 30 days with 0
  for (let i = 0; i < 30; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
    activityMap.set(dateStr, 0);
  }

  posts.forEach((post: { createdAt: Date }) => {
    const dateStr = new Date(post.createdAt).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
    if (activityMap.has(dateStr)) {
      activityMap.set(dateStr, (activityMap.get(dateStr) || 0) + 1);
    }
  });

  // Convert map to array and reverse to show oldest to newest
  const activity = Array.from(activityMap.entries())
    .map(([date, posts]) => ({ date, posts }))
    .reverse();

  // 2. Category distribution
  const categories = await db.kategori.findMany({
    include: {
      _count: {
        select: { yazilar: true },
      },
    },
  });

  const categoryDistribution = categories.map((cat: { name: string; _count: { yazilar: number } }) => ({
    name: cat.name,
    value: cat._count.yazilar,
  })).sort((a: { value: number }, b: { value: number }) => b.value - a.value).slice(0, 5); // Top 5 categories

  return {
    activity,
    categoryDistribution,
  };
}
