import { requireAdminPage } from "@/lib/admin-auth";

export default async function HakkimizdaAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return children;
}
