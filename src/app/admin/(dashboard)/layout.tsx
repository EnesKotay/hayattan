import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminBreadcrumbs } from "@/components/admin/AdminBreadcrumbs";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/giris");
  }

  const role = session.user.role;
  if (role !== "ADMIN" && role !== "AUTHOR") {
    redirect("/admin/giris");
  }

  return (
    <div className="space-y-4">
      <AdminBreadcrumbs />
      {children}
    </div>
  );
}
