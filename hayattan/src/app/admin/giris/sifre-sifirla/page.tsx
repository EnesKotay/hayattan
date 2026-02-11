import { resetPassword } from "../auth-actions";

export default async function SifreSifirlaPage({
    searchParams,
}: {
    searchParams: Promise<{ token?: string; error?: string }>;
}) {
    const params = await searchParams;
    const token = params.token;

    if (!token && !params.error) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center px-4">
                <div className="w-full max-w-md rounded-2xl border border-[#e5e5dc] bg-white p-8 shadow-lg text-center">
                    <p className="text-red-600 font-medium">Geçersiz veya eksik bağlantı.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-[70vh] items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-[#e5e5dc] bg-white p-8 shadow-lg">
                <h1 className="font-serif text-2xl font-bold text-foreground">
                    Yeni şifre belirle
                </h1>
                <p className="mt-2 text-sm text-muted">
                    Lütfen hesabınız için yeni bir şifre girin.
                </p>

                <form action={resetPassword} className="mt-8 space-y-6">
                    <input type="hidden" name="token" value={token} />

                    {params.error === "eksik" && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            Lütfen tüm alanları doldurun.
                        </div>
                    )}
                    {params.error === "uyusmuyor" && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            Şifreler uyuşmuyor.
                        </div>
                    )}
                    {params.error === "gecersiz" && (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                            Bu bağlantı geçersiz veya süresi dolmuş.
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-foreground"
                        >
                            Yeni şifre
                        </label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            minLength={6}
                            placeholder="••••••••"
                            className="mt-1.5 w-full rounded-lg border border-[#ddd] px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="passwordConfirm"
                            className="block text-sm font-medium text-foreground"
                        >
                            Yeni şifre (Tekrar)
                        </label>
                        <input
                            id="passwordConfirm"
                            name="passwordConfirm"
                            type="password"
                            required
                            minLength={6}
                            placeholder="••••••••"
                            className="mt-1.5 w-full rounded-lg border border-[#ddd] px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full rounded-lg bg-primary py-3 font-medium text-white transition-colors hover:bg-primary-hover"
                    >
                        Şifreyi sıfırla
                    </button>
                </form>
            </div>
        </div>
    );
}
