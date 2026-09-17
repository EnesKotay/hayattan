"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { runInBatches } from "@/backend/infrastructure/database/db";
import { db, getSetting, requireAdmin } from "@/backend/modules/admin/context";
import { sanitizeHtml, sanitizeText } from "@/backend/security/sanitize";

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
  const [mainTitle, mainContent, detailsTitle, detailsContent, rulesTitle, rulesContent, imageUrl] = await runInBatches([
    () => getSetting(HAKKIMIZDA_KEYS.mainTitle),
    () => getSetting(HAKKIMIZDA_KEYS.mainContent),
    () => getSetting(HAKKIMIZDA_KEYS.detailsTitle),
    () => getSetting(HAKKIMIZDA_KEYS.detailsContent),
    () => getSetting(HAKKIMIZDA_KEYS.rulesTitle),
    () => getSetting(HAKKIMIZDA_KEYS.rulesContent),
    () => getSetting("hakkimizda_image_url"),
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
  await requireAdmin();

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
