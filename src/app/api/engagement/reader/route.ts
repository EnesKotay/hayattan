import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { repository } from "@/backend/modules/data/repository";
import { READER_EVENTS, READER_PREFIX } from "@/shared/engagement/reader-metrics";

const payloadSchema = z.object({
  articleId: z.string().min(1).max(100),
  events: z.array(z.enum(READER_EVENTS)).min(1).max(READER_EVENTS.length),
}).strict();

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return new NextResponse(null, { status: 403 });
  if (request.headers.get("sec-fetch-site") === "cross-site") return new NextResponse(null, { status: 403 });
  try {
    const body = await request.text();
    if (body.length > 2048) return new NextResponse(null, { status: 413 });
    let json: unknown;
    try { json = JSON.parse(body); } catch { return new NextResponse(null, { status: 400 }); }
    const parsed = payloadSchema.safeParse(json);
    if (!parsed.success) return new NextResponse(null, { status: 400 });
    const { articleId } = parsed.data;
    const article = await repository.yazi.findFirst({
      where: { id: articleId, publishedAt: { lte: new Date() }, author: { ayrilmis: false } },
      select: { id: true },
    });
    if (!article) return new NextResponse(null, { status: 404 });
    const key = `${READER_PREFIX}${new Date().toISOString().slice(0, 10)}:${articleId}`;
    // JSON counters are incremented atomically, including simultaneous readers.
    await repository.$transaction([...new Set(parsed.data.events)].map(event => repository.$executeRaw`
      INSERT INTO "SiteSetting" ("id", "key", "value")
      VALUES (${randomUUID()}, ${key}, ${JSON.stringify({ [event]: 1 })})
      ON CONFLICT ("key") DO UPDATE SET "value" =
        jsonb_set("SiteSetting"."value"::jsonb, ARRAY[${event}]::text[],
          to_jsonb(COALESCE(("SiteSetting"."value"::jsonb ->> ${event})::bigint, 0) + 1))::text
    `));
    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 500 });
  }
}
