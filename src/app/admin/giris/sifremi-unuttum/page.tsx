import Link from "next/link";
import { forgotPassword } from "../auth-actions";

export default async function SifremiUnuttumPage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string; error?: string }>;
}) {
    const params = await searchParams;

    return (
        <div className="flex min-h-[70vh] items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-[#e5e5dc] bg-white p-8 shadow-lg">
                <h1 className="font-serif text-2xl font-bold text-foreground">
                    Şifremi unuttum
                </h1>
                <p className="mt-2 text-sm text-muted">
                    E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
                </p>

                <form action={forgotPassword} className="mt-8 space-y-6">
                    {params.error === "eksik" && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            Lütfen e-posta adresinizi girin.
                        </div>
                    )}
                    {params.success && (
                        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                            Şifre sıfırlama bağlantısı e-posta adresinize gönderildi (Eğer kayıtlı ise).
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-foreground"
                        >
                            E-posta adresiniz
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="ornek@email.com"
                            className="mt-1.5 w-full rounded-lg border border-[#ddd] px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-primary py-3 font-medium text-white transition-colors hover:bg-primary-hover"
                    >
                        Bağlantı gönder
                    </button>

                    <div className="text-center">
                        <Link
                            href="/admin/giris"
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            Giriş ekranına dön
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
