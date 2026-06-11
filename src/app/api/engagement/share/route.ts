import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { shareCountKey, parseCounter } from "@/lib/engagement";

export async function POST(request: NextRequest) {
  try {
    const { articleId } = await request.json();

    if (!articleId || typeof articleId !== "string") {
      return NextResponse.json({ error: "Geçersiz yazı kimliği." }, { status: 400 });
    }

    const key = shareCountKey(articleId);

    await prisma.$transaction(async (tx) => {
      const existing = await tx.siteSetting.findUnique({ where: { key } });
      const nextValue = String(parseCounter(existing?.value) + 1);

      if (existing) {
        await tx.siteSetting.update({
          where: { key },
          data: { value: nextValue },
        });
        return;
      }

      await tx.siteSetting.create({
        data: { key, value: nextValue },
      });
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Paylaşım kaydı oluşturulamadı." }, { status: 500 });
  }
}
