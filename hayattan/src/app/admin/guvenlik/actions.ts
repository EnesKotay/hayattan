"use server";

import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { setTwoFactorEnabled } from "@/lib/two-factor";
import { logDataModification } from "@/lib/security-logger";

export async function updateTwoFactorStatus(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || !session.user.role || !["ADMIN", "AUTHOR"].includes(session.user.role)) {
    throw new Error("Yetkisiz erisim");
  }

  const enabled = formData.get("enabled") === "1";
  await setTwoFactorEnabled(session.user.id, enabled);
  await logDataModification(session.user.id, "update", "two_factor_settings", session.user.id);

  revalidatePath("/admin/guvenlik");
}
