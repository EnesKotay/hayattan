import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@/backend/modules/auth/auth";

/** Guard sensitive administrator-only pages. */
export async function requireAdminPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") redirect("/admin/yazilar");
  return session;
}
