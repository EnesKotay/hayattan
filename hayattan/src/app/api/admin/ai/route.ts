import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateExcerpt, generateMetaDescription } from "@/lib/ai";

export async function POST(req: Request) {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    try {
        const { action, content, title } = await req.json();

        if (action === "excerpt") {
            const result = await generateExcerpt(content);
            return NextResponse.json({ result });
        }

        if (action === "meta") {
            const result = await generateMetaDescription(title, content);
            return NextResponse.json({ result });
        }

        return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
