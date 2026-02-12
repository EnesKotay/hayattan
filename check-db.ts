
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const settings = await prisma.siteSetting.findMany();
    console.log("--- Site Settings ---");
    settings.forEach(s => {
        if (s.key === "menu_order") {
            console.log("MENU ORDER:", s.value);
        }
    });

    const pages = await prisma.page.findMany({
        select: { id: true, title: true, slug: true }
    });
    console.log("--- Pages ---");
    console.log(pages);
}

main().catch(console.error).finally(() => prisma.$disconnect());
