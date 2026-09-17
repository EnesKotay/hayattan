import { requireAdminPage } from "@/backend/modules/auth/admin-guard";

export default async function KategorilerAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return children;
}
