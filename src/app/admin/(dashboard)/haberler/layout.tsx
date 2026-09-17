import { requireAdminPage } from "@/backend/modules/auth/admin-guard";

export default async function HaberlerAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return children;
}
