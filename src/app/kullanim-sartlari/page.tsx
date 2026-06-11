import Link from "next/link";

export const metadata = {
    title: "Kullanım Şartları | Hayattan.Net",
    description: "Hayattan.Net kullanım koşulları ve yasal uyarılar.",
};

export default function KullanimSartlariPage() {
    return (
        <main className="min-h-screen bg-background py-20 px-4">
            <div className="container mx-auto max-w-4xl">
                <h1 className="font-serif text-4xl font-bold text-primary mb-8 border-b pb-4">
                    Kullanım Şartları
                </h1>

                <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
                    <p>
                        <strong>Son Güncelleme:</strong> {new Date().toLocaleDateString("tr-TR")}
                    </p>

                    <p>
                        Hayattan.Net platformuna erişerek ve kullanarak aşağıdaki şartları kabul etmiş sayılırsınız.
                    </p>

                    <section className="space-y-4">
                        <h2 className="font-serif text-2xl font-bold text-foreground">1. İçerik Kullanımı</h2>
                        <p>
                            Sitemizde yayınlanan tüm yazı, görsel ve videoların telif hakları aksi belirtilmedikçe Hayattan.Net'e aittir. İçeriklerimiz izinsiz kopyalanamaz veya ticari amaçla kullanılamaz. Atıf yapılarak paylaşılması durumunda kaynak link belirtilmesi zorunludur.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="font-serif text-2xl font-bold text-foreground">2. Kullanıcı Sorumluluğu</h2>
                        <p>
                            Kullanıcılar, siteyi kullanırken yasalara ve genel ahlak kurallarına aykırı hareket etmemeyi kabul ederler. Yorum alanlarında hakaret, nefret söylemi veya spam içerik paylaşılması yasaktır.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="font-serif text-2xl font-bold text-foreground">3. Hizmet Değişiklikleri</h2>
                        <p>
                            Hayattan.Net, önceden haber vermeksizin site içeriğinde, yapısında veya sunulan hizmetlerde değişiklik yapma hakkını saklı tutar.
                        </p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="font-serif text-2xl font-bold text-foreground">4. Feragatname</h2>
                        <p>
                            Sitede yer alan bilgiler "olduğu gibi" sunulmaktadır. İçeriklerin doğruluğu veya güncelliği konusunda yasal bir taahhüt verilmemektedir. Sitedeki bilgilere dayanılarak yapılan işlemlerden doğacak sorumluluk kullanıcıya aittir.
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
