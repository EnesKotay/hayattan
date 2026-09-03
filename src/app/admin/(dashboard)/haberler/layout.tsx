import { requireAdminPage } from "@/lib/admin-auth";

export default async function HaberlerAdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return children;
}
