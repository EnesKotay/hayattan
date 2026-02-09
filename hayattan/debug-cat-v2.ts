
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const categories = await prisma.kategori.findMany();
        console.log("Categories:", JSON.stringify(categories, null, 2));

        // Check specifically for fotografhane
        const photoCat = categories.find(c => c.slug === 'fotografhane');
        if (!photoCat) {
            console.log("Category 'fotografhane' NOT FOUND.");
        } else {
            console.log("Category 'fotografhane' FOUND:", photoCat);

            const articles = await prisma.yazi.count({
                where: {
                    kategoriler: {
                        some: {
                            slug: 'fotografhane'
                        }
                    }
                }
            });
            console.log(`Articles in 'fotografhane': ${articles}`);
        }
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
