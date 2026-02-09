import { prisma } from "@/lib/db";

async function main() {
    const c = await prisma.kategori.findFirst({
        where: {
            OR: [
                { name: { contains: "Bakış", mode: "insensitive" } },
                { slug: { contains: "bakis", mode: "insensitive" } }
            ]
        }
    });
    console.log("Found Category:", c);
}

main();
