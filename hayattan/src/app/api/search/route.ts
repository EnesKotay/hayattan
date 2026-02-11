import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query || query.trim().length < 2) {
        return NextResponse.json({ results: [] });
    }

    const searchTerm = query.trim().toLowerCase();

    try {
        // Search in yazılar (posts)
        const posts = await prisma.yazi.findMany({
            where: {
                OR: [
                    { title: { contains: searchTerm, mode: "insensitive" } },
                    { content: { contains: searchTerm, mode: "insensitive" } },
                ],
                publishedAt: { not: null }, // equivalent to yayinda: true if using publishedAt
            },
            select: {
                id: true,
                title: true,
                slug: true,
            },
            take: 5,
        });

        // Search in kategoriler (categories)
        const categories = await prisma.kategori.findMany({
            where: {
                name: { contains: searchTerm, mode: "insensitive" },
            },
            select: {
                id: true,
                name: true,
                slug: true,
            },
            take: 3,
        });

        // Search in yazarlar (authors)
        const authors = await prisma.yazar.findMany({
            where: {
                name: { contains: searchTerm, mode: "insensitive" },
            },
            orderBy: [
                { sortOrder: "asc" },
                { yazilar: { _count: "desc" } },
                { name: "asc" }
            ] as any,
            select: {
                id: true,
                name: true,
                slug: true,
            },
            take: 3,
        });

        const results = [
            ...posts.map((post) => ({
                id: post.id,
                title: post.title,
                slug: post.slug,
                type: "yazi" as const,
            })),
            ...categories.map((cat) => ({
                id: cat.id,
                title: cat.name,
                slug: cat.slug,
                type: "kategori" as const,
            })),
            ...authors.map((author) => ({
                id: author.id,
                title: author.name,
                slug: author.slug,
                type: "yazar" as const,
            })),
        ];

        return NextResponse.json({ results });
    } catch (error) {
        console.error("Search API error:", error);
        return NextResponse.json({ results: [] }, { status: 500 });
    }
}
