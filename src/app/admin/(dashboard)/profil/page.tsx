import Link from "next/link";
import { auth } from "@/lib/auth";
import { updatePassword } from "../../actions";
import { FormField, FormSection } from "@/components/admin/FormField";
import { AdminFeedback } from "@/components/admin/AdminFeedback";

const ERROR_MESSAGES: Record<string, string> = {
  eksik: "Tüm alanları doldurun.",
  kisa: "Yeni şifre en az 6 karakter olmalıdır.",
  uyusmuyor: "Yeni şifre ve tekrarı aynı değil.",
  yanlis: "Mevcut şifre hatalı.",
  bulunamadi: "Kullanıcı bulunamadı.",
};

export default async function ProfilPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const errorMessage = params.error ? ERROR_MESSAGES[params.error] ?? "Bir hata oluştu." : null;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground">
          Profil
        </h1>
        <p className="mt-1 text-sm text-muted">
          Giriş yapan hesap: <strong>{session?.user?.email}</strong>. Şifrenizi buradan değiştirebilirsiniz.
        </p>
      </div>

      <AdminFeedback initialSuccess={params.success} initialError={params.error} />

      <form action={updatePassword} className="space-y-6">
        <FormSection title="Şifre değiştir">
          <FormField label="Mevcut şifre" required>
            <input
              type="password"
              name="currentPassword"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-[#ddd] px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </FormField>
          <FormField label="Yeni şifre" help="En az 6 karakter." required>
            <input
              type="password"
              name="newPassword"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-lg border border-[#ddd] px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </FormField>
          <FormField label="Yeni şifre (tekrar)" required>
            <input
              type="password"
              name="newPasswordConfirm"
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-lg border border-[#ddd] px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </FormField>
        </FormSection>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-lg bg-primary px-6 py-2.5 font-medium text-white transition-colors hover:bg-primary-hover"
          >
            Şifreyi güncelle
          </button>
          <Link
            href="/admin"
            className="rounded-lg border border-[#ddd] bg-white px-6 py-2.5 font-medium text-foreground transition-colors hover:bg-[#f9f9f6]"
          >
            İptal
          </Link>
        </div>
      </form>
    </div>
  );
}
