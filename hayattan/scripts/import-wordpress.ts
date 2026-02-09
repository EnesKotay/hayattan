/**
 * WordPress (MySQL) verisini Prisma/PostgreSQL'e aktarır.
 *
 * Ön koşul:
 * 1. 94_73_148_159.sql dosyası MySQL/MariaDB'ye import edilmiş olmalı.
 * 2. .env içinde MYSQL_URL tanımlı olmalı (örn. mysql://root:sifre@localhost:3306/db_hayattan_net)
 * 3. PostgreSQL tabloları hazır olmalı (npx prisma db push)
 *
 * Çalıştırma: npx tsx scripts/import-wordpress.ts
 */

import "dotenv/config";
import mysql from "mysql2/promise";
import { prisma } from "../src/lib/db";

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

function ensureUniqueSlug(slug: string, existing: Set<string>): string {
  let s = slug || "slug";
  let n = 1;
  while (existing.has(s)) {
    s = `${slug}-${n}`;
    n++;
  }
  existing.add(s);
  return s;
}

async function main() {
  const mysqlUrl = process.env.MYSQL_URL;
  if (!mysqlUrl) {
    console.error("Hata: .env dosyasında MYSQL_URL tanımlı değil.");
    console.error('Örnek: MYSQL_URL="mysql://root:sifre@localhost:3306/db_hayattan_net"');
    process.exit(1);
  }

  console.log("MySQL'e bağlanılıyor...");
  const conn = await mysql.createConnection(mysqlUrl);

  try {
    // 1) Yazarlar: wp_users → Yazar (yazı yazan kullanıcılar)
    // Aynı isimdeki kullanıcılar tek Yazar'da birleştirilir (tekrar eden isimler önlenir)
    const [users] = await conn.execute<mysql.RowDataPacket[]>(
      `SELECT u.ID, u.display_name, u.user_nicename, u.user_login, u.user_email
       FROM wp_users u
       INNER JOIN wp_posts p ON p.post_author = u.ID AND p.post_type = 'post' AND p.post_status = 'publish'
       GROUP BY u.ID
       ORDER BY u.ID`
    );

    const nameToUsers = new Map<string, mysql.RowDataPacket[]>();
    for (const u of users) {
      const name = (u.display_name || u.user_login || `Yazar ${u.ID}`).trim();
      if (!nameToUsers.has(name)) nameToUsers.set(name, []);
      nameToUsers.get(name)!.push(u);
    }

    const authorIdMap = new Map<number, string>();
    const yazarSlugs = new Set<string>();

    for (const [name, group] of nameToUsers) {
      const first = group[0];
      const baseSlug = (first.user_nicename || slugify(name)).slice(0, 100);
      const slug = ensureUniqueSlug(baseSlug, yazarSlugs);
      const email = first.user_email && String(first.user_email).trim() ? first.user_email : null;

      const yazar = await prisma.yazar.upsert({
        where: { slug },
        update: { name, email: email ?? undefined },
        create: { name, slug, email, misafir: false },
      });
      for (const u of group) {
        authorIdMap.set(u.ID, yazar.id);
      }
    }
    console.log(`✅ ${nameToUsers.size} yazar aktarıldı (${users.length} WP kullanıcısı birleştirildi).`);

    // 2) Kategoriler: wp_terms + wp_term_taxonomy (taxonomy = category)
    const [categories] = await conn.execute<mysql.RowDataPacket[]>(
      `SELECT tt.term_taxonomy_id, t.name, t.slug
       FROM wp_term_taxonomy tt
       INNER JOIN wp_terms t ON t.term_id = tt.term_id
       WHERE tt.taxonomy = 'category'`
    );

    const categoryIdMap = new Map<number, string>();
    const kategoriSlugs = new Set<string>();

    for (const c of categories) {
      const name = (c.name || `Kategori ${c.term_taxonomy_id}`).trim();
      const baseSlug = (c.slug || slugify(name)).slice(0, 100);
      const slug = ensureUniqueSlug(baseSlug, kategoriSlugs);

      const kategori = await prisma.kategori.upsert({
        where: { slug },
        update: { name },
        create: { name, slug },
      });
      categoryIdMap.set(c.term_taxonomy_id, kategori.id);
    }
    console.log(`✅ ${categoryIdMap.size} kategori aktarıldı.`);

    // 3) Kapak resimleri: post_id -> attachment URL (wp_postmeta _thumbnail_id -> wp_posts guid)
    const [thumbRows] = await conn.execute<mysql.RowDataPacket[]>(
      `SELECT pm.post_id, pm.meta_value AS attachment_id
       FROM wp_postmeta pm
       WHERE pm.meta_key = '_thumbnail_id' AND pm.meta_value != '' AND pm.meta_value REGEXP '^[0-9]+$'`
    );
    const thumbPostIds = thumbRows.map((r) => parseInt(r.post_id, 10));
    const thumbAttachmentIds = [...new Set(thumbRows.map((r) => parseInt(r.attachment_id, 10)))];

    let thumbUrls: Map<number, string> = new Map();
    if (thumbAttachmentIds.length > 0) {
      const placeholders = thumbAttachmentIds.map(() => "?").join(",");
      const [attachments] = await conn.execute<mysql.RowDataPacket[]>(
        `SELECT ID, guid FROM wp_posts WHERE ID IN (${placeholders}) AND post_type = 'attachment'`,
        thumbAttachmentIds
      );
      const idToUrl = new Map(attachments.map((a) => [a.ID, a.guid || ""]));
      for (const r of thumbRows) {
        const url = idToUrl.get(parseInt(r.attachment_id, 10));
        if (url) thumbUrls.set(parseInt(r.post_id, 10), url);
      }
    }

    // 4) Yazılar: wp_posts (post_type=post, post_status=publish)
    const [posts] = await conn.execute<mysql.RowDataPacket[]>(
      `SELECT ID, post_author, post_title, post_name, post_content, post_excerpt, post_date_gmt, post_status
       FROM wp_posts
       WHERE post_type = 'post' AND post_status = 'publish'
       ORDER BY post_date_gmt ASC`
    );

    const yaziSlugs = new Set<string>();
    let created = 0;
    let skipped = 0;

    for (const p of posts) {
      const authorId = authorIdMap.get(p.post_author);
      if (!authorId) {
        skipped++;
        continue;
      }

      const title = (p.post_title || `Yazı ${p.ID}`).trim();
      if (!title) {
        skipped++;
        continue;
      }

      const baseSlug = (p.post_name || slugify(title)).slice(0, 100).replace(/[^a-z0-9\-]/g, "-") || "yazi";
      const slug = ensureUniqueSlug(baseSlug, yaziSlugs);

      const content = p.post_content ?? "";
      const excerpt = (p.post_excerpt ?? "").trim() || null;
      let publishedAt: Date | null = null;
      if (p.post_date_gmt) {
        const d = new Date(p.post_date_gmt);
        if (!isNaN(d.getTime())) publishedAt = d;
      }
      const featuredImage = thumbUrls.get(p.ID) || null;

      const kategoriIds = await getCategoryIds(conn, p.ID, categoryIdMap);
      await prisma.yazi.create({
        data: {
          title,
          slug,
          content: content || "<p></p>",
          excerpt,
          publishedAt,
          featuredImage,
          authorId,
          ...(kategoriIds.length > 0 && { kategoriler: { connect: kategoriIds.map((id) => ({ id })) } }),
        },
      });
      created++;
      if (created % 100 === 0) console.log(`   ${created} yazı işlendi...`);
    }

    console.log(`✅ ${created} yazı aktarıldı. (${skipped} atlandı)`);
  } finally {
    await conn.end();
  }

  console.log("\n🎉 Aktarım tamamlandı.");
}

async function getCategoryIds(
  conn: mysql.Connection,
  postId: number,
  categoryIdMap: Map<number, string>
): Promise<string[]> {
  const [rows] = await conn.execute<mysql.RowDataPacket[]>(
    `SELECT term_taxonomy_id FROM wp_term_relationships WHERE object_id = ?`,
    [postId]
  );
  const ids: string[] = [];
  for (const r of rows) {
    const tid = r.term_taxonomy_id;
    const id = categoryIdMap.get(tid);
    if (id) ids.push(id);
  }
  return ids;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
