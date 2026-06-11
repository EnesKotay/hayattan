import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: Request) {
    try {
        const session = await auth();
        if (!session?.user?.role || !["ADMIN", "AUTHOR"].includes(session.user.role)) {
            return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get("query");
        const page = searchParams.get("page") || "1";
        const per_page = "12";

        // Placeholder key or env variable
        const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;

        if (!UNSPLASH_ACCESS_KEY) {
            return NextResponse.json(
                { error: "Unsplash API anahtarı yapılandırılmamış." },
                { status: 500 }
            );
        }

        const unsplashUrl = query
            ? `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${per_page}&client_id=${UNSPLASH_ACCESS_KEY}`
            : `https://api.unsplash.com/photos?page=${page}&per_page=${per_page}&client_id=${UNSPLASH_ACCESS_KEY}`;

        const response = await fetch(unsplashUrl);

        if (!response.ok) {
            // Handle rate limits or errors
            const errorData = await response.json();
            return NextResponse.json({ error: errorData.errors?.[0] || "Unsplash hatası." }, { status: response.status });
        }

        const data = await response.json();

        // Normalize data
        const images = (query ? data.results : data).map((img: any) => ({
            id: img.id,
            url: img.urls.regular,
            thumbnail: img.urls.small,
            download_location: img.links.download_location, // Needed for attribution triggering
            photographer: img.user.name,
            photographer_url: img.user.links.html,
            description: img.alt_description || img.description || "Unsplash Photo",
        }));

        return NextResponse.json({ images, total_pages: data.total_pages || 10 });

    } catch (e) {
        console.error("Unsplash proxy error:", e);
        return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
    }
}
