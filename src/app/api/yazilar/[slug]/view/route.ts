import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Yazı sayfası görüntülendiğinde okunma sayısını +1 artırır.
 * Sadece yayındaki yazılar için çalışır.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "Slug gerekli" }, { status: 400 });
    }

    await prisma.yazi.updateMany({
      where: {
        slug: slug.trim(),
        publishedAt: { lte: new Date() },
      },
      data: {
        viewCount: { increment: 1 },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("View count increment error:", error);
    return NextResponse.json(
      { error: "Okunma sayısı güncellenemedi" },
      { status: 500 }
    );
  }
}
