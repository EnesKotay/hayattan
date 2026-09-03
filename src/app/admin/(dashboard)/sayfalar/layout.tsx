import { requireAdminPage } from "@/lib/admin-auth";

export default async function SayfalarAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return children;
}
