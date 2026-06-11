import { hash } from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const newPassword = "Msk872190Omo";
    const hashedPassword = await hash(newPassword, 12);

    const yazar = await prisma.yazar.findFirst({
        where: {
            OR: [
                { role: "ADMIN" },
                { email: "admin@hayattan.net" }
            ]
        }
    });

    if (!yazar) {
        console.log("❌ Admin kullanıcısı Yazar tablosunda bulunamadı.");
        return;
    }

    await prisma.yazar.update({
        where: { id: yazar.id },
        data: { password: hashedPassword }
    });

    console.log(`✅ ${yazar.email} için şifre başarıyla güncellendi!`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
