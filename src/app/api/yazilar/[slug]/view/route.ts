import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * Yazı sayfası görüntülendiğinde okunma sayısını +1 artırır.
 * Sadece yayındaki yazılar için çalışır.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    if (!slug || typeof slug !== "string") {
      return NextResponse.json({ error: "Slug gerekli" }, { status: 400 });
    }

    const viewKey = createHash("sha256").update(slug.trim()).digest("hex").slice(0, 12);
    const previousViews = (request.cookies.get("hayattan_views")?.value ?? "")
      .split(".")
      .filter(Boolean);
    if (previousViews.includes(viewKey)) {
      return new NextResponse(null, { status: 204 });
    }

    const result = await prisma.yazi.updateMany({
      where: {
        slug: slug.trim(),
        publishedAt: { lte: new Date() },
      },
      data: {
        viewCount: { increment: 1 },
      },
    });

    const response = new NextResponse(null, { status: 204 });
    if (result.count > 0) {
      response.cookies.set("hayattan_views", [viewKey, ...previousViews].slice(0, 50).join("."), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });
    }
    return response;
  } catch (error) {
    console.error("View count increment error:", error);
    return NextResponse.json(
      { error: "Okunma sayısı güncellenemedi" },
      { status: 500 }
    );
  }
}
