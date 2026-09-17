import { requireAdminPage } from "@/backend/modules/auth/admin-guard";

export default async function SayfalarAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return children;
}
