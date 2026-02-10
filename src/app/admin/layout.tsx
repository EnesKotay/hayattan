import { auth } from "@/lib/auth";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { ToastProvider } from "@/components/admin/ToastProvider";
import { ToastContainer } from "@/components/admin/Toast";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

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
          {session && <AdminNav />}
        </header>
        <main className="container mx-auto max-w-5xl px-4 py-8">
          {children}
        </main>
        <ToastContainer />
      </div>
    </ToastProvider>
  );
}
