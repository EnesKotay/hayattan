/**
 * WordPress'ten devralınan /wp-content/uploads/... görsellerini R2'ye taşır.
 *
 * Neden: Vercel WAF /wp-content/* yollarını 403 ile bloklıyor, bu yüzden
 * eski yazıların öne çıkan görselleri hem sayfada hem og:image'de kırık.
 *
 * Kullanım:
 *   npx tsx scripts/migrate-wp-media.ts upload   → dosyaları R2'ye yükler (idempotent)
 *   npx tsx scripts/migrate-wp-media.ts rewrite  → DB'deki URL'leri günceller (önce yedek alır)
 *   npx tsx scripts/migrate-wp-media.ts restore  → yedekten geri alır
 */
import { PrismaClient } from "@prisma/client";
import { S3Client, PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
const BUCKET = process.env.R2_BUCKET_NAME!;

/** Eski dosyaların bulunduğu yerel kök (WordPress export'u) */
const LOCAL_ROOT = "hayattan/public";
/** R2'de kullanılacak önek: /wp-content/uploads/x → wp/uploads/x */
const R2_PREFIX = "wp";
/**
 * Her çalıştırma kendi yedeğini yazar. Tek bir sabit dosya kullanmak, yarıda kalan
 * bir aktarımdan sonra ikinci çalıştırmanın ilk yedeği ezmesine yol açıyordu.
 */
const BACKUP_DIR = "scripts/.wp-media-backups";

const WP_REF = /wp-content\/uploads\//;
const CONTENT_REF = /["'(]([^"')\s]*wp-content\/uploads\/[^"')\s]+)/g;

const MIME: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".mp3": "audio/mpeg",
  ".pdf": "application/pdf",
};

/** Mutlak ya da göreli bir wp URL'sini /wp-content/... biçiminde normalize eder */
function toRelative(url: string): string {
  const withoutHost = url.replace(/^https?:\/\/[^/]+/, "");
  return decodeURIComponent(withoutHost.split("?")[0].split("#")[0]);
}

/** /wp-content/uploads/2020/07/a.jpg → wp/uploads/2020/07/a.jpg */
function toR2Key(relative: string): string {
  return relative.replace(/^\/wp-content\//, `${R2_PREFIX}/`);
}

/** R2 anahtarını proxy URL'sine çevirir; her segment ayrı ayrı encode edilir */
function toProxyUrl(key: string): string {
  return `/api/r2/file/${key.split("/").map(encodeURIComponent).join("/")}`;
}

/** DB'de wp-content geçen tüm farklı dosya yollarını toplar */
async function collectReferences(): Promise<Set<string>> {
  const refs = new Set<string>();

  const featured = await prisma.yazi.findMany({
    where: { featuredImage: { contains: "wp-content" } },
    select: { featuredImage: true },
  });
  for (const row of featured) refs.add(toRelative(row.featuredImage!));

  const bodies = await prisma.yazi.findMany({
    where: { content: { contains: "wp-content" } },
    select: { content: true },
  });
  for (const row of bodies) {
    for (const match of row.content.matchAll(CONTENT_REF)) {
      refs.add(toRelative(match[1]));
    }
  }

  return refs;
}

async function upload() {
  const refs = await collectReferences();
  console.log(`${refs.size} farklı dosya bulundu.`);

  let uploaded = 0;
  let skipped = 0;
  let missing = 0;
  let index = 0;

  for (const relative of refs) {
    index++;
    const localPath = path.join(LOCAL_ROOT, relative);
    if (!fs.existsSync(localPath)) {
      console.warn(`  [yok] ${relative}`);
      missing++;
      continue;
    }

    const key = toR2Key(relative);

    try {
      await r2.send(new HeadObjectCommand({ Bucket: BUCKET, Key: key }));
      skipped++;
      continue;
    } catch {
      // yoksa yükle
    }

    const ext = path.extname(localPath).toLowerCase();
    await r2.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: fs.readFileSync(localPath),
        ContentType: MIME[ext] ?? "application/octet-stream",
      })
    );
    uploaded++;

    if (index % 50 === 0) {
      console.log(`  ${index}/${refs.size} işlendi (yüklenen: ${uploaded}, atlanan: ${skipped})`);
    }
  }

  console.log(`\nBitti — yüklenen: ${uploaded}, zaten vardı: ${skipped}, bulunamadı: ${missing}`);
}

async function rewrite() {
  const rows = await prisma.yazi.findMany({
    where: {
      OR: [{ featuredImage: { contains: "wp-content" } }, { content: { contains: "wp-content" } }],
    },
    select: { id: true, featuredImage: true, content: true },
  });

  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const backupFile = path.join(BACKUP_DIR, `${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  fs.writeFileSync(backupFile, JSON.stringify(rows, null, 2));
  console.log(`${rows.length} yazı güncellenecek. Yedek: ${backupFile}`);

  let updated = 0;
  for (const row of rows) {
    const data: { featuredImage?: string; content?: string } = {};

    if (row.featuredImage && WP_REF.test(row.featuredImage)) {
      data.featuredImage = toProxyUrl(toR2Key(toRelative(row.featuredImage)));
    }

    if (WP_REF.test(row.content)) {
      data.content = row.content.replace(CONTENT_REF, (full, url: string) => {
        const quote = full[0];
        return `${quote}${toProxyUrl(toR2Key(toRelative(url)))}`;
      });
    }

    if (Object.keys(data).length === 0) continue;

    // Supabase pooler bağlantısı uzun döngülerde kopabiliyor; koptuğu yerde
    // durmak yerine birkaç kez deneyip devam ediyoruz. Tekrar çalıştırıldığında
    // zaten dönüştürülmüş satırlar sorguya girmediği için işlem kaldığı yerden sürer.
    for (let attempt = 1; ; attempt++) {
      try {
        await prisma.yazi.update({ where: { id: row.id }, data });
        break;
      } catch (error) {
        if (attempt >= 5) throw error;
        console.warn(`  yeniden deneniyor (${attempt}/5): ${row.id}`);
        await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
      }
    }

    updated++;
    if (updated % 100 === 0) console.log(`  ${updated}/${rows.length}`);
  }

  console.log(`\nBitti — ${updated} yazı güncellendi.`);
}

async function restore() {
  if (!fs.existsSync(BACKUP_DIR)) throw new Error(`Yedek dizini yok: ${BACKUP_DIR}`);
  // En eski yedek orijinal içeriği taşır; eskiden yeniye uygulayınca
  // her satır ilk hâline döner.
  const files = fs.readdirSync(BACKUP_DIR).filter((f) => f.endsWith(".json")).sort();
  if (files.length === 0) throw new Error(`${BACKUP_DIR} içinde yedek yok.`);

  let restored = 0;
  for (const file of files) {
    const rows: { id: string; featuredImage: string | null; content: string }[] = JSON.parse(
      fs.readFileSync(path.join(BACKUP_DIR, file), "utf8")
    );
    for (const row of rows) {
      await prisma.yazi.update({
        where: { id: row.id },
        data: { featuredImage: row.featuredImage, content: row.content },
      });
      restored++;
    }
    console.log(`  ${file}: ${rows.length} satır`);
  }
  console.log(`${restored} güncelleme geri alındı.`);
}

const command = process.argv[2];
const actions: Record<string, () => Promise<void>> = { upload, rewrite, restore };

if (!actions[command]) {
  console.error("Kullanım: npx tsx scripts/migrate-wp-media.ts <upload|rewrite|restore>");
  process.exit(1);
}

actions[command]()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
