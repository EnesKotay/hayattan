"use server";

import { hash } from "bcryptjs";
import { randomUUID } from "crypto";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/mail";

const db = prisma as any;

export async function forgotPassword(formData: FormData) {
    const email = (formData.get("email") as string) || "";
    if (!email) redirect("/admin/giris/sifremi-unuttum?error=eksik");

    const yazar = await db.yazar.findUnique({
        where: { email },
    });

    if (!yazar) redirect("/admin/giris/sifremi-unuttum?success=1");

    const token = randomUUID();
    const expires = new Date(Date.now() + 3600 * 1000); // 1 saat geçerli

    await db.passwordResetToken.create({
        data: {
            email,
            token,
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

    const resetToken = await db.passwordResetToken.findUnique({
        where: { token },
    });

    if (!resetToken || resetToken.expires < new Date()) {
        redirect("/admin/giris/sifre-sifirla?error=gecersiz");
    }

    const hashedPassword = await hash(password, 12);

    await db.yazar.update({
        where: { email: resetToken.email },
        data: { password: hashedPassword },
    });

    await db.passwordResetToken.delete({
        where: { id: resetToken.id },
    });

    redirect("/admin/giris?resetSuccess=1");
}
