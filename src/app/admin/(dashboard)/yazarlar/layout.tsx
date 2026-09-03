import { requireAdminPage } from "@/lib/admin-auth";

export default async function YazarlarAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return children;
}
