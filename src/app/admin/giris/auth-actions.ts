"use server";

import { hash } from "bcryptjs";
import { createHash, randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/mail";
import { validatePassword } from "@/lib/password-validator";

const db = prisma as any;

export async function forgotPassword(formData: FormData) {
    const email = ((formData.get("email") as string) || "").trim().toLowerCase();
    if (!email) redirect("/admin/giris/sifremi-unuttum?error=eksik");

    const yazar = await db.yazar.findUnique({
        where: { email },
    });

    if (!yazar) redirect("/admin/giris/sifremi-unuttum?success=1");

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expires = new Date(Date.now() + 3600 * 1000); // 1 saat geçerli

    await db.passwordResetToken.deleteMany({ where: { email } });
    await db.passwordResetToken.create({
        data: {
            email,
            tokenHash,
            expires,
        },
    });

    await sendPasswordResetEmail(email, token);

    redirect("/admin/giris/sifremi-unuttum?success=1");
}

export async function resetPassword(formData: FormData) {
    const token = (formData.get("token") as string) || "";
    const password = (formData.get("password") as string) || "";
    const passwordConfirm = (formData.get("passwordConfirm") as string) || "";

    if (!token || !password || !passwordConfirm) {
        redirect(`/admin/giris/sifre-sifirla?token=${token}&error=eksik`);
    }

    if (password !== passwordConfirm) {
        redirect(`/admin/giris/sifre-sifirla?token=${token}&error=uyusmuyor`);
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
        redirect(`/admin/giris/sifre-sifirla?token=${encodeURIComponent(token)}&error=zayif`);
    }

    const tokenHash = createHash("sha256").update(token).digest("hex");
    const resetToken = await db.passwordResetToken.findUnique({
        where: { tokenHash },
    });

    if (!resetToken || resetToken.expires < new Date()) {
        redirect("/admin/giris/sifre-sifirla?error=gecersiz");
    }

    const hashedPassword = await hash(password, 12);

    await db.$transaction(async (tx: typeof db) => {
        await tx.yazar.update({
            where: { email: resetToken.email },
            data: { password: hashedPassword },
        });
        await tx.passwordResetToken.deleteMany({
            where: { email: resetToken.email },
        });
    });

    redirect("/admin/giris?resetSuccess=1");
}
