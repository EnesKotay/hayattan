import Link from "next/link";

export const metadata = {
    title: "Gizlilik Politikası | Hayattan.Net",
    description: "Hayattan.Net gizlilik politikası ve veri güvenliği bilgilendirmesi.",
};

export default function GizlilikPage() {
    return (
        <main className="min-h-screen bg-background py-20 px-4">
            <div className="container mx-auto max-w-4xl">
                <h1 className="font-serif text-4xl font-bold text-primary mb-8 border-b pb-4">
                    Gizlilik Politikası
                </h1>

                <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
                    <p>
                        <strong>Son Güncelleme:</strong> {new Date().toLocaleDateString("tr-TR")}
                    </p>

                    <p>
                        Hayattan.Net olarak gizliliğinize önem veriyoruz. Bu metin, sitemizi ziyaret ettiğinizde hangi verilerin toplandığını ve nasıl kullanıldığını açıklar.
                    </p>

                    <section className="space-y-4">
                        <h2 className="font-serif text-2xl font-bold text-foreground">1. Toplanan Veriler</h2>
                        <p>
                            Sitemizi ziyaret ettiğinizde standart günlük dosyaları (loglar) tutulabilir. Bu dosyalar IP adresiniz, tarayıcı türünüz, sitemizde geçirdiğiniz süre ve ziyaret ettiğiniz sayfalar gibi anonim bilgileri içerir.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="font-serif text-2xl font-bold text-foreground">2. Çerezler (Cookies)</h2>
                        <p>
                            Deneyiminizi geliştirmek ve tercihlerinizi hatırlamak için çerezleri kullanıyoruz. Çerezler, tarayıcınız aracılığıyla cihazınıza yerleştirilen küçük metin dosyalarıdır.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="font-serif text-2xl font-bold text-foreground">3. Üçüncü Taraf Bağlantıları</h2>
                        <p>
                            Sitemizde reklamlar veya içerik ortaklıkları kapsamında üçüncü taraf sitelere bağlantılar bulunabilir. Bu sitelerin gizlilik politikalarından Hayattan.Net sorumlu değildir.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="font-serif text-2xl font-bold text-foreground">4. İletişim</h2>
                        <p>
                            Gizlilik politikamız hakkında sorularınız için bizimle <Link href="/iletisim" className="text-primary hover:underline font-medium">iletişim sayfamız</Link> üzerinden irtibata geçebilirsiniz.
                        </p>
                    </section>
                </div>

                <div className="mt-12 pt-8 border-t">
                    <Link href="/" className="text-primary hover:underline flex items-center gap-2 font-medium">
                        ← Ana Sayfaya Dön
                    </Link>
                </div>
            </div>
        </main>
    );
}
