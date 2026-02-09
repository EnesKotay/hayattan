
import { prisma } from "./src/lib/db";

async function main() {
    const categories = await prisma.kategori.findMany({
        select: { name: true, slug: true, _count: { select: { yazilar: true } } }
    });
    console.log("Categories:", JSON.stringify(categories, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
