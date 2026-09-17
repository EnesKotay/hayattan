import { auth } from "@/backend/modules/auth/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminNav } from "@/frontend/admin/layout/AdminNav";
import { SignOutButton } from "@/frontend/admin/layout/SignOutButton";
import { ToastProvider } from "@/frontend/admin/ui/ToastProvider";
import { ToastContainer } from "@/frontend/admin/ui/Toast";
import { AdminWelcome } from "@/frontend/admin/layout/AdminWelcome";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/admin/giris");
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <Link
              href="/admin"
              className="font-serif text-xl font-bold text-gray-900 hover:text-primary transition-colors"
            >
              Hayattan.Net — Yönetim Paneli
            </Link>
            <div className="flex items-center gap-4">
              {session && <SignOutButton />}
            </div>
          </div>
          {session && <AdminNav isAdmin={session.user.role === "ADMIN"} />}
        </header>
        <main className="container mx-auto max-w-7xl px-4 py-8">
          {children}
        </main>
        <AdminWelcome />
        <ToastContainer />
      </div>
    </ToastProvider>
  );
}
