
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const category = await prisma.kategori.findUnique({
            where: { slug: "fotografhane" },
            include: {
                _count: {
                    select: {
                        yazilar: { where: { publishedAt: { not: null } } }
                    }
                },
                yazilar: {
                    take: 5,
                    select: { title: true, publishedAt: true }
                }
            }
        });

        // Also count total raw
        const totalRaw = await prisma.yazi.count({
            where: { kategoriler: { some: { slug: 'fotografhane' } } }
        });

        return NextResponse.json({
            category,
            totalRawArticles: totalRaw
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
