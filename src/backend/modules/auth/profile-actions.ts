"use server";

import { compare, hash } from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/backend/modules/admin/context";
import { auth } from "@/backend/modules/auth/auth";

export async function updatePassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN", "AUTHOR"].includes((session.user as { role?: string }).role ?? "")) {
    throw new Error("Yetkisiz erişim");
  }
  const currentPassword = (formData.get("currentPassword") as string) || "";
  const newPassword = (formData.get("newPassword") as string) || "";
  const newPasswordConfirm = (formData.get("newPasswordConfirm") as string) || "";

  if (!currentPassword || !newPassword || !newPasswordConfirm) {
    redirect("/admin/profil?error=eksik");
  }

  if (newPassword !== newPasswordConfirm) {
    redirect("/admin/profil?error=uyusmuyor");
  }

  // Import password validator
  const { validatePassword } = await import("@/backend/security/password-validator");

  // Validate password strength
  const validation = validatePassword(newPassword);
  if (!validation.valid) {
    // Encode error message for URL
    const errorMsg = encodeURIComponent(validation.errors[0]);
    redirect(`/admin/profil?error=zayif&msg=${errorMsg}`);
  }

  const user = await db.yazar.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });
  if (!user) redirect("/admin/profil?error=bulunamadi");

  const isValid = await compare(currentPassword, user.password || "");
  if (!isValid) redirect("/admin/profil?error=yanlis");

  // Check if new password is same as old password
  const isSameAsOld = await compare(newPassword, user.password || "");
  if (isSameAsOld) {
    redirect("/admin/profil?error=ayni");
  }

  const hashedPassword = await hash(newPassword, 12);
  await db.yazar.update({
    where: { id: session.user.id },
    data: { password: hashedPassword },
  });

  // Log password change
  const { logPasswordChange } = await import("@/backend/security/security-logger");
  await logPasswordChange(session.user.id);

  revalidatePath("/admin/profil");
  redirect("/admin/profil?success=1");
}
