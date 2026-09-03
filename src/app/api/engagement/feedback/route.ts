import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import {
  feedbackCountKey,
  type FeedbackValue,
} from "@/lib/engagement";

export async function POST(request: NextRequest) {
  try {
    const { articleId, value } = await request.json();

    if (!articleId || typeof articleId !== "string") {
      return NextResponse.json({ error: "Geçersiz yazı kimliği." }, { status: 400 });
    }

    if (value !== "up" && value !== "down") {
      return NextResponse.json({ error: "Geçersiz geri bildirim." }, { status: 400 });
    }

    const article = await prisma.yazi.findFirst({
      where: { id: articleId, publishedAt: { lte: new Date() } },
      select: { id: true },
    });
    if (!article) {
      return NextResponse.json({ error: "Yazı bulunamadı." }, { status: 404 });
    }

    const key = feedbackCountKey(articleId, value as FeedbackValue);
    await prisma.$executeRaw`
      INSERT INTO "SiteSetting" ("id", "key", "value")
      VALUES (${randomUUID()}, ${key}, '1')
      ON CONFLICT ("key") DO UPDATE
      SET "value" = (COALESCE(NULLIF("SiteSetting"."value", ''), '0')::integer + 1)::text
    `;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Geri bildirim kaydedilemedi." }, { status: 500 });
  }
}
