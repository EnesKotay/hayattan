import { requireAdminPage } from "@/lib/admin-auth";

export default async function KategorilerAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return children;
}
