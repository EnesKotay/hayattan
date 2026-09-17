import { requireAdminPage } from "@/backend/modules/auth/admin-guard";

export default async function YazarlarAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return children;
}
