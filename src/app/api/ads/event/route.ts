import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AD_SLOT_KEYS, adMetricKey, type AdMetricType } from "@/lib/ad-slots";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const slotId = typeof body.slotId === "string" ? body.slotId : "";
    const event = body.event as AdMetricType;

    if (!AD_SLOT_KEYS.includes(slotId as (typeof AD_SLOT_KEYS)[number])) {
      return NextResponse.json({ error: "Geçersiz reklam alanı." }, { status: 400 });
    }
    if (event !== "impression" && event !== "click") {
      return NextResponse.json({ error: "Geçersiz reklam olayı." }, { status: 400 });
    }

    const key = adMetricKey(slotId, event);
    await prisma.$transaction(async (transaction) => {
      const existing = await transaction.siteSetting.findUnique({ where: { key } });
      const nextValue = String(Math.max(0, Number.parseInt(existing?.value ?? "0", 10) || 0) + 1);
      if (existing) {
        await transaction.siteSetting.update({ where: { key }, data: { value: nextValue } });
      } else {
        await transaction.siteSetting.create({ data: { key, value: nextValue } });
      }
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Reklam istatistiği kaydedilemedi." }, { status: 500 });
  }
}
